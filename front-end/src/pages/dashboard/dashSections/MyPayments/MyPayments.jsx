import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiAlertCircle, FiCheckCircle, FiClock, FiUploadCloud, FiX, FiXCircle } from "react-icons/fi";
import api from "../../../../services/api";
import { loginSuccess } from "../../../../services/store/reducers/authSlice";
import "./MyPayments.css";

const yearFromDate = (date) => {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  return m >= 9 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
};

const currentAcademicYear = () => yearFromDate(new Date());

const buildAllYears = (enrolledAt) => {
  if (!enrolledAt) return [currentAcademicYear()];
  const startYear = parseInt(yearFromDate(enrolledAt).split("-")[0], 10);
  const nowYear   = parseInt(currentAcademicYear().split("-")[0], 10);
  const years = [];
  for (let y = nowYear; y >= startYear; y--) years.push(`${y}-${y + 1}`);
  return years;
};

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" }) : null;

const STATE_CONFIG = {
  approved: { cls: "mp-card-approved", iconCls: "mp-icon-approved", badgeCls: "mp-badge-approved", icon: <FiCheckCircle />, label: "Approved",    canUpload: false },
  pending:  { cls: "mp-card-pending",  iconCls: "mp-icon-pending",  badgeCls: "mp-badge-pending",  icon: <FiClock />,        label: "Pending",     canUpload: false },
  rejected: { cls: "mp-card-rejected", iconCls: "mp-icon-rejected", badgeCls: "mp-badge-rejected", icon: <FiXCircle />,      label: "Rejected",    canUpload: true  },
  none:     { cls: "mp-card-none",     iconCls: "mp-icon-none",     badgeCls: "mp-badge-none",     icon: <FiAlertCircle />,  label: "Not Uploaded",canUpload: true  },
};

function MyPayments() {
  const dispatch = useDispatch();
  const { user }  = useSelector((s) => s.auth);

  const [modal, setModal]         = useState(null); // year string
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState(null);
  const fileRef = useRef(null);

  const allYears    = buildAllYears(user?.createdAt);
  const receiptsMap = Object.fromEntries((user?.tuitionReceipts || []).map((r) => [r.academicYear, r]));

  const openModal = (year) => { setModal(year); setUploadMsg(null); };
  const closeModal = () => { setModal(null); setUploadMsg(null); if (fileRef.current) fileRef.current.value = ""; };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !modal) return;
    setUploadMsg(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("receipt", file);
      fd.append("academicYear", modal);
      await api.post("/upload/tuition-receipt", fd, { headers: { "Content-Type": "multipart/form-data" } });
      const meRes = await api.get("/auth/me");
      dispatch(loginSuccess(meRes.data.user));
      setUploadMsg({ type: "success", text: "Receipt uploaded. Awaiting admin review." });
    } catch (err) {
      setUploadMsg({ type: "error", text: err.response?.data?.message || "Upload failed." });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const modalReceipt = modal ? receiptsMap[modal] : null;
  const modalState   = modalReceipt ? (modalReceipt.status || "pending") : "none";

  return (
    <div className="mp-root">
      <div className="mp-header">
        <div>
          <h2 className="mp-title">My Payments</h2>
          <p className="mp-sub">All academic years since enrollment. Upload your receipt for each year that requires payment.</p>
        </div>
      </div>

      <div className="mp-list">
        {allYears.map((year) => {
          const r      = receiptsMap[year];
          const state  = r ? (r.status || "pending") : "none";
          const cfg    = STATE_CONFIG[state];

          return (
            <div key={year} className={`mp-card ${cfg.cls}`}>
              <div className="mp-card-left">
                <div className={`mp-icon-wrap ${cfg.iconCls}`}>{cfg.icon}</div>
                <div className="mp-card-info">
                  <div className="mp-year">Academic Year {year}</div>

                  {r?.uploadedAt && <div className="mp-date">Uploaded: {fmt(r.uploadedAt)}</div>}
                  {r?.reviewedAt && <div className="mp-date">Reviewed: {fmt(r.reviewedAt)}</div>}
                  {!r            && <div className="mp-date mp-date-warn">No receipt submitted yet</div>}

                  {state === "rejected" && r?.rejectionReason && (
                    <div className="mp-rejection">
                      <FiXCircle className="mp-rejection-icon" />
                      <span><strong>Rejection reason:</strong> {r.rejectionReason}</span>
                    </div>
                  )}

                  {state === "pending" && (
                    <div className="mp-info-note">Your receipt is under review. You cannot re-upload until it is reviewed.</div>
                  )}
                  {state === "approved" && (
                    <div className="mp-info-note mp-info-ok">Payment confirmed for this year.</div>
                  )}
                </div>
              </div>

              <div className="mp-card-right">
                <span className={`mp-badge ${cfg.badgeCls}`}>{cfg.icon} {cfg.label}</span>

                {r?.url && (
                  <a href={r.url} target="_blank" rel="noreferrer" className="mp-view-link">View Receipt</a>
                )}

                {cfg.canUpload && (
                  <button className="mp-upload-btn" onClick={() => openModal(year)}>
                    <FiUploadCloud />
                    {state === "rejected" ? "Re-upload" : "Upload"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload Modal */}
      {modal && (
        <div className="mp-overlay" onClick={closeModal}>
          <div className="mp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mp-modal-header">
              <div>
                <h3 className="mp-modal-title">
                  {modalState === "rejected" ? "Re-upload Receipt" : "Upload Receipt"}
                </h3>
                <p className="mp-modal-sub">Academic Year {modal}</p>
              </div>
              <button className="mp-modal-close" onClick={closeModal}><FiX /></button>
            </div>

            <div className="mp-modal-body">
              {/* Show rejection reason if re-uploading */}
              {modalState === "rejected" && modalReceipt?.rejectionReason && (
                <div className="mp-modal-rejection">
                  <FiXCircle />
                  <span><strong>Previous rejection reason:</strong> {modalReceipt.rejectionReason}</span>
                </div>
              )}

              {/* Current receipt preview */}
              {modalReceipt?.url && (
                <div className="mp-preview">
                  {modalReceipt.url.includes(".pdf") ? (
                    <a href={modalReceipt.url} target="_blank" rel="noreferrer" className="mp-pdf-link">📄 View current receipt</a>
                  ) : (
                    <img src={modalReceipt.url} alt="Current receipt" className="mp-preview-img" />
                  )}
                </div>
              )}

              <label className="mp-drop-zone">
                <FiUploadCloud className="mp-drop-icon" />
                <span className="mp-drop-title">{uploading ? "Uploading…" : "Click to select file"}</span>
                <span className="mp-drop-hint">PDF, JPG or PNG · Max 5 MB</span>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,image/jpeg,image/png"
                  style={{ display: "none" }}
                  onChange={handleUpload}
                  disabled={uploading}
                />
              </label>

              {uploadMsg && (
                <p className={uploadMsg.type === "success" ? "mp-msg-ok" : "mp-msg-err"}>{uploadMsg.text}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyPayments;
