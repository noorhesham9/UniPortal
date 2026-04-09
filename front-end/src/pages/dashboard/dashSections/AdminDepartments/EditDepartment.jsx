import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getDepartments, updateDepartment } from "../../../../services/AdminServices";
import "./EditDepartment.css";
import { FiClock, FiInfo, FiUser } from "react-icons/fi";

const EditDepartment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    head_member: "",
    status: "Active",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchDept = async () => {
      setLoading(true);
      try {
        const depts = await getDepartments();
        const list = Array.isArray(depts) ? depts : (depts.departments || []);
        const found = list.find((d) => d._id === id);
        if (found) {
          setFormData({
            name: found.name || "",
            code: found.code || "",
            head_member: found.head_member || "",
            status: found.status || "Active",
            description: found.description || "",
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDept();
  }, [id]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDepartment(id, formData);
      navigate("/dashboard?section=admin_departments");
    } catch (error) {
      console.error("Failed to save department:", error);
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="admin-page-container">Loading...</div>;

  return (
    <div className="edit-dept-container">
      <div className="edit-dept-header">
        <h1 className="edit-dept-title">Edit Existing Department</h1>
        <p className="edit-dept-subtitle">Modify the core details and operational status for the department.</p>
      </div>

      <div className="edit-dept-card">
        <div className="edit-dept-grid">
          <div className="edit-dept-group">
            <label className="edit-dept-label">Department Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="edit-dept-input" />
          </div>
          <div className="edit-dept-group">
            <label className="edit-dept-label">Department Code</label>
            <input type="text" name="code" value={formData.code} onChange={handleChange} className="edit-dept-input" />
          </div>
          <div className="edit-dept-group">
            <label className="edit-dept-label">Head of Department</label>
            <input type="text" name="head_member" value={formData.head_member} onChange={handleChange} className="edit-dept-input" placeholder="e.g. Dr. Sarah Jones" />
          </div>
          <div className="edit-dept-group">
            <label className="edit-dept-label">Current Status</label>
            <div className="edit-dept-status-options">
              {["Active", "Inactive", "On Hold"].map((s) => (
                <label key={s} className="edit-dept-radio-label">
                  <input type="radio" name="status" value={s} checked={formData.status === s} onChange={handleChange} className="edit-dept-radio" />
                  <span className={`radio-custom ${s === "Active" ? "active" : "disabled"}`}></span>
                  {s}
                </label>
              ))}
            </div>
          </div>
          <div className="edit-dept-group full-width">
            <label className="edit-dept-label">Department Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="edit-dept-textarea" />
          </div>
        </div>

        <div className="edit-dept-actions">
          <button className="edit-dept-cancel" onClick={() => navigate("/dashboard?section=admin_departments")}>Cancel</button>
          <button className="edit-dept-save" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="edit-dept-meta-cards">
        <div className="edit-dept-meta-card">
          <div className="edit-dept-meta-icon"><FiClock /></div>
          <div>
            <div className="edit-dept-meta-label">LAST UPDATED</div>
            <div className="edit-dept-meta-value">{new Date().toLocaleDateString()}</div>
          </div>
        </div>
        <div className="edit-dept-meta-card">
          <div className="edit-dept-meta-icon yellow"><FiUser /></div>
          <div>
            <div className="edit-dept-meta-label">HEAD MEMBER</div>
            <div className="edit-dept-meta-value">{formData.head_member || "—"}</div>
          </div>
        </div>
        <div className="edit-dept-meta-card">
          <div className="edit-dept-meta-icon green"><FiInfo /></div>
          <div>
            <div className="edit-dept-meta-label">ID REFERENCE</div>
            <div className="edit-dept-meta-value">#{id?.slice(-6).toUpperCase() || "—"}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditDepartment;
