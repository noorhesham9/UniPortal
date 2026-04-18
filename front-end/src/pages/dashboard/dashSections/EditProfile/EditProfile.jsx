import { useRef, useState } from "react";
import {
  FiCamera,
  FiLock,
  FiSettings,
  FiUser,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../../../../services/api";
import { loginSuccess } from "../../../../services/store/reducers/authSlice";
import ChangePassword from "../Settings/ChangePassword";
import "./EditProfile.css";

const STAFF_ROLES = ["admin", "super_admin", "professor"];

const EditProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  const roleName = user?.role?.name || "student";
  const isStaff = STAFF_ROLES.includes(roleName);

  const tabs = [
    { label: "Personal Info", icon: <FiUser /> },
    { label: "Change Password", icon: <FiLock /> }
  ];

  const [activeTab, setActiveTab] = useState("Personal Info");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);

  // Photo upload
  const photoInputRef = useRef(null);
  const [photoPreview, setPhotoPreview] = useState(user?.profilePhoto?.url || null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState(null);

  const nameArray = user?.name ? user.name.split(" ") : ["", ""];
  const [formData, setFormData] = useState({
    firstNameEn: nameArray[0] || "",
    lastNameEn: nameArray.slice(1).join(" ") || "",
    mobileNumber: user?.phone || "",
    address: user?.address || "",
    // student-only extras
    fatherNameEn: user?.fatherName || "",
    nationality: user?.nationality || "Egyptian",
    homePhoneNumber: user?.homePhone || "",
    dateOfEnrollment: user?.dateOfEnrollment ? new Date(user.dateOfEnrollment).toISOString().split("T")[0] : "",
    fatherJob: user?.fatherJob || "",
    motherJob: user?.motherJob || "",
    guardianName: user?.guardianName || "",
    guardianMobile: user?.guardianMobile || "",
  });

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  // ── Photo upload ──────────────────────────────────────────────────────────
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoError(null);
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoUploading(true);
    try {
      const fd = new FormData();
      fd.append("photo", file);
      await api.post("/upload/profile-photo", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const meRes = await api.get("/auth/me");
      dispatch(loginSuccess(meRes.data.user));
    } catch (err) {
      setPhotoError(err.response?.data?.message || "Photo upload failed");
    } finally {
      setPhotoUploading(false);
      e.target.value = "";
    }
  };

  // ── Save personal info ────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await api.patch("/auth/me", {
        firstNameEn: formData.firstNameEn,
        lastNameEn: formData.lastNameEn,
        phone: formData.mobileNumber,
        address: formData.address,
        fatherName: formData.fatherNameEn,
        nationality: formData.nationality,
        homePhone: formData.homePhoneNumber,
        dateOfEnrollment: formData.dateOfEnrollment || undefined,
        fatherJob: formData.fatherJob,
        motherJob: formData.motherJob,
        guardianName: formData.guardianName,
        guardianMobile: formData.guardianMobile,
      });
      dispatch(loginSuccess(res.data.user));
      setSaveMsg({ type: "success", text: "Changes saved" });
      setTimeout(() => navigate("/dashboard?section=profile"), 800);
    } catch (err) {
      setSaveMsg({ type: "error", text: err.response?.data?.message || "Failed to save changes" });
    } finally {
      setSaving(false);
    }
  };

  const initials =
    `${formData.firstNameEn?.[0] || ""}${formData.lastNameEn?.[0] || ""}`.toUpperCase() || "U";

  const roleLabel =
    roleName === "super_admin"
      ? "Super Admin"
      : roleName === "admin"
      ? "Administrator"
      : roleName === "professor"
      ? "Professor"
      : "Student";

  return (
    <div className="edit-profile-container">
      {/* Hidden save trigger for header button */}
      <button
        id="ep-save-trigger"
        onClick={handleSave}
        style={{ display: "none" }}
        aria-hidden="true"
      />

      <div className="ep-body">
        {/* ── Sidebar ── */}
        <aside className="ep-sidebar">
          <div className="ep-user-summary">
            <div className="ep-user-avatar">
              {photoPreview ? (
                <img src={photoPreview} alt="avatar" className="ep-avatar-img" />
              ) : (
                initials
              )}
            </div>
            <div>
              <div className="ep-user-name">
                {formData.firstNameEn} {formData.lastNameEn}
              </div>
              <div className="ep-user-id">
                {isStaff
                  ? roleLabel
                  : `ID: ${user?.studentId || "—"}`}
              </div>
            </div>
          </div>

          {tabs.map((t) => (
            <div
              key={t.label}
              onClick={() => setActiveTab(t.label)}
              className={`ep-menu-item ${activeTab === t.label ? "active" : ""}`}
            >
              <span className="ep-menu-icon">{t.icon}</span>
              <span>{t.label}</span>
            </div>
          ))}
        </aside>

        {/* ── Main content ── */}
        <main className="ep-main-content">

          {/* ── Personal Info tab (both roles) ── */}
          {activeTab === "Personal Info" && (
            <>
              {/* Photo upload */}
              <div className="ep-card">
                <h3 className="ep-card-title">
                  <FiUser style={{ color: "#facc15" }} /> Profile Photo
                </h3>
                <p className="ep-card-subtitle">
                  Upload a formal photo for your {isStaff ? "staff" : "student"} profile.
                </p>
                <div className="ep-upload-box ep-photo-box">
                  <div className="ep-photo-preview">
                    {photoPreview ? (
                      <img src={photoPreview} alt="preview" className="ep-photo-img" />
                    ) : (
                      <FiCamera className="ep-photo-placeholder-icon" />
                    )}
                  </div>
                  <div className="ep-photo-meta">
                    <div className="ep-upload-title">
                      {photoUploading ? "Uploading…" : "Upload Profile Photo"}
                    </div>
                    <div className="ep-upload-hint">JPG, PNG or WEBP · Max 2 MB</div>
                    {photoError && <span className="ep-msg-error">{photoError}</span>}
                    <label className="ep-select-btn">
                      {photoUploading ? "Uploading…" : "Select Photo"}
                      <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/jpg,image/jpeg,image/png,image/webp"
                        style={{ display: "none" }}
                        onChange={handlePhotoChange}
                        disabled={photoUploading}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Personal info form */}
              <div className="ep-card">
                <h3 className="ep-card-title">
                  <FiSettings style={{ color: "#facc15" }} /> Personal Information
                </h3>
                <p className="ep-card-subtitle">
                  Update your basic details and contact information.
                </p>

                <div className="ep-form-grid">
                  <div className="ep-form-group">
                    <label className="ep-label">First Name</label>
                    <input
                      className="ep-input"
                      name="firstNameEn"
                      value={formData.firstNameEn}
                      onChange={handleChange}
                      placeholder="First name"
                    />
                  </div>
                  <div className="ep-form-group">
                    <label className="ep-label">Last Name</label>
                    <input
                      className="ep-input"
                      name="lastNameEn"
                      value={formData.lastNameEn}
                      onChange={handleChange}
                      placeholder="Last name"
                    />
                  </div>
                  <div className="ep-form-group">
                    <label className="ep-label">Mobile Number</label>
                    <input
                      className="ep-input"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      placeholder="+20 ..."
                    />
                  </div>
                  <div className="ep-form-group">
                    <label className="ep-label">Email</label>
                    <input
                      className="ep-input"
                      value={user?.email || ""}
                      disabled
                      style={{ opacity: 0.5, cursor: "not-allowed" }}
                    />
                  </div>

                  {/* Student-only extra fields */}
                  {!isStaff && (
                    <>
                      <div className="ep-form-group">
                        <label className="ep-label">Father's Name</label>
                        <input
                          className="ep-input"
                          name="fatherNameEn"
                          value={formData.fatherNameEn}
                          onChange={handleChange}
                          placeholder="Father's name"
                        />
                      </div>
                      <div className="ep-form-group">
                        <label className="ep-label">Nationality</label>
                        <input
                          className="ep-input"
                          name="nationality"
                          value={formData.nationality}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="ep-form-group">
                        <label className="ep-label">Home Phone</label>
                        <input
                          className="ep-input"
                          name="homePhoneNumber"
                          value={formData.homePhoneNumber}
                          onChange={handleChange}
                          placeholder="+20 ..."
                        />
                      </div>
                      <div className="ep-form-group">
                        <label className="ep-label">Date of Enrollment</label>
                        <input
                          className="ep-input"
                          type="date"
                          name="dateOfEnrollment"
                          value={formData.dateOfEnrollment}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="ep-form-group full">
                        <label className="ep-label">Address</label>
                        <textarea
                          className="ep-input"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          rows={3}
                          style={{ resize: "vertical" }}
                        />
                      </div>
                      <div className="ep-form-group">
                        <label className="ep-label">Father's Job</label>
                        <input
                          className="ep-input"
                          name="fatherJob"
                          value={formData.fatherJob}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="ep-form-group">
                        <label className="ep-label">Mother's Job</label>
                        <input
                          className="ep-input"
                          name="motherJob"
                          value={formData.motherJob}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="ep-form-group">
                        <label className="ep-label">Guardian Full Name</label>
                        <input
                          className="ep-input"
                          name="guardianName"
                          value={formData.guardianName}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="ep-form-group">
                        <label className="ep-label">Guardian's Mobile</label>
                        <input
                          className="ep-input"
                          name="guardianMobile"
                          value={formData.guardianMobile}
                          onChange={handleChange}
                        />
                      </div>
                    </>
                  )}
                </div>

                {saveMsg && (
                  <p className={saveMsg.type === "success" ? "ep-msg-success" : "ep-msg-error"}>
                    {saveMsg.text}
                  </p>
                )}
              </div>
            </>
          )}

          {/* ── Change Password tab (all roles) ── */}
          {activeTab === "Change Password" && (
            <div className="ep-card">
              <h3 className="ep-card-title">
                <FiLock style={{ color: "#facc15" }} /> Change Password
              </h3>
              <p className="ep-card-subtitle">
                Update your account password for enhanced security.
              </p>
              <div style={{ marginTop: "1.5rem" }}>
                <ChangePassword />
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default EditProfile;
