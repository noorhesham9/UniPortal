import { useEffect, useRef, useState } from "react";
import {
  FiChevronDown, FiChevronLeft, FiChevronRight,
  FiChevronUp, FiDownload, FiPlus, FiSearch,
} from "react-icons/fi";
import { getDepartments } from "../../../../services/AdminServices";
import { getOfferedCourses } from "../../../../services/CourseServices";
import { getAllSemesters } from "../../../../services/SemesterServices";
import "./AdminCourseOfferings.css";

const AdminCourseOfferings = () => {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [expandedCourse, setExpandedCourse] = useState(null);

  // client-side pagination on the grouped courses
  const [page, setPage] = useState(1);
  const LIMIT = 10;
  const debounceRef = useRef(null);

  const selectedSemester = semesters.find((s) => s._id === semesterId);

  useEffect(() => {
    getDepartments()
      .then((r) => setDepartments(Array.isArray(r) ? r : r.departments || []))
      .catch(() => {});
    getAllSemesters()
      .then((r) => {
        const list = r.semesters || (Array.isArray(r) ? r : []);
        setSemesters(list);
        const active = list.find((s) => s.is_active);
        if (active) setSemesterId(active._id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => { setPage(1); }, [search, departmentId, semesterId]);

  useEffect(() => {
    if (!semesterId) return;
    fetchOffered();
  }, [semesterId, search, departmentId]);

  const fetchOffered = async () => {
    setLoading(true);
    try {
      const res = await getOfferedCourses(semesterId, search, departmentId);
      setCourses(res.courses || []);
      setTotal(res.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    clearTimeout(debounceRef.current);
    const v = e.target.value;
    debounceRef.current = setTimeout(() => setSearch(v), 300);
  };

  const totalPages = Math.ceil(total / LIMIT);
  const paginated = courses.slice((page - 1) * LIMIT, page * LIMIT);

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  const renderPages = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    for (let i = Math.max(1, page - 1); i <= Math.min(totalPages, page + 1); i++) {
      pages.push(
        <button key={i} className={`admin-page-btn ${page === i ? "active" : ""}`} onClick={() => goToPage(i)}>{i}</button>
      );
    }
    return pages;
  };

  const academicYears = [...new Set(semesters.map((s) => s.year))].sort((a, b) => b - a);

  return (
    <div className="admin-co-container">
      <header className="admin-co-header">
        <div className="admin-co-title-group">
          <span className="admin-co-sup">
            Admin &gt; Academic Management &gt; <span className="admin-co-sup-active">Course Offerings</span>
          </span>
          <h1 className="admin-co-title">Course Offerings</h1>
          <p className="admin-co-subtitle">
            Courses that have at least one section in the selected semester.
            {selectedSemester && (
              <span className="admin-co-sem-tag"> {selectedSemester.term} {selectedSemester.year}</span>
            )}
          </p>
        </div>
        <div className="admin-co-actions">
          <button className="admin-btn-secondary"><FiDownload /> Export</button>
          <button className="admin-btn-primary"><FiPlus /> Offer New Course</button>
        </div>
      </header>

      {/* Filters */}
      <div className="admin-co-filters-card">
        <div className="admin-co-filter-group">
          <label>SEMESTER</label>
          <select className="admin-co-select" value={semesterId} onChange={(e) => setSemesterId(e.target.value)}>
            <option value="">Select semester...</option>
            {semesters.map((s) => (
              <option key={s._id} value={s._id}>
                {s.term} {s.year}{s.is_active ? " ★" : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-co-filter-group">
          <label>ACADEMIC YEAR</label>
          <select
            className="admin-co-select"
            value={selectedSemester?.year || ""}
            onChange={(e) => {
              const yr = Number(e.target.value);
              const match = semesters.find((s) => s.year === yr);
              if (match) setSemesterId(match._id);
            }}
          >
            <option value="">All Years</option>
            {academicYears.map((y) => (
              <option key={y} value={y}>{y} – {y + 1}</option>
            ))}
          </select>
        </div>

        <div className="admin-co-filter-group">
          <label>DEPARTMENT</label>
          <select className="admin-co-select" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div className="admin-co-filter-group search-group">
          <label>SEARCH COURSES</label>
          <div className="admin-co-search-wrapper">
            <FiSearch className="admin-co-search-icon" />
            <input
              type="text"
              className="admin-co-search"
              placeholder="Code, title..."
              defaultValue={search}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-card">
        <div className="admin-table-wrapper">
          <table className="admin-table admin-co-table">
            <thead>
              <tr>
                <th></th>
                <th>COURSE INFO</th>
                <th>CREDITS</th>
                <th>ROOM TYPE</th>
                <th>SECTIONS</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="admin-loading">Loading...</td></tr>
              ) : !semesterId ? (
                <tr><td colSpan={6} className="admin-loading">Select a semester to view offerings.</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={6} className="admin-loading">No offered courses found for this semester.</td></tr>
              ) : paginated.map((course) => (
                <>
                  <tr
                    key={course._id}
                    className={`admin-co-row ${expandedCourse === course._id ? "admin-co-row-expanded" : ""}`}
                    onClick={() => setExpandedCourse(expandedCourse === course._id ? null : course._id)}
                    style={{ cursor: "pointer" }}
                  >
                    <td style={{ width: 36 }}>
                      {expandedCourse === course._id
                        ? <FiChevronUp style={{ color: "#facc15" }} />
                        : <FiChevronDown style={{ color: "var(--textsecondary)" }} />}
                    </td>
                    <td>
                      <div className="admin-co-code">{course.code}</div>
                      <div className="admin-co-title-sm">{course.title}</div>
                    </td>
                    <td><span className="admin-bold-text">{course.credits} CR</span></td>
                    <td><span className="admin-rm-badge-outline">{course.required_room_type || "—"}</span></td>
                    <td>
                      <span className="admin-co-section-count">{course.sections?.length || 0} section{course.sections?.length !== 1 ? "s" : ""}</span>
                    </td>
                    <td>
                      <span className={`admin-status-badge ${course.is_activated ? "active" : "inactive"}`}>
                        {course.is_activated ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>

                  {/* Expanded sections */}
                  {expandedCourse === course._id && (
                    <tr key={`${course._id}-sections`} className="admin-co-sections-row">
                      <td colSpan={6} style={{ padding: 0 }}>
                        <div className="admin-co-sections-panel">
                          <table className="admin-co-sections-table">
                            <thead>
                              <tr>
                                <th>SEC #</th>
                                <th>INSTRUCTOR</th>
                                <th>ROOM</th>
                                <th>DAY</th>
                                <th>TIME</th>
                                <th>CAPACITY</th>
                              </tr>
                            </thead>
                            <tbody>
                              {course.sections.map((sec) => (
                                <tr key={sec._id}>
                                  <td>Section {sec.sectionNumber}</td>
                                  <td>{sec.instructor?.name || "—"}</td>
                                  <td>{sec.room?.room_name || "—"} <span style={{ opacity: 0.5, fontSize: "0.75rem" }}>({sec.room?.type || ""})</span></td>
                                  <td>{sec.day}</td>
                                  <td>{sec.start_time} – {sec.end_time}</td>
                                  <td>{sec.capacity}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        <div className="admin-table-footer">
          <span>
            Showing {paginated.length > 0 ? (page - 1) * LIMIT + 1 : 0}–{Math.min(page * LIMIT, total)} of {total} courses
          </span>
          <div className="admin-pagination">
            <button className={`admin-page-btn ${page === 1 ? "disabled" : ""}`} onClick={() => goToPage(page - 1)}>
              <FiChevronLeft />
            </button>
            {renderPages()}
            <button className={`admin-page-btn ${page === totalPages ? "disabled" : ""}`} onClick={() => goToPage(page + 1)}>
              <FiChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCourseOfferings;
