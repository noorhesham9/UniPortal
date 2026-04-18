import { useNavigate, useLocation } from "react-router-dom";
import "./Home.css";

export default function PublicNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="home-nav">
      <span className="home-nav-logo" onClick={() => navigate("/")}>UniPortal</span>
      <div className="home-nav-links">
        <a href="/">Home</a>
        <a href="/about">About</a>
        <a href="/departments">Departments</a>
      </div>
      <div className="home-nav-actions">
        {pathname !== "/login" && (
          <button className="home-btn-ghost" onClick={() => navigate("/login")}>Login</button>
        )}
        {pathname !== "/register" && (
          <button className="home-btn-primary" onClick={() => navigate("/register")}>Apply Now</button>
        )}
      </div>
    </nav>
  );
}
