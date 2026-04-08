import { useEffect, useState } from "react";
import { FiSearch, FiUserPlus } from "react-icons/fi";
import { getUsers } from "../../../../services/AdminServices";
import { adminEnrollStudent } from "../../../../services/CourseServices";
import api from "../../../../services/api";
import "./AdminEnrollment.css";

function AdminEnrollment() {
  const [students, setStudents]   = useState([]);
  const [sections, setSections]   = useState([]);
  const [studentQ, setStudentQ]   = useState("");
  const [sectionQ, setSectionQ]   = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [msg, setMsg]             = useState(null);

  useEffect(() => { loadStudents(); loadSections(); }, []);

  const loadStudents = async () => {
    try {
      const data = await getUsers("student");
      setStudents(Array.isArray(data) ? data : (data.users || []));
    } catch {}
  };

  const loadSections = async () => {
    try {
      // Get active semester first, then load its sections
      const semRes = await api.get("/semesters");
      const semesters = semRes.data?.semesters || [];
      const active = semesters.find(s => s.is_active) || semesters[0];
      if (!active) return;
      const res = await api.get(`/sections?semesterId=${active._id}`);
      const list = Array.isArray(res.data) ? res.data : (res.data.sections || []);
      setSections(list);
    } catch {}
  };

  const filteredStudents = students.filter((s) => {
    const q = studentQ.toLowerCase();
    return s.name?.toLowerCase().includes(q) || s.studentId?.toLowerCase().includes(q);
  });

  const filteredSections = sections.filter((s) => {
    const q = sectionQ.toLowerCase();
    const code  = s.course_id?.code?.toLowerCase() || "";
    const title = s.course_id?.title?.toLowerCase() || "";
    return code.includes(q) || title.includes(q);
  });

  const handleEnroll = async () => {
    if (!selectedStudent || !selectedSection) return;
    setLoading(true);
    setMsg(null);
    try {
      await adminEnrollStudent(selectedStudent._id, selectedSection._id);
      setMsg({ type: "success", text: `${selectedStudent.name} enrolled in ${selectedSection.course_id?.code} Sec ${selectedSection.sectionNumber}` });
      setSelectedStudent(null);
      setSelectedSection(null);
      setStudentQ("");
      setSectionQ("");
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Enrollment failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ae-root">
      <div className="ae-header">
        <h2 className="ae-title">Admin Enrollment</h2>
        <p className="ae-sub">Directly enroll a student in any section — bypasses capacity, slice, and fee checks.</p>
      </div>

      <div className="ae-grid">
        {/* Student picker */}
        <div className="ae-card">
          <h3 className="ae-card-title">1. Select Student</h3>
          <div className="ae-search-wrap">
            <FiSearch className="ae-search-icon" />
            <input className="ae-search" placeholder="Search by name or ID..." value={studentQ} onChange={(e) => setStudentQ(e.target.value)} />
          </div>
          <div className="ae-list">
            {filteredStudents.map((s) => (
              <button
                key={s._id}
                className={`ae-item ${selectedStudent?._id === s._id ? "ae-item-selected" : ""}`}
                onClick={() => setSelectedStudent(s)}
              >
                <div className="ae-item-avatar">{s.name?.split(" ").slice(0,2).map(n=>n[0]).join("").toUpperCase()}</div>
                <div>
                  <div className="ae-item-name">{s.name}</div>
                  <div className="ae-item-sub">ID: {s.studentId || "—"} · {s.department?.name || "—"} · Level {s.level}</div>
                </div>
              </button>
            ))}
            {filteredStudents.length === 0 && <p className="ae-empty">No students found</p>}
          </div>
        </div>

        {/* Section picker */}
        <div className="ae-card">
          <h3 className="ae-card-title">2. Select Section</h3>
          <div className="ae-search-wrap">
            <FiSearch className="ae-search-icon" />
            <input className="ae-search" placeholder="Search by course code or title..." value={sectionQ} onChange={(e) => setSectionQ(e.target.value)} />
          </div>
          <div className="ae-list">
            {filteredSections.map((s) => (
              <button
                key={s._id}
                className={`ae-item ${selectedSection?._id === s._id ? "ae-item-selected" : ""}`}
                onClick={() => setSelectedSection(s)}
              >
                <div className="ae-item-avatar" style={{ background: "rgba(59,130,246,0.15)", color: "#3b82f6" }}>
                  {s.sectionNumber}
                </div>
                <div>
                  <div className="ae-item-name">{s.course_id?.code} — {s.course_id?.title}</div>
                  <div className="ae-item-sub">{s.day} {s.start_time}–{s.end_time} · {s.instructor_id?.name || "—"} · Cap {s.capacity}</div>
                </div>
              </button>
            ))}
            {filteredSections.length === 0 && <p className="ae-empty">No sections found</p>}
          </div>
        </div>
      </div>

      {/* Summary + enroll button */}
      <div className="ae-action-bar">
        <div className="ae-summary">
          {selectedStudent
            ? <span className="ae-chip ae-chip-student">Student: {selectedStudent.name}</span>
            : <span className="ae-chip ae-chip-empty">No student selected</span>}
          {selectedSection
            ? <span className="ae-chip ae-chip-section">Section: {selectedSection.course_id?.code} Sec {selectedSection.sectionNumber}</span>
            : <span className="ae-chip ae-chip-empty">No section selected</span>}
        </div>
        <button
          className="ae-enroll-btn"
          onClick={handleEnroll}
          disabled={!selectedStudent || !selectedSection || loading}
        >
          <FiUserPlus /> {loading ? "Enrolling…" : "Enroll Student"}
        </button>
      </div>

      {msg && <p className={msg.type === "success" ? "ae-msg-ok" : "ae-msg-err"}>{msg.text}</p>}
    </div>
  );
}

export default AdminEnrollment;
