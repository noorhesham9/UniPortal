import React, { useState } from "react";
import "./Login.css";
import { Link } from "react-router-dom";
import loginLogoSvg from "./login_logo.svg";
import { FiUser, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="card-header">
          <img
            src={loginLogoSvg}
            alt="University Logo"
            className="logo-image"
          />
          <h2>University Portal</h2>
          <p className="subtitle">Secure Access Login</p>

          <h3 className="welcome-text">Welcome Back</h3>
          <p className="instruction-text">Please sign in to continue.</p>
        </div>
        <form className="login-form">
          <div className="input-group">
            <label>Student ID or Email</label>
            <div className="input-wrapper">
              <FiUser className="input-icon" />
              <input type="text" placeholder="Enter your ID or email" />
            </div>
          </div>

          <div className="input-group">
            <div className="label-row">
              <label>Password</label>
              <Link
                to="/forgot-password"
                style={{
                  color: "#FBBF24",
                  fontSize: "12px",
                  textDecoration: "none",
                }}
              >
                Forgot Password?
              </Link>
            </div>
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
              />
              <span
                className="eye-icon"
                onClick={togglePasswordVisibility}
                style={{ cursor: "pointer" }}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
          </div>

          <div className="remember-me">
            <input type="checkbox" id="remember" />
            <label htmlFor="remember">Remember me on this device</label>
          </div>

          <button type="submit" className="login-btn">
            Log In
          </button>

          <p className="new-student">
            New student?{" "}
            <Link to="/register" className="highlight">
              Activate your account
            </Link>
          </p>
        </form>
      </div>
      <footer className="login-footer">
        <div className="footer-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
          <Link to="/calendar">Academic Calendar</Link>
        </div>
        <p>© 2024 University Portal. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Login;
