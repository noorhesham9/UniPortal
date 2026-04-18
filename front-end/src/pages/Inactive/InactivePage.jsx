import { useEffect } from "react";
import { FiAlertTriangle, FiPhone, FiMail } from "react-icons/fi";
import { Link } from "react-router-dom";
import "./InactivePage.css";

export default function InactivePage() {
  useEffect(() => {
    document.body.classList.add("public-page");
    return () => document.body.classList.remove("public-page");
  }, []);

  return (
    <div className="inactive-page">
      <div className="inactive-card">
        <div className="inactive-icon">
          <FiAlertTriangle size={48} />
        </div>

        <h1>Account Deactivated</h1>
        <p className="inactive-msg">
          Your account has been temporarily deactivated by the administration.
          Please visit the Student Affairs office to resolve this issue.
        </p>

        <div className="inactive-contact">
          <h3>Contact Student Affairs</h3>
          <div className="inactive-contact-item">
            <FiPhone size={16} />
            <span>+20 XX XXX XXXX</span>
          </div>
          <div className="inactive-contact-item">
            <FiMail size={16} />
            <span>affairs@university.edu</span>
          </div>
          <div className="inactive-contact-item">
            <span>📍 Main Building, Room 101 — Sun to Thu, 9AM–3PM</span>
          </div>
        </div>

        <Link to="/login" className="inactive-back-btn">
          Back to Login
        </Link>
      </div>
    </div>
  );
}
