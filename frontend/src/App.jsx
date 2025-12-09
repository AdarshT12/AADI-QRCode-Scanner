// App.jsx
import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./Login.jsx";
import Dashboard from "./Dashboard.jsx";
import MemberDetails from "./Components/MemberDetails.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import "./Components/spinner.css";
import "./App.css";

function LoadingOverlay() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500); 
    return () => clearTimeout(timer);
  }, [location]);

  if (!loading) return null;

  return (
    <div className="spinner-container">
      <div className="spinner"></div>
    </div>
  );
}

function App() {
  return (
    <HashRouter>
      <LoadingOverlay />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/member/:transactionId" element={<ProtectedRoute><MemberDetails /></ProtectedRoute>} />
      </Routes>
    </HashRouter>
  );
}

export default App;
