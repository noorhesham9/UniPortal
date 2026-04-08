import { useEffect, useState } from "react";
import { FiBook, FiCalendar, FiMapPin, FiUsers, FiClock, FiFilter } from "react-icons/fi";
import { getMySections } from "../../../../services/SectionServices";
import api from "../../../../services/api";
import "./CourseManage.css";

const DAYS_ORDER = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAYS_AR = { Sunday: "الأحد", Monday: "الاثنين", Tuesday: "الثلاثاء", Wednesday: "الأربعاء", Thursday: "الخميس", Friday: "الجمعة", Saturday: "السبت" };

const STATUS_COLORS = {
  Open:      "cm-badge-open",
  Full:      "cm-badge-full",
  Cancelled: "cm-badge-cancelled",
  Tentative: "cm-badge-tentative",
};

function CourseManage() {
  const [sections, setSections]     = useState([]);
  const [semesters, setSemesters]   = useState([]);
  const [semesterId, setSemesterId] = useState("");
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  // load semesters for filter
  useEffect(() => {
    api.get("/semesters").then((r) => {
      const list = r.data.semesters || [];
      setSemesters(list);
    }).catch(() => {});
  }, []);

  // load sections
  useEffect(() => {
    setLoading(true);
    setError(null);
    getMySections(semesterId || null)
      .then((d) => setSections(d.sections || []))
      .catch(() => setError("Failed to load sections."))
      .finally(() => setLoading(false));
  }, [semesterId]);

  // group by semester then by course
  const grouped = {};
  sections.forEach((sec) => {
    const sem = sec.semester_id;
    const semKey = sem?._id || "unknown";
    const semLabel = sem ? `${sem.term} ${sem.year}${sem.is_active ? " ✓" : ""}` : "Unknown Semester";
    if (!grouped[semKey]) grouped[semKey] = { label: semLabel, isActive: sem?.is_active, courses: {} };

    const courseKey = sec.course_id?._id || "unknown";
    const courseLabel = sec.course_id ? `${sec.course_id.code} — ${sec.course_id.title}` : "Unknown Course";
    if (!grouped[semKey].courses[courseKey]) {
      grouped[semKey].courses[courseKey] = { label: courseLabel, course: sec.course_id, sections: [] };
    }
    grouped[semKey].courses[courseKey].sections.push(sec);
  });

  // sort sections within each course by day then time
  Object.values(grouped).forEach((g) =>
    Object.values(g.courses).forEach((c) =>
      c.sections.sort((a, b) => DAYS_ORDER.indexOf(a.day) - DAYS_ORDER.indexOf(b.day) || a.start_time.localeCompare(b.start_time))
    )
  );

  const totalSections = sections.length;
  const totalStudents = sections.reduce((s, sec) => s + (sec.enrolled_students?.length || 0), 0);
  const uniqueCourses = new Set(sections.map((s) => s.course_id?._id)).size;

  return (
    <div className="cm-root">
      {/* Header */}
      <div className="cm-header">
        <div>
          <h2 className="cm-title">My Courses</h2>
          <p className="cm-sub">All sections and lectures assigned to you</p>
        </div>
        <div className="cm-header-actions">
          <FiFilter className="cm-filter-icon" />
          <select
            className="cm-select"
            value={semesterId}
            onChange={(e) => setSemesterId(e.target.value)}
          >
            <option value="">All Semesters</option>
            {semesters.map((s) => (
              <option key={s._id} value={s._id}>
                {s.term} {s.year} {s.is_active ? "✓" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary */}
      {!loading && sections.length > 0 && (
        <div className="cm-summary">
          <div className="cm-stat"><FiBook /><span>{uniqueCourses} Course{uniqueCourses !== 1 ? "s" : ""}</span></div>
          <div className="cm-stat"><FiCalendar /><span>{totalSections} Section{totalSections !== 1 ? "s" : ""}</span></div>
          <div className="cm-stat"><FiUsers /><span>{totalStudents} Student{totalStudents !== 1 ? "s" : ""}</span></div>
        </div>
      )}

      {loading && <div className="cm-state">Loading...</div>}
      {error   && <div className="cm-state cm-error">{error}</div>}
      {!loading && !error && sections.length === 0 && (
        <div className="cm-state cm-empty">
          <FiBook size={40} />
          <p>No sections assigned to you{semesterId ? " for this semester" : ""}.</p>
        </div>
      )}

      {/* Grouped content */}
      {!loading && !error && Object.entries(grouped).map(([semKey, semGroup]) => (
        <div key={semKey} className="cm-semester-block">
          <div className={`cm-semester-label${semGroup.isActive ? " cm-semester-active" : ""}`}>
            <FiCalendar /> {semGroup.label}
            {semGroup.isActive && <span className="cm-active-pill">Active</span>}
          </div>

          {Object.entries(semGroup.courses).map(([courseKey, courseGroup]) => (
            <div key={courseKey} className="cm-course-block">
              {/* Course header */}
              <div className="cm-course-header">
                <div className="cm-course-info">
                  <span className="cm-course-code">{courseGroup.course?.code}</span>
                  <span className="cm-course-title">{courseGroup.course?.title}</span>
                  <span className="cm-course-credits">{courseGroup.course?.credits} cr</span>
                </div>
                <span className="cm-course-count">{courseGroup.sections.length} section{courseGroup.sections.length !== 1 ? "s" : ""}</span>
              </div>

              {/* Sections table */}
              <div className="cm-table-wrap">
                <table className="cm-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Day</th>
                      <th>Time</th>
                      <th>Room</th>
                      <th>Location</th>
                      <th>Type</th>
                      <th>Enrolled</th>
                      <th>Capacity</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseGroup.sections.map((sec) => {
                      const enrolled = sec.enrolled_students?.length || 0;
                      const pct = sec.capacity ? Math.round((enrolled / sec.capacity) * 100) : 0;
                      return (
                        <tr key={sec._id}>
                          <td className="cm-sec-num">Sec {sec.sectionNumber}</td>
                          <td>{DAYS_AR[sec.day] || sec.day}</td>
                          <td className="cm-nowrap">
                            <FiClock className="cm-row-icon" />
                            {sec.start_time} – {sec.end_time}
                          </td>
                          <td className="cm-nowrap">
                            <FiMapPin className="cm-row-icon" />
                            {sec.room_id?.room_name || "—"}
                          </td>
                          <td>{sec.room_id?.building_section || "—"}</td>
                          <td>{sec.room_id?.type || "—"}</td>
                          <td>
                            <div className="cm-enroll-wrap">
                              <span>{enrolled}</span>
                              <div className="cm-enroll-bar">
                                <div
                                  className="cm-enroll-fill"
                                  style={{
                                    width: `${pct}%`,
                                    background: pct >= 100 ? "#ef4444" : pct >= 75 ? "#facc15" : "#10b981",
                                  }}
                                />
                              </div>
                            </div>
                          </td>
                          <td>{sec.capacity}</td>
                          <td>
                            <span className={`cm-badge ${STATUS_COLORS[sec.status] || ""}`}>
                              {sec.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default CourseManage;
