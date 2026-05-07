import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiAlertTriangle, FiBook, FiCalendar, FiCheck,
  FiEdit2, FiGrid, FiLayers, FiPlus,
  FiRefreshCw, FiSearch, FiTrash2, FiUsers, FiX,
} from "react-icons/fi";
import {
  createSection, deleteSection, getResources,
  getSectionsBySemester, updateSection,
} from "../../../../services/ScheduleBuilderServices";
import "./ScheduleBuilder.css";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
const DAY_SHORT = { Sunday: "Sun", Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu" };

const TIME_SLOTS = [
  "08:00","09:00","10:00","11:00","12:00",
  "13:00","14:00","15:00","16:00","17:00","18:00","19:00",
];

const ROOM_COLORS = [
  "#3b82f6","#10b981","#f59e0b","#8b5cf6","#ef4444",
  "#06b6d4","#ec4899","#84cc16","#f97316","#6366f1",
];

function timeLabel(t) {
  const [h] = t.split(":").map(Number);
  return h < 12 ? `${h}:00 AM` : h === 12 ? "12:00 PM" : `${h - 12}:00 PM`;
}

function nextHour(t) {
  const [h, m] = t.split(":").map(Number);
  return `${String(h + 1).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// ─── Conflict checker ─────────────────────────────────────────────────────────
function hasConflict(sections, candidate, excludeId = null) {
  const cStart = candidate.start_time;
  const cEnd = candidate.end_time;
  const cDay = candidate.day;
  for (const s of sections) {
    if (s._id === excludeId) continue;
    if (s.day !== cDay) continue;
    const overlap = cStart < s.end_time && cEnd > s.start_time;
    if (!overlap) continue;
    if (s.instructor_id?._id === candidate.instructor_id || s.instructor_id === candidate.instructor_id)
      return { type: "instructor", with: s };
    if (s.room_id?._id === candidate.room_id || s.room_id === candidate.room_id)
      return { type: "room", with: s };
  }
  return null;
}

// ─── Section modal (add / edit) ───────────────────────────────────────────────
function SectionModal({ section, defaults = {}, resources, semesterId, sections, onSave, onClose }) {
  const editing = !!section?._id;
  const [form, setForm] = useState({
    course_id: section?.course_id?._id || section?.course_id || "",
    instructor_id: section?.instructor_id?._id || section?.instructor_id || "",
    room_id: section?.room_id?._id || section?.room_id || defaults.room_id || "",
    day: section?.day || defaults.day || DAYS[0],
    start_time: section?.start_time || defaults.start_time || "08:00",
    end_time: section?.end_time || defaults.end_time || "09:00",
    capacity: section?.capacity || 30,
    sectionNumber: section?.sectionNumber || 1,
    status: section?.status || "Open",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const conflict = useMemo(() => hasConflict(sections, form, section?._id), [sections, form, section]);

  const handleSubmit = async () => {
    if (!form.course_id || !form.instructor_id || !form.room_id) {
      setErr("Please fill all required fields."); return;
    }
    setSaving(true); setErr(null);
    try {
      const payload = { ...form, semester_id: semesterId };
      if (editing) await updateSection(section._id, payload);
      else await createSection(payload);
      onSave();
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to save section.");
    } finally { setSaving(false); }
  };

  const selectedCourse = resources.courses.find(c => c._id === form.course_id);

  return (
    <div className="sb-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sb-modal">
        <div className="sb-modal-header">
          <h3>{editing ? "Edit Section" : "Add Section"}</h3>
          <button className="sb-icon-btn" onClick={onClose}><FiX /></button>
        </div>
        <div className="sb-modal-body">
          {/* Course */}
          <label className="sb-form-label">Course *</label>
          <select className="sb-select" value={form.course_id} onChange={e => set("course_id", e.target.value)}>
            <option value="">— Select course —</option>
            {resources.courses.map(c => (
              <option key={c._id} value={c._id}>{c.code} — {c.title}</option>
            ))}
          </select>

          {selectedCourse && (
            <p className="sb-hint-text">Room type required: <strong>{selectedCourse.required_room_type}</strong></p>
          )}

          {/* Instructor */}
          <label className="sb-form-label">Instructor *</label>
          <select className="sb-select" value={form.instructor_id} onChange={e => set("instructor_id", e.target.value)}>
            <option value="">— Select instructor —</option>
            {resources.instructors.map(i => (
              <option key={i._id} value={i._id}>{i.name}</option>
            ))}
          </select>

          {/* Room */}
          <label className="sb-form-label">Room *</label>
          <select className="sb-select" value={form.room_id} onChange={e => set("room_id", e.target.value)}>
            <option value="">— Select room —</option>
            {resources.rooms
              .filter(r => !selectedCourse || r.type === selectedCourse.required_room_type)
              .map(r => (
                <option key={r._id} value={r._id}>{r.room_name} ({r.type}, cap {r.capacity})</option>
              ))}
          </select>

          <div className="sb-row-2">
            <div>
              <label className="sb-form-label">Day *</label>
              <select className="sb-select" value={form.day} onChange={e => set("day", e.target.value)}>
                {DAYS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="sb-form-label">Section #</label>
              <input type="number" min={1} className="sb-input" value={form.sectionNumber}
                onChange={e => set("sectionNumber", Number(e.target.value))} />
            </div>
          </div>

          <div className="sb-row-2">
            <div>
              <label className="sb-form-label">Start Time *</label>
              <select className="sb-select" value={form.start_time} onChange={e => {
                set("start_time", e.target.value);
                set("end_time", nextHour(e.target.value));
              }}>
                {TIME_SLOTS.map(t => <option key={t} value={t}>{timeLabel(t)}</option>)}
              </select>
            </div>
            <div>
              <label className="sb-form-label">End Time *</label>
              <select className="sb-select" value={form.end_time} onChange={e => set("end_time", e.target.value)}>
                {TIME_SLOTS.filter(t => t > form.start_time).map(t => (
                  <option key={t} value={t}>{timeLabel(t)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="sb-row-2">
            <div>
              <label className="sb-form-label">Capacity</label>
              <input type="number" min={1} className="sb-input" value={form.capacity}
                onChange={e => set("capacity", Number(e.target.value))} />
            </div>
            <div>
              <label className="sb-form-label">Status</label>
              <select className="sb-select" value={form.status} onChange={e => set("status", e.target.value)}>
                {["Open","Full","Cancelled","Tentative"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {conflict && (
            <div className="sb-conflict-warn">
              <FiAlertTriangle />
              {conflict.type === "instructor"
                ? `Instructor conflict with ${conflict.with.course_id?.code || "another section"} on ${conflict.with.day} ${conflict.with.start_time}`
                : `Room conflict with ${conflict.with.course_id?.code || "another section"} on ${conflict.with.day} ${conflict.with.start_time}`}
            </div>
          )}
          {err && <p className="sb-error">{err}</p>}
        </div>
        <div className="sb-modal-footer">
          <button className="sb-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="sb-btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? <span className="sb-spinner" /> : <FiCheck />}
            {editing ? "Save Changes" : "Add Section"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Weekly grid view ─────────────────────────────────────────────────────────
function WeeklyView({ sections, onEdit, onDelete, onAdd }) {
  const grid = useMemo(() => {
    const g = {};
    DAYS.forEach(d => { g[d] = {}; TIME_SLOTS.forEach(t => { g[d][t] = []; }); });
    sections.forEach(s => {
      const day = s.day;
      const slot = s.start_time?.slice(0, 5);
      if (g[day] && g[day][slot] !== undefined) g[day][slot].push(s);
    });
    return g;
  }, [sections]);

  return (
    <div className="sb-grid-wrap">
      <div className="sb-weekly-grid">
        {/* Corner */}
        <div className="sb-grid-corner" />
        {/* Day headers */}
        {DAYS.map(d => (
          <div key={d} className="sb-day-header">{DAY_SHORT[d]}<br /><span>{d}</span></div>
        ))}
        {/* Rows */}
        {TIME_SLOTS.map(slot => (
          <>
            <div key={slot} className="sb-time-label">{timeLabel(slot)}</div>
            {DAYS.map(day => {
              const cells = grid[day]?.[slot] || [];
              return (
                <div key={day} className="sb-grid-cell"
                  onClick={() => cells.length === 0 && onAdd({ day, start_time: slot, end_time: nextHour(slot) })}>
                  {cells.map(sec => (
                    <SectionCard key={sec._id} section={sec} onEdit={onEdit} onDelete={onDelete} />
                  ))}
                  {cells.length === 0 && <div className="sb-empty-slot"><FiPlus size={12} /></div>}
                </div>
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
}

// ─── Room view ────────────────────────────────────────────────────────────────
function RoomView({ sections, rooms, onEdit, onDelete, onAdd }) {
  const [selectedRoom, setSelectedRoom] = useState(null);

  const roomMap = useMemo(() => {
    const m = {};
    rooms.forEach(r => { m[r._id] = []; });
    sections.forEach(s => {
      const rid = s.room_id?._id || s.room_id;
      if (m[rid]) m[rid].push(s);
    });
    return m;
  }, [sections, rooms]);

  const activeRoom = selectedRoom || rooms[0];

  const grid = useMemo(() => {
    if (!activeRoom) return {};
    const g = {};
    DAYS.forEach(d => { g[d] = {}; TIME_SLOTS.forEach(t => { g[d][t] = null; }); });
    (roomMap[activeRoom._id] || []).forEach(s => {
      const slot = s.start_time?.slice(0, 5);
      if (g[s.day] && slot in g[s.day]) g[s.day][slot] = s;
    });
    return g;
  }, [activeRoom, roomMap]);

  if (!rooms.length) return <div className="sb-empty-state">No rooms available.</div>;

  return (
    <div className="sb-room-view">
      {/* Room list */}
      <div className="sb-room-list">
        <div className="sb-room-list-header">Rooms ({rooms.length})</div>
        {rooms.map((r, i) => {
          const count = (roomMap[r._id] || []).length;
          const pct = Math.round((count / (DAYS.length * TIME_SLOTS.length)) * 100);
          return (
            <button key={r._id}
              className={`sb-room-item ${activeRoom?._id === r._id ? "active" : ""}`}
              onClick={() => setSelectedRoom(r)}>
              <div className="sb-room-dot" style={{ background: ROOM_COLORS[i % ROOM_COLORS.length] }} />
              <div className="sb-room-info">
                <span className="sb-room-name">{r.room_name}</span>
                <span className="sb-room-meta">{r.type} · Cap {r.capacity}</span>
              </div>
              <div className="sb-room-usage">
                <div className="sb-usage-bar-bg">
                  <div className="sb-usage-bar" style={{ width: `${pct}%`, background: ROOM_COLORS[i % ROOM_COLORS.length] }} />
                </div>
                <span className="sb-usage-pct">{count} slots</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Room grid */}
      {activeRoom && (
        <div className="sb-room-grid-wrap">
          <div className="sb-room-grid-header">
            <span className="sb-room-grid-title">{activeRoom.room_name}</span>
            <span className="sb-room-grid-meta">{activeRoom.type} · Capacity {activeRoom.capacity} · {activeRoom.building_section}</span>
          </div>
          <div className="sb-grid-wrap">
            <div className="sb-weekly-grid">
              <div className="sb-grid-corner" />
              {DAYS.map(d => (
                <div key={d} className="sb-day-header">{DAY_SHORT[d]}<br /><span>{d}</span></div>
              ))}
              {TIME_SLOTS.map(slot => (
                <>
                  <div key={slot} className="sb-time-label">{timeLabel(slot)}</div>
                  {DAYS.map(day => {
                    const sec = grid[day]?.[slot];
                    return (
                      <div key={day} className="sb-grid-cell"
                        onClick={() => !sec && onAdd({ day, start_time: slot, end_time: nextHour(slot), room_id: activeRoom._id })}>
                        {sec
                          ? <SectionCard section={sec} onEdit={onEdit} onDelete={onDelete} compact />
                          : <div className="sb-empty-slot"><FiPlus size={12} /></div>}
                      </div>
                    );
                  })}
                </>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────
function SectionCard({ section, onEdit, onDelete, compact }) {
  const code = section.course_id?.code || "—";
  const instructor = section.instructor_id?.name || "—";
  const room = section.room_id?.room_name || "—";
  return (
    <div className="sb-section-card" onClick={e => e.stopPropagation()}>
      <div className="sb-sc-code">{code}</div>
      {!compact && <div className="sb-sc-info">{instructor}</div>}
      <div className="sb-sc-room">{room}</div>
      <div className="sb-sc-actions">
        <button className="sb-sc-btn" onClick={() => onEdit(section)} title="Edit"><FiEdit2 size={10} /></button>
        <button className="sb-sc-btn danger" onClick={() => onDelete(section)} title="Delete"><FiTrash2 size={10} /></button>
      </div>
    </div>
  );
}

// ─── Instructor panel ─────────────────────────────────────────────────────────
function InstructorPanel({ sections, instructors }) {
  const [q, setQ] = useState("");
  const load = useMemo(() => {
    const m = {};
    instructors.forEach(i => { m[i._id] = { name: i.name, dept: i.department?.name || "—", count: 0, sections: [] }; });
    sections.forEach(s => {
      const id = s.instructor_id?._id || s.instructor_id;
      if (m[id]) { m[id].count++; m[id].sections.push(s); }
    });
    return Object.values(m);
  }, [sections, instructors]);

  const filtered = load.filter(i => i.name.toLowerCase().includes(q.toLowerCase()));
  const max = Math.max(...filtered.map(i => i.count), 1);

  return (
    <div className="sb-panel">
      <div className="sb-panel-search">
        <FiSearch className="sb-search-icon" />
        <input className="sb-search" placeholder="Search instructors…" value={q} onChange={e => setQ(e.target.value)} />
      </div>
      <div className="sb-panel-list">
        {filtered.map(i => (
          <div key={i.name} className="sb-instr-row">
            <div className="sb-instr-info">
              <span className="sb-instr-name">{i.name}</span>
              <span className="sb-instr-dept">{i.dept}</span>
            </div>
            <div className="sb-instr-bar-wrap">
              <div className="sb-instr-bar" style={{ width: `${(i.count / max) * 100}%` }} />
            </div>
            <span className="sb-instr-count">{i.count}h</span>
          </div>
        ))}
        {filtered.length === 0 && <p className="sb-empty-msg">No instructors found.</p>}
      </div>
    </div>
  );
}

// ─── Main ScheduleBuilder ─────────────────────────────────────────────────────
export default function ScheduleBuilder() {
  const [resources, setResources] = useState({ courses: [], instructors: [], rooms: [], semesters: [] });
  const [sections, setSections] = useState([]);
  const [semesterId, setSemesterId] = useState("");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("weekly"); // "weekly" | "rooms" | "instructors"
  const [modal, setModal] = useState(null); // null | { section?, defaults? }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Load resources once
  useEffect(() => {
    getResources().then(r => {
      setResources(r);
      if (r.semesters?.length) setSemesterId(r.semesters[0]._id);
    }).catch(() => showToast("Failed to load resources", "err"))
      .finally(() => setLoading(false));
  }, []);

  // Load sections when semester changes
  useEffect(() => {
    if (!semesterId) return;
    getSectionsBySemester(semesterId)
      .then(s => setSections(s))
      .catch(() => showToast("Failed to load sections", "err"));
  }, [semesterId]);

  const reload = () => getSectionsBySemester(semesterId).then(setSections).catch(() => {});

  const handleSave = async () => {
    await reload();
    setModal(null);
    showToast("Section saved successfully");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteSection(deleteTarget._id);
      await reload();
      showToast("Section deleted");
    } catch {
      showToast("Failed to delete section", "err");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const openAdd = (defaults = {}) => setModal({ defaults });
  const openEdit = (section) => setModal({ section });

  if (loading) {
    return (
      <div className="sb-loading">
        <span className="sb-spinner" />
        Loading schedule builder…
      </div>
    );
  }

  return (
    <div className="sb-root">
      {/* Header */}
      <div className="sb-header">
        <div>
          <h2 className="sb-title"><FiCalendar /> Schedule Builder</h2>
          <p className="sb-sub">Manually build and manage course sections for any semester.</p>
        </div>
        <div className="sb-header-actions">
          <div className="sb-config-field">
            <label className="sb-label"><FiCalendar size={12} /> Semester</label>
            <select className="sb-select" value={semesterId} onChange={e => setSemesterId(e.target.value)}>
              {resources.semesters.map(s => (
                <option key={s._id} value={s._id}>{s.term} {s.year}</option>
              ))}
            </select>
          </div>
          <button className="sb-btn-ghost" onClick={reload} title="Refresh"><FiRefreshCw size={14} /></button>
          <button className="sb-btn-primary" onClick={() => openAdd()}>
            <FiPlus /> Add Section
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="sb-stats-bar">
        <div className="sb-stat-pill"><FiBook size={13} />{sections.length} Sections</div>
        <div className="sb-stat-pill"><FiUsers size={13} />{new Set(sections.map(s => s.instructor_id?._id || s.instructor_id)).size} Instructors</div>
        <div className="sb-stat-pill"><FiLayers size={13} />{new Set(sections.map(s => s.room_id?._id || s.room_id)).size} Rooms used</div>
        <div className="sb-stat-pill"><FiBook size={13} />{new Set(sections.map(s => s.course_id?._id || s.course_id)).size} Courses</div>
      </div>

      {/* View tabs */}
      <div className="sb-tabs">
        <button className={`sb-tab ${view === "weekly" ? "active" : ""}`} onClick={() => setView("weekly")}>
          <FiGrid size={14} /> Weekly View
        </button>
        <button className={`sb-tab ${view === "rooms" ? "active" : ""}`} onClick={() => setView("rooms")}>
          <FiLayers size={14} /> Room View
        </button>
        <button className={`sb-tab ${view === "instructors" ? "active" : ""}`} onClick={() => setView("instructors")}>
          <FiUsers size={14} /> Instructor Load
        </button>
      </div>

      {/* Content */}
      <div className="sb-content">
        {view === "weekly" && (
          <WeeklyView sections={sections} onEdit={openEdit} onDelete={setDeleteTarget} onAdd={openAdd} />
        )}
        {view === "rooms" && (
          <RoomView sections={sections} rooms={resources.rooms} onEdit={openEdit} onDelete={setDeleteTarget} onAdd={openAdd} />
        )}
        {view === "instructors" && (
          <InstructorPanel sections={sections} instructors={resources.instructors} />
        )}
      </div>

      {/* Section modal */}
      {modal && (
        <SectionModal
          section={modal.section}
          defaults={modal.defaults || {}}
          resources={resources}
          semesterId={semesterId}
          sections={sections}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="sb-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="sb-modal sb-confirm" onClick={e => e.stopPropagation()}>
            <div className="sb-modal-header">
              <h3>Delete Section</h3>
              <button className="sb-icon-btn" onClick={() => setDeleteTarget(null)}><FiX /></button>
            </div>
            <div className="sb-modal-body">
              <p>Delete <strong>{deleteTarget.course_id?.code}</strong> on <strong>{deleteTarget.day}</strong> at <strong>{deleteTarget.start_time}</strong>?</p>
              <p className="sb-warn-text">This will remove the section and all enrollment data.</p>
            </div>
            <div className="sb-modal-footer">
              <button className="sb-btn-ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="sb-btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? <span className="sb-spinner" /> : <FiTrash2 />} Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`sb-toast ${toast.type}`}>
          {toast.type === "err" ? <FiAlertTriangle /> : <FiCheck />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
