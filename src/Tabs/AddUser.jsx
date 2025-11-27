import React, { useState, useEffect } from 'react';
import './AddUser.css';

const CLIENT_ORIGIN = import.meta.env.VITE_BACKEND_ORIGIN;

const AddUser = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [response, setResponse] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate random password (frontend)
  const generatePassword = (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let pwd = '';
    for (let i = 0; i < length; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pwd);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend validation
    if (!name && !email && !password) {
      setResponse({ type: "error", message: "Name, Email and Password are required!" });
      return;
    }
    if (!name) {
      setResponse({ type: "error", message: "Name is required!" });
      return;
    }
    if (!email) {
      setResponse({ type: "error", message: "Email is required!" });
      return;
    }
    if (!password) {
      setResponse({ type: "error", message: "Password is required! Please generate one." });
      return;
    }

    try {
      setIsSubmitting(true); // 👈 disable button
      const res = await fetch(`${CLIENT_ORIGIN}/api/users/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, isAdmin })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Something went wrong! Please try again.");
      }

      await res.json();
      setResponse({ type: "success", message: "User created successfully!!" });

      // Reset form
      setName("");
      setEmail("");
      setIsAdmin(false);
      setPassword("");
    } catch (err) {
      setResponse({ type: "error", message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (response) {
      const timer = setTimeout(() => setResponse(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [response]);

  return (
    <div className="card">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Password</label>
          <div className='password-group'>
            <input type="text" value={password} readOnly />
            <input
              type="button"
              className="generate-password-button"
              onClick={() => generatePassword(10)}
              value="Generate Password"
            />
          </div>
        </div>

        <div className="form-group checkbox">
          <label>
            <input
              type="checkbox"
              className="checkbox-input"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
            />
            Is Admin
          </label>
        </div>

        <div className="form-group">
          <button
            className="submit-button"
            type="submit"
            disabled={isSubmitting}
            aria-disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Add User"}
          </button>
        </div>
      </form>

      {response && (
        <div
          className={`message ${response.type}`}
          aria-live="polite"
        >
          {response.message}
        </div>
      )}
    </div>
  );
};

export default AddUser;
