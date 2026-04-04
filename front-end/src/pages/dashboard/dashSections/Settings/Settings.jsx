import { useEffect, useState } from "react";
import { FiLock, FiUnlock, FiAlertTriangle } from "react-icons/fi";
import { getSiteLock, setSiteLock } from "../../../../services/CourseServices";
import "./Settings.css";

function Settings() {
  const [locked, setLocked]       = useState(false);
  const [loading, setLoading]     = useState(true);
  const [toggling, setToggling]   = useState(false);
  const [msg, setMsg]             = useState(null);

  useEffect(() => {
    getSiteLock()
      .then((d) => setLocked(d.locked))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async () => {
    setToggling(true);
    setMsg(null);
    try {
      const data = await setSiteLock(!locked);
      setLocked(data.locked);
      setMsg({
        type: "success",
        text: data.locked
          ? "Site locked. Students can only view their profile data."
          : "Site unlocked. Students have full access.",
      });
    } catch {
      setMsg({ type: "error", text: "Failed to update site lock." });
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="settings-root">
      <div className="settings-header">
        <h2 className="settings-title">System Settings</h2>
        <p className="settings-sub">Control global system behaviour for all users.</p>
      </div>

      <div className="settings-section">
        <h3 className="settings-section-title">Access Control</h3>

        <div className={`settings-card ${locked ? "settings-card-locked" : ""}`}>
          <div className="settings-card-left">
            <div className={`settings-icon-wrap ${locked ? "settings-icon-locked" : "settings-icon-open"}`}>
              {locked ? <FiLock /> : <FiUnlock />}
            </div>
            <div>
              <div className="settings-card-name">Student Site Lock</div>
              <div className="settings-card-desc">
                When locked, students cannot make any requests except login and viewing their saved profile data.
                Admins and staff are unaffected.
              </div>
              {locked && (
                <div className="settings-warning">
                  <FiAlertTriangle />
                  <span>Site is currently locked — students have restricted access.</span>
                </div>
              )}
            </div>
          </div>

          <div className="settings-card-right">
            <span className={`settings-status ${locked ? "settings-status-locked" : "settings-status-open"}`}>
              {locked ? "Locked" : "Open"}
            </span>
            <button
              className={`settings-toggle-btn ${locked ? "settings-toggle-unlock" : "settings-toggle-lock"}`}
              onClick={handleToggle}
              disabled={toggling || loading}
            >
              {toggling ? "Updating…" : locked ? "Unlock Site" : "Lock Site"}
            </button>
          </div>
        </div>

        {msg && (
          <p className={msg.type === "success" ? "settings-msg-ok" : "settings-msg-err"}>
            {msg.text}
          </p>
        )}
      </div>
    </div>
  );
}

export default Settings;
