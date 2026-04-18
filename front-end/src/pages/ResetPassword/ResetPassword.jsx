import { useEffect, useState } from "react";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { FiCheckCircle, FiEye, FiEyeOff, FiLock } from "react-icons/fi";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { auth } from "../../utils/firebaseConfig";
import loginLogoSvg from "../Login/login_logo.svg";
import "./ResetPassword.css";

function ResetPassword() {
  const [searchParams]      = useSearchParams();
  const navigate            = useNavigate();
  const oobCode             = searchParams.get("oobCode");

  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [status, setStatus]             = useState("idle"); // idle | verifying | success | error | invalid
  const [errorMsg, setErrorMsg]         = useState("");

  const checks = {
    length:    password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number:    /[0-9]/.test(password),
    special:   /[!@#$%^&*(),.?":{}|<>]/.test(password),
    match:     password === confirmPassword && confirmPassword !== "",
  };
  const allValid = Object.values(checks).every(Boolean);

  // Verify the oobCode on mount
  useEffect(() => {
    if (!oobCode) { setStatus("invalid"); return; }
    verifyPasswordResetCode(auth, oobCode)
      .then((e) => setEmail(e))
      .catch(() => setStatus("invalid"));
  }, [oobCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allValid) return;
    setStatus("verifying");
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setStatus("success");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message || "Failed to reset password.");
    }
  };

  if (status === "invalid") return (
    <div className="reset-container">
      <div className="login-card" style={{ textAlign: "center", padding: "3rem 2rem" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔗</div>
        <h2 style={{ color: "#ef4444" }}>Invalid or Expired Link</h2>
        <p style={{ color: "#94a3b8", margin: "0.75rem 0 1.5rem" }}>
          This password reset link is invalid or has expired.<br />Please request a new one.
        </p>
        <Link to="/forgot-password" className="login-btn" style={{ display: "inline-block", textDecoration: "none", padding: "0.65rem 1.5rem" }}>
          Request New Link
        </Link>
      </div>
    </div>
  );

  if (status === "success") return (
    <div className="reset-container">
      <div className="login-card" style={{ textAlign: "center", padding: "3rem 2rem" }}>
        <FiCheckCircle style={{ fontSize: "3rem", color: "#22c55e", marginBottom: "1rem" }} />
        <h2 style={{ color: "#f1f5f9" }}>Password Reset!</h2>
        <p style={{ color: "#94a3b8", margin: "0.75rem 0" }}>
          Your password has been updated. Redirecting to login...
        </p>
      </div>
    </div>
  );

  return (
    <div className="reset-container">
      <div className="login-card">
        <div className="card-header">
          <img src={loginLogoSvg} alt="University Logo" className="logo-image" />
          <h2>University Portal</h2>
          <h3 className="welcome-text">Reset Password</h3>
          {email && <p className="subtitle" style={{ color: "#f59e0b" }}>{email}</p>}
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>New Password</label>
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="eye-icon" onClick={() => setShowPassword(!showPassword)} style={{ cursor: "pointer" }}>
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
          </div>

          <div className="input-group">
            <label>Confirm New Password</label>
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <span className="eye-icon" onClick={() => setShowConfirm(!showConfirm)} style={{ cursor: "pointer" }}>
                {showConfirm ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
          </div>

          <div className="requirements-box">
            <p className="req-title">PASSWORD REQUIREMENTS</p>
            <ul className="req-list">
              {[
                [checks.length,    "At least 8 characters"],
                [checks.uppercase, "One uppercase letter"],
                [checks.number,    "One number"],
                [checks.special,   "One special character"],
                [checks.match,     "Passwords must match"],
              ].map(([met, label]) => (
                <li key={label} className={met ? "met" : ""}>
                  {met ? <FiCheckCircle /> : <div className="dot" />} {label}
                </li>
              ))}
            </ul>
          </div>

          {status === "error" && (
            <p style={{ color: "#ef4444", fontSize: "0.85rem", textAlign: "center" }}>{errorMsg}</p>
          )}

          <button
            type="submit"
            className="login-btn"
            disabled={!allValid || status === "verifying"}
            style={{ opacity: allValid ? 1 : 0.6 }}
          >
            {status === "verifying" ? "Resetting..." : "Reset Password"}
          </button>

          <p className="new-student">
            Remembered? <Link to="/login">Back to Login</Link>
          </p>
        </form>
      </div>

      <footer className="page-footer">
        <div className="footer-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </div>
        <p className="copyright">© 2024 University Portal. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default ResetPassword;
