import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import { FiMail } from "react-icons/fi";
import { Link } from "react-router-dom";
import { auth } from "../../utils/firebaseConfig";
import logoSvg from "./forget_password_logo.svg";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Check your email for password reset link!");
    } catch (error) {
      console.error(error.message);
      setMessage("Error: User not found or invalid email.");
    }
  };
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

          <form onSubmit={handleReset} className="forgot-form">
            <div className="input-group">
              <label>University Email</label>
              <div className="input-wrapper">
                <FiMail className="input-icon" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                  placeholder="name@university.edu"
                />
              </div>
            </div>

            <button type="submit" className="reset-btn">
              Reset Password
            </button>
            {message && <p>{message}</p>}

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
