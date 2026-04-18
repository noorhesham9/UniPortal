import { useEffect, useRef, useState } from "react";
import { FiBell, FiLogOut, FiUser } from "react-icons/fi";
import { FaGraduationCap } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { logoutUser } from "../../../services/store/reducers/authSlice";
import { logoutApi } from "../../../services/AuthServices";
import api from "../../../services/api";
import "./Header.css";

const Header = ({ actions }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropRef = useRef(null);

  const isStudent = user?.role?.name === "student";
  const currentSection = searchParams.get("section");

  useEffect(() => {
    if (!isStudent) return;
    fetchNotifications();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isStudent]);

  // Refresh unread count when navigating away from notifications page
  useEffect(() => {
    if (!isStudent) return;
    fetchNotifications();
  }, [currentSection]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications/my?limit=5");
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch {}
  };

  const handleOpen = async () => {
    setOpen((prev) => !prev);
    if (!open && unreadCount > 0) {
      try {
        await api.patch("/notifications/mark-read", { ids: [] });
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      } catch {}
    }
  };

  const handleLogout = async () => {
    try { await logoutApi(); } catch {}
    dispatch(logoutUser());
    navigate("/login");
  };

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
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
            {/* Notification Bell */}
            {isStudent && (
              <div className="header-notif-wrap" ref={dropRef}>
                <button className="header-icon-btn" onClick={handleOpen}>
                  <FiBell />
                  {unreadCount > 0 && (
                    <span className="header-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
                  )}
                </button>

                {open && (
                  <div className="header-notif-dropdown">
                    <div className="header-notif-top">
                      <span>Notifications</span>
                      <button
                        className="header-notif-all"
                        onClick={() => { setOpen(false); navigate("/dashboard?section=notifications"); }}
                      >
                        View all
                      </button>
                    </div>

                    {notifications.length === 0 ? (
                      <div className="header-notif-empty">No notifications yet</div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n._id} className={`header-notif-item ${n.isRead ? "" : "unread"}`}>
                          <div className="header-notif-icon">
                            {n.type === "admin" ? "🔔" : "👤"}
                          </div>
                          <div className="header-notif-content">
                            <p className="header-notif-title">{n.title}</p>
                            <p className="header-notif-body">{n.body}</p>
                            <span className="header-notif-time">{timeAgo(n.createdAt)}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

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
