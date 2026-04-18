import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  FiCheck, FiChevronLeft, FiChevronRight, FiEye,
  FiPlus, FiSearch, FiTrash2, FiUserPlus, FiX,
} from "react-icons/fi";
import {
  addAllowedStudent, deleteAllowedStudent, getAllowedStudents,
  getRegistrationRequests, reviewRegistrationRequest, getIdCardSignedUrl,
} from "../../../../services/AdminServices";
import "./AllowedIDS.css";

const EMPTY_FORM = { studentId: "", nationalId: "", examSeatNumber: "", email: "" };
const STATUS_COLOR = {
  pending_email: "#f59e0b",
  pending_approval: "#818cf8",
  approved: "#22c55e",
  rejected: "#ef4444",
};
// 2227271 30204150101092 33333 
const AllowedIDS = () => {
  const [tab, setTab] = useState("whitelist");

  const [items, setItems]             = useState([]);
  const [total, setTotal]             = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [pendingSeats, setPendingSeats] = useState(0);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [search, setSearch]           = useState("");
  const [page, setPage]               = useState(1);
  const PAGE_SIZE = 10;

  const [requests, setRequests]       = useState([]);
  const [reqFilter, setReqFilter]     = useState("pending_approval");
  const [reviewModal, setReviewModal] = useState(null);
  const [adminNote, setAdminNote]     = useState("");

  const [loading, setLoading]         = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState(null);

  const loadWhitelist = async () => {
    setLoading(true); setError(null);
    try {
      const data = await getAllowedStudents();
      setItems(data?.items || []);
      setTotal(data?.total || 0);
      setActiveCount(data?.activeRegistrations || 0);
      setPendingSeats(data?.pendingSeats || 0);
    } catch (err) { setError(err?.message || "Failed to load"); }
    finally { setLoading(false); }
  };

  const loadRequests = async () => {
    setLoading(true); setError(null);
    try {
      const data = await getRegistrationRequests(reqFilter);
      setRequests(data?.requests || []);
    } catch (err) { setError(err?.message || "Failed to load"); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadWhitelist(); }, []);
  useEffect(() => { if (tab === "requests") loadRequests(); }, [tab, reqFilter]);

  const handleAdd = async () => {
    if (!form.studentId || !form.nationalId || !form.examSeatNumber) {
      return setError("Student ID, National ID, and Exam Seat Number are required.");
    }
    setSubmitting(true); setError(null);
    try {
      await addAllowedStudent(form);
      setForm(EMPTY_FORM);
      await loadWhitelist();
    } catch (err) { setError(err?.response?.data?.message || err.message); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this student from the whitelist?")) return;
    try { await deleteAllowedStudent(id); await loadWhitelist(); }
    catch (err) { setError(err.message); }
  };

  const [loadingIdCard, setLoadingIdCard] = useState(null); // requestId being loaded

  const handleViewIdCard = async (requestId) => {
    setLoadingIdCard(requestId);
    try {
      const { url } = await getIdCardSignedUrl(requestId);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      setError("Failed to load ID card. Please try again.");
    } finally {
      setLoadingIdCard(null);
    }
  };

  const handleReview = async () => {
    if (!reviewModal) return;
    setSubmitting(true);
    try {
      await reviewRegistrationRequest(reviewModal.request._id, reviewModal.action, adminNote);
      setReviewModal(null); setAdminNote("");
      await loadRequests();
    } catch (err) { setError(err?.response?.data?.message || err.message); }
    finally { setSubmitting(false); }
  };

  const filtered   = items.filter((i) =>
    !search ||
    i.studentId?.toLowerCase().includes(search.toLowerCase()) ||
    i.nationalId?.toLowerCase().includes(search.toLowerCase()) ||
    i.examSeatNumber?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pendingCount = requests.filter((r) => r.status === "pending_approval").length;

  return (
    <div className="allowed-ids-page">
      {/* Tabs */}
      <div className="aid-tabs">
        <button className={`aid-tab ${tab === "whitelist" ? "active" : ""}`} onClick={() => setTab("whitelist")}>Whitelist</button>
        <button className={`aid-tab ${tab === "requests" ? "active" : ""}`} onClick={() => setTab("requests")}>
          Registration Requests {pendingCount > 0 && <span className="aid-badge">{pendingCount}</span>}
        </button>
      </div>

      {error && <p className="allowed-ids-error">{error}</p>}

      {/* ── WHITELIST ── */}
      {tab === "whitelist" && (
        <div className="allowed-ids-layout">
          <main className="allowed-ids-main">
            <div className="allowed-ids-main-inner">
              <section className="allowed-ids-intro">
                <h1 className="allowed-ids-title">Registration Whitelist</h1>
                <p className="allowed-ids-subtitle">Add students with their verified identity data before they can register.</p>
              </section>

              <section className="allowed-ids-card">
                <div className="allowed-ids-card-header">
                  <FiUserPlus className="allowed-ids-header-icon" />
                  <h3>Add Student</h3>
                </div>
                <div className="aid-form-grid">
                  {[
                    { key: "studentId",      label: "Student ID *",       placeholder: "e.g. 2024-10452" },
                    { key: "nationalId",     label: "National ID *",      placeholder: "14-digit national ID" },
                    { key: "examSeatNumber", label: "Exam Seat Number *", placeholder: "Thanaweyya seat no." },
                    { key: "email",          label: "Email (optional)",   placeholder: "student@university.edu" },
                  ].map(({ key, label, placeholder }) => (
                    <label key={key} className="allowed-ids-field">
                      <span className="allowed-ids-label">{label}</span>
                      <input
                        type="text" placeholder={placeholder}
                        className="allowed-ids-input"
                        value={form[key]}
                        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      />
                    </label>
                  ))}
                </div>
                <button onClick={handleAdd} disabled={submitting} className="allowed-ids-submit" style={{ marginTop: "1rem" }}>
                  <FiPlus /> {submitting ? "Adding..." : "Add to Whitelist"}
                </button>
              </section>

              <section className="allowed-ids-list">
                <div className="allowed-ids-list-header">
                  <h2 className="allowed-ids-list-title">Whitelisted Students</h2>
                  <div className="allowed-ids-search">
                    <FiSearch className="allowed-ids-search-icon" />
                    <input type="text" placeholder="Search..." className="allowed-ids-search-input"
                      value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
                  </div>
                </div>

                <div className="allowed-ids-table-wrapper">
                  <table className="allowed-ids-table">
                    <thead>
                      <tr>
                        <th>Student ID</th><th>National ID</th><th>Exam Seat</th>
                        <th>Email</th><th>Registered</th><th>Date Added</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan={7} className="allowed-ids-table-empty">Loading...</td></tr>
                      ) : paginated.length === 0 ? (
                        <tr><td colSpan={7} className="allowed-ids-table-empty">No records found.</td></tr>
                      ) : paginated.map((item) => (
                        <tr key={item._id} className="allowed-ids-table-row">
                          <td className="allowed-ids-table-id">{item.studentId}</td>
                          <td>{item.nationalId}</td>
                          <td>{item.examSeatNumber}</td>
                          <td style={{ fontSize: "0.8rem" }}>{item.email || "—"}</td>
                          <td>
                            <span style={{ color: item.isRegistered ? "#22c55e" : "#64748b", fontSize: "0.78rem", fontWeight: 600 }}>
                              {item.isRegistered ? "Yes" : "No"}
                            </span>
                          </td>
                          <td className="allowed-ids-table-date">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}</td>
                          <td>
                            <button onClick={() => handleDelete(item._id)} className="allowed-ids-delete-button" title="Remove"><FiTrash2 /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="allowed-ids-pagination">
                  <p className="allowed-ids-pagination-text">
                    Showing {paginated.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                  </p>
                  <div className="allowed-ids-pagination-controls">
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="allowed-ids-page-button"><FiChevronLeft /></button>
                    <span className="allowed-ids-page-indicator">{page} / {totalPages}</span>
                    <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="allowed-ids-page-button"><FiChevronRight /></button>
                  </div>
                </div>
              </section>
            </div>
          </main>

          <footer className="allowed-ids-footer">
            <div className="allowed-ids-footer-inner">
              <div className="allowed-ids-metric">
                <span className="allowed-ids-metric-label">Total</span>
                <span className="allowed-ids-metric-value allowed-ids-metric-value--primary">{total}</span>
              </div>
              <div className="allowed-ids-metric">
                <span className="allowed-ids-metric-label">Registered</span>
                <span className="allowed-ids-metric-value">{activeCount}</span>
              </div>
              <div className="allowed-ids-metric">
                <span className="allowed-ids-metric-label">Pending</span>
                <span className="allowed-ids-metric-value">{pendingSeats}</span>
              </div>
            </div>
          </footer>
        </div>
      )}

      {/* ── REQUESTS ── */}
      {tab === "requests" && (
        <div className="aid-requests">
          <div className="aid-req-header">
            <h1 className="allowed-ids-title">Registration Requests</h1>
            <select className="aid-req-filter" value={reqFilter} onChange={(e) => setReqFilter(e.target.value)}>
              <option value="pending_approval">Pending Approval</option>
              <option value="pending_email">Pending Email Verification</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="all">All</option>
            </select>
          </div>

          <div className="allowed-ids-table-wrapper">
            <table className="allowed-ids-table">
              <thead>
                <tr>
                  <th>Student ID</th><th>Full Name</th><th>Personal Email</th>
                  <th>National ID</th><th>Exam Seat</th><th>ID Card</th>
                  <th>Email ✓</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} className="allowed-ids-table-empty">Loading...</td></tr>
                ) : requests.length === 0 ? (
                  <tr><td colSpan={9} className="allowed-ids-table-empty">No requests found.</td></tr>
                ) : requests.map((req) => (
                  <tr key={req._id} className="allowed-ids-table-row">
                    <td className="allowed-ids-table-id">{req.studentId}</td>
                    <td>{req.fullName}</td>
                    <td style={{ fontSize: "0.8rem" }}>{req.personalEmail}</td>
                    <td>{req.nationalId}</td>
                    <td>{req.examSeatNumber}</td>
                    <td>
                      {req.idCardImageUrl ? (
                        <button
                          className="aid-img-link"
                          onClick={() => handleViewIdCard(req._id)}
                          disabled={loadingIdCard === req._id}
                          style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                        >
                          <FiEye /> {loadingIdCard === req._id ? "Loading..." : "View"}
                        </button>
                      ) : "—"}
                    </td>
                    <td>
                      <span style={{ color: req.emailVerified ? "#22c55e" : "#f59e0b", fontWeight: 600, fontSize: "0.78rem" }}>
                        {req.emailVerified ? "Yes" : "No"}
                      </span>
                    </td>
                    <td>
                      <span className="aid-status-badge" style={{
                        background: `${STATUS_COLOR[req.status]}22`,
                        color: STATUS_COLOR[req.status],
                        border: `1px solid ${STATUS_COLOR[req.status]}44`,
                      }}>
                        {req.status.replace(/_/g, " ").toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {req.status === "pending_approval" && (
                        <div style={{ display: "flex", gap: "0.4rem" }}>
                          <button className="aid-approve-btn" title="Approve"
                            onClick={() => { setReviewModal({ request: req, action: "approve" }); setAdminNote(""); }}>
                            <FiCheck />
                          </button>
                          <button className="aid-reject-btn" title="Reject"
                            onClick={() => { setReviewModal({ request: req, action: "reject" }); setAdminNote(""); }}>
                            <FiX />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Modal — rendered via portal to escape any overflow/transform parent */}
      {reviewModal && createPortal(
        <div className="aid-modal-overlay" onClick={() => setReviewModal(null)}>
          <div className="aid-modal" onClick={(e) => e.stopPropagation()}>
            <div className="aid-modal-header">
              <h2>{reviewModal.action === "approve" ? "Approve Request" : "Reject Request"}</h2>
              <button onClick={() => setReviewModal(null)}><FiX /></button>
            </div>
            <div className="aid-modal-body">
              <p className="aid-modal-student">
                Student: <strong>{reviewModal.request.fullName}</strong> ({reviewModal.request.studentId})
              </p>
              <label className="aid-modal-label">
                Admin Note (optional)
                <textarea
                  rows={3}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder={reviewModal.action === "reject" ? "Reason for rejection..." : "Optional note..."}
                  className="aid-modal-textarea"
                />
              </label>
            </div>
            <div className="aid-modal-footer">
              <button className="aid-modal-cancel" onClick={() => setReviewModal(null)}>Cancel</button>
              <button
                className={`aid-modal-confirm ${reviewModal.action === "approve" ? "aid-confirm-approve" : "aid-confirm-reject"}`}
                onClick={handleReview}
                disabled={submitting}
              >
                {submitting ? "Processing..." : reviewModal.action === "approve" ? "Approve" : "Reject"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AllowedIDS;
