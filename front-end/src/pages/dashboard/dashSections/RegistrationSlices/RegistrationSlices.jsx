import { useEffect, useState } from "react";
import {
  FiActivity,
  FiBookOpen,
  FiClock,
  FiEdit3,
  FiLock,
  FiPlusCircle,
  FiTrash2,
  FiUnlock,
  FiX,
} from "react-icons/fi";
import { getDepartments } from "../../../../services/AdminServices";
import { getSlices, createSlice, deleteSlice, updateSlice } from "../../../../services/RegistrationSliceServices";
import "./RegistrationSlices.css";

const RegistrationSlices = () => {
  const [slices, setSlices]           = useState([]);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    name: "", description: "", start_date: "", end_date: "",
    departments: [], levels: [], min_gpa: "", max_gpa: "", is_active: false,
  });
  const [loading, setLoading]     = useState(false);
  const [showForm, setShowForm]   = useState(true);
  const [showTable, setShowTable] = useState(true);

  const levels = ["1", "2", "3", "4"];

  useEffect(() => {
    fetchSlices();
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const data = await getDepartments();
      const list = Array.isArray(data) ? data : (data.departments || []);
      setDepartments(list);
    } catch {}
  };

  const fetchSlices = async () => {
    try {
      const data = await getSlices();
      setSlices(Array.isArray(data) ? data : []);
    } catch {}
  };

  const handleToggleActive = async (slice) => {
    try {
      await updateSlice(slice._id, { is_active: !slice.is_active });
      fetchSlices();
    } catch {}
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      if (name === "departments") {
        setFormData((prev) => ({
          ...prev,
          departments: checked ? [...prev.departments, value] : prev.departments.filter((d) => d !== value),
        }));
      } else if (name === "levels") {
        setFormData((prev) => ({
          ...prev,
          levels: checked ? [...prev.levels, value] : prev.levels.filter((l) => l !== value),
        }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: checked }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () =>
    setFormData({ name: "", description: "", start_date: "", end_date: "", departments: [], levels: [], min_gpa: "", max_gpa: "", is_active: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createSlice(formData);
      resetForm();
      fetchSlices();
    } catch {}
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this slice?")) return;
    try {
      await deleteSlice(id);
      fetchSlices();
    } catch {}
  };

  return (
    <div className="registration-slices-container">
      <main className="regmain-content">
        <div className="header-section">
          <div>
            <h2>Registration Slices</h2>
            <p>Manage priority registration windows and student eligibility.</p>
          </div>
          <div className="action-buttons">
            {!showForm && (
              <button className="create-button" onClick={() => setShowForm(true)}>
                <FiPlusCircle /> Create Slice
              </button>
            )}
            {!showTable && (
              <button className="create-button" onClick={() => setShowTable(true)}>
                <FiActivity /> View Slices
              </button>
            )}
          </div>
        </div>

        <div className={`grid-container ${!showForm ? "form-is-collapsed" : ""} ${!showTable ? "table-is-collapsed" : ""}`}>
          {/* Form */}
          <div className={`form-section ${showForm ? "panel-visible" : "panel-hidden"}`}>
            <div className="form-card">
              <div className="form-header">
                <h3 className="form-title"><FiEdit3 className="form-icon" /> Create New Slice</h3>
                <button className="collapse-button" onClick={() => setShowForm(false)}><FiX /></button>
              </div>
              <form onSubmit={handleSubmit} className="form">
                <div className="form-group">
                  <label className="form-label">Slice Name</label>
                  <input className="form-input" type="text" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" name="description" value={formData.description} onChange={handleChange} />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input className="form-input" type="datetime-local" name="start_date" value={formData.start_date} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input className="form-input" type="datetime-local" name="end_date" value={formData.end_date} onChange={handleChange} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Departments</label>
                  <div className="checkbox-group">
                    {departments.map((dept) => (
                      <label key={dept._id} className="checkbox-label">
                        <input type="checkbox" name="departments" value={dept._id} checked={formData.departments.includes(dept._id)} onChange={handleChange} className="checkbox-input" />
                        <span>{dept.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Academic Levels</label>
                  <div className="levels-grid">
                    {levels.map((level) => (
                      <label key={level} className="checkbox-label">
                        <input type="checkbox" name="levels" value={level} checked={formData.levels.includes(level)} onChange={handleChange} className="checkbox-input" />
                        <span>Level {level}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">GPA Range</label>
                  <div className="gpa-inputs">
                    <input className="form-input" type="number" name="min_gpa" placeholder="Min GPA" value={formData.min_gpa} onChange={handleChange} min="0" max="5" step="0.1" />
                    <span>to</span>
                    <input className="form-input" type="number" name="max_gpa" placeholder="Max GPA" value={formData.max_gpa} onChange={handleChange} min="0" max="5" step="0.1" />
                  </div>
                </div>
                <div className="form-group">
                  <div className="toggle-group">
                    <div className="toggle-content">
                      <p>Activate on Create</p>
                      <p>Toggle registration availability</p>
                    </div>
                    <label className="toggle-switch">
                      <input className="toggle-input" type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} />
                      <div className="toggle-slider"></div>
                    </label>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="submit-button">
                  {loading ? "Creating..." : "Create Slice"}
                </button>
              </form>
            </div>
          </div>

          {/* Table */}
          <div className={`table-section ${showTable ? "panel-visible" : "panel-hidden"}`}>
            <div className="table-card">
              <div className="table-header">
                <div className="table-title-section">
                  <h3>Registration Slices</h3>
                  <div className="status-indicator">
                    <span className="status-dot"></span>
                    <span className="status-text">{slices.filter((s) => s.is_active).length} active</span>
                  </div>
                </div>
                <button className="collapse-button" onClick={() => setShowTable(false)}><FiX /></button>
              </div>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Slice Name</th>
                      <th>Duration</th>
                      <th>Eligibility</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slices.length === 0 ? (
                      <tr><td colSpan="5" style={{ textAlign: "center", color: "#a1a1aa", padding: "2rem" }}>No slices yet</td></tr>
                    ) : slices.map((slice) => (
                      <tr key={slice._id}>
                        <td>
                          <div className="slice-name">{slice.name}</div>
                          {slice.description && <div className="slice-description">{slice.description}</div>}
                        </td>
                        <td className="duration">
                          {new Date(slice.start_date).toLocaleDateString()}
                          <span> → {new Date(slice.end_date).toLocaleDateString()}</span>
                        </td>
                        <td>
                          <div className="slice-description">
                            {slice.levels?.length > 0 && <span>Levels: {slice.levels.join(", ")} </span>}
                            {slice.departments?.length > 0 && <span>· {slice.departments.length} dept(s)</span>}
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${slice.is_active ? "status-active" : "status-inactive"}`}>
                            <span className={`status-dot-small ${slice.is_active ? "status-dot-active" : "status-dot-inactive"}`}></span>
                            {slice.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <div className="actions">
                            <button
                              onClick={() => handleToggleActive(slice)}
                              className={`action-button ${slice.is_active ? "deactivate" : "activate"}`}
                              title={slice.is_active ? "Deactivate" : "Activate"}
                            >
                              {slice.is_active ? <FiLock /> : <FiUnlock />}
                            </button>
                            <button onClick={() => handleDelete(slice._id)} className="action-button delete">
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="info-cards">
        <div className="info-card live">
          <div className="info-icon"><FiBookOpen /></div>
          <div className="info-content">
            <h4>Live Enrollment</h4>
            <p>{slices.filter((s) => s.is_active).length} active slice(s) running</p>
          </div>
        </div>
        <div className="info-card upcoming">
          <div className="info-icon"><FiClock /></div>
          <div className="info-content">
            <h4>Upcoming Windows</h4>
            <p>{slices.filter((s) => !s.is_active).length} inactive slice(s)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSlices;
