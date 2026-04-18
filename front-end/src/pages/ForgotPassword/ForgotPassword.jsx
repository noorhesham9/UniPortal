import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import { FiCheckCircle, FiMail } from "react-icons/fi";
import { Link } from "react-router-dom";
import { auth } from "../../utils/firebaseConfig";
import logoSvg from "./forget_password_logo.svg";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail]   = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [error, setError]   = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    setError("");
    try {
      await sendPasswordResetEmail(auth, email.trim(), {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false,
      });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email address.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="forgot-page-container">
      <main className="forgot-main">
        <div className="forgot-card">
          <div className="forgot-header">
            <div className="logo-wrapper">
              <img src={logoSvg} alt="University Logo" className="university-logo-img" />
            </div>
            <h1>Forgot Password?</h1>
            <p className="subtitle">
              Enter your email and we'll send you a reset link.
            </p>
          </div>

          {status === "success" ? (
            <div style={{ textAlign: "center", padding: "1rem 0" }}>
              <FiCheckCircle style={{ fontSize: "2.5rem", color: "#22c55e", marginBottom: "0.75rem" }} />
              <p style={{ color: "#f1f5f9", fontWeight: 600, marginBottom: "0.5rem" }}>Check your inbox!</p>
              <p style={{ color: "#94a3b8", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
                We sent a password reset link to <strong style={{ color: "#f59e0b" }}>{email}</strong>.
                <br />The link expires in 1 hour.
              </p>
              <Link to="/login" className="reset-btn" style={{ display: "inline-block", textDecoration: "none", textAlign: "center" }}>
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="forgot-form">
              <div className="input-group">
                <label>Email Address</label>
                <div className="input-wrapper">
                  <FiMail className="input-icon" />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    type="email"
                    placeholder="your@email.com"
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <p style={{ color: "#ef4444", fontSize: "0.85rem", margin: "-0.5rem 0 0", textAlign: "center" }}>
                  {error}
                </p>
              )}

              <button type="submit" className="reset-btn" disabled={status === "loading"}>
                {status === "loading" ? "Sending..." : "Send Reset Link"}
              </button>

              <div className="back-to-login">
                <Link to="/login">← Back to Login</Link>
              </div>
            </form>
          )}
        </div>
      </main>

      <footer className="forgot-footer">
        <div className="footer-links">
          <Link to="/privacy">Privacy Policy</Link>
          <span className="divider">|</span>
          <Link to="/terms">Terms of Service</Link>
        </div>
        <p className="copyright">© 2024 UNIVERSITY PORTAL</p>
      </footer>
    </div>
  );
};

export default ForgotPassword;
