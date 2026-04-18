import { useEffect, useRef, useState } from "react";
import { FiCheckCircle, FiChevronLeft, FiChevronRight, FiSearch, FiXCircle, FiAlertCircle } from "react-icons/fi";
import { getAdminFinalLockStatus } from "../../../../services/gradesService";
import "./AdminFinalLockStatus.css";

const LIMIT = 12;

const AdminFinalLockStatus = () => {
  const [data, setData] = useState([]);
  const [semester, setSemester] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | locked | unlocked | no_students
  const [page, setPage] = useState(1);
  const debounceRef = useRef(null);

  useEffect(() => {
    getAdminFinalLockStatus()
      .then((res) => {
        setData(res.sections || []);
        setSemester(res.semester || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    clearTimeout(debounceRef.current);
    const v = e.target.value;
    debounceRef.current = setTimeout(() => { setSearch(v); setPage(1); }, 300);
  };

  const filtered = data.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      s.course?.code?.toLowerCase().includes(q) ||
      s.course?.title?.toLowerCase().includes(q) ||
      s.instructor?.name?.toLowerCase().includes(q);

    const matchFilter =
      filter === "all" ||
      (filter === "locked" && s.isFinalFullyLocked) ||
      (filter === "unlocked" && !s.isFinalFullyLocked && s.totalStudents > 0) ||
      (filter === "no_students" && s.totalStudents === 0);

    return matchSearch && matchFilter;
  });

  const totalPages = Math.ceil(filtered.length / LIMIT);
  const paginated = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  const stats = {
    total: data.length,
    locked: data.filter((s) => s.isFinalFullyLocked).length,
    unlocked: data.filter((s) => !s.isFinalFullyLocked && s.totalStudents > 0).length,
    noStudents: data.filter((s) => s.totalStudents === 0).length,
  };

  const getStatusBadge = (sec) => {
    if (sec.totalStudents === 0)
      return <span className="fls-badge fls-badge-gray">No Students</span>;
    if (sec.isFinalFullyLocked)
      return <span className="fls-badge fls-badge-green"><FiCheckCircle /> Locked</span>;
    if (sec.hasGradesEntered)
      return <span className="fls-badge fls-badge-yellow"><FiAlertCircle /> Partial</span>;
    return <span className="fls-badge fls-badge-red"><FiXCircle /> Not Submitted</span>;
  };

  return (
    <div className="fls-container">
      <header className="fls-header">
        <div>
          <span className="fls-breadcrumb">Admin &gt; Grades &gt; <span className="fls-breadcrumb-active">Final Lock Status</span></span>
          <h1 className="fls-title">Final Grades Lock Status</h1>
          <p className="fls-subtitle">
            Track which instructors have submitted and locked final exam grades
            {semester && <span className="fls-sem-tag">{semester.term} {semester.year}</span>}
          </p>
        </div>
      </header>

      {/* Stats */}
      <div className="fls-stats-row">
        <div className="fls-stat-card">
          <span className="fls-stat-num">{stats.total}</span>
          <span className="fls-stat-label">Total Sections</span>
        </div>
        <div className="fls-stat-card fls-stat-green">
          <span className="fls-stat-num">{stats.locked}</span>
          <span className="fls-stat-label">Fully Locked</span>
        </div>
        <div className="fls-stat-card fls-stat-red">
          <span className="fls-stat-num">{stats.unlocked}</span>
          <span className="fls-stat-label">Not Locked</span>
        </div>
        <div className="fls-stat-card fls-stat-gray">
          <span className="fls-stat-num">{stats.noStudents}</span>
          <span className="fls-stat-label">No Students</span>
        </div>
      </div>

      {/* Filters */}
      <div className="fls-filters">
        <div className="fls-search-wrap">
          <FiSearch className="fls-search-icon" />
          <input
            type="text"
            className="fls-search"
            placeholder="Search by course or instructor..."
            defaultValue={search}
            onChange={handleSearch}
          />
        </div>
        <div className="fls-filter-tabs">
          {[
            { key: "all", label: "All" },
            { key: "locked", label: "Locked" },
            { key: "unlocked", label: "Not Locked" },
            { key: "no_students", label: "No Students" },
          ].map((t) => (
            <button
              key={t.key}
              className={`fls-tab ${filter === t.key ? "active" : ""}`}
              onClick={() => { setFilter(t.key); setPage(1); }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-card">
        <div className="admin-table-wrapper">
          <table className="admin-table fls-table">
            <thead>
              <tr>
                <th>COURSE</th>
                <th>SECTION</th>
                <th>INSTRUCTOR</th>
                <th>SCHEDULE</th>
                <th>STUDENTS</th>
                <th>FINAL LOCK</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="admin-loading">Loading...</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={7} className="admin-loading">No sections found.</td></tr>
              ) : paginated.map((sec) => (
                <tr key={sec.sectionId} className="fls-row">
                  <td>
                    <div className="fls-course-code">{sec.course?.code || "—"}</div>
                    <div className="fls-course-title">{sec.course?.title || "—"}</div>
                  </td>
                  <td>Section {sec.sectionNumber}</td>
                  <td>{sec.instructor?.name || "—"}</td>
                  <td>
                    <div>{sec.day}</div>
                    <div className="fls-time">{sec.startTime} – {sec.endTime}</div>
                  </td>
                  <td>
                    <span className="fls-students-count">{sec.totalStudents}</span>
                  </td>
                  <td>
                    {sec.totalStudents === 0 ? (
                      <span className="fls-lock-ratio">—</span>
                    ) : (
                      <div className="fls-lock-progress">
                        <span className="fls-lock-ratio">{sec.finalLockedCount}/{sec.totalStudents}</span>
                        <div className="fls-progress-bar">
                          <div
                            className={`fls-progress-fill ${sec.isFinalFullyLocked ? "green" : sec.finalLockedCount > 0 ? "yellow" : "red"}`}
                            style={{ width: `${sec.totalStudents > 0 ? (sec.finalLockedCount / sec.totalStudents) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </td>
                  <td>{getStatusBadge(sec)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="admin-table-footer">
          <span>Showing {paginated.length > 0 ? (page - 1) * LIMIT + 1 : 0}–{Math.min(page * LIMIT, filtered.length)} of {filtered.length} sections</span>
          <div className="admin-pagination">
            <button className={`admin-page-btn ${page === 1 ? "disabled" : ""}`} onClick={() => page > 1 && setPage(page - 1)}><FiChevronLeft /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p >= page - 1 && p <= page + 1)
              .map((p) => (
                <button key={p} className={`admin-page-btn ${p === page ? "active" : ""}`} onClick={() => setPage(p)}>{p}</button>
              ))}
            <button className={`admin-page-btn ${page === totalPages ? "disabled" : ""}`} onClick={() => page < totalPages && setPage(page + 1)}><FiChevronRight /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFinalLockStatus;
