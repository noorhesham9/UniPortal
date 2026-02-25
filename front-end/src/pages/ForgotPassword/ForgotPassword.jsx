import React from "react";
import { Link } from "react-router-dom";
import { FiMail } from "react-icons/fi";
import logoSvg from "./forget_password_logo.svg";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  return (
    <div className="forgot-page-container">
      <main className="forgot-main">
        <div className="forgot-card">
          <div className="forgot-header">
            <div className="logo-wrapper">
              <img
                src={logoSvg}
                alt="University Logo"
                className="university-logo-img"
              />
            </div>
            <h1>Forgot Password?</h1>
            <p className="subtitle">
              No worries, we'll send you reset instructions.
            </p>
          </div>

          <form className="forgot-form">
            <div className="input-group">
              <label>University Email</label>
              <div className="input-wrapper">
                <FiMail className="input-icon" />
                <input type="email" placeholder="name@university.edu" />
              </div>
            </div>

            <button type="submit" className="reset-btn">
              Reset Password
            </button>

            <div className="back-to-login">
              <Link to="/login">
                <span className="arrow">←</span> Back to log in
              </Link>
            </div>
          </form>
        </div>
      </main>

      <footer className="forgot-footer">
        <div className="footer-links">
          <Link to="/privacy">Privacy Policy</Link>
          <span className="divider">|</span>
          <Link to="/terms">Terms of Service</Link>
          <span className="divider">|</span>
          <Link to="/calendar">Academic Calendar</Link>
        </div>
        <p className="copyright">© 2024 UNIVERSITY PORTAL</p>
      </footer>
    </div>
  );
};

export default ForgotPassword;
