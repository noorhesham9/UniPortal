import axios from "axios";
import {
  deleteUser,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { FiEye, FiEyeOff, FiLock, FiUser } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { loginSuccess } from "../../services/store/reducers/authSlice";
import { loginWithToken } from "../../services/AuthServices";
import { auth, googleProvider } from "../../utils/firebaseConfig";
import "./Login.css";
import loginLogoSvg from "./login_logo.svg";
function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // التحقق من وجود token - إذا كان موجوداً، انتقل إلى dashboard
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      localStorage.clear();

      // كود مسح الكوكيز اللي كتبناه فوق
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
        document.cookie =
          name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      }
      await signOut(auth);
      console.log("Previous Firebase session cleared");
      const result = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await result.user.getIdToken();

      console.log("Result:", result);
      console.log("Firebase ID Token:", idToken);
      const response = await loginWithToken(idToken);

      dispatch(loginSuccess(response.user));
      navigate("/dashboard");
    } catch (error) {
      if (error.response) {
        const { code, message } = error.response.data;
        if (code === "auth/user-not-found") {
          alert("الحساب ده مش موجود عندنا في قاعدة البيانات، سجل الأول");
        } else {
          alert(message || "حدث خطأ ما");
        }
      } else {
        console.error("Error without response:", error.message);
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      localStorage.clear();

      // كود مسح الكوكيز اللي كتبناه فوق
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
        document.cookie =
          name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      }

      await signOut(auth);
      console.log("Previous Firebase session cleared");
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      // const userEmail = result.user.email;
      // const methods = await fetchSignInMethodsForEmail(auth, userEmail);
      // console.log("Sign-in methods for email:", methods);
      // if (methods.length > 0 && !methods.includes("google.com")) {
      //   console.log(methods);
      //   console.log("الحساب موجود بالباسورد، جاري الربط...");

      //   // هنا المشكلة إن الربط (Link) بيحتاج اليوزر يكون مسجل دخول بالباسورد الأول
      //   // فالحل الأفضل لليوزر هو إظهار رسالة:
      //   alert(
      //     "هذا الحساب مسجل بالباسورد. يرجى تسجيل الدخول بالباسورد مرة واحدة لربط حساب جوجل.",
      //   );

      //   // كحل بديل (لو مش عايز تضايق اليوزر):
      //   // فيربيز أحياناً بيعمل الـ Linking تلقائياً لو الإعدادات "Link accounts with same email" مفعلة
      //   // بس عشان تضمن إن الباسورد ميتمسحش، لازم اليوزر يكون عمل Login بالباسورد الأول.
      // }
      console.log("Firebase ID Token:", idToken);

      const response = await loginWithToken(idToken);

      if (response.success) {
        dispatch(loginSuccess(response.user));
        navigate("/dashboard");
      }
    } catch (error) {
      const user = auth.currentUser;
      await deleteUser(user);
      console.error(
        "Login Error:",
        error.response?.data?.message || error.message,
      );
    }
  };

  return (
    <div className="login-container">
      <div className="login-cardd ">
        <div className="card-header">
          <img
            src={loginLogoSvg}
            alt="University Logo"
            className="logo-image"
          />
          <h2>University Portal</h2>
          <p className="subtitle">Secure Access Login</p>

          <h3 className="welcome-text">Welcome Back</h3>
          <p className="instruction-text">Please sign in to continue.</p>
        </div>
        <form onSubmit={handleEmailLogin} className="login-form">
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
              <Link
                to="/forgot-password"
                style={{
                  color: "#FBBF24",
                  fontSize: "12px",
                  textDecoration: "none",
                }}
              >
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
              <span
                className="eye-icon"
                onClick={togglePasswordVisibility}
                style={{ cursor: "pointer" }}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
          </div>

          <div className="remember-me">
            <input type="checkbox" id="remember" />
            <label htmlFor="remember">Remember me on this device</label>
          </div>

          <button type="submit" className="login-btn">
            Log In
          </button>
          <button
            type="button"
            onClick={handleGoogleLogin}
            style={{
              marginTop: "10px",
            }}
            className="login-btn"
          >
            Log In with Google
          </button>

          <p className="new-student">
            New student?{" "}
            <Link to="/register" className="highlight">
              Activate your account
            </Link>
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
