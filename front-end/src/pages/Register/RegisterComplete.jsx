import { useState, useEffect, useRef } from "react";
import { FaGraduationCap } from "react-icons/fa";
import { FiLock, FiMail, FiEye, FiEyeOff, FiCheckCircle, FiShield } from "react-icons/fi";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, deleteUser, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { Turnstile } from "@marsidev/react-turnstile";
import axios from "axios";
import { auth } from "../../utils/firebaseConfig";
import { registerWithToken } from "../../services/AuthServices";
import PublicNav from "../Home/PublicNav";
import "./Register.css";

const TURNSTILE_SITE_KEY = "0x4AAAAAAC_GjmneDWnvrWue";
const API = process.env.REACT_APP_API_URL || "http://localhost:3100/api/v1";

// step: "loading" | "invalid" | "challenge" | "form" | "done"

export default function RegisterComplete() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const token          = searchParams.get("token") || "";

  const [step, setStep]           = useState("loading");
  const [studentInfo, setStudentInfo] = useState(null);
  const [last4, setLast4]         = useState("");
  const [challengeError, setChallengeError] = useState("");
  const [lockedMessage, setLockedMessage]   = useState("");
  const [verifying, setVerifying] = useState(false);

  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [turnstileToken, setTurnstileToken] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const turnstileRef = useRef(null);

  // Step 1: Validate token on mount
  useEffect(() => {
    if (!token) { setStep("invalid"); return; }
    axios.get(`${API}/registration-requests/activate?token=${token}`)
      .then((res) => {
        setStudentInfo(res.data);
        setStep("challenge");
      })
      .catch(() => setStep("invalid"));
  }, [token]);

  // Step 2: Verify security challenge
  const handleChallenge = async (e) => {
    e.preventDefault();
    if (last4.length !== 4) return setChallengeError("Please enter exactly 4 digits.");
    setVerifying(true); setChallengeError("");
    try {
      await axios.post(`${API}/registration-requests/activate/verify-challenge`, { token, last4 });
      setStep("form");
    } catch (err) {
      const msg = err.response?.data?.message || "Verification failed.";
      setChallengeError(msg);
      // If locked (429), disable the input
      if (err.response?.status === 429) {
        setStep("locked");
        setLockedMessage(msg);
      }
    } finally {
      setVerifying(false);
    }
  };

  // Step 3: Create account
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) return setError("Email and password are required.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (!turnstileToken) return setError("Please complete the security check.");

    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const idToken    = await credential.user.getIdToken();

      await registerWithToken({ idToken, activationToken: token, last4, turnstileToken });
      setStep("done");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      turnstileRef.current?.reset();
      setTurnstileToken(null);
      if (auth.currentUser) {
        try {
          const cred = EmailAuthProvider.credential(email, password);
          await reauthenticateWithCredential(auth.currentUser, cred);
          await deleteUser(auth.currentUser);
        } catch {}
      }
      setError(err.response?.data?.message || err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  // ── Screens ──────────────────────────────────────────────────────────────────

  if (step === "loading") return (
    <div className="register-page"><PublicNav />
      <main className="main-content">
        <div className="register-card" style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ color: "#94a3b8" }}>Validating your activation link...</p>
        </div>
      </main>
    </div>
  );

  if (step === "locked") return (
    <div className="register-page"><PublicNav />
      <main className="main-content">
        <div className="register-card" style={{ textAlign: "center", padding: "3rem 2rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
          <h1 style={{ color: "#ef4444", marginBottom: "0.5rem" }}>Link Locked</h1>
          <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>{lockedMessage}</p>
          <p style={{ color: "#475569", fontSize: "0.82rem" }}>Please try again later or contact administration.</p>
        </div>
      </main>
    </div>
  );

  if (step === "invalid") return (
    <div className="register-page"><PublicNav />
      <main className="main-content">
        <div className="register-card" style={{ textAlign: "center", padding: "3rem 2rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>�</div>
          <h1 style={{ color: "#ef4444", marginBottom: "0.5rem" }}>Invalid or Expired Link</h1>
          <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
            This activation link is invalid or has expired (links are valid for 3 days).<br />
            Please contact the administration to get a new link.
          </p>
          <Link to="/login" className="submit-btn" style={{ display: "inline-block", textDecoration: "none", padding: "0.75rem 2rem" }}>
            Back to Login
          </Link>
        </div>
      </main>
    </div>
  );

  if (step === "done") return (
    <div className="register-page"><PublicNav />
      <main className="main-content">
        <div className="register-card" style={{ textAlign: "center", padding: "3rem 2rem" }}>
          <FiCheckCircle style={{ fontSize: "3rem", color: "#22c55e", marginBottom: "1rem" }} />
          <h1 style={{ color: "#f1f5f9", marginBottom: "0.5rem" }}>Account Activated!</h1>
          <p style={{ color: "#94a3b8" }}>Redirecting you to login...</p>
        </div>
      </main>
    </div>
  );

  if (step === "challenge") return (
    <div className="register-page"><PublicNav />
      <main className="main-content">
        <div className="register-card">
          <div className="card-header">
            <div className="logo-container">
              <div className="logo-bg"><FiShield style={{ fontSize: "1.8rem", color: "#f59e0b" }} /></div>
            </div>
            <h1>Security Verification</h1>
            <p className="description">
              Welcome, <strong style={{ color: "#f1f5f9" }}>{studentInfo?.fullName}</strong>!<br />
              To confirm your identity, enter the <strong style={{ color: "#f59e0b" }}>last 4 digits</strong> of your National ID.
            </p>
          </div>

          <form className="register-form" onSubmit={handleChallenge}>
            <div className="input-group">
              <label>Last 4 digits of National ID</label>
              <div className="input-wrapper">
                <FiShield className="input-icon" />
                <input
                  value={last4}
                  onChange={(e) => setLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. 1092"
                  maxLength={4}
                  autoFocus
                />
              </div>
              {challengeError && (
                <p style={{ color: "#ef4444", fontSize: "0.82rem", marginTop: "0.35rem" }}>{challengeError}</p>
              )}
            </div>

            <button type="submit" className="submit-btn" disabled={verifying || last4.length !== 4}>
              {verifying ? "Verifying..." : "Verify Identity"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );

  // step === "form"
  return (
    <div className="register-page"><PublicNav />
      <main className="main-content">
        <div className="register-card">
          <div className="card-header">
            <div className="logo-container">
              <div className="logo-bg"><FaGraduationCap className="logo-icon" /></div>
            </div>
            <h1>Activate Account</h1>
            <p className="description">
              Set your university email and password to complete activation.
            </p>
          </div>

          {error && (
            <p style={{ color: "#ef4444", fontSize: "0.875rem", margin: "0 0 1rem", textAlign: "center", padding: "0 1.5rem" }}>
              {error}
            </p>
          )}

          <form className="register-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label>University Email</label>
              <div className="input-wrapper">
                <FiMail className="input-icon" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="student@university.edu"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPass ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                />
                <span className="eye-icon" onClick={() => setShowPass(!showPass)} style={{ cursor: "pointer" }}>
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </span>
              </div>
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
              {loading ? "Activating..." : "Activate Account"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
