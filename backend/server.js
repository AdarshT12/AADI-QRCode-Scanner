// server.js
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const cors = require('cors');

//Excel uploading in db 
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const XLSX = require("xlsx");

const tableName = "MembersData";

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".xls" || ext === ".xlsx" || ext === ".csv") {
      cb(null, true);
    } else {
      cb(new Error("Only Excel or CSV files(.xls, .xlsx, .csv) are allowed. Please upload a valid file."));
    }
  }
});
const app = express();

// CORS with credentials
app.use(cors({
  origin: process.env.VITE_CLIENT_ORIGIN,
  credentials: true,
}));
app.use(express.json());

app.options('/', cors({
  origin: process.env.CLIENT_ORIGIN,
  credentials: true,
}));

// DB pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

// Session store
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  clearExpired: true,
  checkExpirationInterval: 15 * 60 * 1000,
  expiration: 12 * 60 * 60 * 1000
});

app.use(session({
  name: 'sid',
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 12 * 60 * 60 * 1000
  }
}));

// Helper: auth guard
function requireAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.status(401).json({ error: 'Access denied. Please Contact Admin.' });
}

// Login (set session)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email && !password) {
    return res.status(400).json({ error: 'Please enter email and password.' });
  } else if (!email) {
    return res.status(400).json({ error: 'Please enter your email.' });
  } else if (!password) {
    return res.status(400).json({ error: 'Please enter your password.' });
  }

  try {
    const [rows] = await pool.query('SELECT name, email, password, isAdmin FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid email or password.' });

    const user = rows[0];
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    req.session.user = { email: user.email, isAdmin: user.isAdmin, name: user.name };
    res.json({ success: true, user: req.session.user });
  } catch (err) {
    res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
  }
});

app.post('/api/users/add', async (req, res) => {
  const { name, email, isAdmin, password } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required.' });
  }

  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {

    const [result] = await pool.query(
      "INSERT INTO users (`name`, email, password, isAdmin) VALUES (?, ?, ?, ?)"  ,
      [name, email, password, isAdmin ? 1 : 0]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully.',
      userId: result.insertId,
      name,
      email,
      password,
      isAdmin: !!isAdmin
    });
  } catch (err) {
    console.error('Error inserting user:', err);
    res.status(500).json({ error: 'Unable to create user. Please try again.' });
  }
});

// Current session
app.get('/api/auth/me', (req, res) => {
  if (!req.session.user) return res.json({ authenticated: false });
  res.json({ authenticated: true, user: req.session.user });
});

// Logout (destroy session)
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('sid');
    res.json({ success: true });
  });
});

// Example protected route (email/password must be valid and logged in)
app.get('/api/secure/data', requireAuth, async (req, res) => {
  res.json({ ok: true, user: req.session.user, data: 'Secret stuff' });
});

// ✅ Upload route
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if(req.user.isAdmin !== 1){
      return  res.status(403).send("Access denied. Only admin users can upload files.");
    }
    await new Promise(resolve => setTimeout(resolve, 1000));

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // ✅ Get headers directly from first row
    const headerRow = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0];
    const rawColumns = headerRow;

    // ✅ Sanitize column names
    const columns = rawColumns.map(col => col.replace(/\s+/g, "_").replace(/[^\w]/g, ""));

    // ✅ Get all rows with headers
    const rows = XLSX.utils.sheet_to_json(sheet);

    if (!rows.length) {
      fs.unlinkSync(req.file.path);
      return res.status(400).send("uploaded Excel file is empty. Please check the file and try again.");
    }

    const conn = await pool.getConnection();

    const columnDefs = columns.map(col => `\`${col}\` VARCHAR(255)`).join(", ");
    await conn.query(
      `CREATE TABLE IF NOT EXISTS ${tableName} (MembersId INT AUTO_INCREMENT PRIMARY KEY, ${columnDefs})`
    );

    const values = rows.map(row => rawColumns.map(col => row[col] || null));

    await conn.query(
      `INSERT INTO ${tableName} (${columns.map(c => `\`${c}\``).join(", ")}) VALUES ?`,
      [values]
    );

    conn.release();
    fs.unlinkSync(req.file.path);
    res.status(200).json({ message: "File uploaded successfully" });
  } catch (err) {
    res.status(500).send("Upload failed. Please try again later.");
  }
});

// Endpoint to check QR code against membersData
app.post("/qr-scan", async (req, res) => {
  const { qrCode } = req.body;

  try {
    const [rows] = await pool.query(
      `SELECT Transaction_ID AS transactionId, Full_Name, event  FROM ${tableName} WHERE Transaction_ID = ?`,
      [qrCode]
    );

    if (rows.length > 0) {
      res.json({ success: true, member: rows[0] });
    } else {
      res.json({ success: false, message: "No matching member found" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.listen(5000, () => console.log('Server on 5000'));
