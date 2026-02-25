import React from "react";
import { Link } from "react-router-dom";
import { FiUser, FiMail, FiHash } from "react-icons/fi";
import { FaGraduationCap } from "react-icons/fa";
import "./Register.css";

function Register() {
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
                <input type="text" placeholder="Ex. 202400123" />
              </div>
            </div>

            <div className="input-group">
              <label>Full Name</label>
              <div className="input-wrapper">
                <FiUser className="input-icon" />
                <input type="text" placeholder="Ex. Jane Doe" />
              </div>
            </div>

            <div className="input-group">
              <label>University Email</label>
              <div className="input-wrapper">
                <FiMail className="input-icon" />
                <input type="email" placeholder="student@university.edu" />
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

            <button type="submit" className="submit-btn">
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
