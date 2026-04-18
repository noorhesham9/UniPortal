import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiSearch, FiX, FiUserCheck, FiLogIn, FiMoreVertical, FiSlash, FiUsers } from "react-icons/fi";
import { getUsers, getAdvisors, assignAdvisor, impersonateUser } from "../../../../services/AdminServices";
import { startImpersonation } from "../../../../services/store/reducers/authSlice";
import api from "../../../../services/api";
import "./AdminUsers.css";

const AdminUsers = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterRole, setFilterRole] = useState("All Users");
  const [impersonateLoading, setImpersonateLoading] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const menuRef = useRef(null);

  // Advisor modal state
  const [advisorModal, setAdvisorModal] = useState(null);
  const [advisors, setAdvisors] = useState([]);
  const [selectedAdvisor, setSelectedAdvisor] = useState("");
  const [assigning, setAssigning] = useState(false);

  // Create staff modal
  const [createModal, setCreateModal] = useState(false);
  const [createForm, setCreateForm]   = useState({ name: "", email: "", password: "", role: "professor", department: "" });
  const [creating, setCreating]       = useState(false);
  const [createError, setCreateError] = useState("");
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [assigningDept, setAssigningDept] = useState(false);

  // Department modal state
  const [deptModal, setDeptModal] = useState(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => { fetchUsers(); }, [filterRole]); // eslint-disable-line

  const handleCreateStaff = async () => {
    setCreateError("");
    const { name, email, password, role, department } = createForm;
    if (!name || !email || !password) { setCreateError("All fields are required."); return; }
    if (password.length < 6) { setCreateError("Password must be at least 6 characters."); return; }
    setCreating(true);
    try {
      await api.post("/admin/create-staff", { name, email, password, role, department: department || undefined });
      setCreateModal(false);
      setCreateForm({ name: "", email: "", password: "", role: "professor", department: "" });
      fetchUsers();
    } catch (err) {
      setCreateError(err.response?.data?.message || "Failed to create account.");
    } finally {
      setCreating(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const roleMap = { "Students": "student", "Faculty": "professor" };
      const role = roleMap[filterRole] || null;
      const data = await getUsers(role);
      setUsers(Array.isArray(data) ? data : (data.users || []));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openAdvisorModal = async (user) => {
    setOpenMenu(null);
    setAdvisorModal({ studentId: user._id, studentName: user.name, currentAdvisor: user.advisor });
    setSelectedAdvisor(user.advisor?._id || "");
    if (advisors.length === 0) {
      try {
        const data = await getAdvisors();
        setAdvisors(data);
      } catch (e) { console.error(e); }
    }
  };

  const openDeptModal = async (user) => {
    setOpenMenu(null);
    setDeptModal({ userId: user._id, userName: user.name, currentDept: user.department?._id });
    setSelectedDept(user.department?._id || "");
    if (departments.length === 0) {
      try {
        const res = await api.get("/departments");
        setDepartments(res.data.departments || res.data || []);
      } catch (e) { console.error(e); }
    }
  };

  const handleAssign = async () => {
    if (!advisorModal) return;
    setAssigning(true);
    try {
      await assignAdvisor(advisorModal.studentId, selectedAdvisor || null);
      setAdvisorModal(null);
      fetchUsers();
    } catch (e) {
      alert("Failed to assign advisor.");
    } finally {
      setAssigning(false);
    }
  };

  const handleAssignDept = async () => {
    if (!deptModal) return;
    setAssigningDept(true);
    try {
      await api.patch(`/admin/users/${deptModal.userId}`, { department: selectedDept || null });
      setDeptModal(null);
      fetchUsers();
    } catch (e) {
      alert("Failed to change department.");
    } finally {
      setAssigningDept(false);
    }
  };

  const handleImpersonate = async (user) => {
    setOpenMenu(null);
    setImpersonateLoading(user._id);
    try {
      const res = await impersonateUser(user._id);
      dispatch(startImpersonation(res.user));
      navigate("/dashboard");
    } catch (e) {
      alert("Failed to impersonate user.");
    } finally {
      setImpersonateLoading(null);
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await api.patch(`/admin/users/${user._id}`, { is_active: !user.is_active });
      fetchUsers();
    } catch (e) {
      alert("Failed to update user status.");
    }
  };

  return (
    <div className="admin-usr-container">
      <header className="admin-usr-header">
        <div className="admin-usr-title-group">
          <h1 className="admin-usr-title">User Management</h1>
          <p className="admin-usr-subtitle">Manage system access for Students, Faculty, and Staff</p>
        </div>
        <div className="admin-usr-actions">
          <button className="admin-btn-primary bg-blue-primary" onClick={() => { setCreateModal(true); setCreateError(""); if (!departments.length) api.get("/departments").then(r => setDepartments(r.data.departments || [])).catch(() => {}); }}><FiPlus /> Add User</button>
        </div>
      </header>

      <div className="admin-stats-container">
        <div className="admin-stat-card">
          <span className="admin-usr-stat-label">TOTAL USERS</span>
          <div className="admin-stat-value">{users.length || "—"}</div>
        </div>
        <div className="admin-stat-card">
          <span className="admin-usr-stat-label">FACULTY</span>
          <div className="admin-stat-value">{users.filter(u => u.role?.name === "professor").length || "—"}</div>
        </div>
        <div className="admin-stat-card">
          <span className="admin-usr-stat-label">STUDENTS</span>
          <div className="admin-stat-value">{users.filter(u => u.role?.name === "student").length || "—"}</div>
        </div>
        <div className="admin-stat-card">
          <span className="admin-usr-stat-label">ACTIVE</span>
          <div className="admin-stat-value">
            <span className="admin-dot green"></span> {users.filter(u => u.is_active).length || "—"}
          </div>
        </div>
      </div>

      <div className="admin-table-card">
        <div className="admin-usr-toolbar">
          <div className="admin-usr-search-box">
            <FiSearch className="admin-usr-search-icon" />
            <input type="text" placeholder="Search by name, department, or role..." className="admin-usr-search-input" />
          </div>
          <div className="admin-usr-filters">
            {["All Users", "Students", "Faculty"].map(f => (
              <button
                key={f}
                className={`admin-usr-filter-btn ${filterRole === f ? "active" : ""}`}
                onClick={() => setFilterRole(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table admin-usr-table">
            <thead>
              <tr>
                <th>NAME</th>
                <th>ROLE</th>
                <th>DEPARTMENT</th>
                <th>ADVISOR</th>
                <th>STATUS</th>
                <th style={{ textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="admin-loading">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="6" className="admin-loading">No users found.</td></tr>
              ) : users.map((u, i) => {
                const isStudent = u.role?.name === "student";
                return (
                  <tr key={u._id || i}>
                    <td>
                      <div className="admin-bold-text">{u.name}</div>
                      <div className="admin-co-meta">{u.email}</div>
                    </td>
                    <td>
                      <span className={`admin-usr-role-badge ${isStudent ? "outline-blue" : "outline-yellow"}`}>
                        {u.role?.name || "—"}
                      </span>
                    </td>
                    <td>{u.department?.name || "—"}</td>
                    <td>
                      {isStudent ? (
                        <span style={{ fontSize: "0.8rem", color: u.advisor ? "#10b981" : "#a1a1aa" }}>
                          {u.advisor?.name || "Unassigned"}
                        </span>
                      ) : "—"}
                    </td>
                    <td>
                      <span className={`admin-rm-status-text ${u.is_active ? "green" : "gray"}`}>
                        ● {u.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="admin-usr-action-btns" ref={openMenu === u._id ? menuRef : null}>
                        {/* Inactive / Active toggle button */}
                        <button
                          className={`admin-usr-btn ${u.is_active ? "red" : "green-btn"}`}
                          onClick={() => handleToggleActive(u)}
                          title={u.is_active ? "Deactivate user" : "Activate user"}
                        >
                          <FiSlash size={13} />
                          {u.is_active ? "Inactive" : "Activate"}
                        </button>

                        {/* 3-dot menu */}
                        <div className="admin-usr-menu-wrap">
                          <button
                            className="admin-usr-btn admin-usr-dots-btn"
                            onClick={() => setOpenMenu(openMenu === u._id ? null : u._id)}
                          >
                            <FiMoreVertical size={16} />
                          </button>

                          {openMenu === u._id && (
                            <div className="admin-usr-dropdown">
                              <button
                                className="admin-usr-dropdown-item"
                                onClick={() => handleImpersonate(u)}
                                disabled={impersonateLoading === u._id}
                              >
                                <FiLogIn size={14} />
                                {impersonateLoading === u._id ? "Loading..." : "Impersonate"}
                              </button>

                              {isStudent && (
                                <button
                                  className="admin-usr-dropdown-item"
                                  onClick={() => openAdvisorModal(u)}
                                >
                                  <FiUserCheck size={14} />
                                  Assign Advisor
                                </button>
                              )}

                              <button
                                className="admin-usr-dropdown-item"
                                onClick={() => openDeptModal(u)}
                              >
                                <FiUsers size={14} />
                                Change Department
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="admin-table-footer">
          <span>Showing {users.length} users</span>
        </div>
      </div>

      {/* Assign Advisor Modal */}
      {advisorModal && (
        <div className="admin-modal-overlay" onClick={() => setAdvisorModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Assign Advisor</h3>
              <button className="admin-modal-close" onClick={() => setAdvisorModal(null)}><FiX /></button>
            </div>
            <div className="admin-modal-body">
              <p style={{ color: "#a1a1aa", fontSize: "0.875rem", marginBottom: "1rem" }}>
                Student: <strong style={{ color: "#f1f5f9" }}>{advisorModal.studentName}</strong>
              </p>
              <label style={{ display: "block", fontSize: "0.8rem", color: "#a1a1aa", marginBottom: "0.5rem" }}>SELECT ADVISOR</label>
              <select value={selectedAdvisor} onChange={e => setSelectedAdvisor(e.target.value)} className="admin-modal-select">
                <option value="">— Remove advisor —</option>
                {advisors.map(a => (
                  <option key={a._id} value={a._id}>{a.name} ({a.email})</option>
                ))}
              </select>
            </div>
            <div className="admin-modal-footer">
              <button className="edit-dept-cancel" onClick={() => setAdvisorModal(null)}>Cancel</button>
              <button className="edit-dept-save" onClick={handleAssign} disabled={assigning}>
                {assigning ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Department Modal */}
      {deptModal && (
        <div className="admin-modal-overlay" onClick={() => setDeptModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Change Department</h3>
              <button className="admin-modal-close" onClick={() => setDeptModal(null)}><FiX /></button>
            </div>
            <div className="admin-modal-body">
              <p style={{ color: "#a1a1aa", fontSize: "0.875rem", marginBottom: "1rem" }}>
                User: <strong style={{ color: "#f1f5f9" }}>{deptModal.userName}</strong>
              </p>
              <label style={{ display: "block", fontSize: "0.8rem", color: "#a1a1aa", marginBottom: "0.5rem" }}>SELECT DEPARTMENT</label>
              <select value={selectedDept} onChange={e => setSelectedDept(e.target.value)} className="admin-modal-select">
                <option value="">— No department —</option>
                {departments.map(d => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="admin-modal-footer">
              <button className="edit-dept-cancel" onClick={() => setDeptModal(null)}>Cancel</button>
              <button className="edit-dept-save" onClick={handleAssignDept} disabled={assigningDept}>
                {assigningDept ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Staff Modal */}
      {createModal && (
        <div className="admin-modal-overlay" onClick={() => setCreateModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Create New Account</h3>
              <button className="admin-modal-close" onClick={() => setCreateModal(false)}><FiX /></button>
            </div>
            <div className="admin-modal-body" style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {createError && <p style={{ color: "#ef4444", fontSize: "0.82rem", margin: 0 }}>{createError}</p>}
              {[
                { label: "Full Name *", key: "name", type: "text", placeholder: "Dr. Ahmed Ali" },
                { label: "Email *", key: "email", type: "email", placeholder: "ahmed@university.edu" },
                { label: "Password *", key: "password", type: "password", placeholder: "Min. 6 characters" },
              ].map(({ label, key, type, placeholder }) => (
                <label key={key} style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.78rem", color: "#64748b", textTransform: "uppercase" }}>
                  {label}
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={createForm[key]}
                    onChange={e => setCreateForm(f => ({ ...f, [key]: e.target.value }))}
                    className="admin-modal-select"
                  />
                </label>
              ))}
              <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.78rem", color: "#64748b", textTransform: "uppercase" }}>
                Role *
                <select value={createForm.role} onChange={e => setCreateForm(f => ({ ...f, role: e.target.value }))} className="admin-modal-select">
                  <option value="professor">Professor</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.78rem", color: "#64748b", textTransform: "uppercase" }}>
                Department (optional)
                <select value={createForm.department} onChange={e => setCreateForm(f => ({ ...f, department: e.target.value }))} className="admin-modal-select">
                  <option value="">— None —</option>
                  {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </label>
              <p style={{ fontSize: "0.75rem", color: "#475569", margin: 0 }}>
                Credentials will be sent automatically to the email above.
              </p>
            </div>
            <div className="admin-modal-footer">
              <button className="edit-dept-cancel" onClick={() => setCreateModal(false)}>Cancel</button>
              <button className="edit-dept-save" onClick={handleCreateStaff} disabled={creating}>
                {creating ? "Creating..." : "Create & Send Email"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;