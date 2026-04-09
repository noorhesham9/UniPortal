import { useEffect, useRef, useState } from "react";
import {
  FiChevronLeft, FiChevronRight, FiEdit2,
  FiPlus, FiSearch, FiToggleLeft, FiToggleRight, FiX,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { getDepartments } from "../../../../services/AdminServices";
import { getAllCourses, offerCourse, toggleCourseActive } from "../../../../services/CourseServices";
import { getRooms } from "../../../../services/RoomServices";
import { getAllSemesters } from "../../../../services/SemesterServices";
import api from "../../../../services/api";
import "./CourseManagement.css";

const LIMIT = 10;

export default function CourseManagement() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [activeSemester, setActiveSemester] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // courseId being acted on
  const [offerModal, setOfferModal] = useState(null); // course to offer
  const [rooms, setRooms] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [offerForm, setOfferForm] = useState({
    instructor_id: "", room_id: "", day: "Saturday",
    start_time: "08:00", end_time: "10:00", capacity: 40, sectionNumber: 1,
  });
  const [offerError, setOfferError] = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    getDepartments().then(r => setDepartments(Array.isArray(r) ? r : r.departments || [])).catch(() => {});
    getAllSemesters().then(r => {
      const list = r.semesters || (Array.isArray(r) ? r : []);
      setActiveSemester(list.find(s => s.is_active) || null);
    }).catch(() => {});
    getRooms().then(r => setRooms(Array.isArray(r) ? r : r.rooms || [])).catch(() => {});
    api.get("/admin/users?role=professor").then(r => setProfessors(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => { setPage(1); }, [search, departmentId, statusFilter]);
  useEffect(() => { fetchCourses(); }, [page, search, departmentId, statusFilter]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (departmentId) filters.department_id = departmentId;
      const res = await getAllCourses(page, LIMIT, search, filters);
      let list = res.courses || [];
      if (statusFilter === "active") list = list.filter(c => c.is_activated);
      if (statusFilter === "inactive") list = list.filter(c => !c.is_activated);
      setCourses(list);
      setPagination(res.pagination || { total: list.length, totalPages: 1 });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    clearTimeout(debounceRef.current);
    const v = e.target.value;
    setSearch(v);
    debounceRef.current = setTimeout(() => {}, 0);
  };

  const handleToggle = async (course) => {
    setActionLoading(course._id);
    try {
      const res = await toggleCourseActive(course._id);
      setCourses(prev => prev.map(c => c._id === course._id ? { ...c, is_activated: res.course.is_activated } : c));
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const openOfferModal = (course) => {
    setOfferModal(course);
    setOfferError(null);
    setOfferForm({ instructor_id: "", room_id: "", day: "Saturday", start_time: "08:00", end_time: "10:00", capacity: 40, sectionNumber: 1 });
  };

  const handleOffer = async () => {
    if (!offerForm.instructor_id || !offerForm.room_id) {
      setOfferError("Instructor and room are required");
      return;
    }
    setActionLoading(offerModal._id);
    setOfferError(null);
    try {
      await offerCourse(offerModal._id, offerForm);
      setOfferModal(null);
    } catch (e) {
      setOfferError(e.response?.data?.message || "Failed to offer course");
    } finally {
      setActionLoading(null);
    }
  };

  const goToPage = (p) => {
    if (p < 1 || p > pagination.totalPages) return;
    setPage(p);
  };

  const renderPages = () => {
    const { totalPages } = pagination;
    if (totalPages <= 1) return null;
    const pages = [];
    for (let i = Math.max(1, page - 1); i <= Math.min(totalPages, page + 1); i++) pages.push(i);
    return pages.map(p => (
      <button key={p} className={`cm-page-btn ${page === p ? "cm-page-active" : ""}`} onClick={() => goToPage(p)}>{p}</button>
    ));
  };

  const DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

  return (
    <div className="cm-container">
      {/* Header */}
      <div className="cm-header">
        <div>
          <span className="cm-breadcrumb">Admin &gt; <span className="cm-breadcrumb-active">Course Management</span></span>
          <h1 className="cm-title">Course Management</h1>
          <p className="cm-subtitle">
            Offer courses in the active semester, edit course details, or toggle activation status.
            {activeSemester && (
              <span className="cm-semester-tag"> Active: {activeSemester.term} {activeSemester.year}</span>
            )}
          </p>
        </div>
        <button className="cm-btn-primary" onClick={() => navigate("/dashboard?section=create_course")}>
          <FiPlus /> New Course
        </button>
      </div>

      {/* Filters */}
      <div className="cm-filters">
        <div className="cm-search-wrap">
          <FiSearch className="cm-search-icon" />
          <input
            className="cm-search"
            placeholder="Search by code or title..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>
        <select className="cm-select" value={departmentId} onChange={e => setDepartmentId(e.target.value)}>
          <option value="">All Departments</option>
          {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>
        <select className="cm-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <span className="cm-total">Total: {pagination.total}</span>
      </div>

      {/* Table */}
      <div className="cm-table-card">
        <div className="cm-table-wrap">
          <table className="cm-table">
            <thead>
              <tr>
                <th>COURSE INFO</th>
                <th>CREDITS</th>
                <th>ROOM TYPE</th>
                <th>PREREQUISITES</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="cm-empty">Loading...</td></tr>
              ) : courses.length === 0 ? (
                <tr><td colSpan={6} className="cm-empty">No courses found.</td></tr>
              ) : courses.map(course => (
                <tr key={course._id}>
                  <td>
                    <div className="cm-code">{course.code}</div>
                    <div className="cm-course-title">{course.title}</div>
                  </td>
                  <td><span className="cm-credits">{course.credits} CR</span></td>
                  <td><span className="cm-room-badge">{course.required_room_type}</span></td>
                  <td>
                    {course.prerequisites_array?.length > 0
                      ? course.prerequisites_array.map(p => (
                          <span key={p._id} className="cm-prereq-tag">{p.code}</span>
                        ))
                      : <span className="cm-none">None</span>}
                  </td>
                  <td>
                    <span className={`cm-status ${course.is_activated ? "cm-active" : "cm-inactive"}`}>
                      {course.is_activated ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="cm-actions">
                      {/* Offer in active semester */}
                      <button
                        className="cm-action-btn cm-offer-btn"
                        onClick={() => openOfferModal(course)}
                        disabled={actionLoading === course._id || !activeSemester}
                        title={activeSemester ? `Offer in ${activeSemester.term} ${activeSemester.year}` : "No active semester"}
                      >
                        <FiPlus /> Offer
                      </button>
                      {/* Edit */}
                      <button
                        className="cm-action-btn cm-edit-btn"
                        onClick={() => navigate(`/dashboard?section=update_course&id=${course._id}`)}
                        title="Edit course"
                      >
                        <FiEdit2 />
                      </button>
                      {/* Toggle active */}
                      <button
                        className={`cm-action-btn ${course.is_activated ? "cm-deactivate-btn" : "cm-activate-btn"}`}
                        onClick={() => handleToggle(course)}
                        disabled={actionLoading === course._id}
                        title={course.is_activated ? "Deactivate" : "Activate"}
                      >
                        {course.is_activated ? <FiToggleRight /> : <FiToggleLeft />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="cm-footer">
          <span className="cm-showing">
            Showing {courses.length > 0 ? (page - 1) * LIMIT + 1 : 0}–{Math.min(page * LIMIT, pagination.total)} of {pagination.total}
          </span>
          <div className="cm-pagination">
            <button className="cm-page-btn" onClick={() => goToPage(page - 1)} disabled={page === 1}><FiChevronLeft /></button>
            {renderPages()}
            <button className="cm-page-btn" onClick={() => goToPage(page + 1)} disabled={page === pagination.totalPages}><FiChevronRight /></button>
          </div>
        </div>
      </div>

      {/* Offer Modal */}
      {offerModal && (
        <div className="cm-overlay" onClick={() => setOfferModal(null)}>
          <div className="cm-modal" onClick={e => e.stopPropagation()}>
            <div className="cm-modal-header">
              <div>
                <h3>Offer Course in Active Semester</h3>
                <p className="cm-modal-sub">
                  {offerModal.code} — {offerModal.title}
                  {activeSemester && <span className="cm-semester-tag"> {activeSemester.term} {activeSemester.year}</span>}
                </p>
              </div>
              <button className="cm-modal-close" onClick={() => setOfferModal(null)}><FiX /></button>
            </div>
            <div className="cm-modal-body">
              <div className="cm-form-grid">
                <div className="cm-form-group">
                  <label className="cm-label">INSTRUCTOR</label>
                  <select className="cm-input" value={offerForm.instructor_id}
                    onChange={e => setOfferForm(p => ({ ...p, instructor_id: e.target.value }))}>
                    <option value="">Select instructor...</option>
                    {professors.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="cm-form-group">
                  <label className="cm-label">ROOM</label>
                  <select className="cm-input" value={offerForm.room_id}
                    onChange={e => setOfferForm(p => ({ ...p, room_id: e.target.value }))}>
                    <option value="">Select room...</option>
                    {rooms.map(r => <option key={r._id} value={r._id}>{r.room_name} ({r.type})</option>)}
                  </select>
                </div>
                <div className="cm-form-group">
                  <label className="cm-label">DAY</label>
                  <select className="cm-input" value={offerForm.day}
                    onChange={e => setOfferForm(p => ({ ...p, day: e.target.value }))}>
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="cm-form-group">
                  <label className="cm-label">SECTION #</label>
                  <input className="cm-input" type="number" min={1} value={offerForm.sectionNumber}
                    onChange={e => setOfferForm(p => ({ ...p, sectionNumber: Number(e.target.value) }))} />
                </div>
                <div className="cm-form-group">
                  <label className="cm-label">START TIME</label>
                  <input className="cm-input" type="time" value={offerForm.start_time}
                    onChange={e => setOfferForm(p => ({ ...p, start_time: e.target.value }))} />
                </div>
                <div className="cm-form-group">
                  <label className="cm-label">END TIME</label>
                  <input className="cm-input" type="time" value={offerForm.end_time}
                    onChange={e => setOfferForm(p => ({ ...p, end_time: e.target.value }))} />
                </div>
                <div className="cm-form-group">
                  <label className="cm-label">CAPACITY</label>
                  <input className="cm-input" type="number" min={1} value={offerForm.capacity}
                    onChange={e => setOfferForm(p => ({ ...p, capacity: Number(e.target.value) }))} />
                </div>
              </div>
              {offerError && <p className="cm-error">{offerError}</p>}
            </div>
            <div className="cm-modal-footer">
              <button className="cm-btn-primary" onClick={handleOffer} disabled={actionLoading === offerModal._id}>
                {actionLoading === offerModal._id ? "Offering..." : "Confirm Offer"}
              </button>
              <button className="cm-btn-cancel" onClick={() => setOfferModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
