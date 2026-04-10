import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createDepartment } from "../../../../services/DepartmentServices";
import { getUsers } from "../../../../services/AdminServices";
import "./AddDepartment.css";

export default function AddDepartment() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    name_ar: "",
    code: "",
    head_member: "",
    head: "",
    description: "",
    status: "Active",
  });
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getUsers("professor")
      .then((data) => setProfessors(Array.isArray(data) ? data : (data.users || [])))
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleHeadChange = (e) => {
    const selectedId = e.target.value;
    const prof = professors.find((p) => p._id === selectedId);
    setFormData((prev) => ({
      ...prev,
      head: selectedId,
      head_member: prof ? prof.name : "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        name: formData.name,
        code: formData.code,
        description: formData.description,
        head_member: formData.head_member,
        head: formData.head || undefined,
        status: formData.status,
      };
      await createDepartment(payload);
      navigate("/dashboard?section=admin_departments");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create department.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dept-page-wrapper">
      <div className="dept-container">
        <button className="dept-back-btn" onClick={() => navigate("/dashboard?section=admin_departments")}>
          <span>&#8592;</span> Back to Department List
        </button>

        <header className="dept-header">
          <h1>Add New Department</h1>
          <p>
            Create a new academic or administrative unit. Ensure all required
            fields are filled to maintain system integrity.
          </p>
        </header>

        {error && (
          <div style={{ color: "#ef4444", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        <div className="dept-card">
          <form onSubmit={handleSubmit}>
            <div className="dept-form-row">
              <div className="dept-input-group">
                <label>Department Name (English) *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Faculty of Computer Science"
                  required
                />
              </div>
              <div className="dept-input-group rtl-text">
                <label>اسم القسم (بالعربية)</label>
                <input
                  dir="rtl"
                  type="text"
                  name="name_ar"
                  value={formData.name_ar}
                  onChange={handleChange}
                  placeholder="مثلاً كلية علوم الحاسب"
                />
              </div>
            </div>

            <div className="dept-form-row">
              <div className="dept-input-group">
                <label>Department Code *</label>
                <input
                  className="code-input"
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="E.G. CS-ADMIN-01"
                  required
                />
              </div>
              <div className="dept-input-group">
                <label>Head of Department</label>
                <select
                  name="head"
                  value={formData.head}
                  onChange={handleHeadChange}
                >
                  <option value="" disabled>Select Faculty Member</option>
                  {professors.map((p) => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="dept-input-group dept-full-width">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide a brief overview of the department's objectives and core functions..."
              />
            </div>

            <div className="dept-status-bar">
              <div className="status-label-box">
                <h3>Department Status</h3>
                <p>Control visibility and active operations for this department.</p>
              </div>
              <div className="status-control">
                <div
                  className={`dept-switch${formData.status === "Active" ? " is-active" : ""}`}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      status: prev.status === "Active" ? "Inactive" : "Active",
                    }))
                  }
                >
                  <div className="dept-knob" />
                </div>
                <span className="status-display">{formData.status}</span>
              </div>
            </div>

            <div className="dept-actions">
              <button type="submit" className="dept-btn-save" disabled={loading}>
                <span>+</span> {loading ? "Creating..." : "Create Department"}
              </button>
              <button
                type="button"
                className="dept-btn-cancel"
                onClick={() => navigate("/dashboard?section=admin_departments")}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
