import { useEffect, useRef, useState } from "react";
import { FiPaperclip, FiSend } from "react-icons/fi";
import { useSelector } from "react-redux";
import { useSocket } from "../../../../context/SocketContext";
import { getConversation, getMyStudents, getUnreadCounts, sendFile, sendMessage } from "../../../../services/ChatServices";
import "./AdvisorChat.css";

function AdvisorChat() {
  const { user }  = useSelector((s) => s.auth);
  const socket = useSocket();

  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText]         = useState("");
  const [loading, setLoading]   = useState(true);
  const [sending, setSending]   = useState(false);
  const [unread, setUnread]     = useState({});

  const bottomRef    = useRef(null);
  const fileInputRef = useRef(null);
  const selectedRef  = useRef(null); // track selected inside socket handler
  const originalTitle = useRef(document.title);

  useEffect(() => {
    loadStudents();
    return () => { document.title = originalTitle.current; };
  }, []); // eslint-disable-line

  // Keep selectedRef in sync
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  // Load history when selected student changes
  useEffect(() => {
    if (!selected) return;
    setMessages([]);
    getConversation(selected._id).then((data) => {
      setMessages(data.messages);
      setUnread((prev) => ({ ...prev, [selected._id]: 0 }));
    }).catch(() => {});
  }, [selected?._id]); // eslint-disable-line

  // Socket: listen for new_message
  useEffect(() => {
    if (!socket) return;

    const handler = (msg) => {
      const senderId = String(msg.sender._id);
      if (selectedRef.current && senderId === String(selectedRef.current._id)) {
        setMessages((prev) => [...prev, msg]);
      } else {
        setUnread((prev) => ({ ...prev, [senderId]: (prev[senderId] || 0) + 1 }));
      }
    };

    socket.on("new_message", handler);
    return () => socket.off("new_message", handler);
  }, [socket]);

  // Tab title
  const totalUnread = Object.values(unread).reduce((a, b) => a + b, 0);
  useEffect(() => {
    document.title = totalUnread > 0
      ? `(${totalUnread}) Chat — Advisor`
      : originalTitle.current;
  }, [totalUnread]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadStudents = async () => {
    try {
      const [studData, unreadData] = await Promise.all([getMyStudents(), getUnreadCounts()]);
      setStudents(studData.students);
      const map = {};
      unreadData.counts.forEach(c => { map[c._id] = c.count; });
      setUnread(map);
      if (studData.students.length > 0) setSelected(studData.students[0]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!text.trim() || !selected) return;
    setSending(true);
    try {
      const data = await sendMessage(selected._id, text);
      setMessages(prev => [...prev, data.message]);
      setText("");
    } catch {}
    finally { setSending(false); }
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file || !selected) return;
    setSending(true);
    try {
      const data = await sendFile(selected._id, file);
      setMessages(prev => [...prev, data.message]);
    } catch {}
    finally { setSending(false); e.target.value = ""; }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const initials = (name) => name?.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase() || "?";
  const fmt      = (d) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const fmtDate  = (d) => new Date(d).toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

  const latestReceipt = (student) => {
    const receipts = student?.tuitionReceipts;
    if (!receipts?.length) return null;
    return [...receipts].sort((a, b) => b.academicYear.localeCompare(a.academicYear))[0];
  };

  if (loading) return <div className="ac-loading">Loading...</div>;

  return (
    <div className="ac-root">
      {/* Student roster */}
      <div className="ac-roster">
        <div className="ac-roster-header">
          <h3>Student Roster</h3>
          <span className="ac-roster-sub">Active Academic Cycles</span>
        </div>
        <div className="ac-roster-list">
          {students.length === 0 && <p className="ac-no-students">No students assigned yet.</p>}
          {students.map(s => (
            <button
              key={s._id}
              className={`ac-roster-item ${selected?._id === s._id ? "ac-roster-active" : ""}`}
              onClick={() => { setSelected(s); setUnread(prev => ({ ...prev, [s._id]: 0 })); }}
            >
              <div className="ac-roster-avatar">{initials(s.name)}</div>
              <div className="ac-roster-info">
                <span className="ac-roster-name">{s.name}</span>
                <span className={`ac-roster-status ${s.is_active ? "ac-online" : ""}`}>
                  {s.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              {unread[s._id] > 0 && <span className="ac-unread-badge">{unread[s._id]}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="ac-chat">
        {!selected ? (
          <div className="ac-no-select">Select a student to start chatting</div>
        ) : (
          <>
            <div className="ac-chat-header">
              <div className="ac-chat-avatar">{initials(selected.name)}</div>
              <div className="ac-chat-info">
                <span className="ac-chat-name">{selected.name}</span>
                <span className="ac-chat-sub">
                  {selected.is_active ? "Active" : "Inactive"} &bull; {selected.department?.name || "—"} &bull; Level {selected.level}
                </span>
              </div>
            </div>

            <div className="ac-messages">
              {messages.length === 0 && (
                <div className="ac-no-msgs">No messages yet. Start the conversation.</div>
              )}
              {messages.map((msg, i) => {
                const isMe     = msg.sender._id === user._id;
                const showDate = i === 0 || fmtDate(messages[i - 1].createdAt) !== fmtDate(msg.createdAt);
                return (
                  <div key={msg._id}>
                    {showDate && <div className="ac-date-divider">{fmtDate(msg.createdAt)}</div>}
                    <div className={`ac-msg-row ${isMe ? "ac-me" : "ac-them"}`}>
                      {!isMe && <div className="ac-bubble-avatar">{initials(msg.sender.name)}</div>}
                      <div className={`ac-bubble ${isMe ? "ac-bubble-me" : "ac-bubble-them"}`}>
                        {msg.text && <p className="ac-bubble-text">{msg.text}</p>}
                        {msg.fileUrl && (
                          msg.fileType === "image" ? (
                            <a href={msg.fileUrl} target="_blank" rel="noreferrer">
                              <img src={msg.fileUrl} alt="attachment" className="ac-bubble-img" />
                            </a>
                          ) : (
                            <a href={msg.fileUrl} target="_blank" rel="noreferrer" className="ac-file-link">
                              📄 {msg.fileName || "File"}
                            </a>
                          )
                        )}
                        <span className="ac-bubble-time">
                          {fmt(msg.createdAt)}{isMe && msg.isRead ? " • Read" : ""}
                        </span>
                      </div>
                      {isMe && <div className="ac-bubble-avatar ac-me-avatar">{initials(user.name)}</div>}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <div className="ac-input-bar">
              <button className="ac-attach-btn" onClick={() => fileInputRef.current?.click()} disabled={sending}>
                <FiPaperclip />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={handleFile} />
              <textarea
                className="ac-textarea"
                placeholder={`Message ${selected.name.split(" ")[0]}...`}
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKey}
                rows={1}
                disabled={sending}
              />
              <button className="ac-send-btn" onClick={handleSend} disabled={sending || !text.trim()}>
                <FiSend />
              </button>
            </div>
            <p className="ac-enc-note">SHIFT + ENTER FOR NEW LINE</p>
          </>
        )}
      </div>

      {/* Student detail panel */}
      {selected && (() => {
        const receipt = latestReceipt(selected);
        return (
          <div className="ac-detail">
            <div className="ac-detail-avatar">{initials(selected.name)}</div>
            <h4 className="ac-detail-name">{selected.name}</h4>
            <span className="ac-detail-id">ID: {selected.studentId || "—"}</span>
            <span className={`ac-detail-badge ${selected.is_active ? "ac-badge-active" : "ac-badge-inactive"}`}>
              {selected.is_active ? "Active" : "Inactive"}
            </span>
            <div className="ac-detail-section">
              <span className="ac-detail-label">DEPARTMENT</span>
              <span className="ac-detail-value">{selected.department?.name || "—"}</span>
            </div>
            <div className="ac-detail-section">
              <span className="ac-detail-label">LEVEL</span>
              <span className="ac-detail-value">{selected.level || "—"}</span>
            </div>
            <div className="ac-detail-section">
              <span className="ac-detail-label">FEES STATUS</span>
              <span className={`ac-detail-value ${selected.feesPaid ? "ac-paid" : "ac-unpaid"}`}>
                {selected.feesPaid ? "Paid" : "Unpaid"}
              </span>
            </div>
            <div className="ac-detail-section">
              <span className="ac-detail-label">LATEST RECEIPT</span>
              <span className="ac-detail-value">
                {receipt?.url ? (
                  <>
                    <a href={receipt.url} target="_blank" rel="noreferrer" className="ac-receipt-link">View</a>
                    {" "}
                    <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                      ({receipt.academicYear} · {receipt.status})
                    </span>
                  </>
                ) : "Not uploaded"}
              </span>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default AdvisorChat;
