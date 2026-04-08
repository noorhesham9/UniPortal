import { useEffect, useRef, useState } from "react";
import { FiPaperclip, FiSend } from "react-icons/fi";
import { useSelector } from "react-redux";
import { useSocket } from "../../../../context/SocketContext";
import { getConversation, getMyAdvisor, sendFile, sendMessage } from "../../../../services/ChatServices";
import "./StudentChat.css";

function StudentChat() {
  const { user }  = useSelector((s) => s.auth);
  const socket = useSocket();

  const [advisor, setAdvisor]         = useState(null);
  const [messages, setMessages]       = useState([]);
  const [text, setText]               = useState("");
  const [loading, setLoading]         = useState(true);
  const [sending, setSending]         = useState(false);
  const [error, setError]             = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const bottomRef     = useRef(null);
  const fileInputRef  = useRef(null);
  const advisorIdRef  = useRef(null);
  const originalTitle = useRef(document.title);

  // Load advisor + history, then subscribe to socket events
  useEffect(() => {
    loadAdvisor();
    return () => { document.title = originalTitle.current; };
  }, []); // eslint-disable-line

  const loadAdvisor = async () => {
    try {
      const data = await getMyAdvisor();
      setAdvisor(data.advisor);
      advisorIdRef.current = data.advisor._id;
      const hist = await getConversation(data.advisor._id);
      setMessages(hist.messages);
    } catch (e) {
      setError(e.response?.data?.message || "No advisor assigned yet");
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch history on socket reconnect to catch any messages missed during disconnect
  useEffect(() => {
    if (!socket || !advisorIdRef.current) return;
    console.log("[StudentChat] Socket ready, id:", socket.id, "— re-fetching history");
    getConversation(advisorIdRef.current).then((data) => {
      setMessages(data.messages);
    }).catch(() => {});
  }, [socket]);

  // Socket: listen for new_message events
  useEffect(() => {
    if (!socket) return;
    console.log("[StudentChat] Attaching new_message listener on socket:", socket.id);

    const handler = (msg) => {
      console.log("[StudentChat] new_message received:", msg._id, "from:", msg.sender._id, "advisorId:", advisorIdRef.current);
      if (String(msg.sender._id) !== String(advisorIdRef.current)) {
        console.log("[StudentChat] Ignored — sender is not advisor");
        return;
      }
      setMessages((prev) => [...prev, msg]);
      setUnreadCount((c) => c + 1);
    };

    socket.on("new_message", handler);
    return () => socket.off("new_message", handler);
  }, [socket]);

  // Tab title
  useEffect(() => {
    document.title = unreadCount > 0
      ? `(${unreadCount}) Chat — Advisor`
      : originalTitle.current;
  }, [unreadCount]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || !advisor) return;
    setSending(true);
    try {
      const data = await sendMessage(advisor._id, text);
      setMessages((prev) => [...prev, data.message]);
      setText("");
    } catch {
      setError("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file || !advisor) return;
    setSending(true);
    try {
      const data = await sendFile(advisor._id, file);
      setMessages((prev) => [...prev, data.message]);
    } catch {
      setError("Failed to send file");
    } finally {
      setSending(false);
      e.target.value = "";
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const initials = (name) => name?.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase() || "?";
  const fmt      = (d) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const fmtDate  = (d) => new Date(d).toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

  if (loading) return <div className="sc-loading">Loading...</div>;
  if (error && !advisor) return <div className="sc-empty">{error}</div>;

  return (
    <div className="sc-root" onClick={() => setUnreadCount(0)}>
      <div className="sc-advisor-bar">
        <div className="sc-advisor-avatar">{initials(advisor?.name)}</div>
        <div className="sc-advisor-info">
          <span className="sc-advisor-name">{advisor?.name}</span>
          <span className="sc-advisor-role">Academic Advisor &bull; {advisor?.department?.name || ""}</span>
        </div>
        <div className="sc-advisor-meta">
          <span className="sc-meta-item"><strong>Email:</strong> {advisor?.email}</span>
        </div>
      </div>

      <div className="sc-messages">
        {messages.length === 0 && (
          <div className="sc-no-msgs">No messages yet. Say hello to your advisor!</div>
        )}
        {messages.map((msg, i) => {
          const isMe     = msg.sender._id === user._id;
          const showDate = i === 0 || fmtDate(messages[i - 1].createdAt) !== fmtDate(msg.createdAt);
          return (
            <div key={msg._id}>
              {showDate && <div className="sc-date-divider">{fmtDate(msg.createdAt)}</div>}
              <div className={`sc-msg-row ${isMe ? "sc-me" : "sc-them"}`}>
                {!isMe && <div className="sc-bubble-avatar">{initials(msg.sender.name)}</div>}
                <div className={`sc-bubble ${isMe ? "sc-bubble-me" : "sc-bubble-them"}`}>
                  {msg.text && <p className="sc-bubble-text">{msg.text}</p>}
                  {msg.fileUrl && (
                    msg.fileType === "image" ? (
                      <a href={msg.fileUrl} target="_blank" rel="noreferrer">
                        <img src={msg.fileUrl} alt="attachment" className="sc-bubble-img" />
                      </a>
                    ) : (
                      <a href={msg.fileUrl} target="_blank" rel="noreferrer" className="sc-file-link">
                        📄 {msg.fileName || "File"}
                      </a>
                    )
                  )}
                  <span className="sc-bubble-time">{fmt(msg.createdAt)}</span>
                </div>
                {isMe && <div className="sc-bubble-avatar sc-me-avatar">{initials(user.name)}</div>}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="sc-input-bar">
        <button className="sc-attach-btn" onClick={() => fileInputRef.current?.click()} disabled={sending}>
          <FiPaperclip />
        </button>
        <input ref={fileInputRef} type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={handleFile} />
        <textarea
          className="sc-textarea"
          placeholder="Message your advisor..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
          disabled={sending}
        />
        <button className="sc-send-btn" onClick={handleSend} disabled={sending || !text.trim()}>
          <FiSend />
        </button>
      </div>
      <p className="sc-enc-note">SHIFT + ENTER FOR NEW LINE</p>
    </div>
  );
}

export default StudentChat;
