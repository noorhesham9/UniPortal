import { useEffect, useRef, useState } from "react";
import {
  FiCheck, FiEdit2, FiEye, FiEyeOff, FiFile, FiImage,
  FiPlus, FiTrash2, FiUpload, FiX,
} from "react-icons/fi";
import {
  createAnnouncement,
  deleteAnnouncement,
  getAdminAnnouncements,
  updateAnnouncement,
} from "../../../../services/publicServices";
import "./AdManagement.css";

const EMPTY = { title: "", body: "", type: "news", status: "draft" };
const TYPE_LABELS = { news: "News", document: "Document", event: "Event" };

const fmtSize = (bytes) =>
  bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

export default function AdManagement() {
  const [list, setList]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);

  const [selectedFile, setSelectedFile]   = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview]   = useState(null);
  const [customFileName, setCustomFileName] = useState("");
  const fileInputRef  = useRef(null);
  const imageInputRef = useRef(null);

  const load = () => {
    setLoading(true);
    getAdminAnnouncements()
      .then((d) => setList(d.announcements || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = list.filter((a) => {
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openCreate = () => {
    setForm(EMPTY);
    setSelectedFile(null);
    setSelectedImage(null);
    setImagePreview(null);
    setCustomFileName("");
    setModal({ mode: "create" });
  };

  const openEdit = (ann) => {
    setForm({ title: ann.title, body: ann.body, type: ann.type, status: ann.status });
    setSelectedFile(null);
    setSelectedImage(null);
    setImagePreview(ann.imageUrl || null);
    setCustomFileName(ann.fileName ? ann.fileName.replace(/\.[^/.]+$/, "") : "");
    setModal({
      mode: "edit",
      id: ann._id,
      existingFile: ann.fileUrl,
      existingSize: ann.fileSize,
      existingImage: ann.imageUrl,
    });
  };

  const closeModal = () => {
    setModal(null);
    setSelectedFile(null);
    setSelectedImage(null);
    setImagePreview(null);
    setCustomFileName("");
  };

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    // Auto-fill name from filename if user hasn't typed a custom name
    if (!customFileName) {
      setCustomFileName(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = (e) => {
    e.stopPropagation();
    setSelectedImage(null);
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleSave = async () => {
    if (!form.title || !form.body) return alert("Title and body are required.");
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("body", form.body);
      fd.append("type", form.type);
      fd.append("status", form.status);
      if (selectedFile)  fd.append("file", selectedFile);
      if (customFileName.trim()) fd.append("fileName", customFileName.trim());
      if (selectedImage) fd.append("image", selectedImage);

      if (modal.mode === "create") await createAnnouncement(fd);
      else await updateAnnouncement(modal.id, fd);
      load();
      closeModal();
    } catch {
      alert("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    await deleteAnnouncement(id);
    load();
  };

  const toggleStatus = async (ann) => {
    const fd = new FormData();
    fd.append("status", ann.status === "active" ? "draft" : "active");
    await updateAnnouncement(ann._id, fd);
    load();
  };

  const stats = {
    total:    list.length,
    active:   list.filter((a) => a.status === "active").length,
    draft:    list.filter((a) => a.status === "draft").length,
    archived: list.filter((a) => a.status === "archived").length,
  };

  return (
    <div className="adm-page">
      <div className="adm-header">
        <div>
          <h1>Ad Management</h1>
          <p>Manage announcements shown on the public home page.</p>
        </div>
        <button className="adm-btn-primary" onClick={openCreate}>
          <FiPlus /> New Announcement
        </button>
      </div>

      {/* Stats */}
      <div className="adm-stats">
        {[
          { label: "Total",    value: stats.total,    cls: "" },
          { label: "Active",   value: stats.active,   cls: "adm-stat-active" },
          { label: "Draft",    value: stats.draft,    cls: "adm-stat-draft" },
          { label: "Archived", value: stats.archived, cls: "adm-stat-archived" },
        ].map((s) => (
          <div key={s.label} className={`adm-stat ${s.cls}`}>
            <span>{s.value}</span>
            <small>{s.label}</small>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="adm-filters">
        <input
          className="adm-search"
          placeholder="Search announcements..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="adm-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="adm-loading">Loading...</div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Announcement</th>
                <th>Type</th>
                <th>Status</th>
                <th>Attachments</th>
                <th>Date</th>
                <th>Visible</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ann) => (
                <tr key={ann._id}>
                  <td>
                    <div className="adm-title">{ann.title}</div>
                    <div className="adm-body-preview">
                      {ann.body?.slice(0, 60)}{ann.body?.length > 60 ? "…" : ""}
                    </div>
                  </td>
                  <td><span className="adm-type-badge">{TYPE_LABELS[ann.type] || ann.type}</span></td>
                  <td><span className={`adm-status-badge adm-status-${ann.status}`}>{ann.status.toUpperCase()}</span></td>
                  <td className="adm-attach-cell">
                    <div className="adm-attach-cell-inner">
                      {ann.imageUrl && <span className="adm-attach-tag adm-attach-img"><FiImage /> Image</span>}
                      {ann.fileUrl  && <span className="adm-attach-tag adm-attach-file"><FiFile /> File</span>}
                      {!ann.imageUrl && !ann.fileUrl && <span style={{ color: "#334155" }}>—</span>}
                    </div>
                  </td>
                  <td className="adm-date">{new Date(ann.date || ann.createdAt).toLocaleDateString()}</td>
                  <td className="adm-center">
                    <button
                      className={`adm-toggle-btn ${ann.status === "active" ? "adm-toggle-on" : "adm-toggle-off"}`}
                      onClick={() => toggleStatus(ann)}
                      title={ann.status === "active" ? "Hide" : "Show on home page"}
                    >
                      {ann.status === "active" ? <><FiEye /> Visible</> : <><FiEyeOff /> Hidden</>}
                    </button>
                  </td>
                  <td>
                    <div className="adm-actions">
                      <button onClick={() => openEdit(ann)} title="Edit"><FiEdit2 /></button>
                      <button onClick={() => handleDelete(ann._id)} title="Delete" className="adm-del-btn"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="adm-empty">No announcements found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="adm-overlay" onClick={closeModal}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h2>{modal.mode === "create" ? "New Announcement" : "Edit Announcement"}</h2>
              <button onClick={closeModal}><FiX /></button>
            </div>

            <div className="adm-modal-body">
              <label>Title *
                <input name="title" value={form.title} onChange={handleChange} placeholder="Announcement title" />
              </label>
              <label>Body *
                <textarea name="body" value={form.body} onChange={handleChange} rows={4} placeholder="Content..." />
              </label>
              <div className="adm-modal-row">
                <label>Type
                  <select name="type" value={form.type} onChange={handleChange}>
                    <option value="news">News</option>
                    <option value="document">Document</option>
                    <option value="event">Event</option>
                  </select>
                </label>
                <label>Status
                  <select name="status" value={form.status} onChange={handleChange}>
                    <option value="draft">Draft (Hidden)</option>
                    <option value="active">Active (Visible)</option>
                    <option value="archived">Archived</option>
                  </select>
                </label>
              </div>

              {/* Cover Image */}
              <label htmlFor="adm-image-input" className="adm-upload-label">Cover Image (JPG / PNG / WebP)</label>
              <div className="adm-upload-zone">
                <input
                  id="adm-image-input"
                  ref={imageInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
                {imagePreview ? (
                  <div className="adm-image-preview-wrap">
                    <img src={imagePreview} alt="preview" className="adm-image-preview" />
                    <button className="adm-image-remove" onClick={removeImage}><FiX /></button>
                    {selectedImage && <span className="adm-image-meta">{selectedImage.name} · {fmtSize(selectedImage.size)}</span>}
                  </div>
                ) : (
                  <label htmlFor="adm-image-input" className="adm-upload-placeholder" style={{ cursor: "pointer" }}>
                    <FiImage />
                    <span>Click to upload cover image</span>
                    <span className="adm-upload-hint">JPG, PNG or WebP</span>
                  </label>
                )}
              </div>

              {/* File Attachment */}
              <label htmlFor="adm-file-input" className="adm-upload-label">File Attachment (PDF / Image)</label>
              <div className="adm-upload-zone adm-upload-zone-file">
                <input
                  id="adm-file-input"
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                {selectedFile ? (
                  <div className="adm-file-selected">
                    <FiFile />
                    <span>{selectedFile.name}</span>
                    <span className="adm-file-size">{fmtSize(selectedFile.size)}</span>
                  </div>
                ) : modal.existingFile ? (
                  <label htmlFor="adm-file-input" className="adm-file-existing" style={{ cursor: "pointer", width: "100%" }}>
                    <FiFile />
                    <span>Current file {modal.existingSize ? `(${modal.existingSize})` : ""}</span>
                    <span className="adm-file-replace">Click to replace</span>
                  </label>
                ) : (
                  <label htmlFor="adm-file-input" className="adm-upload-placeholder" style={{ cursor: "pointer" }}>
                    <FiUpload />
                    <span>Click to upload PDF or file</span>
                    <span className="adm-upload-hint">PDF, JPG, PNG or WebP</span>
                  </label>
                )}
              </div>

              {/* Custom file name — shown when a file is selected or editing existing */}
              {(selectedFile || modal.existingFile) && (
                <label className="adm-upload-label">File Display Name
                  <input
                    type="text"
                    value={customFileName}
                    onChange={(e) => setCustomFileName(e.target.value)}
                    placeholder="e.g. Degree Reassignment Form"
                    style={{ textTransform: "none" }}
                  />
                </label>
              )}
            </div>

            <div className="adm-modal-footer">
              <button className="adm-btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="adm-btn-primary" onClick={handleSave} disabled={saving}>
                <FiCheck /> {saving ? "Uploading..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
