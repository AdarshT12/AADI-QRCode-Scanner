// DynamicSplash.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Correct from "../assets/Correct.jpeg"; 
import "./Splash.css";

function DynamicSplash({ redirectTo, delay = 2000, state }) {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(redirectTo, { state });
    }, delay);

    return () => clearTimeout(timer);
  }, [navigate, redirectTo, delay, state]);

  return (
    <div className="splash-container">
      <img src={Correct} alt="Logo" className="splash-logo animate-logo" />
    </div>
  );
}

export default DynamicSplash;
