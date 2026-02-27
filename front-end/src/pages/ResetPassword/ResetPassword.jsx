import { useEffect, useState } from "react";
import { FiCheckCircle, FiEye, FiEyeOff, FiLock } from "react-icons/fi";
import { Link } from "react-router-dom";
import loginLogoSvg from "../Login/login_logo.svg";
import "./ResetPassword.css";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [checks, setChecks] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
    match: false, // شرط تطابق الباسوورد.
  });

  useEffect(() => {
    setChecks({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      match: password === confirmPassword && confirmPassword !== "",
    });
  }, [password, confirmPassword]);

  return (
    <div className="reset-container">
      <div className="login-card">
        <div className="card-header">
          <img
            src={loginLogoSvg}
            alt="University Logo"
            className="logo-image"
          />
          <h2>University Portal</h2>
          <p className="subtitle">Student Administration System</p>
          <h3 className="welcome-text">Reset Password</h3>
        </div>

        <form className="login-form" onSubmit={(e) => e.preventDefault()}>
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
              <span
                className="eye-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
          </div>

          <div className="input-group">
            <label>Confirm New Password</label>
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <span
                className="eye-icon"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
          </div>

          <div className="requirements-box">
            <p className="req-title">PASSWORD REQUIREMENTS</p>
            <ul className="req-list">
              <li className={checks.length ? "met" : ""}>
                {checks.length ? (
                  <FiCheckCircle />
                ) : (
                  <div className="dot"></div>
                )}{" "}
                At least 8 characters
              </li>
              <li className={checks.uppercase ? "met" : ""}>
                {checks.uppercase ? (
                  <FiCheckCircle />
                ) : (
                  <div className="dot"></div>
                )}{" "}
                One uppercase letter
              </li>
              <li className={checks.number ? "met" : ""}>
                {checks.number ? (
                  <FiCheckCircle />
                ) : (
                  <div className="dot"></div>
                )}{" "}
                One number
              </li>
              <li className={checks.special ? "met" : ""}>
                {checks.special ? (
                  <FiCheckCircle />
                ) : (
                  <div className="dot"></div>
                )}{" "}
                One special character
              </li>
              {/* شرط تطابق الباسوورد   */}
              <li className={checks.match ? "met" : ""}>
                {checks.match ? <FiCheckCircle /> : <div className="dot"></div>}{" "}
                Passwords must match
              </li>
            </ul>
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={!Object.values(checks).every((val) => val)}
            style={{
              opacity: Object.values(checks).every((val) => val) ? 1 : 0.6,
            }}
          >
            Reset Password
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
          <Link to="/calendar">Academic Calendar</Link>
        </div>
        <p className="copyright">
          © 2024 University Portal. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default ResetPassword;
