import { useEffect, useState } from "react";
import { FiCheck, FiSearch, FiTrash2, FiX } from "react-icons/fi";
import { approveReceipt, deleteReceipt, getAllReceipts, rejectReceipt } from "../../../../services/ReceiptServices";
import "./TuitionApproval.css";

const STATUS_COLORS = {
  pending: "ta-badge-pending",
  approved: "ta-badge-approved",
  rejected: "ta-badge-rejected",
};

const getCurrentAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return month >= 9 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
};

const buildYearOptions = () => {
  const current = getCurrentAcademicYear();
  const [startYear] = current.split("-").map(Number);
  return Array.from({ length: 5 }, (_, i) => {
    const y = startYear - i;
    return `${y}-${y + 1}`;
  });
};

function TuitionApproval() {
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const limit = 10;

  useEffect(() => { load(); }, [page, statusFilter, academicYear]); // eslint-disable-line

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAllReceipts({ page, limit, status: statusFilter, search, academicYear });
      setRecords(data.students);
      setTotal(data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => { e.preventDefault(); setPage(1); load(); };

  const handleApprove = async (student) => {
    setActionLoading(true);
    try { await approveReceipt(student._id, academicYear); setSelected(null); load(); }
    catch (e) { console.error(e); }
    finally { setActionLoading(false); }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActionLoading(true);
    try { await rejectReceipt(rejectModal._id, rejectReason, academicYear); setRejectModal(null); setRejectReason(""); setSelected(null); load(); }
    catch (e) { console.error(e); }
    finally { setActionLoading(false); }
  };

  const handleDelete = async (student) => {
    if (!window.confirm(`Delete receipt for ${student.name}?`)) return;
    setActionLoading(true);
    try { await deleteReceipt(student._id, academicYear); setSelected(null); load(); }
    catch (e) { console.error(e); }
    finally { setActionLoading(false); }
  };

  const totalPages = Math.ceil(total / limit);
  const fmt = (d) => d ? new Date(d).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }) : "—";
  const getReceipt = (student) => student?.tuitionReceipt || student?.tuitionReceipts?.find(r => r.academicYear === academicYear);

  const selectedReceipt = selected ? getReceipt(selected) : null;

  return (
    <div className="ta-root">
      <div className="ta-header">
        <div>
          <h2 className="ta-title">Tuition Receipt Approval</h2>
          <p className="ta-sub">Review and verify student tuition payments for course activation.</p>
        </div>
      </div>

      <div className="ta-filters">
        <form className="ta-search-form" onSubmit={handleSearch}>
          <FiSearch className="ta-search-icon" />
          <input className="ta-search-input" placeholder="Search by Student ID or Name..." value={search} onChange={e => setSearch(e.target.value)} />
        </form>
        <select className="ta-select" value={academicYear} onChange={e => { setAcademicYear(e.target.value); setPage(1); }}>
          {buildYearOptions().map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select className="ta-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <span className="ta-total">Total Records: {total}</span>
      </div>

      <div className="ta-table-wrap">
        <table className="ta-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Student ID</th>
              <th>Department</th>
              <th>Academic Year</th>
              <th>Upload Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="ta-loading-row">Loading...</td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan={7} className="ta-loading-row">No records found.</td></tr>
            ) : records.map(s => {
              const receipt = getReceipt(s);
              return (
                <tr key={s._id}>
                  <td>
                    <div className="ta-student-cell">
                      <div className="ta-student-avatar">
                        {s.profilePhoto?.url ? <img src={s.profilePhoto.url} alt="" /> : s.name?.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()}
                      </div>
                      <span>{s.name}</span>
                    </div>
                  </td>
                  <td className="ta-id">{s.studentId || "—"}</td>
                  <td>{s.department?.name || "—"}</td>
                  <td>{receipt?.academicYear || academicYear}</td>
                  <td>{fmt(receipt?.uploadedAt)}</td>
                  <td>
                    <span className={`ta-badge ${STATUS_COLORS[receipt?.status] || "ta-badge-pending"}`}>
                      {(receipt?.status || "pending").toUpperCase()}
                    </span>
                  </td>
                  <td><button className="ta-details-btn" onClick={() => setSelected(s)}>Details</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="ta-pagination">
          <span className="ta-page-info">Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} records</span>
          <div className="ta-pages">
            <button className="ta-page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} className={`ta-page-btn ${page === p ? "ta-page-active" : ""}`} onClick={() => setPage(p)}>{p}</button>
            ))}
            {totalPages > 5 && <span className="ta-page-ellipsis">...</span>}
            {totalPages > 5 && (
              <button className={`ta-page-btn ${page === totalPages ? "ta-page-active" : ""}`} onClick={() => setPage(totalPages)}>{totalPages}</button>
            )}
            <button className="ta-page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
          </div>
        </div>
      )}

      {selected && (
        <div className="ta-modal-overlay" onClick={() => setSelected(null)}>
          <div className="ta-modal" onClick={e => e.stopPropagation()}>
            <div className="ta-modal-header">
              <h3>Receipt Verification — {academicYear}</h3>
              <p className="ta-modal-sub">Student: {selected.name} ({selected.studentId})</p>
              <button className="ta-modal-close" onClick={() => setSelected(null)}><FiX /></button>
            </div>
            <div className="ta-modal-body">
              {selectedReceipt?.url && (
                <div className="ta-receipt-preview">
                  {selectedReceipt.url.includes(".pdf") ? (
                    <a href={selectedReceipt.url} target="_blank" rel="noreferrer" className="ta-pdf-link">📄 View PDF Receipt</a>
                  ) : (
                    <a href={selectedReceipt.url} target="_blank" rel="noreferrer">
                      <img src={selectedReceipt.url} alt="Receipt" className="ta-receipt-img" />
                    </a>
                  )}
                </div>
              )}
              <div className="ta-meta-grid">
                <div className="ta-meta-item"><span className="ta-meta-label">Student Name</span><span className="ta-meta-value">{selected.name}</span></div>
                <div className="ta-meta-item"><span className="ta-meta-label">Student ID</span><span className="ta-meta-value">{selected.studentId || "—"}</span></div>
                <div className="ta-meta-item"><span className="ta-meta-label">Department</span><span className="ta-meta-value">{selected.department?.name || "—"}</span></div>
                <div className="ta-meta-item"><span className="ta-meta-label">Academic Year</span><span className="ta-meta-value">{academicYear}</span></div>
                <div className="ta-meta-item"><span className="ta-meta-label">Upload Date</span><span className="ta-meta-value">{fmt(selectedReceipt?.uploadedAt)}</span></div>
                <div className="ta-meta-item">
                  <span className="ta-meta-label">Current Status</span>
                  <span className={`ta-badge ${STATUS_COLORS[selectedReceipt?.status] || "ta-badge-pending"}`}>{(selectedReceipt?.status || "pending").toUpperCase()}</span>
                </div>
                {selectedReceipt?.rejectionReason && (
                  <div className="ta-meta-item ta-full">
                    <span className="ta-meta-label">Rejection Reason</span>
                    <span className="ta-meta-value ta-reject-reason">{selectedReceipt.rejectionReason}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="ta-modal-actions">
              <button className="ta-action-approve" onClick={() => handleApprove(selected)} disabled={actionLoading || selectedReceipt?.status === "approved"}>
                <FiCheck /> Approve Payment
              </button>
              <button className="ta-action-reject" onClick={() => { setRejectModal(selected); setSelected(null); }} disabled={actionLoading}>
                <FiX /> Reject Submission
              </button>
              <button className="ta-action-delete" onClick={() => handleDelete(selected)} disabled={actionLoading}>
                <FiTrash2 /> Delete Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectModal && (
        <div className="ta-modal-overlay" onClick={() => setRejectModal(null)}>
          <div className="ta-modal ta-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="ta-modal-header">
              <h3>Reject Receipt</h3>
              <button className="ta-modal-close" onClick={() => setRejectModal(null)}><FiX /></button>
            </div>
            <div className="ta-modal-body">
              <p className="ta-reject-label">Provide a reason for rejection (optional):</p>
              <textarea className="ta-reject-textarea" placeholder="e.g. Receipt is unclear, wrong amount..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={4} />
            </div>
            <div className="ta-modal-actions">
              <button className="ta-action-reject" onClick={handleReject} disabled={actionLoading}>Confirm Rejection</button>
              <button className="ta-action-cancel" onClick={() => setRejectModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TuitionApproval;
