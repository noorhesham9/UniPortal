import { FiBell, FiLogOut, FiUser } from "react-icons/fi";
import { FaGraduationCap } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../../services/store/reducers/authSlice";
import { logoutApi } from "../../../services/AuthServices";
import "./Header.css";

const Header = ({ actions }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await logoutApi(); } catch {}
    dispatch(logoutUser());
    navigate("/login");
  };

  return (
    <header className="dash-header">
      <div className="dash-header-left">
        <div className="dash-header-logo">
          <FaGraduationCap />
        </div>
        <div className="dash-header-sys">
          <span className="sys-name">Student Portal</span>
          <span className="sys-term">Academic Session 2024-2025</span>
        </div>
      </div>

      <div className="dash-header-right">
        {actions ? (
          <div className="dash-header-actions">
            {actions}
            <button className="header-logout-btn" onClick={handleLogout} title="Logout">
              <FiLogOut />
            </button>
          </div>
        ) : (
          <div className="dash-header-actions">
            <div className="header-icon-btn">
              <FiBell />
              <span className="header-badge">3</span>
            </div>
            <div className="header-user-avatar">
              {user?.name ? user.name[0].toUpperCase() : <FiUser />}
            </div>
            <button className="header-logout-btn" onClick={handleLogout} title="Logout">
              <FiLogOut />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
