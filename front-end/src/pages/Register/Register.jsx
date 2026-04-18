import { useState, useEffect, useRef } from "react";
import { FaGraduationCap } from "react-icons/fa";
import { FiHash, FiMail, FiUser, FiCreditCard, FiUpload, FiCheckCircle } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Turnstile } from "@marsidev/react-turnstile";
import axios from "axios";
import "./Register.css";
import PublicNav from "../Home/PublicNav";

const TURNSTILE_SITE_KEY = "0x4AAAAAAC_GjmneDWnvrWue";
const API = process.env.REACT_APP_API_URL || "http://localhost:3100/api/v1";

function Register() {
  const [step, setStep]               = useState(1); // 1=form, 2=success
  const [studentId, setStudentId]     = useState("");
  const [nationalId, setNationalId]   = useState("");
  const [examSeat, setExamSeat]       = useState("");
  const [fullName, setFullName]       = useState("");
  const [personalEmail, setPersonalEmail] = useState("");
  const [idCardFile, setIdCardFile]   = useState(null);
  const [idCardPreview, setIdCardPreview] = useState(null);
  const [turnstileToken, setTurnstileToken] = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const turnstileRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    document.body.classList.add("public-page");
    return () => document.body.classList.remove("public-page");
  }, []);

  const handleIdCardChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIdCardFile(file);
    setIdCardPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!studentId || !nationalId || !examSeat || !fullName || !personalEmail) {
      return setError("All fields are required.");
    }
    if (!idCardFile) return setError("Please upload a photo of your national ID card.");
    if (!turnstileToken) return setError("Please complete the security check.");

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("studentId",      studentId.trim());
      fd.append("nationalId",     nationalId.trim());
      fd.append("examSeatNumber", examSeat.trim());
      fd.append("fullName",       fullName.trim());
      fd.append("personalEmail",  personalEmail.trim());
      fd.append("idCardImage",    idCardFile);
      fd.append("turnstileToken", turnstileToken);

      await axios.post(`${API}/registration-requests`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setStep(2);
    } catch (err) {
      turnstileRef.current?.reset();
      setTurnstileToken(null);
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (step === 2) {
    return (
      <div className="register-page">
        <PublicNav />
        <main className="main-content">
          <div className="register-card" style={{ textAlign: "center", padding: "3rem 2rem" }}>
            <FiCheckCircle style={{ fontSize: "3rem", color: "#22c55e", marginBottom: "1rem" }} />
            <h1 style={{ color: "#f1f5f9", marginBottom: "0.5rem" }}>Request Submitted</h1>
            <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
              We sent a verification link to <strong style={{ color: "#f1f5f9" }}>{personalEmail}</strong>.
              <br />Please verify your email, then wait for admin approval.
              <br />You'll receive an email once your request is reviewed.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/login" className="submit-btn" style={{ display: "inline-block", textDecoration: "none", padding: "0.75rem 2rem" }}>
                Back to Login
              </Link>
              <Link
                to={`/register/status`}
                style={{ display: "inline-block", textDecoration: "none", padding: "0.75rem 2rem", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "0.4rem", color: "#94a3b8", fontSize: "0.875rem" }}
              >
                Check Request Status
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="register-page">
      <PublicNav />
      <main className="main-content">
        <div className="register-card">
          <div className="card-header">
            <div className="logo-container">
              <div className="logo-bg"><FaGraduationCap className="logo-icon" /></div>
            </div>
            <h1>Registration Request</h1>
            <p className="description">
              Submit your identity details for admin verification before activating your account.
            </p>
          </div>

          {error && <p style={{ color: "#ef4444", fontSize: "0.875rem", margin: "0 0 1rem", textAlign: "center" }}>{error}</p>}

          <form className="register-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Student ID</label>
              <div className="input-wrapper">
                <FiHash className="input-icon" />
                <input value={studentId} onChange={(e) => setStudentId(e.target.value)} type="text" placeholder="e.g. 2024-10452" />
              </div>
            </div>

            <div className="input-group">
              <label>National ID (الرقم القومي)</label>
              <div className="input-wrapper">
                <FiCreditCard className="input-icon" />
                <input value={nationalId} onChange={(e) => setNationalId(e.target.value)} type="text" placeholder="14-digit national ID" maxLength={14} />
              </div>
            </div>

            <div className="input-group">
              <label>Exam Seat Number (رقم الجلوس)</label>
              <div className="input-wrapper">
                <FiHash className="input-icon" />
                <input value={examSeat} onChange={(e) => setExamSeat(e.target.value)} type="text" placeholder="Thanaweyya Amma seat number" />
              </div>
            </div>

            <div className="input-group">
              <label>Full Name</label>
              <div className="input-wrapper">
                <FiUser className="input-icon" />
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} type="text" placeholder="Your full name" />
              </div>
            </div>

            <div className="input-group">
              <label>Personal Email</label>
              <div className="input-wrapper">
                <FiMail className="input-icon" />
                <input value={personalEmail} onChange={(e) => setPersonalEmail(e.target.value)} type="email" placeholder="your.personal@email.com" />
              </div>
            </div>

            {/* ID Card Upload */}
            <div className="input-group">
              <label>National ID Card Photo</label>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleIdCardChange} style={{ display: "none" }} id="id-card-input" />
              <label htmlFor="id-card-input" className="reg-upload-zone">
                {idCardPreview ? (
                  <img src={idCardPreview} alt="ID card preview" className="reg-id-preview" />
                ) : (
                  <div className="reg-upload-placeholder">
                    <FiUpload />
                    <span>Click to upload ID card photo</span>
                    <span style={{ fontSize: "0.72rem", color: "#475569" }}>JPG, PNG — clear photo required</span>
                  </div>
                )}
              </label>
            </div>

            <Turnstile
              ref={turnstileRef}
              siteKey={TURNSTILE_SITE_KEY}
              onSuccess={(token) => setTurnstileToken(token)}
              onExpire={() => setTurnstileToken(null)}
              onError={() => setTurnstileToken(null)}
              options={{ theme: "dark" }}
              style={{ margin: "0.75rem 0" }}
            />

            <button type="submit" className="submit-btn" disabled={loading || !turnstileToken}>
              {loading ? "Submitting..." : "Submit Request"}
            </button>

            <div className="form-footer">
              <p>Already have an account? <Link to="/login" className="login-link">Log in</Link></p>
            </div>
          </form>
        </div>
      </main>

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

export default Register;
