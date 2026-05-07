import { useEffect, useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiSearch, FiUserPlus, FiUsers, FiX } from "react-icons/fi";
import { getUsers } from "../../../../services/AdminServices";
import { adminEnrollStudent, bulkAdminEnrollStudents } from "../../../../services/CourseServices";
import api from "../../../../services/api";
import "./AdminEnrollment.css";

const STUDENT_LIMIT = 10;

// Simple SweetAlert-like modal (no external dependency needed)
const showSuccessAlert = (title, message) => {
  const overlay = document.createElement('div');
  overlay.className = 'swal-overlay';
  const modal = document.createElement('div');
  modal.className = 'swal-modal';
  modal.innerHTML = `
    <div class="swal-icon swal-success">
      <div class="swal-success-ring"></div>
      <div class="swal-success-line swal-success-line-tip"></div>
      <div class="swal-success-line swal-success-line-long"></div>
    </div>
    <h2 class="swal-title">${title}</h2>
    <p class="swal-text">${message}</p>
    <button class="swal-button">OK</button>
  `;
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  const button = modal.querySelector('.swal-button');
  const close = () => {
    overlay.classList.add('swal-fade-out');
    setTimeout(() => document.body.removeChild(overlay), 300);
  };
  button.onclick = close;
  overlay.onclick = (e) => { if (e.target === overlay) close(); };
  setTimeout(() => overlay.classList.add('swal-show'), 10);
};

function AdminEnrollment() {
  // ── Students (server-side) ─────────────────────────────────────────────────
  const [students,      setStudents]      = useState([]);
  const [studentTotal,  setStudentTotal]  = useState(0);
  const [studentPages,  setStudentPages]  = useState(1);
  const [studentPage,   setStudentPage]   = useState(1);
  const [studentQ,      setStudentQ]      = useState("");
  const [studentSort,   setStudentSort]   = useState("name");
  const [studentOrder,  setStudentOrder]  = useState("asc");
  const [studentLoading, setStudentLoading] = useState(false);

  // ── Sections (server-side) ─────────────────────────────────────────────────
  const [sections,       setSections]       = useState([]);
  const [sectionTotal,   setSectionTotal]   = useState(0);
  const [sectionPages,   setSectionPages]   = useState(1);
  const [sectionPage,    setSectionPage]    = useState(1);
  const [sectionQ,       setSectionQ]       = useState("");
  const [sectionDay,     setSectionDay]     = useState("");
  const [sectionStatus,  setSectionStatus]  = useState("");
  const [sectionSort,    setSectionSort]    = useState("course_id");
  const [sectionOrder,   setSectionOrder]   = useState("asc");
  const [sectionLoading, setSectionLoading] = useState(false);
  const [activeSemId,    setActiveSemId]    = useState("");

  // ── Selection ──────────────────────────────────────────────────────────────
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedSection,  setSelectedSection]  = useState(null);
  const [bulkMode,         setBulkMode]         = useState(false);

  // ── Misc ───────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [msg,     setMsg]     = useState(null);

  const debounceRef    = useRef(null);
  const secDebounceRef = useRef(null);

  // ── Load students — plain async, takes all params explicitly ─────────────
  const loadStudents = async (page, q, sort, order) => {
    setStudentLoading(true);
    try {
      const data = await getUsers({ role: "student", search: q, page, limit: STUDENT_LIMIT, sort, order });
      setStudents(data.users || []);
      setStudentTotal(data.total || 0);
      setStudentPages(data.totalPages || 1);
      setStudentPage(data.page || page);
    } catch (e) {
      console.error("loadStudents error:", e);
    } finally {
      setStudentLoading(false);
    }
  };

  // Initial load on mount
  useEffect(() => {
    loadStudents(1, "", "name", "asc");
  }, []); // eslint-disable-line

  // Debounce search
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => loadStudents(1, studentQ, studentSort, studentOrder), 350);
    return () => clearTimeout(debounceRef.current);
  }, [studentQ]); // eslint-disable-line

  // Sort / order change
  useEffect(() => {
    loadStudents(1, studentQ, studentSort, studentOrder);
  }, [studentSort, studentOrder]); // eslint-disable-line

  // Page change (skip page 1 — already handled by mount + filter effects)
  useEffect(() => {
    if (studentPage === 1) return;
    loadStudents(studentPage, studentQ, studentSort, studentOrder);
  }, [studentPage]); // eslint-disable-line

  // ── Load sections (server-side) ───────────────────────────────────────────
  const loadSections = async (page, q, day, status, sort, order, semId) => {
    if (!semId) return;
    setSectionLoading(true);
    try {
      const params = new URLSearchParams({
        semesterId: semId, page, limit: 10, sort, order,
      });
      if (q)      params.append("search", q);
      if (day)    params.append("day",    day);
      if (status) params.append("status", status);
      const res  = await api.get(`/sections?${params}`);
      const data = res.data;
      setSections(data.sections || []);
      setSectionTotal(data.total || 0);
      setSectionPages(data.totalPages || 1);
      setSectionPage(data.page || page);
    } catch {}
    finally { setSectionLoading(false); }
  };

  // Resolve active semester once, then load sections
  useEffect(() => {
    (async () => {
      try {
        const semRes   = await api.get("/semesters");
        const semesters = semRes.data?.semesters || [];
        const active   = semesters.find(s => s.is_active) || semesters[0];
        if (!active) return;
        setActiveSemId(active._id);
        loadSections(1, "", "", "", "course_id", "asc", active._id);
      } catch {}
    })();
  }, []); // eslint-disable-line

  // Debounce section search
  useEffect(() => {
    clearTimeout(secDebounceRef.current);
    secDebounceRef.current = setTimeout(
      () => loadSections(1, sectionQ, sectionDay, sectionStatus, sectionSort, sectionOrder, activeSemId),
      350
    );
    return () => clearTimeout(secDebounceRef.current);
  }, [sectionQ]); // eslint-disable-line

  // Filter / sort change
  useEffect(() => {
    if (!activeSemId) return;
    loadSections(1, sectionQ, sectionDay, sectionStatus, sectionSort, sectionOrder, activeSemId);
  }, [sectionDay, sectionStatus, sectionSort, sectionOrder]); // eslint-disable-line

  // Page change
  useEffect(() => {
    if (!activeSemId || sectionPage === 1) return;
    loadSections(sectionPage, sectionQ, sectionDay, sectionStatus, sectionSort, sectionOrder, activeSemId);
  }, [sectionPage]); // eslint-disable-line

  // Pagination helpers for sections
  const goToSectionPage = (p) => { if (p >= 1 && p <= sectionPages) setSectionPage(p); };
  const sectionPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= sectionPages; i++) {
      if (i === 1 || i === sectionPages || Math.abs(i - sectionPage) <= 1) pages.push(i);
      else if (pages[pages.length - 1] !== "…") pages.push("…");
    }
    return pages;
  };
  const secFrom = sectionTotal === 0 ? 0 : (sectionPage - 1) * 10 + 1;
  const secTo   = Math.min(sectionPage * 10, sectionTotal);

  // ── Student pagination helpers ─────────────────────────────────────────────
  const goToStudentPage = (p) => { if (p >= 1 && p <= studentPages) setStudentPage(p); };

  const studentPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= studentPages; i++) {
      if (i === 1 || i === studentPages || Math.abs(i - studentPage) <= 1) pages.push(i);
      else if (pages[pages.length - 1] !== "…") pages.push("…");
    }
    return pages;
  };

  // ── Selection ──────────────────────────────────────────────────────────────
  const toggleStudentSelection = (student) => {
    if (!bulkMode) { setSelectedStudents([student]); return; }
    const isSelected = selectedStudents.some(s => s._id === student._id);
    setSelectedStudents(isSelected
      ? selectedStudents.filter(s => s._id !== student._id)
      : [...selectedStudents, student]);
  };

  const removeStudent = (id) => setSelectedStudents(selectedStudents.filter(s => s._id !== id));

  // ── Enroll ─────────────────────────────────────────────────────────────────
  const handleEnroll = async () => {
    if (!selectedStudents.length || !selectedSection) return;
    setLoading(true); setMsg(null);
    try {
      if (bulkMode && selectedStudents.length > 1) {
        const result = await bulkAdminEnrollStudents(selectedStudents.map(s => s._id), selectedSection._id);
        showSuccessAlert('Enrollment Successful!',
          `${result.enrolled} student(s) enrolled${result.skipped > 0 ? `. ${result.skipped} already enrolled.` : '.'}`);
        setSections(prev => prev.map(s =>
          s._id === selectedSection._id ? { ...s, enrolled_count: (s.enrolled_count || 0) + result.enrolled } : s));
      } else {
        await adminEnrollStudent(selectedStudents[0]._id, selectedSection._id);
        showSuccessAlert('Enrollment Successful!',
          `${selectedStudents[0].name} enrolled in ${selectedSection.course_id?.code} Sec ${selectedSection.sectionNumber}`);
        setSections(prev => prev.map(s =>
          s._id === selectedSection._id ? { ...s, enrolled_count: (s.enrolled_count || 0) + 1 } : s));
      }
      setSelectedStudents([]); setSelectedSection(null);
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Enrollment failed" });
    } finally { setLoading(false); }
  };

  const from = studentTotal === 0 ? 0 : (studentPage - 1) * STUDENT_LIMIT + 1;
  const to   = Math.min(studentPage * STUDENT_LIMIT, studentTotal);

  return (
    <div className="ae-root">
      <div className="ae-header">
        <div>
          <h2 className="ae-title">Admin Enrollment</h2>
          <p className="ae-sub">Directly enroll student(s) in any section — bypasses capacity, slice, and fee checks.</p>
        </div>
        <button
          className={`ae-bulk-toggle ${bulkMode ? 'active' : ''}`}
          onClick={() => { setBulkMode(!bulkMode); setSelectedStudents([]); }}
        >
          {bulkMode ? <FiUsers /> : <FiUserPlus />}
          {bulkMode ? "Bulk Mode" : "Single Mode"}
        </button>
      </div>

      <div className="ae-grid">
        {/* ── Student picker ─────────────────────────────────────────────── */}
        <div className="ae-card">
          <h3 className="ae-card-title">
            1. Select Student{bulkMode ? 's' : ''}
            {bulkMode && selectedStudents.length > 0 && (
              <span className="ae-count-badge">{selectedStudents.length} selected</span>
            )}
          </h3>

          {/* Search + sort row */}
          <div className="ae-student-controls">
            <div className="ae-search-wrap">
              <FiSearch className="ae-search-icon" />
              <input
                className="ae-search"
                placeholder="Search by name or ID…"
                value={studentQ}
                onChange={e => setStudentQ(e.target.value)}
              />
              {studentQ && (
                <button className="ae-clear-btn" onClick={() => setStudentQ("")}><FiX size={12} /></button>
              )}
            </div>
            <select
              className="ae-sort-select"
              value={`${studentSort}:${studentOrder}`}
              onChange={e => {
                const [s, o] = e.target.value.split(":");
                setStudentSort(s); setStudentOrder(o);
              }}
            >
              <option value="name:asc">Name A→Z</option>
              <option value="name:desc">Name Z→A</option>
              <option value="studentId:asc">ID ↑</option>
              <option value="studentId:desc">ID ↓</option>
              <option value="createdAt:desc">Newest</option>
              <option value="createdAt:asc">Oldest</option>
            </select>
          </div>

          {/* List */}
          <div className="ae-list">
            {studentLoading ? (
              <p className="ae-empty">Loading…</p>
            ) : students.length === 0 ? (
              <p className="ae-empty">No students found</p>
            ) : students.map((s) => {
              const isSelected = selectedStudents.some(sel => sel._id === s._id);
              return (
                <button
                  key={s._id}
                  className={`ae-item ${isSelected ? "ae-item-selected" : ""}`}
                  onClick={() => toggleStudentSelection(s)}
                >
                  {bulkMode && (
                    <div className={`ae-checkbox ${isSelected ? 'checked' : ''}`}>{isSelected && '✓'}</div>
                  )}
                  <div className="ae-item-avatar">{s.name?.split(" ").slice(0,2).map(n=>n[0]).join("").toUpperCase()}</div>
                  <div>
                    <div className="ae-item-name">{s.name}</div>
                    <div className="ae-item-sub">ID: {s.studentId || "—"} · {s.department?.name || "—"} · Level {s.level}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Pagination */}
          {studentPages > 1 && (
            <div className="ae-pagination">
              <span className="ae-page-info">{from}–{to} of {studentTotal}</span>
              <div className="ae-page-btns">
                <button className="ae-page-btn" disabled={studentPage === 1} onClick={() => goToStudentPage(studentPage - 1)}>
                  <FiChevronLeft size={14} />
                </button>
                {studentPageNumbers().map((n, i) =>
                  n === "…"
                    ? <span key={`e${i}`} className="ae-page-ellipsis">…</span>
                    : <button key={n} className={`ae-page-btn ${studentPage === n ? "active" : ""}`} onClick={() => goToStudentPage(n)}>{n}</button>
                )}
                <button className="ae-page-btn" disabled={studentPage === studentPages} onClick={() => goToStudentPage(studentPage + 1)}>
                  <FiChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Section picker ─────────────────────────────────────────────── */}
        <div className="ae-card">
          <h3 className="ae-card-title">2. Select Section</h3>

          {/* Search + filters row */}
          <div className="ae-student-controls">
            <div className="ae-search-wrap" style={{ flex: 1 }}>
              <FiSearch className="ae-search-icon" />
              <input
                className="ae-search"
                placeholder="Search course, instructor, room…"
                value={sectionQ}
                onChange={e => setSectionQ(e.target.value)}
              />
              {sectionQ && (
                <button className="ae-clear-btn" onClick={() => setSectionQ("")}><FiX size={12} /></button>
              )}
            </div>
          </div>

          {/* Filter row */}
          <div className="ae-section-filters">
            <select className="ae-sort-select" value={sectionDay} onChange={e => setSectionDay(e.target.value)}>
              <option value="">All Days</option>
              {["Sunday","Monday","Tuesday","Wednesday","Thursday"].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <select className="ae-sort-select" value={sectionStatus} onChange={e => setSectionStatus(e.target.value)}>
              <option value="">All Status</option>
              <option value="Open">Open</option>
              <option value="Full">Full</option>
              <option value="Tentative">Tentative</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <select
              className="ae-sort-select"
              value={`${sectionSort}:${sectionOrder}`}
              onChange={e => {
                const [s, o] = e.target.value.split(":");
                setSectionSort(s); setSectionOrder(o);
              }}
            >
              <option value="course_id:asc">Course A→Z</option>
              <option value="course_id:desc">Course Z→A</option>
              <option value="day:asc">Day ↑</option>
              <option value="day:desc">Day ↓</option>
              <option value="start_time:asc">Time ↑</option>
              <option value="start_time:desc">Time ↓</option>
              <option value="enrolled_count:asc">Enrolled ↑</option>
              <option value="enrolled_count:desc">Enrolled ↓</option>
            </select>
          </div>

          {/* List */}
          <div className="ae-list">
            {sectionLoading ? (
              <p className="ae-empty">Loading…</p>
            ) : sections.length === 0 ? (
              <p className="ae-empty">No sections found</p>
            ) : sections.map((s) => {
              const enrolledCount = s.enrolled_count || 0;
              const pct    = s.capacity > 0 ? (enrolledCount / s.capacity) * 100 : 0;
              const isFull = enrolledCount >= s.capacity;
              return (
                <button
                  key={s._id}
                  className={`ae-item ${selectedSection?._id === s._id ? "ae-item-selected" : ""}`}
                  onClick={() => setSelectedSection(s)}
                >
                  <div className="ae-item-avatar" style={{ background: "rgba(59,130,246,0.15)", color: "#3b82f6" }}>
                    {s.sectionNumber}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="ae-item-name">{s.course_id?.code} — {s.course_id?.title}</div>
                    <div className="ae-item-sub">{s.day} {s.start_time}–{s.end_time} · {s.instructor_id?.name || "—"}</div>
                    <div className="ae-enrollment-info">
                      <span className={`ae-enrollment-count ${isFull ? "full" : ""}`}>{enrolledCount}/{s.capacity} enrolled</span>
                      <div className="ae-capacity-bar">
                        <div className="ae-capacity-fill" style={{
                          width: `${Math.min(pct, 100)}%`,
                          background: isFull ? "#ef4444" : pct > 80 ? "#f59e0b" : "#10b981",
                        }} />
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Pagination */}
          {sectionPages > 1 && (
            <div className="ae-pagination">
              <span className="ae-page-info">{secFrom}–{secTo} of {sectionTotal}</span>
              <div className="ae-page-btns">
                <button className="ae-page-btn" disabled={sectionPage === 1} onClick={() => goToSectionPage(sectionPage - 1)}>
                  <FiChevronLeft size={14} />
                </button>
                {sectionPageNumbers().map((n, i) =>
                  n === "…"
                    ? <span key={`se${i}`} className="ae-page-ellipsis">…</span>
                    : <button key={n} className={`ae-page-btn ${sectionPage === n ? "active" : ""}`} onClick={() => goToSectionPage(n)}>{n}</button>
                )}
                <button className="ae-page-btn" disabled={sectionPage === sectionPages} onClick={() => goToSectionPage(sectionPage + 1)}>
                  <FiChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Summary + enroll ───────────────────────────────────────────────── */}
      <div className="ae-action-bar">
        <div className="ae-summary">
          {selectedStudents.length > 0 ? (
            bulkMode && selectedStudents.length > 1 ? (
              <div className="ae-selected-students">
                <span className="ae-chip ae-chip-student">{selectedStudents.length} students selected</span>
                <div className="ae-student-tags">
                  {selectedStudents.slice(0, 3).map(s => (
                    <span key={s._id} className="ae-student-tag">
                      {s.name}
                      <button onClick={() => removeStudent(s._id)} className="ae-tag-remove"><FiX /></button>
                    </span>
                  ))}
                  {selectedStudents.length > 3 && (
                    <span className="ae-student-tag ae-more">+{selectedStudents.length - 3} more</span>
                  )}
                </div>
              </div>
            ) : (
              <span className="ae-chip ae-chip-student">Student: {selectedStudents[0].name}</span>
            )
          ) : (
            <span className="ae-chip ae-chip-empty">No student{bulkMode ? 's' : ''} selected</span>
          )}
          {selectedSection
            ? <span className="ae-chip ae-chip-section">Section: {selectedSection.course_id?.code} Sec {selectedSection.sectionNumber}</span>
            : <span className="ae-chip ae-chip-empty">No section selected</span>}
        </div>
        <button
          className="ae-enroll-btn"
          onClick={handleEnroll}
          disabled={!selectedStudents.length || !selectedSection || loading}
        >
          {bulkMode && selectedStudents.length > 1 ? <FiUsers /> : <FiUserPlus />}
          {loading ? "Enrolling…" : bulkMode && selectedStudents.length > 1 ? `Enroll ${selectedStudents.length} Students` : "Enroll Student"}
        </button>
      </div>

      {msg && <p className={msg.type === "success" ? "ae-msg-ok" : "ae-msg-err"}>{msg.text}</p>}
    </div>
  );
}


export default AdminEnrollment;
