import { useEffect, useState } from "react";
import { FiBell, FiCheck } from "react-icons/fi";
import api from "../../../../services/api";
import "./Notifications.css";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 20;

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/notifications/my?page=${page}&limit=${LIMIT}`);
      setNotifications(res.data.notifications || []);
      setTotal(res.data.total || 0);
    } catch {}
    finally { setLoading(false); }
  };

  const markAllRead = async () => {
    try {
      await api.patch("/notifications/mark-read", { ids: [] });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(date).toLocaleDateString();
  };

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="notif-page">
      <div className="notif-header">
        <div>
          <h1>Notifications</h1>
          <p>{total} total {unread > 0 && `• ${unread} unread`}</p>
        </div>
        {unread > 0 && (
          <button className="notif-mark-all" onClick={markAllRead}>
            <FiCheck size={14} /> Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="notif-loading">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="notif-empty">
          <FiBell size={40} />
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="notif-list">
          {notifications.map((n) => (
            <div key={n._id} className={`notif-item ${n.isRead ? "" : "unread"}`}>
              <div className="notif-item-icon">
                {n.type === "admin" ? "🔔" : "👤"}
              </div>
              <div className="notif-item-content">
                <div className="notif-item-top">
                  <span className="notif-item-title">{n.title}</span>
                  <span className="notif-item-time">{timeAgo(n.createdAt)}</span>
                </div>
                <p className="notif-item-body">{n.body}</p>
                {n.sender?.name && (
                  <span className="notif-item-sender">
                    From: {n.sender.name}
                  </span>
                )}
              </div>
              {!n.isRead && <div className="notif-unread-dot" />}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > LIMIT && (
        <div className="notif-pagination">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <span>Page {page} of {Math.ceil(total / LIMIT)}</span>
          <button disabled={page >= Math.ceil(total / LIMIT)} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
