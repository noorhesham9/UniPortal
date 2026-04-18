import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import PublicNav from "../Home/PublicNav";

const API = process.env.REACT_APP_API_URL || "http://localhost:3100/api/v1";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) { setStatus("error"); setMessage("Invalid verification link."); return; }

    axios.get(`${API}/registration-requests/verify-email?token=${token}`)
      .then(() => { setStatus("success"); })
      .catch((err) => {
        setStatus("error");
        setMessage(err.response?.data?.message || "Verification failed or link expired.");
      });
  }, []);

  return (
    <div className="register-page">
      <PublicNav />
      <main className="main-content">
        <div className="register-card" style={{ textAlign: "center", padding: "3rem 2rem" }}>
          {status === "loading" && <p style={{ color: "#94a3b8" }}>Verifying your email...</p>}
          {status === "success" && (
            <>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
              <h1 style={{ color: "#f1f5f9", marginBottom: "0.5rem" }}>Email Verified</h1>
              <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
                Your email has been verified. Your registration request is now pending admin approval.
                You'll receive an email once it's reviewed.
              </p>
              <Link to="/login" className="submit-btn" style={{ display: "inline-block", textDecoration: "none", padding: "0.75rem 2rem" }}>
                Back to Login
              </Link>
            </>
          )}
          {status === "error" && (
            <>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>❌</div>
              <h1 style={{ color: "#ef4444", marginBottom: "0.5rem" }}>Verification Failed</h1>
              <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>{message}</p>
              <Link to="/register" className="submit-btn" style={{ display: "inline-block", textDecoration: "none", padding: "0.75rem 2rem" }}>
                Try Again
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
