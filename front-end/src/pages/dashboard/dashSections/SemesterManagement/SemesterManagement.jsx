import { useEffect, useState } from "react";
import { FiCheck, FiEye, FiEyeOff, FiCalendar, FiPlus, FiX } from "react-icons/fi";
import api from "../../../../services/api";
import "./SemesterManagement.css";

export default function SemesterManagement() {
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    term: "Fall",
    start_date: "",
    end_date: "",
    add_drop_start: "",
    add_drop_end: "",
    max_credits_rules: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSemesters();
  }, []);

  const loadSemesters = () => {
    setLoading(true);
    api.get("/semesters")
      .then((r) => setSemesters(r.data.semesters || []))
      .catch(() => alert("Failed to load semesters"))
      .finally(() => setLoading(false));
  };

  const handleSetActive = async (semesterId) => {
    try {
      await api.patch(`/semesters/${semesterId}/activate`);
      loadSemesters();
    } catch {
      alert("Failed to set active semester");
    }
  };

  const handleToggleResults = async (semesterId, currentValue) => {
    try {
      await api.patch(`/semesters/${semesterId}/toggle-results`, {
        show_final_results: !currentValue,
      });
      loadSemesters();
    } catch {
      alert("Failed to toggle final results");
    }
  };

  const handleCreateSemester = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/semesters", formData);
      alert("Semester created successfully!");
      setShowModal(false);
      setFormData({
        year: new Date().getFullYear(),
        term: "Fall",
        start_date: "",
        end_date: "",
        add_drop_start: "",
        add_drop_end: "",
        max_credits_rules: "",
      });
      loadSemesters();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create semester");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="sm-loading">Loading semesters...</div>;

  const activeSemester = semesters.find((s) => s.is_active);

  return (
    <div className="sm-page">
      <div className="sm-header">
        <div>
          <h1>Semester Management</h1>
          <p>Control active semester and final results visibility</p>
        </div>
        <button className="sm-create-btn" onClick={() => setShowModal(true)}>
          <FiPlus /> Create New Semester
        </button>
      </div>

      {activeSemester && (
        <div className="sm-active-card">
          <FiCalendar size={24} />
          <div>
            <h3>Current Active Semester</h3>
            <p>{activeSemester.term} {activeSemester.year}</p>
          </div>
          <span className={`sm-results-badge ${activeSemester.show_final_results ? "sm-visible" : "sm-hidden"}`}>
            {activeSemester.show_final_results ? (
              <><FiEye size={14} /> Results Visible</>
            ) : (
              <><FiEyeOff size={14} /> Results Hidden</>
            )}
          </span>
        </div>
      )}

      <div className="sm-table-wrap">
        <table className="sm-table">
          <thead>
            <tr>
              <th>Term</th>
              <th>Year</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Final Results</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {semesters.map((s) => (
              <tr key={s._id} className={s.is_active ? "sm-row-active" : ""}>
                <td className="sm-term">{s.term}</td>
                <td>{s.year}</td>
                <td>{new Date(s.start_date).toLocaleDateString()}</td>
                <td>{new Date(s.end_date).toLocaleDateString()}</td>
                <td>
                  {s.is_active ? (
                    <span className="sm-badge sm-badge-active">
                      <FiCheck size={12} /> Active
                    </span>
                  ) : (
                    <span className="sm-badge sm-badge-inactive">Inactive</span>
                  )}
                </td>
                <td>
                  <button
                    className={`sm-toggle-btn ${s.show_final_results ? "sm-toggle-on" : "sm-toggle-off"}`}
                    onClick={() => handleToggleResults(s._id, s.show_final_results)}
                  >
                    {s.show_final_results ? <FiEye size={14} /> : <FiEyeOff size={14} />}
                    {s.show_final_results ? "Visible" : "Hidden"}
                  </button>
                </td>
                <td>
                  {!s.is_active && (
                    <button
                      className="sm-activate-btn"
                      onClick={() => handleSetActive(s._id)}
                    >
                      Set Active
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Semester Modal */}
      {showModal && (
        <div className="sm-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="sm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sm-modal-header">
              <h2>Create New Semester</h2>
              <button className="sm-modal-close" onClick={() => setShowModal(false)}>
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSemester} className="sm-form">
              <div className="sm-form-row">
                <div className="sm-form-group">
                  <label>Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    required
                    min="2020"
                    max="2100"
                  />
                </div>

                <div className="sm-form-group">
                  <label>Term</label>
                  <select
                    value={formData.term}
                    onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                    required
                  >
                    <option value="Fall">Fall</option>
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                  </select>
                </div>
              </div>

              <div className="sm-form-row">
                <div className="sm-form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>

                <div className="sm-form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="sm-form-row">
                <div className="sm-form-group">
                  <label>Add/Drop Start</label>
                  <input
                    type="date"
                    value={formData.add_drop_start}
                    onChange={(e) => setFormData({ ...formData, add_drop_start: e.target.value })}
                    required
                  />
                </div>

                <div className="sm-form-group">
                  <label>Add/Drop End</label>
                  <input
                    type="date"
                    value={formData.add_drop_end}
                    onChange={(e) => setFormData({ ...formData, add_drop_end: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="sm-form-group">
                <label>Max Credits Rules (Optional)</label>
                <textarea
                  value={formData.max_credits_rules}
                  onChange={(e) => setFormData({ ...formData, max_credits_rules: e.target.value })}
                  placeholder="e.g., Maximum 18 credits per semester"
                  rows="3"
                />
              </div>

              <div className="sm-form-actions">
                <button type="button" className="sm-btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="sm-btn-submit" disabled={saving}>
                  {saving ? "Creating..." : "Create Semester"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
