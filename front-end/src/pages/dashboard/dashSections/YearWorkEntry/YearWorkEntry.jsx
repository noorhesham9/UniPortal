import { useEffect, useState } from "react";
import { FiSave } from "react-icons/fi";
import api from "../../../../services/api";
import SectionPicker from "../shared/SectionPicker";
import GradeConfigPanel from "../shared/GradeConfigPanel";
import "./YearWorkEntry.css";

const DEFAULT_CONFIG = {
  year_work_max: 40,
  final_max: 60,
  attendance_max: 10,
  midterm_max: 20,
  quizzes: [{ label: "Quizzes", max: 10 }],
};

export default function YearWorkEntry() {
  const [sections, setSections]           = useState([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [config, setConfig]               = useState(DEFAULT_CONFIG);
  const [students, setStudents]           = useState([]);
  const [loading, setLoading]             = useState(false);
  const [saving, setSaving]               = useState(false);

  useEffect(() => {
    api.get("/sections/my")
      .then((r) => setSections(r.data.sections || r.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedSection) { setStudents([]); setConfig(DEFAULT_CONFIG); return; }
    setLoading(true);
    Promise.all([
      api.get(`/grade-config/${selectedSection}`).catch(() => ({ data: { config: null } })),
      api.get(`/grades/section/${selectedSection}`).catch(() => ({ data: { enrollments: [] } })),
    ]).then(([cfgRes, gradesRes]) => {
      const cfg = cfgRes.data.config || DEFAULT_CONFIG;
      setConfig(cfg);
      const rows = (gradesRes.data.enrollments || []).map((e) => {
        const g = e.grades_object || {};
        const quizValues = (cfg.quizzes || []).map((_, i) => g[`quiz_${i}`] ?? "");
        return {
          enrollmentId: e._id,
          studentId: e.student?.studentId || "—",
          name: e.student?.name || "—",
          attendance: g.attendance ?? "",
          quizValues,
          midterm: g.midterm ?? "",
        };
      });
      setStudents(rows);
    }).finally(() => setLoading(false));
  }, [selectedSection]);

  const handleConfigSaved = (cfg) => {
    setConfig(cfg);
    setStudents((prev) =>
      prev.map((s) => ({
        ...s,
        quizValues: (cfg.quizzes || []).map((_, i) => s.quizValues?.[i] ?? ""),
      }))
    );
  };

  const handleChange = (enrollmentId, field, value) => {
    setStudents((prev) =>
      prev.map((s) => s.enrollmentId === enrollmentId ? { ...s, [field]: value } : s)
    );
  };

  const handleQuizChange = (enrollmentId, quizIdx, value) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.enrollmentId !== enrollmentId) return s;
        const qv = [...(s.quizValues || [])];
        qv[quizIdx] = value;
        return { ...s, quizValues: qv };
      })
    );
  };

  const calcTotal = (s) => {
    const att    = parseFloat(s.attendance) || 0;
    const mid    = parseFloat(s.midterm) || 0;
    const qTotal = (s.quizValues || []).reduce((sum, v) => sum + (parseFloat(v) || 0), 0);
    return att + mid + qTotal;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(
        students.map((s) => {
          const grades = {
            attendance: parseFloat(s.attendance) || 0,
            midterm:    parseFloat(s.midterm) || 0,
            year_work:  calcTotal(s),
          };
          (s.quizValues || []).forEach((v, i) => {
            grades[`quiz_${i}`] = parseFloat(v) || 0;
          });
          return api.patch(`/grades/${s.enrollmentId}`, { grades_object: grades });
        })
      );

      // Send notification to all enrolled students in this section
      await api.post("/notifications/section-grades", {
        sectionId: selectedSection,
        type: "year_work",
      }).catch(() => {}); // non-blocking

      alert("Year work grades saved successfully.");
    } catch {
      alert("Failed to save grades.");
    } finally {
      setSaving(false);
    }
  };

  const ywMax = parseFloat(config?.year_work_max) || 40;

  return (
    <div className="ywe-page">
      <div className="ywe-header">
        <div>
          <h1>Year Work Entry</h1>
          <p>Enter attendance, quizzes, and midterm grades.</p>
        </div>
        <button className="ywe-save-btn" onClick={handleSave} disabled={saving || !selectedSection}>
          <FiSave /> {saving ? "Saving..." : "Save Grades"}
        </button>
      </div>

      <div className="ywe-picker-label">Select Section</div>
      <SectionPicker sections={sections} value={selectedSection} onChange={setSelectedSection} />

      <GradeConfigPanel sectionId={selectedSection} onConfigSaved={handleConfigSaved} />

      {!selectedSection ? null : loading ? (
        <div className="ywe-loading">Loading students...</div>
      ) : students.length === 0 ? (
        <div className="ywe-empty">No enrolled students found.</div>
      ) : (
        <div className="ywe-table-wrap">
          <table className="ywe-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Attendance / {config.attendance_max ?? 10}</th>
                {(config.quizzes || []).map((q, i) => (
                  <th key={i}>{q.label || `Quiz ${i + 1}`} / {q.max}</th>
                ))}
                <th>Midterm / {config.midterm_max ?? 20}</th>
                <th>Total / {ywMax}</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => {
                const total    = calcTotal(s);
                const isFailing = total < ywMax / 2;
                return (
                  <tr key={s.enrollmentId}>
                    <td className="ywe-id">{s.studentId}</td>
                    <td className="ywe-name">{s.name}</td>

                    <td className="ywe-center">
                      <input type="number" min={0} max={config.attendance_max ?? 10}
                        value={s.attendance} className="ywe-input"
                        onChange={(e) => handleChange(s.enrollmentId, "attendance", e.target.value)} />
                    </td>

                    {(config.quizzes || []).map((q, i) => (
                      <td key={i} className="ywe-center">
                        <input type="number" min={0} max={q.max}
                          value={s.quizValues?.[i] ?? ""} className="ywe-input"
                          onChange={(e) => handleQuizChange(s.enrollmentId, i, e.target.value)} />
                      </td>
                    ))}

                    <td className="ywe-center">
                      <input type="number" min={0} max={config.midterm_max ?? 20}
                        value={s.midterm} className="ywe-input"
                        onChange={(e) => handleChange(s.enrollmentId, "midterm", e.target.value)} />
                    </td>

                    <td className={`ywe-total ${isFailing ? "ywe-fail" : "ywe-pass"}`}>
                      {total}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
