import { useEffect, useState, useCallback } from "react";
import { FiSearch, FiUsers, FiFilter, FiTrash2, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import api from "../../../../services/api";
import "./AllEnrollments.css";

const STATUSES = ["", "Enrolled", "Approved", "Pending", "Waitlist", "Rejected"];

const BADGE = {
  Enrolled: "ae-badge-enrolled",
  Approved: "ae-badge-approved",
  Pending:  "ae-badge-pending",
  Waitlist: "ae-badge-waitlist",
  Rejected: "ae-badge-rejected",
};

const fmt = (d) => d ? new Date(d).toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" }) : "—";

export default function AllEnrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [semesters, setSemesters]     = useState([]);
  const [semesterId, setSemesterId]   = useState("");
  const [status, setStatus]           = useState("");
  const [search, setSearch]           = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [total, setTotal]             = useState(0);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [deleting, setDeleting]       = useState(null);

  const LIMIT = 20;

  // load semesters once
  useEffect(() => {
    api.get("/semesters").then((r) => {
      const list = r.data.semesters || [];
      setSemesters(list);
      const active = list.find((s) => s.is_active);
      if (active) setSemesterId(active._id);
    }).catch(() => {});
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ page, limit: LIMIT });
    if (semesterId) params.append("semesterId", semesterId);
    if (status)     params.append("status", status);
    if (search)     params.append("search", search);

    api.get(`/enrollment/all?${params}`)
      .then((r) => {
        setEnrollments(r.data.enrollments || []);
        setTotal(r.data.total || 0);
        setTotalPages(r.data.totalPages || 1);
      })
      .catch(() => setError("Failed to load enrollments."))
      .finally(() => setLoading(false));
  }, [semesterId, status, search, page]);

  useEffect(() => { load(); }, [load]);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleFilterChange = (setter) => (e) => { setter(e.target.value); setPage(1); };

  const handleDelete = async (id) => {
    if (!window.confirm("Drop this enrollment?")) return;
    setDeleting(id);
    try {
      await api.delete(`/enrollment/${id}`);
      load();
    } catch { /* ignore */ }
    finally { setDeleting(null); }
  };

  return (
    <div className="ae-root">
      {/* Header */}
      <div className="ae-header">
        <div>
          <h2 className="ae-title">All Enrollments</h2>
          <p className="ae-sub">View and manage every enrollment across the system</p>
        </div>
      </div>

      {/* Filters */}
      <div className="ae-filters">
        <div className="ae-search-wrap">
          <FiSearch className="ae-search-icon" />
          <input
            className="ae-search"
            placeholder="Search by name, student ID or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <div className="ae-filter-group">
          <FiFilter className="ae-filter-icon" />
          <select className="ae-select" value={semesterId} onChange={handleFilterChange(setSemesterId)}>
            <option value="">All Semesters</option>
            {semesters.map((s) => (
              <option key={s._id} value={s._id}>{s.term} {s.year}{s.is_active ? " ✓" : ""}</option>
            ))}
          </select>
          <select className="ae-select" value={status} onChange={handleFilterChange(setStatus)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s || "All Statuses"}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Count */}
      {!loading && (
        <div className="ae-count">
          <FiUsers /> {total} enrollment{total !== 1 ? "s" : ""}
        </div>
      )}

      {loading && <div className="ae-state">Loading...</div>}
      {error   && <div className="ae-state ae-error">{error}</div>}
      {!loading && !error && enrollments.length === 0 && (
        <div className="ae-state ae-empty">No enrollments found.</div>
      )}

      {/* Table */}
      {!loading && enrollments.length > 0 && (
        <>
          <div className="ae-table-wrap">
            <table className="ae-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Student ID</th>
                  <th>Course</th>
                  <th>Section</th>
                  <th>Instructor</th>
                  <th>Room</th>
                  <th>Day / Time</th>
                  <th>Semester</th>
                  <th>Status</th>
                  <th>Enrolled On</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e) => {
                  const sec    = e.section || {};
                  const course = sec.course_id || {};
                  const sem    = sec.semester_id || {};
                  return (
                    <tr key={e._id}>
                      <td className="ae-student-name">{e.student?.name || "—"}</td>
                      <td className="ae-mono">{e.student?.studentId || "—"}</td>
                      <td>
                        <span className="ae-course-code">{course.code}</span>
                        <span className="ae-course-title">{course.title}</span>
                      </td>
                      <td className="ae-center">Sec {sec.sectionNumber ?? "—"}</td>
                      <td>{sec.instructor_id?.name || "—"}</td>
                      <td className="ae-nowrap">{sec.room_id?.room_name || "—"}</td>
                      <td className="ae-nowrap">
                        {sec.day ? `${sec.day}` : "—"}
                        {sec.start_time && <span className="ae-time"> {sec.start_time}–{sec.end_time}</span>}
                      </td>
                      <td className="ae-nowrap">{sem.term ? `${sem.term} ${sem.year}` : "—"}</td>
                      <td>
                        <span className={`ae-badge ${BADGE[e.status] || ""}`}>{e.status}</span>
                      </td>
                      <td className="ae-nowrap ae-muted">{fmt(e.createdAt)}</td>
                      <td>
                        <button
                          className="ae-del-btn"
                          onClick={() => handleDelete(e._id)}
                          disabled={deleting === e._id}
                          title="Drop enrollment"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="ae-pagination">
              <button className="ae-page-btn" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
                <FiChevronRight />
              </button>
              <span className="ae-page-info">Page {page} of {totalPages}</span>
              <button className="ae-page-btn" onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>
                <FiChevronLeft />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
