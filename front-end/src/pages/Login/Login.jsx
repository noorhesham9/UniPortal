import axios from "axios";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import { FiEye, FiEyeOff, FiLock, FiUser } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Turnstile } from "@marsidev/react-turnstile";
import { loginSuccess } from "../../services/store/reducers/authSlice";
import { loginWithToken } from "../../services/AuthServices";
import { auth } from "../../utils/firebaseConfig";
import "./Login.css";
import loginLogoSvg from "./login_logo.svg";
import PublicNav from "../Home/PublicNav";

const TURNSTILE_SITE_KEY = "0x4AAAAAAC_GjmneDWnvrWue";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState(null);
  const [error, setError] = useState("");
  const turnstileRef = useRef(null);

  useEffect(() => {
    document.body.classList.add("public-page");
    return () => document.body.classList.remove("public-page");
  }, []);

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!turnstileToken) return setError("Please complete the security check.");

    try {
      localStorage.clear();
      const cookies = document.cookie.split(";");
      for (const cookie of cookies) {
        const name = cookie.split("=")[0].trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      }
      await signOut(auth);

      let loginEmail = email.trim();
      if (!loginEmail.includes("@")) {
        try {
          const res = await axios.get(
            `${process.env.REACT_APP_API_URL || "http://localhost:3100/api/v1"}/auth/student-email/${loginEmail}`
          );
          loginEmail = res.data.email;
        } catch {
          setError("Student ID not found. Please check your ID and try again.");
          return;
        }
      }

      const result   = await signInWithEmailAndPassword(auth, loginEmail, password);
      const idToken  = await result.user.getIdToken();
      const response = await loginWithToken(idToken, turnstileToken);
      dispatch(loginSuccess(response.user));
      navigate("/dashboard");
    } catch (err) {
      turnstileRef.current?.reset();
      setTurnstileToken(null);
      if (err.response) {
        const { code, message } = err.response.data;
        if (code === "auth/user-not-found") {
          setError("No account found. Please register first.");
        } else if (code === "auth/user-inactive") {
          navigate("/inactive");
        } else {
          setError(message || "An error occurred.");
        }
      } else {
        setError(err.message || "An error occurred.");
      }
    }
  };

  return (
    <div className="login-container">
      <PublicNav />
      <div className="login-cardd">
        <div className="card-header">
          <img src={loginLogoSvg} alt="University Logo" className="logo-image" />
          <h2>University Portal</h2>
          <p className="subtitle">Secure Access Login</p>
          <h3 className="welcome-text">Welcome Back</h3>
          <p className="instruction-text">Please sign in to continue.</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label>Student ID or Email</label>
            <div className="input-wrapper">
              <FiUser className="input-icon" />
              <input
                type="text"
                placeholder="Enter your ID or email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
            <div className="label-row">
              <label>Password</label>
              <Link to="/forgot-password" style={{ color: "#FBBF24", fontSize: "12px", textDecoration: "none" }}>
                Forgot Password?
              </Link>
            </div>
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
              />
              <span className="eye-icon" onClick={() => setShowPassword(!showPassword)} style={{ cursor: "pointer" }}>
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
          </div>

          <div className="remember-me">
            <input type="checkbox" id="remember" />
            <label htmlFor="remember">Remember me on this device</label>
          </div>

          {error && <p style={{ color: "#ef4444", fontSize: "0.85rem", margin: "0", textAlign: "center" }}>{error}</p>}

          <Turnstile
            ref={turnstileRef}
            siteKey={TURNSTILE_SITE_KEY}
            onSuccess={(token) => setTurnstileToken(token)}
            onExpire={() => setTurnstileToken(null)}
            onError={() => setTurnstileToken(null)}
            options={{ theme: "dark" }}
            style={{ margin: "0.75rem 0" }}
          />

          <button type="submit" className="login-btn" disabled={!turnstileToken}>
            Log In
          </button>

          <p className="new-student">
            New student?{" "}
            <Link to="/register" className="highlight">Activate your account</Link>
          </p>
          <p className="new-student">
            Already submitted a request?{" "}
            <Link to="/register/status" className="highlight">Check status</Link>
          </p>
        </form>
      </div>

      <footer className="login-footer">
        <div className="footer-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
          <Link to="/calendar">Academic Calendar</Link>
        </div>
        <p>© 2024 University Portal. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Login;
