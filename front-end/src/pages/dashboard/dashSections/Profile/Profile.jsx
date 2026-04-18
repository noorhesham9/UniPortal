import { useEffect, useRef, useState } from "react";
import { FaGraduationCap, FaUserTie } from "react-icons/fa";
import { FiCamera, FiChevronUp, FiEdit2, FiUpload } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../../../../services/api";
import { loginSuccess } from "../../../../services/store/reducers/authSlice";
import "./Profile.css";

const STAFF_ROLES = ["admin", "super_admin", "professor"];

function Profile({ siteLocked = false }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  const photoInputRef = useRef(null);
  const receiptInputRef = useRef(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [receiptUploading, setReceiptUploading] = useState(false);
  const [receiptMsg, setReceiptMsg] = useState(null);
  const [photoError, setPhotoError] = useState(null);
  const [academicSummary, setAcademicSummary] = useState(null);

  const roleName = user?.role?.name || "student";
  const isStaff = STAFF_ROLES.includes(roleName);

  useEffect(() => {
    if (roleName !== "student") return;
    api.get("/grades/my-summary")
      .then((res) => setAcademicSummary(res.data.summary))
      .catch(() => {});
  }, [roleName]);

  if (!user) return <div className="sp-loading">Loading...</div>;

  const nameArray = user.name ? user.name.split(" ") : ["U", "N"];
  const firstName = nameArray[0] || "User";
  const lastName = nameArray.slice(1).join(" ") || "";
  const avatarInitials = `${firstName[0]}${lastName?.[0] || firstName[1] || ""}`.toUpperCase();

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoError(null);
    setPhotoUploading(true);
    try {
      const fd = new FormData();
      fd.append("photo", file);
      await api.post("/upload/profile-photo", fd, { headers: { "Content-Type": "multipart/form-data" } });
      const meRes = await api.get("/auth/me");
      dispatch(loginSuccess(meRes.data.user));
    } catch (err) {
      setPhotoError(err.response?.data?.message || "Upload failed");
    } finally {
      setPhotoUploading(false);
      e.target.value = "";
    }
  };

  const handleReceiptChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setReceiptMsg(null);
    setReceiptUploading(true);
    try {
      const fd = new FormData();
      fd.append("receipt", file);
      await api.post("/upload/tuition-receipt", fd, { headers: { "Content-Type": "multipart/form-data" } });
      const meRes = await api.get("/auth/me");
      dispatch(loginSuccess(meRes.data.user));
      setReceiptMsg({ type: "success", text: "Receipt uploaded successfully" });
    } catch (err) {
      setReceiptMsg({ type: "error", text: err.response?.data?.message || "Upload failed" });
    } finally {
      setReceiptUploading(false);
      e.target.value = "";
    }
  };

  // ── Shared avatar block ──────────────────────────────────────────────────
  const AvatarBlock = () => (
    <div className="sp-avatar-wrapper">
      <div className="sp-avatar-large">
        {user.profilePhoto?.url
          ? <img src={user.profilePhoto.url} alt="Profile" className="sp-avatar-img" />
          : avatarInitials}
      </div>
      <button
        className="sp-avatar-upload-btn"
        onClick={() => photoInputRef.current?.click()}
        disabled={photoUploading || siteLocked}
        title={siteLocked ? "Photo upload disabled while site is locked" : "Change profile photo"}
        style={siteLocked ? { opacity: 0.4, cursor: "not-allowed" } : undefined}
      >
        {photoUploading ? "…" : <FiCamera />}
      </button>
      <input ref={photoInputRef} type="file" accept="image/jpg,image/jpeg,image/png,image/webp"
        style={{ display: "none" }} onChange={handlePhotoChange} disabled={siteLocked} />
      {photoError && <span className="sp-upload-error">{photoError}</span>}
    </div>
  );

  // ── STAFF profile (admin / super_admin / professor) ──────────────────────
  if (isStaff) {
    const roleLabel = roleName === "super_admin" ? "Super Admin"
      : roleName === "admin" ? "Administrator"
      : "Professor";

    return (
      <div className="student-profile-container">
        <main>
          <div className="sp-main-card">
            <div className="sp-card-decoration"><FaUserTie /></div>
            <div className="sp-user-top">
              <div className="sp-user-info">
                <AvatarBlock />
                <div>
                  <div className="sp-name-row">
                    <h2 className="sp-name">{user.name}</h2>
                    <span className="sp-status-badge sp-badge-staff">
                      {user.is_active ? `Active ${roleLabel}` : "Inactive"}
                    </span>
                  </div>
                  <p className="sp-major">
                    {roleLabel} &bull; {user.department?.name || "University"}
                  </p>
                </div>
              </div>
              <button className="sp-edit-btn" onClick={() => navigate("/dashboard?section=edit_profile")} style={siteLocked ? { display: "none" } : undefined}>
                <FiEdit2 /> Edit Profile
              </button>
            </div>

            <div className="sp-stats-row">
              <div className="sp-stat-item">
                <span className="sp-stat-label">ROLE</span>
                <span className="sp-stat-value">{roleLabel}</span>
              </div>
              <div className="sp-stat-item">
                <span className="sp-stat-label">DEPARTMENT</span>
                <span className="sp-stat-value">{user.department?.name || "—"}</span>
              </div>
              <div className="sp-stat-item">
                <span className="sp-stat-label">EMAIL</span>
                <span className="sp-stat-value">{user.email}</span>
              </div>
              <div className="sp-stat-item">
                <span className="sp-stat-label">STATUS</span>
                <span className={`sp-stat-value ${user.is_active ? "highlight" : "sp-stat-unpaid"}`}>
                  {user.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          {/* Staff info grid */}
          <div className="sp-grid">
            <div className="sp-grid-col">
              <div className="sp-card">
                <div className="sp-card-header">
                  <h3>Personal Information</h3>
                  <FiChevronUp style={{ color: "var(--textsecondary)" }} />
                </div>
                <div className="sp-card-body sp-info-list">
                  <InfoItem label="FIRST NAME" value={firstName} />
                  <InfoItem label="LAST NAME" value={lastName || "—"} />
                  <InfoItem label="EMAIL" value={user.email} />
                  <InfoItem label="DEPARTMENT" value={user.department?.name || "—"} />
                  <InfoItem label="ROLE" value={roleLabel} />
                </div>
              </div>
            </div>

            <div className="sp-grid-col">
              <div className="sp-card">
                <div className="sp-card-header">
                  <h3>Account Status</h3>
                </div>
                <div className="sp-card-body sp-info-list">
                  <InfoItem label="ACCOUNT ACTIVE" value={user.is_active ? "Yes" : "No"} />
                  <InfoItem label="PROFILE PHOTO" value={user.profilePhoto?.url ? "Uploaded" : "Not set"} />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── STUDENT profile ──────────────────────────────────────────────────────
  const receiptStatus = user.tuitionReceipt?.status || "pending";
  const receiptStatusClass = receiptStatus === "approved" ? "sp-receipt-approved"
    : receiptStatus === "rejected" ? "sp-receipt-rejected"
    : "sp-receipt-pending";

  return (
    <div className="student-profile-container">
      <main>
        <div className="sp-main-card">
          <div className="sp-card-decoration"><FaGraduationCap /></div>
          <div className="sp-user-top">
            <div className="sp-user-info">
              <AvatarBlock />
              <div>
                <div className="sp-name-row">
                  <h2 className="sp-name">{user.name}</h2>
                  <span className="sp-status-badge">
                    {user.is_active ? `Active ${roleName}` : "Inactive"}
                  </span>
                </div>
                <p className="sp-major">
                  {user.department?.name || "Computer Science"} &bull; Level {user.level || "1"}
                </p>
              </div>
            </div>
            <button className="sp-edit-btn" onClick={() => navigate("/dashboard?section=edit_profile")} style={siteLocked ? { display: "none" } : undefined}>
              <FiEdit2 /> Edit Profile
            </button>
          </div>

          <div className="sp-stats-row">
            <div className="sp-stat-item">
              <span className="sp-stat-label">STUDENT ID</span>
              <span className="sp-stat-value">{user.studentId || "—"}</span>
            </div>
            <div className="sp-stat-item">
              <span className="sp-stat-label">LEVEL</span>
              <span className="sp-stat-value highlight">{user.level || "—"}</span>
            </div>
            <div className="sp-stat-item">
              <span className="sp-stat-label">DEPARTMENT</span>
              <span className="sp-stat-value">{user.department?.name || "—"}</span>
            </div>
            <div className="sp-stat-item">
              <span className="sp-stat-label">FEES STATUS</span>
              <span className={`sp-stat-value ${user.feesPaid ? "highlight" : "sp-stat-unpaid"}`}>
                {user.feesPaid ? "Paid" : "Unpaid"}
              </span>
            </div>
          </div>
        </div>

        {/* Tuition receipt card — hidden when fees are paid */}
        {!user.feesPaid && (
        <div className="sp-fee-card">
          <div className="sp-fee-info">
            <div className="sp-fee-icon">💸</div>
            <div className="sp-fee-text">
              <span className="sp-fee-label">TUITION RECEIPT</span>
              {user.tuitionReceipt?.url ? (
                <a href={user.tuitionReceipt.url} target="_blank" rel="noreferrer" className="sp-receipt-link">
                  View uploaded receipt
                </a>
              ) : (
                <span style={{ fontSize: "0.9rem", opacity: 0.6, color: "var(--foreground)" }}>
                  No receipt uploaded yet
                </span>
              )}
              {user.tuitionReceipt?.url && (
                <span className={`sp-receipt-status-badge ${receiptStatusClass}`}>
                  {receiptStatus.toUpperCase()}
                </span>
              )}
              {user.tuitionReceipt?.rejectionReason && (
                <span className="sp-rejection-reason">
                  Reason: {user.tuitionReceipt.rejectionReason}
                </span>
              )}
              {receiptMsg && (
                <span className={receiptMsg.type === "success" ? "sp-upload-success" : "sp-upload-error"}>
                  {receiptMsg.text}
                </span>
              )}
            </div>
          </div>
          <button className="sp-pay-btn" onClick={() => receiptInputRef.current?.click()} disabled={receiptUploading || siteLocked} title={siteLocked ? "Receipt upload disabled while site is locked" : undefined} style={siteLocked ? { opacity: 0.4, cursor: "not-allowed" } : undefined}>
            <FiUpload style={{ marginRight: "0.4rem" }} />
            {receiptUploading ? "Uploading..." : "Upload Receipt"}
          </button>
          <input ref={receiptInputRef} type="file" accept="image/jpg,image/jpeg,image/png,application/pdf"
            style={{ display: "none" }} onChange={handleReceiptChange} disabled={siteLocked} />
        </div>
        )}

        {/* Student info grid */}
        <div className="sp-grid">
          <div className="sp-grid-col">
            <div className="sp-card">
              <div className="sp-card-header">
                <h3>Personal Information</h3>
                <FiChevronUp style={{ color: "var(--textsecondary)" }} />
              </div>
              <div className="sp-card-body sp-info-list">
                <InfoItem label="FIRST NAME" value={firstName} />
                <InfoItem label="LAST NAME" value={lastName || "—"} />
                <InfoItem label="STUDENT ID" value={user.studentId || "—"} />
                <InfoItem label="EMAIL" value={user.email || "—"} />
                <InfoItem label="DEPARTMENT" value={user.department?.name || "—"} />
                <InfoItem label="LEVEL" value={user.level || "—"} />
              </div>
            </div>
          </div>

          <div className="sp-grid-col">
            <div className="sp-card">
              <div className="sp-card-header">
                <h3>Academic Status</h3>
              </div>
              <div className="sp-card-body sp-info-list">
                <InfoItem label="ACCOUNT ACTIVE" value={user.is_active ? "Yes" : "No"} />
                <div className="sp-info-item">
                  <span className="sp-info-label">FEES PAID</span>
                  <div className="sp-info-value-row">
                    <span className={`sp-info-value ${user.feesPaid ? "" : "sp-stat-unpaid"}`}>
                      {user.feesPaid ? "Paid" : "Not Paid"}
                    </span>
                  </div>
                </div>
                <InfoItem label="PROFILE PHOTO" value={user.profilePhoto?.url ? "Uploaded" : "Not set"} />
                <div className="sp-info-item">
                  <span className="sp-info-label">RECEIPT STATUS</span>
                  <div className="sp-info-value-row">
                    {user.tuitionReceipt?.url ? (
                      <span className={`sp-receipt-status-badge ${receiptStatusClass}`}>
                        {receiptStatus.toUpperCase()}
                      </span>
                    ) : (
                      <span className="sp-info-value" style={{ opacity: 0.5 }}>Not uploaded</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="sp-card">
              <div className="sp-card-header">
                <h3>Academic Summary</h3>
              </div>
              <div className="sp-card-body">
                <div className="sp-academic-stats">
                  <div className="sp-acad-stat">
                    <span className="sp-acad-stat-value">
                      {academicSummary ? academicSummary.cumulativeGPA.toFixed(2) : "—"}
                    </span>
                    <span className="sp-acad-stat-label">Cumulative GPA</span>
                  </div>
                  <div className="sp-acad-stat">
                    <span className="sp-acad-stat-value highlight">
                      {academicSummary ? academicSummary.currentSemesterHours : "—"}
                    </span>
                    <span className="sp-acad-stat-label">
                      Current Semester Hours
                      {academicSummary?.activeSemester && (
                        <small style={{ display: "block", opacity: 0.6 }}>
                          {academicSummary.activeSemester}
                        </small>
                      )}
                    </span>
                  </div>
                  <div className="sp-acad-stat">
                    <span className="sp-acad-stat-value" style={{ color: "#f97316" }}>
                      {academicSummary ? academicSummary.remainingCredits : "—"}
                    </span>
                    <span className="sp-acad-stat-label">Hours to Graduation</span>
                  </div>
                </div>

                {academicSummary && (
                  <div className="sp-progress-item" style={{ marginTop: "1rem" }}>
                    <div className="sp-progress-header">
                      <span className="sp-progress-label">
                        Degree Progress ({academicSummary.totalCreditsEarned}/{academicSummary.requiredCredits} hrs)
                      </span>
                      <span className="sp-progress-percent">{academicSummary.completionPercentage}%</span>
                    </div>
                    <div className="sp-progress-bar">
                      <div
                        className="sp-progress-fill"
                        style={{ width: `${Math.min(academicSummary.completionPercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// small helper to avoid repetition
const InfoItem = ({ label, value }) => (
  <div className="sp-info-item">
    <span className="sp-info-label">{label}</span>
    <div className="sp-info-value-row">
      <span className="sp-info-value">{value}</span>
    </div>
  </div>
);

export default Profile;
