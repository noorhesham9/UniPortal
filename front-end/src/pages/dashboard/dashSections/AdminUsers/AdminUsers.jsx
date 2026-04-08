import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiSearch, FiX, FiUserCheck, FiLogIn } from "react-icons/fi";
import { getUsers, getAdvisors, assignAdvisor, impersonateUser } from "../../../../services/AdminServices";
import { startImpersonation } from "../../../../services/store/reducers/authSlice";
import "./AdminUsers.css";

const AdminUsers = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterRole, setFilterRole] = useState("All Users");
  const [impersonateLoading, setImpersonateLoading] = useState(null);

  // Advisor modal state
  const [advisorModal, setAdvisorModal] = useState(null);
  const [advisors, setAdvisors] = useState([]);
  const [selectedAdvisor, setSelectedAdvisor] = useState("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [filterRole]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const role = filterRole !== "All Users" ? filterRole.toLowerCase() : null;
      const data = await getUsers(role);
      setUsers(Array.isArray(data) ? data : (data.users || []));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openAdvisorModal = async (user) => {
    setAdvisorModal({ studentId: user._id, studentName: user.name, currentAdvisor: user.advisor });
    setSelectedAdvisor(user.advisor?._id || "");
    if (advisors.length === 0) {
      try {
        const data = await getAdvisors();
        setAdvisors(data);
      } catch (e) {
        console.error(e);
      }
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
      console.error(e);
      alert("Failed to assign advisor.");
    } finally {
      setAssigning(false);
    }
  };

  const handleImpersonate = async (user) => {
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

    return (
    <div className="admin-usr-container">
      <header className="admin-usr-header">
        <div className="admin-usr-title-group">
          <h1 className="admin-usr-title">User Management</h1>
          <p className="admin-usr-subtitle">Manage system access for Students, Faculty, and Staff</p>
        </div>
        <div className="admin-usr-actions">
          <button className="admin-btn-primary bg-blue-primary"><FiPlus /> Add User</button>
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
                      <div className="admin-usr-action-btns">
                        {isStudent && (
                          <button
                            className="admin-usr-btn blue"
                            onClick={() => openAdvisorModal(u)}
                          >
                            <FiUserCheck /> Assign Advisor
                          </button>
                        )}
                        <button
                          className="admin-usr-btn yellow"
                          onClick={() => handleImpersonate(u)}
                          disabled={impersonateLoading === u._id}
                        >
                          <FiLogIn /> {impersonateLoading === u._id ? "..." : "Impersonate"}
                        </button>
                        <button className="admin-usr-btn red">🚫 Inactivate</button>
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
              <label style={{ display: "block", fontSize: "0.8rem", color: "#a1a1aa", marginBottom: "0.5rem" }}>
                SELECT ADVISOR
              </label>
              <select
                value={selectedAdvisor}
                onChange={e => setSelectedAdvisor(e.target.value)}
                className="admin-modal-select"
              >
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
    </div>
  );
};

export default AdminUsers;
