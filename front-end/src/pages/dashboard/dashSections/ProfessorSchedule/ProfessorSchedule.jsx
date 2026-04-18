import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FiCalendar, FiDownload, FiBook, FiUsers } from "react-icons/fi";
import api from "../../../../services/api";
import "./ProfessorSchedule.css";

const DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
const DAYS_AR = { Saturday: "السبت", Sunday: "الأحد", Monday: "الاثنين", Tuesday: "الثلاثاء", Wednesday: "الأربعاء", Thursday: "الخميس" };

const TIME_SLOTS = [];
for (let h = 8; h < 20; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, "0")}:00`);
  TIME_SLOTS.push(`${String(h).padStart(2, "0")}:30`);
}

const toMinutes = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const slotIndex = (time) => Math.floor((toMinutes(time) - 8 * 60) / 30);
const spanCount = (start, end) => Math.max(1, Math.round((toMinutes(end) - toMinutes(start)) / 30));

const COURSE_COLORS = [
  "#4f46e5", "#0891b2", "#059669", "#d97706",
  "#dc2626", "#7c3aed", "#db2777", "#0284c7",
];

function ProfessorSchedule() {
  const { user } = useSelector((s) => s.auth);

  const [semesters, setSemesters]   = useState([]);
  const [semesterId, setSemesterId] = useState("");
  const [sections, setSections]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);

  useEffect(() => {
    api.get("/semesters").then((r) => {
      const list = r.data.semesters || [];
      setSemesters(list);
      const active = list.find((s) => s.is_active);
      if (active) setSemesterId(active._id);
      else if (list.length) setSemesterId(list[0]._id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!semesterId) return;
    setLoading(true);
    setError(null);
    api.get(`/sections/my?semesterId=${semesterId}`)
      .then((r) => setSections(r.data.sections || []))
      .catch(() => setError("Failed to load sections."))
      .finally(() => setLoading(false));
  }, [semesterId]);

  const colorMap = {};
  sections.forEach((sec) => {
    const code = sec.course_id?.code;
    if (code && !colorMap[code])
      colorMap[code] = COURSE_COLORS[Object.keys(colorMap).length % COURSE_COLORS.length];
  });

  const grid = {};
  DAYS.forEach((d) => { grid[d] = []; });
  sections.forEach((sec) => {
    if (!sec.day || !sec.start_time || !sec.end_time) return;
    if (!grid[sec.day]) return;
    grid[sec.day].push({
      sec,
      startSlot: slotIndex(sec.start_time),
      span: spanCount(sec.start_time, sec.end_time),
    });
  });

  const selectedSemester = semesters.find((s) => s._id === semesterId);
  const totalStudents = sections.reduce((sum, s) => sum + (s.enrolled_students?.length || 0), 0);

  return (
    <div className="ps-root">
      {/* Header */}
      <div className="ps-header no-print">
        <div>
          <h2 className="ps-title">My Schedule</h2>
          <p className="ps-sub">Your assigned sections and weekly timetable</p>
        </div>
        <div className="ps-header-actions">
          <select
            className="ps-semester-select"
            value={semesterId}
            onChange={(e) => setSemesterId(e.target.value)}
          >
            {semesters.map((s) => (
              <option key={s._id} value={s._id}>
                {s.term} {s.year} {s.is_active ? "✓" : ""}
              </option>
            ))}
          </select>
          <button className="ps-print-btn" onClick={() => window.print()} disabled={!sections.length}>
            <FiDownload /> Print / Download
          </button>
        </div>
      </div>

      {/* Print header */}
      <div className="ps-print-header print-only">
        <h2>{user?.name} — Teaching Schedule</h2>
        <p>{selectedSemester ? `${selectedSemester.term} ${selectedSemester.year}` : ""}</p>
      </div>

      {loading && <div className="ps-loading">Loading...</div>}
      {error   && <div className="ps-error">{error}</div>}

      {!loading && !error && sections.length === 0 && (
        <div className="ps-empty">
          <FiCalendar size={40} />
          <p>No sections assigned for this semester</p>
        </div>
      )}

      {!loading && sections.length > 0 && (
        <>
          {/* Summary strip */}
          <div className="ps-summary no-print">
            <div className="ps-summary-item"><FiBook /><span>{sections.length} Sections</span></div>
            <div className="ps-summary-item"><FiUsers /><span>{totalStudents} Students</span></div>
          </div>

          {/* Sections table */}
          <div className="ps-table-wrap">
            <table className="ps-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Title</th>
                  <th>Section #</th>
                  <th>Day</th>
                  <th>Time</th>
                  <th>Room</th>
                  <th>Enrolled / Cap</th>
                </tr>
              </thead>
              <tbody>
                {sections.map((sec) => {
                  const course = sec.course_id || {};
                  const color  = colorMap[course.code] || "#4f46e5";
                  return (
                    <tr key={sec._id}>
                      <td>
                        <span className="ps-course-dot" style={{ background: color }} />
                        {course.code || "—"}
                      </td>
                      <td>{course.title || "—"}</td>
                      <td className="ps-center">{sec.sectionNumber ?? "—"}</td>
                      <td>{DAYS_AR[sec.day] || sec.day || "—"}</td>
                      <td className="ps-nowrap">
                        {sec.start_time && sec.end_time ? `${sec.start_time} – ${sec.end_time}` : "—"}
                      </td>
                      <td>{sec.room_id?.room_name || "—"}</td>
                      <td className="ps-center">
                        {(sec.enrolled_students?.length ?? "—")} / {sec.capacity ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Weekly grid */}
          <div className="ps-schedule-section">
            <h3 className="ps-schedule-title"><FiCalendar /> Weekly Schedule</h3>
            <div className="ps-grid-wrap">
              <div className="ps-grid">
                {/* Time column */}
                <div className="ps-col ps-time-col">
                  <div className="ps-col-header">Time</div>
                  {TIME_SLOTS.map((t) => (
                    <div key={t} className="ps-time-cell">{t}</div>
                  ))}
                </div>

                {/* Day columns */}
                {DAYS.map((day) => (
                  <div key={day} className="ps-col ps-day-col">
                    <div className="ps-col-header">{DAYS_AR[day]}</div>
                    <div className="ps-day-body" style={{ position: "relative", height: `${TIME_SLOTS.length * 32}px` }}>
                      {TIME_SLOTS.map((_, i) => (
                        <div key={i} className={`ps-slot-line${i % 2 === 0 ? " ps-slot-hour" : ""}`} style={{ top: `${i * 32}px` }} />
                      ))}
                      {grid[day].map(({ sec, startSlot, span }) => {
                        const course = sec.course_id || {};
                        const color  = colorMap[course.code] || "#4f46e5";
                        return (
                          <div
                            key={sec._id}
                            className="ps-course-block"
                            style={{ top: `${startSlot * 32}px`, height: `${span * 32 - 4}px`, background: color }}
                          >
                            <div className="ps-block-code">{course.code}</div>
                            <div className="ps-block-room">{sec.room_id?.room_name}</div>
                            <div className="ps-block-time">{sec.start_time}–{sec.end_time}</div>
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

export default ProfessorSchedule;
