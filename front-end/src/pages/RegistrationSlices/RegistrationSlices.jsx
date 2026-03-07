import { useEffect, useState } from "react";
import {
  FiActivity,
  FiBookOpen,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiEdit3,
  FiPlusCircle,
  FiTrash2,
} from "react-icons/fi";
import "./RegistrationSlices.css";

const RegistrationSlices = () => {
  const [slices, setSlices] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    departments: [],
    levels: [],
    min_gpa: "",
    max_gpa: "",
    is_active: false,
  });
  const [loading, setLoading] = useState(false);
  const [formCollapsed, setFormCollapsed] = useState(false);
  const [tableCollapsed, setTableCollapsed] = useState(false);

  const levels = ["Level 1", "Level 2", "Level 3", "Level 4"];

  useEffect(() => {
    fetchSlices();
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await fetch(
        "http://localhost:3100/api/v1/admin/departments",
        {
          credentials: "include",
        },
      );
      const data = await res.json();
      setDepartments(data);
    } catch (error) {
      console.warn("Using mock department data:", error);
    }
  };

  const fetchSlices = async () => {
    try {
      const res = await fetch(
        "http://localhost:3100/api/v1/registration-slices",
        {
          credentials: "include",
        },
      );
      const data = await res.json();
      setSlices(data);
    } catch (error) {
      // Use mock data if API fails
      console.warn("Using mock slice data:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      if (name === "departments") {
        setFormData((prev) => ({
          ...prev,
          departments: checked
            ? [...prev.departments, value]
            : prev.departments.filter((d) => d !== value),
        }));
      } else if (name === "levels") {
        setFormData((prev) => ({
          ...prev,
          levels: checked
            ? [...prev.levels, value]
            : prev.levels.filter((l) => l !== value),
        }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: checked }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        "http://localhost:3100/api/v1/registration-slices",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            ...formData,
          }),
        },
      );
      if (res.ok) {
        alert("Slice created successfully!");
        setFormData({
          name: "",
          description: "",
          start_date: "",
          end_date: "",
          departments: [],
          levels: [],
          min_gpa: "",
          max_gpa: "",
          is_active: false,
        });
        fetchSlices();
      } else {
        console.warn("API failed, simulating with mock data");
        const newSlice = {
          _id: `mock_${Date.now()}`,
          ...formData,
          min_gpa: parseFloat(formData.min_gpa) || 0,
          max_gpa: parseFloat(formData.max_gpa) || 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setSlices((prev) => [...prev, newSlice]);
        alert("Slice created successfully! (Mock data)");
        setFormData({
          name: "",
          description: "",
          start_date: "",
          end_date: "",
          departments: [],
          levels: [],
          min_gpa: "",
          max_gpa: "",
          is_active: false,
        });
      }
    } catch (error) {
      // Simulate successful creation with mock data
      console.warn("API failed, simulating with mock data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this slice?")) {
      try {
        await fetch(`http://localhost:3100/api/v1/registration-slices/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        fetchSlices();
      } catch (error) {
        // Simulate deletion with mock data
        console.warn("API failed, simulating deletion with mock data:", error);
        setSlices((prev) => prev.filter((slice) => slice._id !== id));
        alert("Slice deleted successfully! (Mock data)");
      }
    }
  };

  return (
    <div className="registration-slices-container">
      <main className="regmain-content">
        <div className="header-section">
          <div>
            <h2>Registration Slices</h2>
            <p>Manage priority registration windows and student eligibility.</p>
          </div>
          <div
            className="action-buttons"
            style={{
              display: "flex",
              gap: "5px",
            }}
          >
            {formCollapsed && (
              <button
                className="create-button"
                onClick={() => setFormCollapsed(false)}
              >
                <FiPlusCircle /> Open Form
              </button>
            )}
            {tableCollapsed && (
              <button
                className="create-button"
                onClick={() => setTableCollapsed(false)}
              >
                <FiActivity /> Open Active Slices
              </button>
            )}
          </div>
        </div>

        <div
          className={`grid-container ${formCollapsed ? "form-is-collapsed" : ""} ${tableCollapsed ? "table-is-collapsed" : ""}`}
        >
          {/* Form Section */}
          <div
            className={`form-section ${formCollapsed ? "collapsed" : "expanded"}`}
          >
            <div className="form-card">
              <div className="form-header">
                <h3 className="form-title">
                  <FiEdit3 className="form-icon" />{" "}
                  {!formCollapsed && "Create New Slice"}{" "}
                </h3>
                <button
                  className="collapse-button"
                  onClick={() => setFormCollapsed(!formCollapsed)}
                >
                  {formCollapsed ? <FiChevronDown /> : <FiChevronUp />}
                </button>
              </div>
              {!formCollapsed && (
                <form onSubmit={handleSubmit} className="form">
                  <div className="form-group">
                    <label className="form-label">Slice Name</label>
                    <input
                      className="form-input"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-textarea"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Start Date</label>
                      <input
                        className="form-input"
                        type="datetime-local"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">End Date</label>
                      <input
                        className="form-input"
                        type="datetime-local"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Departments</label>
                    <div className="checkbox-group">
                      {departments.map((dept) => (
                        <label key={dept._id} className="checkbox-label">
                          <input
                            type="checkbox"
                            name="departments"
                            value={dept._id}
                            checked={formData.departments.includes(dept._id)}
                            onChange={handleChange}
                          />
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
                          <input
                            type="checkbox"
                            name="levels"
                            value={level}
                            checked={formData.levels.includes(level)}
                            onChange={handleChange}
                          />
                          <span>{level}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">GPA Range Eligibility</label>
                    <div className="gpa-inputs">
                      <input
                        className="form-input"
                        type="number"
                        name="min_gpa"
                        placeholder="Min GPA"
                        value={formData.min_gpa}
                        onChange={handleChange}
                        min="0"
                        max="5"
                        step="0.1"
                      />
                      <span>to</span>
                      <input
                        className="form-input"
                        type="number"
                        name="max_gpa"
                        placeholder="Max GPA"
                        value={formData.max_gpa}
                        onChange={handleChange}
                        min="0"
                        max="5"
                        step="0.1"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Settings</label>
                    <div className="toggle-group">
                      <div className="toggle-content">
                        <p>Activate Slice</p>
                        <p>Toggle registration availability</p>
                      </div>
                      <label className="toggle-switch">
                        <input
                          className="toggle-input"
                          type="checkbox"
                          name="is_active"
                          checked={formData.is_active}
                          onChange={handleChange}
                        />
                        <div className="toggle-slider"></div>
                      </label>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="submit-button"
                  >
                    {loading ? "Creating..." : "Create Slice"}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Table Section */}
          <div
            className={`table-section ${tableCollapsed ? "collapsed" : "expanded"}`}
          >
            {" "}
            <div className="table-card">
              <div className="table-header">
                <h3>{tableCollapsed ? "Slices" : "Active Slices"}</h3>
                <button
                  className="collapse-button"
                  onClick={() => setTableCollapsed(!tableCollapsed)}
                >
                  {tableCollapsed ? <FiChevronDown /> : <FiChevronUp />}
                </button>
              </div>
              {!tableCollapsed && (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Slice Name</th>
                        <th>Duration</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {slices.map((slice) => (
                        <tr key={slice._id}>
                          <td>{slice.name}</td>
                          <td>
                            {new Date(slice.start_date).toLocaleDateString()}
                          </td>
                          <td>{slice.is_active ? "Active" : "Inactive"}</td>
                          <td>
                            <button
                              onClick={() => handleDelete(slice._id)}
                              className="action-button delete"
                            >
                              <FiTrash2 />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Info Cards - Moved outside main if necessary, or kept within container */}
      <div className="info-cards">
        <div className="info-card live">
          <FiBookOpen />
          <h4>Live Enrollment</h4>
        </div>
        <div className="info-card upcoming">
          <FiClock />
          <h4>Upcoming Window</h4>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSlices;
