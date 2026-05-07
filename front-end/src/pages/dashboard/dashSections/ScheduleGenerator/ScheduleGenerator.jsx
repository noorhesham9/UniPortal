import { useEffect, useState } from "react";
import {
  FiAlertTriangle, FiBook, FiCalendar, FiCheck,
  FiChevronRight, FiClock, FiCpu, FiEdit2, FiLayers,
  FiLink, FiSave, FiSearch, FiSettings, FiUsers, FiX, FiZap,
} from "react-icons/fi";
import {
  generateSchedules, getAvailableResources,
  saveSchedule, validateSchedule,
} from "../../../../services/ScheduleGeneratorServices";
import "./ScheduleGenerator.css";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
const TIME_SLOTS = [
  { start: "08:00", end: "09:00" },
  { start: "09:00", end: "10:00" },
  { start: "10:00", end: "11:00" },
  { start: "11:00", end: "12:00" },
  { start: "12:00", end: "13:00" },
  { start: "13:00", end: "14:00" },
  { start: "14:00", end: "15:00" },
  { start: "15:00", end: "16:00" },
  { start: "16:00", end: "17:00" },
  { start: "17:00", end: "18:00" },
  { start: "18:00", end: "19:00" },
  { start: "19:00", end: "20:00" },
];
const DEFAULT_OPEN = "08:00";
const DEFAULT_CLOSE = "20:00";

// ─── Step bar ─────────────────────────────────────────────────────────────────
function StepBar({ step }) {
  const steps = ["Select", "Configure", "Generate", "Review & Edit", "Save"];
  return (
    <div className="sg-steps">
      {steps.map((label, i) => (
        <div key={i} className={`sg-step ${step === i ? "active" : step > i ? "done" : ""}`}>
          <div className="sg-step-circle">{step > i ? <FiCheck /> : i + 1}</div>
          <span className="sg-step-label">{label}</span>
          {i < steps.length - 1 && <div className="sg-step-line" />}
        </div>
      ))}
    </div>
  );
}

// ─── Multi-select list ────────────────────────────────────────────────────────
function SelectList({ items, selected, onToggle, renderItem, searchPlaceholder }) {
  const [q, setQ] = useState("");
  const filtered = items.filter(item => renderItem(item, true).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="sg-select-list">
      <div className="sg-search-wrap">
        <FiSearch className="sg-search-icon" />
        <input className="sg-search" placeholder={searchPlaceholder} value={q} onChange={e => setQ(e.target.value)} />
      </div>
      <div className="sg-list-scroll">
        {filtered.length === 0 && <p className="sg-empty">No results</p>}
        {filtered.map(item => {
          const isSel = selected.includes(item._id);
          return (
            <button key={item._id} className={`sg-list-item ${isSel ? "selected" : ""}`} onClick={() => onToggle(item._id)}>
              <div className={`sg-checkbox ${isSel ? "checked" : ""}`}>{isSel && <FiCheck size={11} />}</div>
              {renderItem(item)}
            </button>
          );
        })}
      </div>
      <div className="sg-list-footer">{selected.length} selected</div>
    </div>
  );
}

// ─── Schedule grid ────────────────────────────────────────────────────────────
function ScheduleGrid({ sections, onEdit }) {
  const grid = {};
  DAYS.forEach(d => { grid[d] = {}; TIME_SLOTS.forEach(t => { grid[d][t.start] = null; }); });
  sections.forEach(s => { if (grid[s.day]) grid[s.day][s.timeSlot.start] = s; });
  return (
    <div className="sg-grid-wrap">
      <div className="sg-grid">
        <div className="sg-grid-cell sg-grid-corner" />
        {DAYS.map(d => <div key={d} className="sg-grid-cell sg-grid-day">{d}</div>)}
        {TIME_SLOTS.map(slot => (
          <>
            <div key={slot.start} className="sg-grid-cell sg-grid-time">{slot.start}<br /><span>{slot.end}</span></div>
            {DAYS.map(day => {
              const sec = grid[day]?.[slot.start];
              return (
                <div key={day} className="sg-grid-cell sg-grid-slot">
                  {sec ? (
                    <div className="sg-section-card">
                      <div className="sg-section-code">{sec.courseCode}</div>
                      <div className="sg-section-info">{sec.instructorName}</div>
                      <div className="sg-section-room">{sec.roomName}</div>
                      {onEdit && <button className="sg-section-edit" onClick={() => onEdit(sec)}><FiEdit2 size={11} /></button>}
                    </div>
                  ) : <div className="sg-slot-empty" />}
                </div>
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
}

// ─── Edit section modal ───────────────────────────────────────────────────────
function EditModal({ section, resources, onSave, onClose }) {
  const [day, setDay] = useState(section.day);
  const [slot, setSlot] = useState(section.timeSlot.start);
  const [instructor, setInstructor] = useState(section.instructor?.toString());
  const [room, setRoom] = useState(section.room?.toString());

  const handleSave = () => {
    const timeSlot = TIME_SLOTS.find(t => t.start === slot);
    onSave({
      ...section, day, timeSlot, instructor, room,
      instructorName: resources.instructors.find(i => i._id === instructor)?.name || section.instructorName,
      roomName: resources.rooms.find(r => r._id === room)?.room_name || section.roomName,
    });
  };

  return (
    <div className="sg-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sg-modal">
        <div className="sg-modal-header">
          <h3>Edit — {section.courseCode}</h3>
          <button className="sg-modal-close" onClick={onClose}><FiX /></button>
        </div>
        <div className="sg-modal-body">
          <label className="sg-label">Day</label>
          <select className="sg-select" value={day} onChange={e => setDay(e.target.value)}>
            {DAYS.map(d => <option key={d}>{d}</option>)}
          </select>
          <label className="sg-label">Time Slot</label>
          <select className="sg-select" value={slot} onChange={e => setSlot(e.target.value)}>
            {TIME_SLOTS.map(t => <option key={t.start} value={t.start}>{t.start} – {t.end}</option>)}
          </select>
          <label className="sg-label">Instructor</label>
          <select className="sg-select" value={instructor} onChange={e => setInstructor(e.target.value)}>
            {resources.instructors.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
          </select>
          <label className="sg-label">Room</label>
          <select className="sg-select" value={room} onChange={e => setRoom(e.target.value)}>
            {resources.rooms.filter(r => !section.courseRoomType || r.type === section.courseRoomType)
              .map(r => <option key={r._id} value={r._id}>{r.room_name} ({r.type})</option>)}
          </select>
        </div>
        <div className="sg-modal-footer">
          <button className="sg-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="sg-btn-primary" onClick={handleSave}><FiCheck /> Apply</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ScheduleGenerator() {
  const [step, setStep] = useState(0);
  const [resources, setResources] = useState({ courses: [], instructors: [], rooms: [], semesters: [] });
  const [loadingRes, setLoadingRes] = useState(true);

  // Step 0 — selection
  const [selCourses, setSelCourses] = useState([]);
  const [selInstructors, setSelInstructors] = useState([]);
  const [selRooms, setSelRooms] = useState([]);
  const [selSemester, setSelSemester] = useState("");
  const [numOptions, setNumOptions] = useState(3);

  // courseInstructorMap: { [courseId]: [instructorId, ...] }
  // defines which instructors are allowed to teach each course
  const [courseInstructorMap, setCourseInstructorMap] = useState({});

  // Step 1 — constraints
  // courseConstraints: { [courseId]: { expectedEnrollment: number, minHoursPerWeek: number } }
  const [courseConstraints, setCourseConstraints] = useState({});
  // instructorConstraints: { [instructorId]: { maxHoursPerWeek: number, unavailable: [{day,slot}] } }
  const [instructorConstraints, setInstructorConstraints] = useState({});
  // roomConstraints: { [roomId]: { openFrom: string, openUntil: string } }
  const [roomConstraints, setRoomConstraints] = useState({});
  // college-wide defaults
  const [collegeOpen, setCollegeOpen] = useState(DEFAULT_OPEN);
  const [collegeClose, setCollegeClose] = useState(DEFAULT_CLOSE);

  // Step 2 — generated
  const [schedules, setSchedules] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState(null);
  const [generatedBy, setGeneratedBy] = useState(null);

  // Step 3 — review
  const [editedSections, setEditedSections] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [conflicts, setConflicts] = useState([]);

  // Step 4 — save
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);

  useEffect(() => {
    getAvailableResources()
      .then(d => {
        setResources(d.resources);
        if (d.resources.semesters?.length) setSelSemester(d.resources.semesters[0]._id);
      })
      .catch(() => {})
      .finally(() => setLoadingRes(false));
  }, []);

  const toggle = (setter, id) =>
    setter(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  // When moving from step 0 → 1, initialise constraint objects for selected items
  const handleGoToConfigure = () => {
    // Keep existing map entries, init missing ones to all selected instructors
    const newMap = {};
    selCourses.forEach(cid => {
      const existing = courseInstructorMap[cid] || [];
      // keep only instructors still selected
      const filtered = existing.filter(iid => selInstructors.includes(iid));
      newMap[cid] = filtered.length > 0 ? filtered : [...selInstructors];
    });
    setCourseInstructorMap(newMap);

    const cc = {};
    selCourses.forEach(id => {
      cc[id] = courseConstraints[id] || { expectedEnrollment: 200, minHoursPerWeek: 6 };
    });
    setCourseConstraints(cc);

    const ic = {};
    selInstructors.forEach(id => {
      ic[id] = instructorConstraints[id] || { maxHoursPerWeek: 12, unavailable: [] };
    });
    setInstructorConstraints(ic);

    const rc = {};
    selRooms.forEach(id => {
      rc[id] = roomConstraints[id] || { openFrom: collegeOpen, openUntil: collegeClose };
    });
    setRoomConstraints(rc);

    setStep(1);
  };

  // Toggle unavailable slot for an instructor
  const toggleUnavailable = (instrId, day, slotStart) => {
    setInstructorConstraints(prev => {
      const cur = prev[instrId] || { maxHoursPerWeek: 12, unavailable: [] };
      const key = `${day}|${slotStart}`;
      const exists = cur.unavailable.some(u => `${u.day}|${u.slot}` === key);
      return {
        ...prev,
        [instrId]: {
          ...cur,
          unavailable: exists
            ? cur.unavailable.filter(u => `${u.day}|${u.slot}` !== key)
            : [...cur.unavailable, { day, slot: slotStart }],
        },
      };
    });
  };

  // Apply college default to all rooms
  const applyCollegeDefaultToAll = () => {
    setRoomConstraints(prev => {
      const next = { ...prev };
      selRooms.forEach(id => { next[id] = { openFrom: collegeOpen, openUntil: collegeClose }; });
      return next;
    });
  };

  // Generate
  const handleGenerate = async () => {
    setGenerating(true);
    setGenError(null);
    try {
      const res = await generateSchedules({
        courseIds: selCourses,
        instructorIds: selInstructors,
        roomIds: selRooms,
        semesterId: selSemester,
        numOptions,
        courseConstraints,
        instructorConstraints,
        roomConstraints,
        courseInstructorMap,
      });
      setSchedules(res.schedules);
      setGeneratedBy(res.generatedBy || "csp");
      setStep(2);
    } catch (err) {
      setGenError(err.response?.data?.message || "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const handleChoose = (idx) => {
    setEditedSections([...schedules[idx].sections]);
    setConflicts([]);
    setStep(3);
  };

  const handleEditSave = async (updated) => {
    const next = editedSections.map(s =>
      s.courseCode === updated.courseCode &&
      s.day === editingSection.day &&
      s.timeSlot.start === editingSection.timeSlot.start ? updated : s
    );
    setEditedSections(next);
    setEditingSection(null);
    const res = await validateSchedule(next).catch(() => ({ conflicts: [] }));
    setConflicts(res.conflicts || []);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await saveSchedule(editedSections, selSemester);
      setSaveMsg({ type: "ok", text: res.message });
      setStep(4);
    } catch (err) {
      setSaveMsg({ type: "err", text: err.response?.data?.message || "Save failed" });
    } finally {
      setSaving(false);
    }
  };

  const activeSections = editedSections || [];

  // helpers
  const getCourse = id => resources.courses.find(c => c._id === id);
  const getInstructor = id => resources.instructors.find(i => i._id === id);
  const getRoom = id => resources.rooms.find(r => r._id === id);

  return (
    <div className="sg-root">
      <div className="sg-header">
        <div>
          <h2 className="sg-title"><FiCpu /> AI Schedule Generator</h2>
          <p className="sg-sub">Configure courses, instructors, and rooms — then let Gemini AI build conflict-free schedules.</p>
        </div>
      </div>

      <StepBar step={step} />

      {/* ══ STEP 0: Select Resources ══════════════════════════════════════════ */}
      {step === 0 && (
        <div className="sg-step-body">
          {loadingRes ? (
            <div className="sg-loading"><span className="sg-spinner" /> Loading resources…</div>
          ) : (
            <>
              <div className="sg-resources-grid">
                {/* Courses */}
                <div className="sg-resource-card">
                  <div className="sg-resource-header"><FiBook /><span>Courses to Offer</span><span className="sg-badge">{selCourses.length}</span></div>
                  <SelectList items={resources.courses} selected={selCourses} onToggle={id => toggle(setSelCourses, id)}
                    searchPlaceholder="Search courses…"
                    renderItem={(c, t) => t ? `${c.code} ${c.title}` :
                      <div className="sg-item-content">
                        <span className="sg-item-code">{c.code}</span>
                        <span className="sg-item-title">{c.title}</span>
                        <span className="sg-item-meta">{c.required_room_type} · {c.credits} cr</span>
                      </div>}
                  />
                </div>
                {/* Instructors */}
                <div className="sg-resource-card">
                  <div className="sg-resource-header"><FiUsers /><span>Instructors</span><span className="sg-badge">{selInstructors.length}</span></div>
                  <SelectList items={resources.instructors} selected={selInstructors} onToggle={id => toggle(setSelInstructors, id)}
                    searchPlaceholder="Search instructors…"
                    renderItem={(i, t) => t ? i.name :
                      <div className="sg-item-content">
                        <span className="sg-item-title">{i.name}</span>
                        <span className="sg-item-meta">{i.department?.name || "—"}</span>
                      </div>}
                  />
                </div>
                {/* Rooms */}
                <div className="sg-resource-card">
                  <div className="sg-resource-header"><FiLayers /><span>Rooms</span><span className="sg-badge">{selRooms.length}</span></div>
                  <SelectList items={resources.rooms} selected={selRooms} onToggle={id => toggle(setSelRooms, id)}
                    searchPlaceholder="Search rooms…"
                    renderItem={(r, t) => t ? `${r.room_name} ${r.type}` :
                      <div className="sg-item-content">
                        <span className="sg-item-code">{r.room_name}</span>
                        <span className="sg-item-meta">{r.type} · Cap {r.capacity}</span>
                      </div>}
                  />
                </div>
              </div>

              <div className="sg-config-row">
                <div className="sg-config-field">
                  <label className="sg-label"><FiCalendar /> Semester</label>
                  <select className="sg-select" value={selSemester} onChange={e => setSelSemester(e.target.value)}>
                    {resources.semesters.map(s => <option key={s._id} value={s._id}>{s.term} {s.year}</option>)}
                  </select>
                </div>
                <div className="sg-config-field">
                  <label className="sg-label"><FiZap /> Schedule Options</label>
                  <select className="sg-select" value={numOptions} onChange={e => setNumOptions(Number(e.target.value))}>
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} option{n>1?"s":""}</option>)}
                  </select>
                </div>
              </div>

              {/* ── Course → Instructor mapping ── */}
              {selCourses.length > 0 && selInstructors.length > 0 && (
                <div className="sg-constraint-section">
                  <div className="sg-constraint-section-title">
                    <FiLink /> Course — Instructor Assignment
                    <span className="sg-mapping-hint">Select which instructors can teach each course. An instructor will only be scheduled for their assigned courses.</span>
                  </div>
                  <div className="sg-mapping-table">
                    {selCourses.map(cid => {
                      const course = getCourse(cid);
                      if (!course) return null;
                      const assigned = courseInstructorMap[cid] || selInstructors;
                      return (
                        <div key={cid} className="sg-mapping-row">
                          <div className="sg-mapping-course">
                            <span className="sg-item-code">{course.code}</span>
                            <span className="sg-item-meta">{course.title}</span>
                          </div>
                          <div className="sg-mapping-instructors">
                            {selInstructors.map(iid => {
                              const inst = getInstructor(iid);
                              if (!inst) return null;
                              const isAssigned = assigned.includes(iid);
                              return (
                                <button
                                  key={iid}
                                  className={`sg-mapping-chip ${isAssigned ? "assigned" : ""}`}
                                  onClick={() => {
                                    setCourseInstructorMap(prev => {
                                      const cur = prev[cid] || [...selInstructors];
                                      return {
                                        ...prev,
                                        [cid]: isAssigned
                                          ? cur.filter(x => x !== iid)
                                          : [...cur, iid],
                                      };
                                    });
                                  }}
                                >
                                  {isAssigned && <FiCheck size={10} />}
                                  {inst.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="sg-mapping-footer">
                    <button className="sg-btn-ghost sg-btn-sm" onClick={() => {
                      const all = {};
                      selCourses.forEach(cid => { all[cid] = [...selInstructors]; });
                      setCourseInstructorMap(all);
                    }}>Assign All to All</button>
                    <span className="sg-hint">Each course needs at least one instructor assigned.</span>
                  </div>
                </div>
              )}

              <div className="sg-action-row">
                {(() => {
                  const missingCourses = selCourses.filter(cid => {
                    const mapped = courseInstructorMap[cid];
                    return !mapped || mapped.length === 0;
                  });
                  const isDisabled =
                    selCourses.length === 0 || selInstructors.length === 0 ||
                    selRooms.length === 0 || !selSemester ||
                    missingCourses.length > 0;
                  return (
                    <>
                      <button className="sg-btn-primary large" onClick={handleGoToConfigure} disabled={isDisabled}>
                        <FiSettings /> Configure Constraints →
                      </button>
                      {missingCourses.length > 0 && selInstructors.length > 0 ? (
                        <span className="sg-hint sg-hint-warn">
                          <FiAlertTriangle size={13} />
                          {missingCourses.map(cid => getCourse(cid)?.code).filter(Boolean).join(", ")}
                          {" "}{missingCourses.length === 1 ? "needs" : "need"} at least one instructor assigned.
                        </span>
                      ) : (
                        <span className="sg-hint">{selCourses.length} courses · {selInstructors.length} instructors · {selRooms.length} rooms</span>
                      )}
                    </>
                  );
                })()}
              </div>
            </>
          )}
        </div>
      )}

      {/* ══ STEP 1: Configure Constraints ════════════════════════════════════ */}
      {step === 1 && (
        <div className="sg-step-body">
          <div className="sg-options-header">
            <h3 className="sg-section-title"><FiSettings /> Configure Constraints</h3>
            <button className="sg-btn-ghost" onClick={() => setStep(0)}>← Back</button>
          </div>

          {/* ── College-wide room defaults ── */}
          <div className="sg-constraint-section">
            <div className="sg-constraint-section-title"><FiClock /> College-Wide Room Hours (Default)</div>
            <div className="sg-college-defaults">
              <div className="sg-config-field">
                <label className="sg-label">Open From</label>
                <select className="sg-select" value={collegeOpen} onChange={e => setCollegeOpen(e.target.value)}>
                  {TIME_SLOTS.map(t => <option key={t.start} value={t.start}>{t.start}</option>)}
                </select>
              </div>
              <div className="sg-config-field">
                <label className="sg-label">Close At</label>
                <select className="sg-select" value={collegeClose} onChange={e => setCollegeClose(e.target.value)}>
                  {TIME_SLOTS.map(t => <option key={t.end} value={t.end}>{t.end}</option>)}
                </select>
              </div>
              <button className="sg-btn-ghost" onClick={applyCollegeDefaultToAll}>Apply to All Rooms</button>
            </div>
          </div>

          {/* ── Course constraints ── */}
          <div className="sg-constraint-section">
            <div className="sg-constraint-section-title"><FiBook /> Course Constraints</div>
            <div className="sg-constraint-table">
              <div className="sg-ct-header">
                <span>Course</span><span>Expected Enrollment</span><span>Min Hours / Week</span>
              </div>
              {selCourses.map(id => {
                const c = getCourse(id);
                if (!c) return null;
                const cc = courseConstraints[id] || { expectedEnrollment: 200, minHoursPerWeek: 6 };
                return (
                  <div key={id} className="sg-ct-row">
                    <div className="sg-ct-name">
                      <span className="sg-item-code">{c.code}</span>
                      <span className="sg-item-meta">{c.title}</span>
                    </div>
                    <div className="sg-ct-input-wrap">
                      <input type="number" min={1} max={500} className="sg-num-input"
                        value={cc.expectedEnrollment}
                        onChange={e => setCourseConstraints(prev => ({ ...prev, [id]: { ...cc, expectedEnrollment: Number(e.target.value) } }))} />
                      <span className="sg-input-unit">students</span>
                    </div>
                    <div className="sg-ct-input-wrap">
                      <input type="number" min={1} max={20} className="sg-num-input"
                        value={cc.minHoursPerWeek}
                        onChange={e => setCourseConstraints(prev => ({ ...prev, [id]: { ...cc, minHoursPerWeek: Number(e.target.value) } }))} />
                      <span className="sg-input-unit">hrs</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Instructor constraints ── */}
          <div className="sg-constraint-section">
            <div className="sg-constraint-section-title"><FiUsers /> Instructor Constraints</div>
            {selInstructors.map(id => {
              const inst = getInstructor(id);
              if (!inst) return null;
              const ic = instructorConstraints[id] || { maxHoursPerWeek: 12, unavailable: [] };
              // courses this instructor is assigned to
              const assignedCourses = selCourses.filter(cid => (courseInstructorMap[cid] || selInstructors).includes(id));
              return (
                <div key={id} className="sg-instructor-constraint">
                  <div className="sg-ic-header">
                    <div className="sg-ic-name">
                      {inst.name}
                      <span className="sg-item-meta">{inst.department?.name || "—"}</span>
                      {assignedCourses.length > 0 && (
                        <div className="sg-ic-courses">
                          {assignedCourses.map(cid => {
                            const c = getCourse(cid);
                            return c ? <span key={cid} className="sg-ic-course-tag">{c.code}</span> : null;
                          })}
                        </div>
                      )}
                    </div>
                    <div className="sg-ct-input-wrap">
                      <label className="sg-label">Max hrs/week</label>
                      <input type="number" min={1} max={40} className="sg-num-input"
                        value={ic.maxHoursPerWeek}
                        onChange={e => setInstructorConstraints(prev => ({ ...prev, [id]: { ...ic, maxHoursPerWeek: Number(e.target.value) } }))} />
                    </div>
                  </div>
                  <div className="sg-unavail-label"><FiClock size={12} /> Unavailable slots (click to mark)</div>
                  <div className="sg-unavail-grid">
                    <div className="sg-unavail-corner" />
                    {DAYS.map(d => <div key={d} className="sg-unavail-day">{d.slice(0,3)}</div>)}
                    {TIME_SLOTS.map(slot => (
                      <>
                        <div key={slot.start} className="sg-unavail-time">{slot.start}</div>
                        {DAYS.map(day => {
                          const blocked = ic.unavailable.some(u => u.day === day && u.slot === slot.start);
                          return (
                            <button key={day} className={`sg-unavail-cell ${blocked ? "blocked" : ""}`}
                              onClick={() => toggleUnavailable(id, day, slot.start)}
                              title={blocked ? "Unavailable" : "Available"}>
                              {blocked && <FiX size={10} />}
                            </button>
                          );
                        })}
                      </>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Room constraints ── */}
          <div className="sg-constraint-section">
            <div className="sg-constraint-section-title"><FiLayers /> Room Availability</div>
            <div className="sg-constraint-table">
              <div className="sg-ct-header"><span>Room</span><span>Open From</span><span>Close At</span></div>
              {selRooms.map(id => {
                const r = getRoom(id);
                if (!r) return null;
                const rc = roomConstraints[id] || { openFrom: collegeOpen, openUntil: collegeClose };
                return (
                  <div key={id} className="sg-ct-row">
                    <div className="sg-ct-name">
                      <span className="sg-item-code">{r.room_name}</span>
                      <span className="sg-item-meta">{r.type} · Cap {r.capacity}</span>
                    </div>
                    <select className="sg-select sg-select-sm" value={rc.openFrom}
                      onChange={e => setRoomConstraints(prev => ({ ...prev, [id]: { ...rc, openFrom: e.target.value } }))}>
                      {TIME_SLOTS.map(t => <option key={t.start} value={t.start}>{t.start}</option>)}
                    </select>
                    <select className="sg-select sg-select-sm" value={rc.openUntil}
                      onChange={e => setRoomConstraints(prev => ({ ...prev, [id]: { ...rc, openUntil: e.target.value } }))}>
                      {TIME_SLOTS.map(t => <option key={t.end} value={t.end}>{t.end}</option>)}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>

          {genError && <p className="sg-error"><FiAlertTriangle /> {genError}</p>}

          <div className="sg-action-row">
            <button className="sg-btn-primary large" onClick={handleGenerate} disabled={generating}>
              {generating ? <><span className="sg-spinner" /> Generating…</> : <><FiCpu /> Generate Schedules</>}
            </button>
          </div>
        </div>
      )}

      {/* ══ STEP 2: Choose Option ═════════════════════════════════════════════ */}
      {step === 2 && (
        <div className="sg-step-body">
          <div className="sg-options-header">
            <h3 className="sg-section-title">Generated Schedule Options</h3>
            <div style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
              {generatedBy === "gemini" && <span className="sg-ai-badge"><FiCpu /> Gemini AI</span>}
              {generatedBy === "csp_fallback" && <span className="sg-ai-badge fallback"><FiZap /> Algorithm (AI unavailable)</span>}
              <button className="sg-btn-ghost" onClick={() => setStep(1)}>← Back</button>
            </div>
          </div>
          <div className="sg-options-grid">
            {schedules.map((sched, idx) => (
              <div key={sched.id} className="sg-option-card">
                <div className="sg-option-top">
                  <div className="sg-option-title">Option {idx + 1}</div>
                  <div className="sg-score-badge">Score: {sched.score}</div>
                </div>
                <div className="sg-option-stats">
                  <div className="sg-stat"><span>{sched.stats.totalSections}</span><label>Sections</label></div>
                  <div className="sg-stat"><span>{Object.keys(sched.stats.dayDistribution).length}</span><label>Days</label></div>
                  <div className="sg-stat"><span>{Object.keys(sched.stats.instructorLoad).length}</span><label>Instructors</label></div>
                </div>
                <div className="sg-dist-bars">
                  {DAYS.map(d => (
                    <div key={d} className="sg-dist-bar-wrap" title={`${d}: ${sched.stats.dayDistribution[d]||0}`}>
                      <div className="sg-dist-bar" style={{ height:`${Math.min((sched.stats.dayDistribution[d]||0)*12,60)}px` }} />
                      <span>{d.slice(0,3)}</span>
                    </div>
                  ))}
                </div>
                <div className="sg-instructor-load">
                  {Object.entries(sched.stats.instructorLoad).map(([name, count]) => (
                    <div key={name} className="sg-load-row">
                      <span className="sg-load-name">{name}</span>
                      <div className="sg-load-bar-wrap"><div className="sg-load-bar" style={{ width:`${(count/sched.stats.totalSections)*100}%` }} /></div>
                      <span className="sg-load-count">{count}</span>
                    </div>
                  ))}
                </div>
                <button className="sg-btn-primary full" onClick={() => handleChoose(idx)}>
                  Select This Option <FiChevronRight />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ STEP 3: Review & Edit ═════════════════════════════════════════════ */}
      {step === 3 && (
        <div className="sg-step-body">
          <div className="sg-options-header">
            <h3 className="sg-section-title">Review & Edit Schedule</h3>
            <div style={{ display:"flex", gap:"0.75rem" }}>
              <button className="sg-btn-ghost" onClick={() => setStep(2)}>← Back</button>
              <button className="sg-btn-primary" onClick={handleSave} disabled={saving || conflicts.length > 0}>
                {saving ? <><span className="sg-spinner" /> Saving…</> : <><FiSave /> Save Schedule</>}
              </button>
            </div>
          </div>
          {conflicts.length > 0 && (
            <div className="sg-conflicts-box">
              <div className="sg-conflicts-title"><FiAlertTriangle /> {conflicts.length} Conflict{conflicts.length>1?"s":""} Detected</div>
              {conflicts.map((c, i) => (
                <div key={i} className="sg-conflict-row">
                  <span className="sg-conflict-type">{c.type}</span>
                  {c.section1} & {c.section2} — {c.day} {c.time}
                  {c.instructor && <span className="sg-conflict-detail">({c.instructor})</span>}
                  {c.room && <span className="sg-conflict-detail">({c.room})</span>}
                </div>
              ))}
            </div>
          )}
          {conflicts.length === 0 && activeSections.length > 0 && (
            <div className="sg-no-conflicts"><FiCheck /> No conflicts — schedule is valid</div>
          )}
          <ScheduleGrid sections={activeSections} onEdit={setEditingSection} />
          {saveMsg && <p className={saveMsg.type==="ok"?"sg-msg-ok":"sg-msg-err"}>{saveMsg.text}</p>}
        </div>
      )}

      {/* ══ STEP 4: Done ══════════════════════════════════════════════════════ */}
      {step === 4 && (
        <div className="sg-step-body sg-done">
          <div className="sg-done-icon"><FiCheck /></div>
          <h3>Schedule Saved Successfully!</h3>
          <p>All sections have been created and are ready for student enrollment.</p>
          <button className="sg-btn-primary" onClick={() => {
            setStep(0); setSchedules([]); setEditedSections(null);
            setSelCourses([]); setSelInstructors([]); setSelRooms([]);
          }}>Generate Another Schedule</button>
        </div>
      )}

      {editingSection && (
        <EditModal section={editingSection} resources={resources} onSave={handleEditSave} onClose={() => setEditingSection(null)} />
      )}
    </div>
  );
}
