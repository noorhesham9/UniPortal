import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FiChevronDown, FiChevronLeft, FiChevronRight, FiChevronUp,
  FiLogIn, FiMoreVertical, FiPlus, FiSearch, FiSlash,
  FiUserCheck, FiUsers, FiX,
} from "react-icons/fi";
import {
  assignAdvisor, getAdvisors, getUsers, impersonateUser,
} from "../../../../services/AdminServices";
import { startImpersonation } from "../../../../services/store/reducers/authSlice";
import api from "../../../../services/api";
import "./AdminUsers.css";

const LIMIT = 15;

const SORT_FIELDS = {
  name:       "Name",
  email:      "Email",
  createdAt:  "Joined",
};

const AdminUsers = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ── Table state ────────────────────────────────────────────────────────────
  const [users,      setUsers]      = useState([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page,       setPage]       = useState(1);
  const [loading,    setLoading]    = useState(false);

  // ── Filters / sort ─────────────────────────────────────────────────────────
  const [search,     setSearch]     = useState("");
  const [filterRole, setFilterRole] = useState("");      // "" | "student" | "professor"
  const [filterStatus, setFilterStatus] = useState(""); // "" | "active" | "inactive"
  const [sort,       setSort]       = useState("name");
  const [order,      setOrder]      = useState("asc");

  const searchRef   = useRef(null);
  const debounceRef = useRef(null);

  // ── Menus / modals ─────────────────────────────────────────────────────────
  const [openMenu,   setOpenMenu]   = useState(null);
  const menuRef = useRef(null);

  const [advisorModal,   setAdvisorModal]   = useState(null);
  const [advisors,       setAdvisors]       = useState([]);
  const [selectedAdvisor, setSelectedAdvisor] = useState("");
  const [assigning,      setAssigning]      = useState(false);

  const [deptModal,    setDeptModal]    = useState(null);
  const [departments,  setDepartments]  = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [assigningDept, setAssigningDept] = useState(false);

  const [createModal, setCreateModal] = useState(false);
  const [createForm,  setCreateForm]  = useState({ name: "", email: "", password: "", role: "professor", department: "" });
  const [creating,    setCreating]    = useState(false);
  const [createError, setCreateError] = useState("");

  const [impersonateLoading, setImpersonateLoading] = useState(null);

  // ── Close dropdown on outside click ───────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenu(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async (overridePage = page) => {
    setLoading(true);
    try {
      const data = await getUsers({
        role: filterRole, search, page: overridePage,
        limit: LIMIT, sort, order, status: filterStatus,
      });
      setUsers(data.users || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setPage(data.page || overridePage);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterRole, search, sort, order, filterStatus, page]);

  // Reset to page 1 when filters/sort change
  useEffect(() => {
    setPage(1);
    fetchUsers(1);
  }, [filterRole, filterStatus, sort, order]); // eslint-disable-line

  // Debounce search
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchUsers(1);
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [search]); // eslint-disable-line

  // Re-fetch when page changes (but not on filter changes — those reset to 1 above)
  useEffect(() => {
    fetchUsers(page);
  }, [page]); // eslint-disable-line

  // ── Sort toggle ────────────────────────────────────────────────────────────
  const handleSort = (field) => {
    if (sort === field) setOrder(o => o === "asc" ? "desc" : "asc");
    else { setSort(field); setOrder("asc"); }
  };

  const SortIcon = ({ field }) => {
    if (sort !== field) return <FiChevronDown size={12} style={{ opacity: 0.3 }} />;
    return order === "asc" ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />;
  };

  // ── Pagination helpers ─────────────────────────────────────────────────────
  const goTo = (p) => { if (p >= 1 && p <= totalPages) setPage(p); };

  const pageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i);
      else if (pages[pages.length - 1] !== "…") pages.push("…");
    }
    return pages;
  };

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleToggleActive = async (user) => {
    try {
      await api.patch(`/admin/users/${user._id}`, { is_active: !user.is_active });
      fetchUsers(page);
    } catch { alert("Failed to update user status."); }
  };

  const openAdvisorModal = async (user) => {
    setOpenMenu(null);
    setAdvisorModal({ studentId: user._id, studentName: user.name });
    setSelectedAdvisor(user.advisor?._id || "");
    if (!advisors.length) {
      try { setAdvisors(await getAdvisors()); } catch {}
    }
  };

  const openDeptModal = async (user) => {
    setOpenMenu(null);
    setDeptModal({ userId: user._id, userName: user.name });
    setSelectedDept(user.department?._id || "");
    if (!departments.length) {
      try {
        const r = await api.get("/departments");
        setDepartments(r.data.departments || r.data || []);
      } catch {}
    }
  };

  const handleAssign = async () => {
    setAssigning(true);
    try {
      await assignAdvisor(advisorModal.studentId, selectedAdvisor || null);
      setAdvisorModal(null);
      fetchUsers(page);
    } catch { alert("Failed to assign advisor."); }
    finally { setAssigning(false); }
  };

  const handleAssignDept = async () => {
    setAssigningDept(true);
    try {
      await api.patch(`/admin/users/${deptModal.userId}`, { department: selectedDept || null });
      setDeptModal(null);
      fetchUsers(page);
    } catch { alert("Failed to change department."); }
    finally { setAssigningDept(false); }
  };

  const handleImpersonate = async (user) => {
    setOpenMenu(null);
    setImpersonateLoading(user._id);
    try {
      const res = await impersonateUser(user._id);
      dispatch(startImpersonation(res.user));
      navigate("/dashboard");
    } catch { alert("Failed to impersonate user."); }
    finally { setImpersonateLoading(null); }
  };

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
      fetchUsers(1);
    } catch (err) {
      setCreateError(err.response?.data?.message || "Failed to create account.");
    } finally { setCreating(false); }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const from = total === 0 ? 0 : (page - 1) * LIMIT + 1;
  const to   = Math.min(page * LIMIT, total);

  return (
    <div className="admin-usr-container">
      <header className="admin-usr-header">
        <div className="admin-usr-title-group">
          <h1 className="admin-usr-title">User Management</h1>
          <p className="admin-usr-subtitle">Manage system access for Students, Faculty, and Staff</p>
        </div>
        <div className="admin-usr-actions">
          <button
            className="admin-btn-primary bg-blue-primary"
            onClick={() => {
              setCreateModal(true); setCreateError("");
              if (!departments.length) api.get("/departments").then(r => setDepartments(r.data.departments || [])).catch(() => {});
            }}
          >
            <FiPlus /> Add User
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="admin-stats-container">
        <div className="admin-stat-card">
          <span className="admin-usr-stat-label">TOTAL USERS</span>
          <div className="admin-stat-value">{total || "—"}</div>
        </div>
        <div className="admin-stat-card">
          <span className="admin-usr-stat-label">FACULTY</span>
          <div className="admin-stat-value">{users.filter(u => u.role?.name === "professor").length}</div>
        </div>
        <div className="admin-stat-card">
          <span className="admin-usr-stat-label">STUDENTS</span>
          <div className="admin-stat-value">{users.filter(u => u.role?.name === "student").length}</div>
        </div>
        <div className="admin-stat-card">
          <span className="admin-usr-stat-label">ACTIVE</span>
          <div className="admin-stat-value">
            <span className="admin-dot green" /> {users.filter(u => u.is_active).length}
          </div>
        </div>
      </div>

      <div className="admin-table-card">
        {/* Toolbar */}
        <div className="admin-usr-toolbar">
          {/* Search */}
          <div className="admin-usr-search-box">
            <FiSearch className="admin-usr-search-icon" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search by name, email, or ID…"
              className="admin-usr-search-input"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="admin-usr-clear-btn" onClick={() => setSearch("")}>
                <FiX size={13} />
              </button>
            )}
          </div>

          {/* Role filter */}
          <div className="admin-usr-filters">
            {[["", "All Users"], ["student", "Students"], ["professor", "Faculty"]].map(([val, label]) => (
              <button
                key={val}
                className={`admin-usr-filter-btn ${filterRole === val ? "active" : ""}`}
                onClick={() => setFilterRole(val)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <select
            className="admin-co-select"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Sort */}
          <select
            className="admin-co-select"
            value={`${sort}:${order}`}
            onChange={e => {
              const [s, o] = e.target.value.split(":");
              setSort(s); setOrder(o);
            }}
          >
            {Object.entries(SORT_FIELDS).flatMap(([field, label]) => [
              <option key={`${field}:asc`}  value={`${field}:asc`}>{label} ↑</option>,
              <option key={`${field}:desc`} value={`${field}:desc`}>{label} ↓</option>,
            ])}
          </select>
        </div>

        {/* Table */}
        <div className="admin-table-wrapper">
          <table className="admin-table admin-usr-table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => handleSort("name")}>
                  NAME <SortIcon field="name" />
                </th>
                <th>ROLE</th>
                <th className="sortable" onClick={() => handleSort("department")}>
                  DEPARTMENT <SortIcon field="department" />
                </th>
                <th>ADVISOR</th>
                <th className="sortable" onClick={() => handleSort("is_active")}>
                  STATUS <SortIcon field="is_active" />
                </th>
                <th style={{ textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="admin-loading">Loading…</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="6" className="admin-loading">No users found.</td></tr>
              ) : users.map((u) => {
                const isStudent = u.role?.name === "student";
                return (
                  <tr key={u._id}>
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
                        <button
                          className={`admin-usr-btn ${u.is_active ? "red" : "green-btn"}`}
                          onClick={() => handleToggleActive(u)}
                        >
                          <FiSlash size={13} />
                          {u.is_active ? "Deactivate" : "Activate"}
                        </button>
                        <div className="admin-usr-menu-wrap">
                          <button
                            className="admin-usr-btn admin-usr-dots-btn"
                            onClick={() => setOpenMenu(openMenu === u._id ? null : u._id)}
                          >
                            <FiMoreVertical size={16} />
                          </button>
                          {openMenu === u._id && (
                            <div className="admin-usr-dropdown">
                              <button className="admin-usr-dropdown-item" onClick={() => handleImpersonate(u)} disabled={impersonateLoading === u._id}>
                                <FiLogIn size={14} />
                                {impersonateLoading === u._id ? "Loading…" : "Impersonate"}
                              </button>
                              {isStudent && (
                                <button className="admin-usr-dropdown-item" onClick={() => openAdvisorModal(u)}>
                                  <FiUserCheck size={14} /> Assign Advisor
                                </button>
                              )}
                              <button className="admin-usr-dropdown-item" onClick={() => openDeptModal(u)}>
                                <FiUsers size={14} /> Change Department
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

        {/* Footer / Pagination */}
        <div className="admin-table-footer">
          <span className="admin-pagination-info">
            {total === 0 ? "No results" : `Showing ${from}–${to} of ${total} users`}
          </span>
          <div className="admin-pagination">
            <button className={`admin-page-btn ${page === 1 ? "disabled" : ""}`} onClick={() => goTo(page - 1)}>
              <FiChevronLeft />
            </button>
            {pageNumbers().map((n, i) =>
              n === "…"
                ? <span key={`e${i}`} className="admin-page-ellipsis">…</span>
                : <button key={n} className={`admin-page-btn ${page === n ? "active" : ""}`} onClick={() => goTo(n)}>{n}</button>
            )}
            <button className={`admin-page-btn ${page === totalPages ? "disabled" : ""}`} onClick={() => goTo(page + 1)}>
              <FiChevronRight />
            </button>
          </div>
        </div>
      </div>

      {/* ── Assign Advisor Modal ─────────────────────────────────────────────── */}
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
                {advisors.map(a => <option key={a._id} value={a._id}>{a.name} ({a.email})</option>)}
              </select>
            </div>
            <div className="admin-modal-footer">
              <button className="edit-dept-cancel" onClick={() => setAdvisorModal(null)}>Cancel</button>
              <button className="edit-dept-save" onClick={handleAssign} disabled={assigning}>{assigning ? "Saving…" : "Save"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Change Department Modal ──────────────────────────────────────────── */}
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
                {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div className="admin-modal-footer">
              <button className="edit-dept-cancel" onClick={() => setDeptModal(null)}>Cancel</button>
              <button className="edit-dept-save" onClick={handleAssignDept} disabled={assigningDept}>{assigningDept ? "Saving…" : "Save"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create Staff Modal ───────────────────────────────────────────────── */}
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
                { label: "Full Name *",  key: "name",     type: "text",     placeholder: "Dr. Ahmed Ali" },
                { label: "Email *",      key: "email",    type: "email",    placeholder: "ahmed@university.edu" },
                { label: "Password *",   key: "password", type: "password", placeholder: "Min. 6 characters" },
              ].map(({ label, key, type, placeholder }) => (
                <label key={key} style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.78rem", color: "#64748b", textTransform: "uppercase" }}>
                  {label}
                  <input type={type} placeholder={placeholder} value={createForm[key]}
                    onChange={e => setCreateForm(f => ({ ...f, [key]: e.target.value }))}
                    className="admin-modal-select" />
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
            </div>
            <div className="admin-modal-footer">
              <button className="edit-dept-cancel" onClick={() => setCreateModal(false)}>Cancel</button>
              <button className="edit-dept-save" onClick={handleCreateStaff} disabled={creating}>
                {creating ? "Creating…" : "Create & Send Email"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
