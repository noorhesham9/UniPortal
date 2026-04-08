import { useEffect, useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getDepartments } from "../../../../services/AdminServices";
import { getAllCourses, getCourseById, updateCourse } from "../../../../services/CourseServices";
import "./EditCourse.css";

const ROOM_TYPES = ["Lab", "Lecture Hall", "Tutorial"];
const COURSE_TYPES = ["إجباري", "اختياري"];

const EditCourse = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState(null);
  const [saveMsg, setSaveMsg] = useState(null);

  const [form, setForm] = useState({
    title: "",
    code: "",
    credits: 1,
    required_room_type: "Lecture Hall",
    is_activated: true,
    prerequisites_array: [],
  });

  // Department assignments: [{ department_id, name, academic_year, semester_num, course_type }]
  const [deptAssignments, setDeptAssignments] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);

  // Prerequisites search
  const [allCourses, setAllCourses] = useState([]);
  const [prereqSearch, setPrereqSearch] = useState("");

  useEffect(() => {
    if (!courseId) { setPageError("No course ID provided."); setLoading(false); return; }
    Promise.all([loadCourse(), loadDepartments(), loadAllCourses()]).finally(() => setLoading(false));
  }, [courseId]);

  const loadCourse = async () => {
    const res = await getCourseById(courseId);
    const c = res.course;
    setForm({
      title: c.title,
      code: c.code,
      credits: c.credits,
      required_room_type: c.required_room_type,
      is_activated: c.is_activated,
      prerequisites_array: c.prerequisites_array || [],
    });
    // Map existing plan entries to assignment rows
    setDeptAssignments((res.departments || []).map(d => ({
      department_id: d._id.toString(),
      name: d.name,
      academic_year: d.academic_year,
      semester_num: d.semester_num,
      course_type: d.course_type,
    })));
  };

  const loadDepartments = async () => {
    try {
      const res = await getDepartments();
      setAllDepartments(Array.isArray(res) ? res : res.departments || []);
    } catch {}
  };

  const loadAllCourses = async () => {
    try {
      const res = await getAllCourses(1, 200);
      setAllCourses(res.courses || []);
    } catch {}
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  // ── Prerequisites ──────────────────────────────────────────────────────────
  const addPrereq = (course) => {
    if (form.prerequisites_array.find(p => p._id === course._id)) return;
    setForm(p => ({ ...p, prerequisites_array: [...p.prerequisites_array, course] }));
    setPrereqSearch("");
  };
  const removePrereq = (id) => setForm(p => ({ ...p, prerequisites_array: p.prerequisites_array.filter(c => c._id !== id) }));

  const filteredCourses = allCourses.filter(c =>
    c._id !== courseId &&
    !form.prerequisites_array.find(p => p._id === c._id) &&
    (c.code.toLowerCase().includes(prereqSearch.toLowerCase()) ||
     c.title.toLowerCase().includes(prereqSearch.toLowerCase()))
  );

  // ── Department assignments ─────────────────────────────────────────────────
  const addDeptRow = () => {
    const unused = allDepartments.find(d => !deptAssignments.find(a => a.department_id === d._id.toString()));
    if (!unused) return;
    setDeptAssignments(p => [...p, {
      department_id: unused._id.toString(),
      name: unused.name,
      academic_year: 1,
      semester_num: 1,
      course_type: "إجباري",
    }]);
  };

  const updateDeptRow = (idx, field, value) => {
    setDeptAssignments(p => p.map((row, i) => {
      if (i !== idx) return row;
      if (field === "department_id") {
        const dept = allDepartments.find(d => d._id.toString() === value);
        return { ...row, department_id: value, name: dept?.name || "" };
      }
      return { ...row, [field]: field === "academic_year" || field === "semester_num" ? Number(value) : value };
    }));
  };

  const removeDeptRow = (idx) => setDeptAssignments(p => p.filter((_, i) => i !== idx));

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      await updateCourse(courseId, {
        title: form.title,
        credits: Number(form.credits),
        required_room_type: form.required_room_type,
        is_activated: form.is_activated,
        prerequisites_array: form.prerequisites_array.map(p => p._id),
        departments: deptAssignments.map(d => ({
          department_id: d.department_id,
          academic_year: d.academic_year,
          semester_num: d.semester_num,
          course_type: d.course_type,
        })),
      });
      setSaveMsg({ type: "success", text: "Course updated successfully" });
      setTimeout(() => navigate("/dashboard?section=course_management"), 800);
    } catch (e) {
      setSaveMsg({ type: "error", text: e.response?.data?.message || "Failed to save" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="ec-loading">Loading course...</div>;
  if (pageError) return <div className="ec-error">{pageError}</div>;

  // Departments not yet assigned
  const availableDepts = allDepartments.filter(d => !deptAssignments.find(a => a.department_id === d._id.toString()));

  return (
    <div className="edit-course-wrapper">
      <div className="breadcrumb">
        Courses &gt; <span style={{ color: "#facc15" }}>{form.code}</span>
      </div>

      <header className="page-header">
        <div>
          <h1>Edit Course</h1>
          <p>Update course details, department assignments, and prerequisites.</p>
        </div>
        <div className="action-buttons">
          <button className="btn-cancel" onClick={() => navigate("/dashboard?section=course_management")}>
            Cancel
          </button>
          <button className="btn-save" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </header>

      {saveMsg && (
        <div className={`ec-save-msg ${saveMsg.type === "success" ? "ec-success" : "ec-err"}`}>
          {saveMsg.text}
        </div>
      )}

      <div className="main-layout">
        {/* ── Left column ── */}
        <div className="left-section">

          {/* Identification */}
          <div className="content-card">
            <div className="card-header"><span className="icon-yellow">ⓘ</span> Course Identification</div>
            <div className="form-grid">
              <div className="form-group">
                <label>Course Title</label>
                <input name="title" value={form.title} onChange={handleChange} placeholder="Course title" />
              </div>
              <div className="form-group">
                <label>Course Code</label>
                <input value={form.code} readOnly style={{ opacity: 0.5, cursor: "not-allowed" }} />
              </div>
              <div className="form-group">
                <label>Credits</label>
                <input name="credits" type="number" min={1} max={6} value={form.credits} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Required Room Type</label>
                <select name="required_room_type" value={form.required_room_type} onChange={handleChange}>
                  {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Department assignments */}
          <div className="content-card">
            <div className="card-header" style={{ justifyContent: "space-between" }}>
              <span><span className="icon-yellow">🏛</span> Department Assignments</span>
              <button
                className="ec-add-dept-btn"
                onClick={addDeptRow}
                disabled={availableDepts.length === 0}
                title={availableDepts.length === 0 ? "All departments already assigned" : "Add department"}
              >
                <FiPlus /> Add Department
              </button>
            </div>

            {deptAssignments.length === 0 ? (
              <p className="ec-no-dept">
                No department assigned — this course is a general/shared course visible to all.
              </p>
            ) : (
              <div className="ec-dept-list">
                {deptAssignments.map((row, idx) => (
                  <div key={idx} className="ec-dept-row">
                    <div className="ec-dept-row-fields">
                      <div className="form-group">
                        <label>Department</label>
                        <select
                          value={row.department_id}
                          onChange={e => updateDeptRow(idx, "department_id", e.target.value)}
                        >
                          <option value={row.department_id}>{row.name}</option>
                          {availableDepts.map(d => (
                            <option key={d._id} value={d._id.toString()}>{d.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Year</label>
                        <select value={row.academic_year} onChange={e => updateDeptRow(idx, "academic_year", e.target.value)}>
                          {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Semester</label>
                        <select value={row.semester_num} onChange={e => updateDeptRow(idx, "semester_num", e.target.value)}>
                          <option value={1}>Semester 1</option>
                          <option value={2}>Semester 2</option>
                          <option value={3}>Summer</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Type</label>
                        <select value={row.course_type} onChange={e => updateDeptRow(idx, "course_type", e.target.value)}>
                          {COURSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                    <button className="ec-remove-dept-btn" onClick={() => removeDeptRow(idx)} title="Remove">
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Prerequisites */}
          <div className="content-card">
            <div className="card-header"><span className="icon-yellow">📄</span> Prerequisites</div>
            <div className="prerequisites-list">
              {form.prerequisites_array.map(p => (
                <div key={p._id} className="chip">
                  {p.code} — {p.title}
                  <button className="chip-remove" onClick={() => removePrereq(p._id)}>✕</button>
                </div>
              ))}
            </div>
            <div className="ec-prereq-search">
              <input
                className="ec-prereq-input"
                placeholder="Search course to add as prerequisite..."
                value={prereqSearch}
                onChange={e => setPrereqSearch(e.target.value)}
              />
              {prereqSearch && filteredCourses.length > 0 && (
                <div className="ec-prereq-dropdown">
                  {filteredCourses.slice(0, 8).map(c => (
                    <button key={c._id} className="ec-prereq-option" onClick={() => addPrereq(c)}>
                      <span className="ec-prereq-code">{c.code}</span> {c.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="right-section">
          <div className="content-card">
            <div className="card-header">Settings</div>
            <div className="setting-item">
              <div className="setting-info">
                <h4>Active Status</h4>
                <p>Visible to students for enrollment</p>
              </div>
              <label className="ec-toggle">
                <input type="checkbox" name="is_activated" checked={form.is_activated} onChange={handleChange} />
                <span className="ec-toggle-slider" />
              </label>
            </div>
          </div>

          <div className="content-card">
            <div className="card-header">Course Info</div>
            <div className="ec-info-row"><span>Code</span><strong>{form.code}</strong></div>
            <div className="ec-info-row"><span>Credits</span><strong>{form.credits} CR</strong></div>
            <div className="ec-info-row"><span>Room Type</span><strong>{form.required_room_type}</strong></div>
            <div className="ec-info-row">
              <span>Status</span>
              <strong style={{ color: form.is_activated ? "#10b981" : "#ef4444" }}>
                {form.is_activated ? "Active" : "Inactive"}
              </strong>
            </div>
            <div className="ec-info-row"><span>Prerequisites</span><strong>{form.prerequisites_array.length}</strong></div>
            <div className="ec-info-row">
              <span>Departments</span>
              <strong>{deptAssignments.length === 0 ? "General" : deptAssignments.length}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCourse;
