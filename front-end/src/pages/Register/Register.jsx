import axios from "axios";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { useState } from "react";
import { FaGraduationCap } from "react-icons/fa";
import { FiHash, FiLock, FiMail, FiUser } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../../utils/firebaseConfig";
import "./Register.css";

function Register() {
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const navigate = useNavigate();

  const handleDeleteAccount = async (password) => {
    const user = auth.currentUser;
    try {
      // 1. Create a credential object with the user's current email and their password
      const credential = EmailAuthProvider.credential(user.email, password);

      // 2. Re-authenticate the user
      await reauthenticateWithCredential(user, credential);

      // 3. Now that they are "recently logged in," delete the account
      await deleteUser(user);
      console.log("User deleted successfully");
    } catch (error) {
      if (error.code === "auth/wrong-password") {
        console.error("Incorrect password.");
      } else {
        console.error("Error during deletion:", error.message);
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // 1. سجل اليوزر في فايربيز الأول
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const idToken = await userCredential.user.getIdToken();

      // 2. ابعت الـ idToken مع الـ StudentID للباك إند بتاعك
      const response = await axios.post(
        "http://localhost:3100/api/v1/auth/register",
        {
          idToken,
          studentId,
          name: fullName,
          email: email,
        },
        { withCredentials: true },
      );

      if (response.data.success) {
        alert("Registration Complete!");
        navigate("/dashboard");
      }
    } catch (error) {
      // لو الباك إند رفض (مثلاً الـ ID مش مفعل)، لازم نمسح اليوزر من فايربيز عشان ميبقاش "معلق"
      if (auth.currentUser) await handleDeleteAccount(password);

      const errorMessage = error.response?.data?.message || error.message;
      alert("Registration Failed: " + errorMessage);
    }
  };
  return (
    <div className="register-page">
      <main className="main-content">
        <div className="register-card">
          <div className="card-header">
            <div className="logo-container">
              <div className="logo-bg">
                <FaGraduationCap className="logo-icon" />
              </div>
            </div>
            <h1>Create Account</h1>
            <p className="description">
              Join the University Portal to manage your academic journey.
            </p>
          </div>

          <form className="register-form">
            <div className="input-group">
              <label>Student ID</label>
              <div className="input-wrapper">
                <FiHash className="input-icon" />
                <input
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  type="text"
                  placeholder="Ex. 202400123"
                />
              </div>
            </div>

            <div className="input-group">
              <label>Full Name</label>
              <div className="input-wrapper">
                <FiUser className="input-icon" />
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  type="text"
                  placeholder="Ex. Jane Doe"
                />
              </div>
            </div>

            <div className="input-group">
              <label>University Email</label>
              <div className="input-wrapper">
                <FiMail className="input-icon" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="student@university.edu"
                />
              </div>
            </div>

            <div className="input-group">
              <label>Your Password</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="checkbox-group">
              <input type="checkbox" id="terms" />
              <label htmlFor="terms">
                I agree to the{" "}
                <span className="highlight">Terms of Service</span> and{" "}
                <span className="highlight">Privacy Policy</span>
              </label>
            </div>

            <button
              type="submit"
              className="submit-btn"
              onClick={handleRegister}
            >
              Create Account
            </button>

            <div className="form-footer">
              <p>
                Already have an account?
                <Link to="/login" className="login-link">
                  {" "}
                  Log in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </main>

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

export default Register;
