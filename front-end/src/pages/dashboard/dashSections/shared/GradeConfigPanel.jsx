import { useEffect, useState } from "react";
import { FiPlus, FiTrash2, FiSave, FiSettings } from "react-icons/fi";
import api from "../../../../services/api";
import "./GradeConfigPanel.css";

const DEFAULT = {
  year_work_max: 40,
  final_max: 60,
  attendance_max: 0,
  midterm_max: 0,
  quizzes: [],
};

export default function GradeConfigPanel({ sectionId, onConfigSaved }) {
  const [open, setOpen] = useState(false);
  const [cfg, setCfg] = useState(DEFAULT);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!sectionId) return;
    api.get(`/grade-config/${sectionId}`)
      .then((r) => { if (r.data.config) setCfg({ ...DEFAULT, ...r.data.config }); else setCfg(DEFAULT); })
      .catch(() => {});
  }, [sectionId]);

  const setField = (k, v) => setCfg((c) => ({ ...c, [k]: v }));

  const addQuiz = () =>
    setCfg((c) => ({
      ...c,
      quizzes: [...c.quizzes, { label: `Quiz ${c.quizzes.length + 1}`, max: 10 }],
    }));

  const removeQuiz = (i) =>
    setCfg((c) => ({ ...c, quizzes: c.quizzes.filter((_, idx) => idx !== i) }));

  const setQuiz = (i, field, val) =>
    setCfg((c) => ({
      ...c,
      quizzes: c.quizzes.map((q, idx) => (idx === i ? { ...q, [field]: val } : q)),
    }));

  const quizTotal = cfg.quizzes.reduce((s, q) => s + (parseFloat(q.max) || 0), 0);
  const ywUsed = (parseFloat(cfg.attendance_max) || 0) + (parseFloat(cfg.midterm_max) || 0) + quizTotal;
  const ywMax = parseFloat(cfg.year_work_max) || 40;
  const overBudget = ywUsed > ywMax;

  const handleSave = async () => {
    if (overBudget) return;
    setSaving(true);
    try {
      await api.put(`/grade-config/${sectionId}`, cfg);
      onConfigSaved?.(cfg);
      setOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save config.");
    } finally {
      setSaving(false);
    }
  };

  if (!sectionId) return null;

  return (
    <div className="gcp-wrap">
      <button className="gcp-toggle-btn" onClick={() => setOpen((v) => !v)} type="button">
        <FiSettings /> Grade Structure
        <span className="gcp-badge">
          YW {ywMax} · Final {cfg.final_max}
        </span>
      </button>

      {open && (
        <div className="gcp-panel">
          <div className="gcp-panel-header">
            <h3>Grade Structure for this Section</h3>
            <p>Define max marks. Year Work = {ywMax} pts, Final = {cfg.final_max} pts.</p>
          </div>

          {/* Totals */}
          <div className="gcp-row">
            <label>Year Work Max
              <input type="number" min={1} max={100} value={cfg.year_work_max}
                onChange={(e) => setField("year_work_max", e.target.value)} />
            </label>
            <label>Final Exam Max
              <input type="number" min={1} max={100} value={cfg.final_max}
                onChange={(e) => setField("final_max", e.target.value)} />
            </label>
          </div>

          {/* Year work breakdown */}
          <div className="gcp-section-title">Year Work Breakdown</div>
          <div className="gcp-row">
            <label>Attendance Max
              <input type="number" min={0} value={cfg.attendance_max}
                onChange={(e) => setField("attendance_max", e.target.value)} />
            </label>
            <label>Midterm Max
              <input type="number" min={0} value={cfg.midterm_max}
                onChange={(e) => setField("midterm_max", e.target.value)} />
            </label>
          </div>

          {/* Quizzes */}
          <div className="gcp-section-title">
            Quizzes
            <button className="gcp-add-btn" onClick={addQuiz} type="button">
              <FiPlus /> Add Quiz
            </button>
          </div>

          {cfg.quizzes.map((q, i) => (
            <div key={i} className="gcp-quiz-row">
              <input
                className="gcp-quiz-label"
                value={q.label}
                onChange={(e) => setQuiz(i, "label", e.target.value)}
                placeholder={`Quiz ${i + 1}`}
              />
              <input
                type="number" min={1} className="gcp-quiz-max"
                value={q.max}
                onChange={(e) => setQuiz(i, "max", e.target.value)}
              />
              <span className="gcp-quiz-pts">pts</span>
              <button className="gcp-remove-btn" onClick={() => removeQuiz(i)} type="button">
                <FiTrash2 />
              </button>
            </div>
          ))}

          {/* Budget bar */}
          <div className="gcp-budget">
            <div className="gcp-budget-bar-bg">
              <div
                className={`gcp-budget-bar-fill ${overBudget ? "over" : ""}`}
                style={{ width: `${Math.min((ywUsed / ywMax) * 100, 100)}%` }}
              />
            </div>
            <span className={`gcp-budget-label ${overBudget ? "over" : ""}`}>
              {ywUsed} / {ywMax} pts used {overBudget ? "⚠ Over budget" : ""}
            </span>
          </div>

          <div className="gcp-footer">
            <button className="gcp-cancel-btn" onClick={() => setOpen(false)} type="button">Cancel</button>
            <button className="gcp-save-btn" onClick={handleSave} disabled={saving || overBudget} type="button">
              <FiSave /> {saving ? "Saving..." : "Save Config"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
