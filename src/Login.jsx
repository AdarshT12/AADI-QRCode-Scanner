    import React, { useState } from "react";
    import "./Login.css";
    import Logo from "./assets/AADILogo.jpg";
    import { IoMail, IoEye, IoEyeOff } from "react-icons/io5";
    import { IoIosLock } from "react-icons/io";
    import { useNavigate } from "react-router-dom";

    const CLIENT_ORIGIN = import.meta.env.VITE_BACKEND_ORIGIN;

    function Login() {
        const navigate = useNavigate();
        const [email, setEmail] = useState("");
        const [password, setPassword] = useState("");
        const [showPassword, setShowPassword] = useState(false);
        const [msg, setMsg] = useState('');
        const [errors, setErrors] = useState({ email: "", password: "" });

        async function onSubmit(e) {
            e.preventDefault();
            setMsg('');

            if (errors.email || errors.password || !email || !password) {
                setMsg("Please fix the validation errors");
                return;
            }

            try {
                const res = await fetch(`${CLIENT_ORIGIN}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include', 
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();
                if (!res.ok) return setMsg(data.error || 'Login failed');
                
                  navigate("/dashboard");
            } catch {
                setMsg('Network error');
            }
        }

        const handleEmailChange = (e) => {
            const value = e.target.value.trim();
            setEmail(value);

            if (!value) {
                setErrors((prev) => ({ ...prev, email: "Please enter your email" }));
            } else if (!/\S+@\S+\.\S+/.test(value)) {
                setErrors((prev) => ({ ...prev, email: "Please enter valid email format" }));
            } else {
                setErrors((prev) => ({ ...prev, email: "" }));
            }
        };

        const handlePasswordChange = (e) => {
            const value = e.target.value;
            setPassword(value);

            if (!value) {
                setErrors((prev) => ({ ...prev, password: "Please enter your password" }));
            } else {
                setErrors((prev) => ({ ...prev, password: "" }));
            }
        };

        return (
            <div className="login-wrapper">
                <div className="login-card">
                    <div className="login-icon"><img src={Logo} alt="" /></div>
                    <h2 className="login-title">Sign in with email</h2>
                    <p className="login-subtitle">
                    </p>

                    <form className="login-form" onSubmit={onSubmit} noValidate>
                        <div className="input-group">
                            <div className="input-row">
                                <IoMail className="icon" />
                                <input type="email" placeholder="Email" value={email} onChange={handleEmailChange} required autoComplete="email"/>
                            </div>
                            {errors.email && <span className="error">{errors.email}</span>}
                        </div>
                        <div className="input-group">
                            <div className="input-row">
                                <IoIosLock className="icon" />
                                <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={handlePasswordChange} required autoComplete="current-password"/>
                                <span className="toggle-icon" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <IoEyeOff /> : <IoEye />}
                                </span>
                            </div>
                            {errors.password && <span className="error">{errors.password}</span>}
                        </div>
                        <div className="input-group">
                            <input type="submit" className="login-button" value="Login"  disabled={!!errors.email || !!errors.password || !email || !password}/>
                        </div>
                    </form>
                    <div className="messageBox" aria-live="polite" role="alert">
                        {msg && <label className="messageLabel">{msg}</label>}
                    </div>
                </div>
            </div>
        );
    }

    export default Login