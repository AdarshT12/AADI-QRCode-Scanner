import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Components/spinner.css";

function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_ORIGIN}/api/auth/me`, {
          credentials: "include",
        });
        const data = await res.json();
        setAuthenticated(data.authenticated);
      } catch {
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  if (loading) return null;
  if (!authenticated) return <Navigate to="/" replace />;

  return children;
}

export default ProtectedRoute;
