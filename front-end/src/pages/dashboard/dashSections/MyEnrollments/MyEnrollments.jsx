import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { FiCalendar, FiDownload, FiBook, FiClock, FiUser, FiMapPin } from "react-icons/fi";
import api from "../../../../services/api";
import "./MyEnrollments.css";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
const DAYS_AR = { Sunday: "الأحد", Monday: "الاثنين", Tuesday: "الثلاثاء", Wednesday: "الأربعاء", Thursday: "الخميس" };

// Build 30-min slots from 08:00 to 20:00
const TIME_SLOTS = [];
for (let h = 8; h < 20; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, "0")}:00`);
  TIME_SLOTS.push(`${String(h).padStart(2, "0")}:30`);
}

const toMinutes = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const slotIndex = (time) => {
  const mins = toMinutes(time);
  return Math.floor((mins - 8 * 60) / 30);
};

const spanCount = (start, end) => {
  return Math.max(1, Math.round((toMinutes(end) - toMinutes(start)) / 30));
};

const STATUS_COLORS = {
  Enrolled: "me-badge-enrolled",
  Approved: "me-badge-approved",
  Pending:  "me-badge-pending",
  Waitlist: "me-badge-waitlist",
  Rejected: "me-badge-rejected",
};

const COURSE_COLORS = [
  "#4f46e5", "#0891b2", "#059669", "#d97706",
  "#dc2626", "#7c3aed", "#db2777", "#0284c7",
];

function MyEnrollments() {
  const { user } = useSelector((s) => s.auth);
  const printRef = useRef(null);

  const [semesters, setSemesters]     = useState([]);
  const [semesterId, setSemesterId]   = useState("");
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);

  // Load semesters
  useEffect(() => {
    api.get("/semesters").then((r) => {
      const list = r.data.semesters || [];
      setSemesters(list);
      const active = list.find((s) => s.is_active);
      if (active) setSemesterId(active._id);
      else if (list.length) setSemesterId(list[0]._id);
    }).catch(() => {});
  }, []);

  // Load enrollments when semester changes
  useEffect(() => {
    if (!semesterId) return;
    setLoading(true);
    setError(null);
    api.get(`/enrollment/my?semesterId=${semesterId}`)
      .then((r) => setEnrollments(r.data.enrollments || []))
      .catch(() => setError("Failed to load enrollments."))
      .finally(() => setLoading(false));
  }, [semesterId]);

  const handlePrint = () => window.print();

  // Assign a color per course
  const colorMap = {};
  enrollments.forEach((e, i) => {
    const code = e.section?.course_id?.code || i;
    if (!colorMap[code]) colorMap[code] = COURSE_COLORS[Object.keys(colorMap).length % COURSE_COLORS.length];
  });

  // Build schedule grid: day -> list of {enrollment, startSlot, span}
  const grid = {};
  DAYS.forEach((d) => { grid[d] = []; });
  enrollments.forEach((e) => {
    const sec = e.section;
    if (!sec?.day || !sec?.start_time || !sec?.end_time) return;
    const day = sec.day;
    if (!grid[day]) return;
    grid[day].push({
      enrollment: e,
      startSlot: slotIndex(sec.start_time),
      span: spanCount(sec.start_time, sec.end_time),
    });
  });

  const selectedSemester = semesters.find((s) => s._id === semesterId);
  const totalCredits = enrollments.reduce((sum, e) => sum + (e.section?.course_id?.credits || 0), 0);

  return (
    <div className="me-root" ref={printRef}>
      {/* ── Header ── */}
      <div className="me-header no-print">
        <div>
          <h2 className="me-title">My Enrollments</h2>
          <p className="me-sub">View your registered courses and weekly schedule</p>
        </div>
        <div className="me-header-actions">
          <select
            className="me-semester-select"
            value={semesterId}
            onChange={(e) => setSemesterId(e.target.value)}
          >
            {semesters.map((s) => (
              <option key={s._id} value={s._id}>
                {s.term} {s.year} {s.is_active ? "✓" : ""}
              </option>
            ))}
          </select>
          <button className="me-print-btn" onClick={handlePrint} disabled={!enrollments.length}>
            <FiDownload /> تحميل / طباعة الجدول
          </button>
        </div>
      </div>

      {/* ── Print header (only visible when printing) ── */}
      <div className="print-only me-print-header">
        <h2>{user?.name} — جدول المواعيد الدراسية</h2>
        <p>{selectedSemester ? `${selectedSemester.term} ${selectedSemester.year}` : ""} &nbsp;|&nbsp; إجمالي الساعات: {totalCredits}</p>
      </div>

      {loading && <div className="me-loading">جاري التحميل...</div>}
      {error   && <div className="me-error">{error}</div>}

      {!loading && !error && enrollments.length === 0 && (
        <div className="me-empty">
          <FiBook size={40} />
          <p>لا توجد تسجيلات لهذا الترم</p>
        </div>
      )}

      {!loading && enrollments.length > 0 && (
        <>
          {/* ── Summary strip ── */}
          <div className="me-summary no-print">
            <div className="me-summary-item"><FiBook /><span>{enrollments.length} مادة</span></div>
            <div className="me-summary-item"><FiClock /><span>{totalCredits} ساعة معتمدة</span></div>
          </div>

          {/* ── Enrollment table ── */}
          <div className="me-table-wrap">
            <table className="me-table">
              <thead>
                <tr>
                  <th>الكود</th>
                  <th>اسم المادة</th>
                  <th>الساعات</th>
                  <th>السكشن</th>
                  <th>الأستاذ</th>
                  <th>القاعة</th>
                  <th>اليوم</th>
                  <th>الوقت</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e) => {
                  const sec    = e.section || {};
                  const course = sec.course_id || {};
                  const color  = colorMap[course.code] || "#4f46e5";
                  return (
                    <tr key={e._id}>
                      <td>
                        <span className="me-course-dot" style={{ background: color }} />
                        {course.code || "—"}
                      </td>
                      <td>{course.title || "—"}</td>
                      <td className="me-center">{course.credits ?? "—"}</td>
                      <td className="me-center">{sec.sectionNumber ?? "—"}</td>
                      <td>{sec.instructor_id?.name || "—"}</td>
                      <td>{sec.room_id?.room_name || "—"}</td>
                      <td>{DAYS_AR[sec.day] || sec.day || "—"}</td>
                      <td className="me-nowrap">{sec.start_time && sec.end_time ? `${sec.start_time} – ${sec.end_time}` : "—"}</td>
                      <td><span className={`me-badge ${STATUS_COLORS[e.status] || ""}`}>{e.status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Weekly schedule grid ── */}
          <div className="me-schedule-section">
            <h3 className="me-schedule-title"><FiCalendar /> الجدول الأسبوعي</h3>
            <div className="me-grid-wrap">
              <div className="me-grid">
                {/* Time column */}
                <div className="me-col me-time-col">
                  <div className="me-col-header">الوقت</div>
                  {TIME_SLOTS.map((t) => (
                    <div key={t} className="me-time-cell">{t}</div>
                  ))}
                </div>

                {/* Day columns */}
                {DAYS.map((day) => (
                  <div key={day} className="me-col me-day-col">
                    <div className="me-col-header">{DAYS_AR[day]}</div>
                    <div className="me-day-body" style={{ position: "relative", height: `${TIME_SLOTS.length * 32}px` }}>
                      {/* slot lines */}
                      {TIME_SLOTS.map((_, i) => (
                        <div key={i} className={`me-slot-line${i % 2 === 0 ? " me-slot-hour" : ""}`} style={{ top: `${i * 32}px` }} />
                      ))}
                      {/* course blocks */}
                      {grid[day].map(({ enrollment: e, startSlot, span }) => {
                        const sec    = e.section || {};
                        const course = sec.course_id || {};
                        const color  = colorMap[course.code] || "#4f46e5";
                        return (
                          <div
                            key={e._id}
                            className="me-course-block"
                            style={{
                              top: `${startSlot * 32}px`,
                              height: `${span * 32 - 4}px`,
                              background: color,
                            }}
                          >
                            <div className="me-block-code">{course.code}</div>
                            <div className="me-block-room">{sec.room_id?.room_name}</div>
                            <div className="me-block-time">{sec.start_time}–{sec.end_time}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default MyEnrollments;
