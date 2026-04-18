import { useState } from "react";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { FiCheckCircle, FiEye, FiEyeOff, FiLock } from "react-icons/fi";
import { auth } from "../../../../utils/firebaseConfig";

export default function ChangePassword() {
  const [current, setCurrent]   = useState("");
  const [next, setNext]         = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext]       = useState(false);
  const [status, setStatus]     = useState("idle"); // idle | loading | success | error
  const [error, setError]       = useState("");

  const checks = {
    length:    next.length >= 8,
    uppercase: /[A-Z]/.test(next),
    number:    /[0-9]/.test(next),
    special:   /[!@#$%^&*(),.?":{}|<>]/.test(next),
    match:     next === confirm && confirm !== "",
  };
  const allValid = Object.values(checks).every(Boolean) && current.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allValid) return;
    setStatus("loading"); setError("");
    try {
      const user       = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, current);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, next);
      setStatus("success");
      setCurrent(""); setNext(""); setConfirm("");
    } catch (err) {
      setStatus("error");
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setError("Current password is incorrect.");
      } else {
        setError(err.message || "Failed to change password.");
      }
    }
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "0.4rem",
    padding: "0.65rem 0.75rem",
    color: "#f1f5f9",
    fontSize: "0.875rem",
    outline: "none",
    width: "100%",
    fontFamily: "inherit",
  };

  const labelStyle = {
    display: "flex", flexDirection: "column", gap: "0.4rem",
    fontSize: "0.75rem", color: "#64748b",
    textTransform: "uppercase", letterSpacing: ".05em",
  };

  return (
    <div style={{ maxWidth: 440 }}>
      <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f1f5f9", marginBottom: "1.5rem" }}>
        Change Password
      </h2>

      {status === "success" && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#22c55e", marginBottom: "1rem", fontSize: "0.875rem" }}>
          <FiCheckCircle /> Password updated successfully.
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {/* Current password */}
        <label style={labelStyle}>
          Current Password
          <div style={{ position: "relative" }}>
            <FiLock style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
            <input
              type={showCurrent ? "text" : "password"}
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="Enter current password"
              style={{ ...inputStyle, paddingLeft: "2.25rem", paddingRight: "2.5rem" }}
            />
            <span
              onClick={() => setShowCurrent(!showCurrent)}
              style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#64748b" }}
            >
              {showCurrent ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>
        </label>

        {/* New password */}
        <label style={labelStyle}>
          New Password
          <div style={{ position: "relative" }}>
            <FiLock style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
            <input
              type={showNext ? "text" : "password"}
              value={next}
              onChange={(e) => setNext(e.target.value)}
              placeholder="Min. 8 characters"
              style={{ ...inputStyle, paddingLeft: "2.25rem", paddingRight: "2.5rem" }}
            />
            <span
              onClick={() => setShowNext(!showNext)}
              style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#64748b" }}
            >
              {showNext ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>
        </label>

        {/* Confirm */}
        <label style={labelStyle}>
          Confirm New Password
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat new password"
            style={inputStyle}
          />
        </label>

        {/* Requirements */}
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.3rem" }}>
          {[
            [checks.length,    "At least 8 characters"],
            [checks.uppercase, "One uppercase letter"],
            [checks.number,    "One number"],
            [checks.special,   "One special character"],
            [checks.match,     "Passwords match"],
          ].map(([met, label]) => (
            <li key={label} style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.78rem", color: met ? "#22c55e" : "#475569" }}>
              {met ? <FiCheckCircle size={13} /> : <span style={{ width: 13, height: 13, borderRadius: "50%", border: "1px solid #475569", display: "inline-block" }} />}
              {label}
            </li>
          ))}
        </ul>

        {error && <p style={{ color: "#ef4444", fontSize: "0.82rem", margin: 0 }}>{error}</p>}

        <button
          type="submit"
          disabled={!allValid || status === "loading"}
          style={{
            background: allValid ? "#f59e0b" : "rgba(245,158,11,0.3)",
            color: "#0d1b2a",
            border: "none",
            borderRadius: "0.4rem",
            padding: "0.7rem",
            fontWeight: 700,
            fontSize: "0.875rem",
            cursor: allValid ? "pointer" : "not-allowed",
            transition: "opacity .15s",
          }}
        >
          {status === "loading" ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
