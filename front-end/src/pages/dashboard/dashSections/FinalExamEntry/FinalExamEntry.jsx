import { useEffect, useState } from "react";
import { FiSave, FiLock } from "react-icons/fi";
import api from "../../../../services/api";
import SectionPicker from "../shared/SectionPicker";
import "./FinalExamEntry.css";

const PASS_MARK = 60;

function calcLetter(total) {
  if (total >= 90) return "A+";
  if (total >= 85) return "A";
  if (total >= 80) return "B+";
  if (total >= 75) return "B";
  if (total >= 70) return "C+";
  if (total >= 65) return "C";
  if (total >= 60) return "D";
  return "F";
}

export default function FinalExamEntry() {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [students, setStudents] = useState([]);
  const [config, setConfig] = useState({ year_work_max: 40, final_max: 60 });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [locking, setLocking] = useState(false);

  useEffect(() => {
    api.get("/sections/my")
      .then((r) => setSections(r.data.sections || r.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedSection) return;
    setLoading(true);
    
    Promise.all([
      api.get(`/grade-config/${selectedSection}`).catch(() => ({ data: { config: null } })),
      api.get(`/grades/section/${selectedSection}`).catch(() => ({ data: { enrollments: [] } })),
    ]).then(([cfgRes, gradesRes]) => {
      const cfg = cfgRes.data.config || { year_work_max: 40, final_max: 60 };
      setConfig(cfg);
      
      const rows = (gradesRes.data.enrollments || []).map((e) => ({
        enrollmentId: e._id,
        studentId: e.student?.studentId || "—",
        name: e.student?.name || "—",
        yearWork: parseFloat(e.grades_object?.year_work ?? 0),
        finalExam: e.grades_object?.final_exam ?? "",
        isLocked: e.isFinalExamLocked,
      }));
      setStudents(rows);
    }).finally(() => setLoading(false));
  }, [selectedSection]);

  const handleChange = (enrollmentId, value) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.enrollmentId === enrollmentId ? { ...s, finalExam: value } : s
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(
        students
          .filter((s) => !s.isLocked)
          .map((s) => {
            const finalExam = parseFloat(s.finalExam) || 0;
            const total = s.yearWork + finalExam;
            return api.patch(`/grades/${s.enrollmentId}`, {
              grades_object: {
                year_work: s.yearWork,
                final_exam: finalExam,
                final_total: total,
                letter_grade: calcLetter(total),
              },
            });
          })
      );
      alert("Grades saved successfully.");
    } catch {
      alert("Failed to save grades.");
    } finally {
      setSaving(false);
    }
  };

  const handleBulkLock = async (lockValue) => {
    if (!selectedSection) return;
    const msg = lockValue 
      ? "Are you sure you want to lock final exam for all students? They won't be able to edit anymore."
      : "Are you sure you want to unlock final exam for all students?";
    
    if (!window.confirm(msg)) return;
    
    setLocking(true);
    try {
      await api.patch(`/grades/section/${selectedSection}/bulk-lock-final`, { isLocked: lockValue });
      alert(`Final exam ${lockValue ? 'locked' : 'unlocked'} for all students.`);
      // Reload students
      const [cfgRes, gradesRes] = await Promise.all([
        api.get(`/grade-config/${selectedSection}`),
        api.get(`/grades/section/${selectedSection}`),
      ]);
      const cfg = cfgRes.data.config || { year_work_max: 40, final_max: 60 };
      setConfig(cfg);
      const rows = (gradesRes.data.enrollments || []).map((e) => ({
        enrollmentId: e._id,
        studentId: e.student?.studentId || "—",
        name: e.student?.name || "—",
        yearWork: parseFloat(e.grades_object?.year_work ?? 0),
        finalExam: e.grades_object?.final_exam ?? "",
        isLocked: e.isFinalExamLocked,
      }));
      setStudents(rows);
    } catch {
      alert("Failed to lock/unlock grades.");
    } finally {
      setLocking(false);
    }
  };

  return (
    <div className="fee-page">
      <div className="fee-header">
        <div>
          <h1>Final Exam Entry</h1>
          <p>Enter final exam grades for your sections.</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button 
            className="fee-lock-btn" 
            onClick={() => handleBulkLock(true)} 
            disabled={locking || !selectedSection}
            style={{ background: "#dc3545" }}
          >
            <FiLock /> Lock All
          </button>
          <button 
            className="fee-lock-btn" 
            onClick={() => handleBulkLock(false)} 
            disabled={locking || !selectedSection}
            style={{ background: "#28a745" }}
          >
            <FiLock /> Unlock All
          </button>
          <button className="fee-save-btn" onClick={handleSave} disabled={saving || !selectedSection}>
            <FiSave /> {saving ? "Saving..." : "Save Grades"}
          </button>
        </div>
      </div>

      <div className="fee-picker-label">Select Section</div>
      <SectionPicker
        sections={sections}
        value={selectedSection}
        onChange={setSelectedSection}
      />

      {loading ? (
        <div className="fee-loading">Loading students...</div>
      ) : students.length === 0 && selectedSection ? (
        <div className="fee-empty">No enrolled students found.</div>
      ) : students.length > 0 ? (
        <div className="fee-table-wrap">
          <table className="fee-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Year Work / {config.year_work_max ?? 40}</th>
                <th>Final Exam / {config.final_max ?? 60}</th>
                <th>Total / 100</th>
                <th>Grade</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => {
                const finalVal = parseFloat(s.finalExam) || 0;
                const total = s.yearWork + finalVal;
                const passed = total >= PASS_MARK;
                return (
                  <tr key={s.enrollmentId} className={s.isLocked ? "fee-row-locked" : ""}>
                    <td className="fee-id">{s.studentId}</td>
                    <td className="fee-name">{s.name}</td>
                    <td className="fee-center">{s.yearWork}</td>
                    <td className="fee-center">
                      {s.isLocked ? (
                        <span>{finalVal}</span>
                      ) : (
                        <input
                          type="number"
                          min={0}
                          max={config.final_max ?? 60}
                          value={s.finalExam}
                          onChange={(e) => handleChange(s.enrollmentId, e.target.value)}
                          className="fee-input"
                        />
                      )}
                    </td>
                    <td className={`fee-total ${passed ? "fee-pass-total" : "fee-fail-total"}`}>
                      {s.finalExam !== "" ? total.toFixed(1) : "—"}
                    </td>
                    <td className="fee-center">
                      <span className={`fee-grade fee-grade-${calcLetter(total).replace("+", "p")}`}>
                        {s.finalExam !== "" ? calcLetter(total) : "—"}
                      </span>
                    </td>
                    <td className="fee-center">
                      {s.isLocked ? (
                        <span className="fee-locked-badge"><FiLock size={11} /> Locked</span>
                      ) : s.finalExam !== "" ? (
                        <span className={passed ? "fee-pass-badge" : "fee-fail-badge"}>
                          {passed ? "✓ Pass" : "✗ Fail"}
                        </span>
                      ) : (
                        <span className="fee-pending">Pending</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
