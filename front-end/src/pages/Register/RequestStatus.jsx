import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiHash, FiSearch, FiAlertTriangle } from "react-icons/fi";
import PublicNav from "../Home/PublicNav";
import "./Register.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:3100/api/v1";

const STATUS_CONFIG = {
  pending_email: {
    icon: "📧",
    color: "#f59e0b",
    title: "Verify Your Email",
    message: "We sent a verification link to your personal email. Please check your inbox and click the link to continue.",
    canCancel: true,
  },
  pending_approval: {
    icon: "⏳",
    color: "#818cf8",
    title: "Under Review",
    message: "Your request has been received and is pending admin approval. You'll receive an email once it's reviewed — usually within 1–2 business days.",
    canCancel: true,
  },
  approved: {
    icon: "✅",
    color: "#22c55e",
    title: "Approved!",
    message: "Your request has been approved. Check your email for the activation link.",
    canCancel: false,
  },
  rejected: {
    icon: "❌",
    color: "#ef4444",
    title: "Not Approved",
    message: "Your registration request was not approved. Please contact the administration.",
    canCancel: false,
  },
};

export default function RequestStatus() {
  const [studentId, setStudentId]   = useState("");
  const [result, setResult]         = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const navigate = useNavigate();

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!studentId.trim()) return setError("Please enter your Student ID.");
    setError(""); setResult(null); setLoading(true);
    try {
      const res = await axios.get(`${API}/registration-requests/check/${studentId.trim()}`);
      setResult(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError("No registration request found for this Student ID.");
      } else {
        setError(err.response?.data?.message || "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await axios.delete(`${API}/registration-requests/cancel/${studentId.trim()}`);
      setResult(null);
      setConfirmCancel(false);
      navigate("/register");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel request.");
    } finally {
      setCancelling(false);
    }
  };

  const cfg = result ? STATUS_CONFIG[result.status] : null;

  return (
    <div className="register-page">
      <PublicNav />
      <main className="main-content">
        <div className="register-card">
          <div className="card-header">
            <h1>Check Request Status</h1>
            <p className="description">Enter your Student ID to see the status of your registration request.</p>
          </div>

          <form className="register-form" onSubmit={handleCheck}>
            <div className="input-group">
              <label>Student ID</label>
              <div className="input-wrapper">
                <FiHash className="input-icon" />
                <input
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  type="text"
                  placeholder="e.g. 2024-10452"
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <p style={{ color: "#ef4444", fontSize: "0.875rem", margin: "-0.5rem 0 0", textAlign: "center" }}>
                {error}
              </p>
            )}

            <button type="submit" className="submit-btn" disabled={loading}>
              <FiSearch style={{ marginRight: "0.4rem" }} />
              {loading ? "Checking..." : "Check Status"}
            </button>
          </form>

          {/* Result */}
          {cfg && result && (
            <div className="rs-result" style={{ borderColor: `${cfg.color}44` }}>
              <div className="rs-icon">{cfg.icon}</div>
              <div className="rs-info">
                <h2 style={{ color: cfg.color }}>{cfg.title}</h2>
                <p>{cfg.message}</p>
                {result.adminNote && result.status === "rejected" && (
                  <p className="rs-note">Reason: {result.adminNote}</p>
                )}
                {result.status === "approved" && (
                  <p style={{ color: "#22c55e", fontSize: "0.875rem", marginTop: "0.5rem" }}>
                    Check your email for the activation link we sent you.
                  </p>
                )}

                {/* Cancel option for pending requests */}
                {cfg.canCancel && !confirmCancel && (
                  <div className="rs-cancel-wrap">
                    <FiAlertTriangle style={{ color: "#f59e0b", flexShrink: 0 }} />
                    <span>Wrong email or data?</span>
                    <button className="rs-cancel-link" onClick={() => setConfirmCancel(true)}>
                      Cancel this request
                    </button>
                  </div>
                )}

                {/* Confirm cancel */}
                {confirmCancel && (
                  <div className="rs-confirm-wrap">
                    <p>Are you sure? This will delete your request and you'll need to submit a new one.</p>
                    <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem" }}>
                      <button
                        className="rs-confirm-yes"
                        onClick={handleCancel}
                        disabled={cancelling}
                      >
                        {cancelling ? "Cancelling..." : "Yes, Cancel Request"}
                      </button>
                      <button
                        className="rs-confirm-no"
                        onClick={() => setConfirmCancel(false)}
                      >
                        Keep Request
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="form-footer" style={{ marginTop: "1.5rem" }}>
            <p>
              Haven't submitted yet? <Link to="/register" className="login-link">Submit a request</Link>
            </p>
            <p>
              Already have an account? <Link to="/login" className="login-link">Log in</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
