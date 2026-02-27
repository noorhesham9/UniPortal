import { FiBell, FiBook, FiSearch, FiShield, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./Unauthorized.css";

const Unauthorized = () => {
  const navigate = useNavigate();
  return (
    <div className="unauthorized-page">
      {/* Navigation Bar */}
      <header className="unauthorized-header">
        <div className="unauthorized-header-inner">
          <div className="unauthorized-brand">
            <div className="unauthorized-brand-title">
              <div className="unauthorized-brand-icon">
                <FiBook size={24} />
              </div>
              <h2>University Portal</h2>
            </div>
            <nav className="unauthorized-nav">
              <a href="#" className="unauthorized-nav-link">
                Dashboard
              </a>
              <a href="#" className="unauthorized-nav-link">
                Courses
              </a>
              <a href="#" className="unauthorized-nav-link">
                Research
              </a>
              <a href="#" className="unauthorized-nav-link">
                Library
              </a>
            </nav>
          </div>
          <div className="unauthorized-header-actions">
            <div className="unauthorized-search">
              <FiSearch className="unauthorized-search-icon" size={20} />
              <input
                type="text"
                placeholder="Search resources..."
                className="unauthorized-search-input"
              />
            </div>
            <button className="unauthorized-icon-button">
              <FiBell size={20} />{" "}
            </button>

            <div className="unauthorized-avatar">
              <FiUser size={20} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="unauthorized-main">
        <div className="unauthorized-content">
          {/* 403 Display */}
          <div className="unauthorized-code-block">
            <span className="unauthorized-code">403</span>
            <h1 className="unauthorized-title">Access Denied</h1>
          </div>

          {/* Message */}
          <div className="unauthorized-message">
            <div className="unauthorized-underline" />
            <p className="unauthorized-text">
              You do not have permission to view this page. This area is
              restricted to authorized administrative personnel only.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="unauthorized-actions">
            <button
              onClick={() => navigate("/")}
              className="unauthorized-primary-button"
            >
              <span>Return to Home</span>
            </button>
            <button className="unauthorized-secondary-button">
              <span className="material-symbols-outlined">contact_support</span>
              <span>Contact Support</span>
            </button>
          </div>

          {/* Security Notice */}
          <div className="unauthorized-security">
            <div className="unauthorized-security-badge">
              <FiShield size={20} />{" "}
              <span className="unauthorized-security-text">
                Security Protocols Active
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="unauthorized-footer">
        <div className="unauthorized-footer-inner">
          <div className="unauthorized-footer-links">
            <a href="#" className="unauthorized-footer-link">
              Security Policy
            </a>
            <a href="#" className="unauthorized-footer-link">
              Privacy Notice
            </a>
            <a href="#" className="unauthorized-footer-link">
              System Status
            </a>
            <a href="#" className="unauthorized-footer-link">
              Help Center
            </a>
          </div>
          <p className="unauthorized-footer-text">
            © 2024 University Administration. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Unauthorized;
