import { useEffect, useState } from "react";
import { FiBell, FiSearch, FiSend, FiUser, FiX } from "react-icons/fi";
import { getStudents, sendAdvisorNotification } from "../../../../services/NotificationServices";
import "./AdvisorNotifications.css";

export default function AdvisorNotifications() {
  const [students, setStudents]       = useState([]);
  const [search, setSearch]           = useState("");
  const [selected, setSelected]       = useState([]);
  const [title, setTitle]             = useState("");
  const [body, setBody]               = useState("");
  const [loading, setLoading]         = useState(false);
  const [fetching, setFetching]       = useState(true);
  const [toast, setToast]             = useState(null); // { type: 'success'|'error', msg }

  useEffect(() => {
    getStudents()
      .then((res) => setStudents(res.data || []))
      .catch(() => showToast("error", "Failed to load students"))
      .finally(() => setFetching(false));
  }, []);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const filtered = students.filter((s) =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.studentId?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStudent = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const selectAll = () =>
    setSelected(filtered.map((s) => s._id));

  const clearAll = () => setSelected([]);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) return showToast("error", "Title and message are required");
    if (selected.length === 0) return showToast("error", "Select at least one student");

    setLoading(true);
    try {
      const res = await sendAdvisorNotification({ studentIds: selected, title, body });
      showToast("success", res.message || "Notification sent!");
      setTitle("");
      setBody("");
      setSelected([]);
    } catch {
      showToast("error", "Failed to send notification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="an-root">
      {/* Toast */}
      {toast && (
        <div className={`an-toast an-toast--${toast.type}`}>
          {toast.msg}
        </div>
      )}

      <div className="an-header">
        <div className="an-header-left">
          <div className="an-icon-wrap"><FiBell size={20} /></div>
          <div>
            <h1 className="an-title">Send Notification</h1>
            <p className="an-subtitle">Send a push notification to your students</p>
          </div>
        </div>
      </div>

      <div className="an-body">
        {/* Left: Student picker */}
        <div className="an-card">
          <div className="an-card-header">
            <span className="an-card-title">Students</span>
            <div className="an-actions">
              <button className="an-btn-ghost" onClick={selectAll}>Select All</button>
              {selected.length > 0 && (
                <button className="an-btn-ghost an-btn-ghost--red" onClick={clearAll}>
                  Clear ({selected.length})
                </button>
              )}
            </div>
          </div>

          <div className="an-search-wrap">
            <FiSearch className="an-search-icon" />
            <input
              className="an-search"
              placeholder="Search by name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="an-student-list">
            {fetching ? (
              <div className="an-empty">Loading students...</div>
            ) : filtered.length === 0 && students.length === 0 ? (
              <div className="an-empty">No students assigned to you as advisor yet.</div>
            ) : filtered.length === 0 ? (
              <div className="an-empty">No students match your search</div>
            ) : (
              filtered.map((s) => {
                const isSelected = selected.includes(s._id);
                return (
                  <button
                    key={s._id}
                    className={`an-student-item${isSelected ? " selected" : ""}`}
                    onClick={() => toggleStudent(s._id)}
                  >
                    <div className="an-student-avatar">
                      <FiUser size={14} />
                    </div>
                    <div className="an-student-info">
                      <span className="an-student-name">{s.name}</span>
                      <span className="an-student-id">{s.studentId || "—"}</span>
                    </div>
                    {isSelected && <div className="an-student-check">✓</div>}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Compose */}
        <div className="an-card an-compose">
          <div className="an-card-header">
            <span className="an-card-title">Compose Message</span>
            {selected.length > 0 && (
              <span className="an-badge">{selected.length} selected</span>
            )}
          </div>

          <div className="an-field">
            <label className="an-label">Title</label>
            <input
              className="an-input"
              placeholder="Notification title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
            <span className="an-char">{title.length}/100</span>
          </div>

          <div className="an-field">
            <label className="an-label">Message</label>
            <textarea
              className="an-textarea"
              placeholder="Write your message here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={300}
              rows={5}
            />
            <span className="an-char">{body.length}/300</span>
          </div>

          {/* Preview */}
          {(title || body) && (
            <div className="an-preview">
              <span className="an-preview-label">Preview</span>
              <div className="an-preview-card">
                <div className="an-preview-icon"><FiBell size={16} /></div>
                <div>
                  <p className="an-preview-title">{title || "Title"}</p>
                  <p className="an-preview-body">{body || "Message..."}</p>
                </div>
              </div>
            </div>
          )}

          <button
            className="an-send-btn"
            onClick={handleSend}
            disabled={loading}
          >
            {loading ? (
              <span className="an-spinner" />
            ) : (
              <><FiSend size={16} /> Send Notification</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}