import { useEffect, useState, useCallback } from "react";
import { FiPlus, FiSearch, FiChevronUp, FiChevronDown, FiMoreVertical } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { getDepartments } from "../../../../services/AdminServices";
import "./AdminDepartments.css";

const LIMIT = 10;

const SortIcon = ({ field, sortBy, order }) => {
  if (sortBy !== field) return <span className="sort-icon neutral">⇅</span>;
  return order === "asc" ? <FiChevronUp className="sort-icon" /> : <FiChevronDown className="sort-icon" />;
};

const AdminDepartments = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [counts, setCounts] = useState({ Active: 0, Inactive: 0, "On Hold": 0 });
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDepartments({ page, limit: LIMIT, search, status, sortBy, order });
      setDepartments(res.departments || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
      if (res.counts) setCounts(res.counts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, status, sortBy, order]);

  useEffect(() => { fetchDepartments(); }, [fetchDepartments]);

  const handleSort = (field) => {
    if (sortBy === field) setOrder((o) => (o === "asc" ? "desc" : "asc"));
    else { setSortBy(field); setOrder("asc"); }
    setPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleStatusFilter = (e) => {
    setStatus(e.target.value);
    setPage(1);
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="admin-page-container">
      <header className="admin-page-header">
        <div className="admin-page-title-group">
          <span className="admin-page-sup">SYSTEM OVERVIEW</span>
          <h1 className="admin-page-title">Academic Departments</h1>
          <p className="admin-page-subtitle">Configure and manage administrative divisions across the university system.</p>
        </div>
        <div className="admin-page-actions">
          <button className="admin-btn-primary" onClick={() => navigate("/dashboard?section=Add_Department")}>
            <FiPlus /> Add New Department
          </button>
        </div>
      </header>

      <div className="admin-stats-container">
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <div className="admin-stat-icon" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>🏛️</div>
          </div>
          <div className="admin-stat-label">Total Depts</div>
          <div className="admin-stat-value">{total}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <div className="admin-stat-icon" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>✓</div>
          </div>
          <div className="admin-stat-label">Active</div>
          <div className="admin-stat-value">{counts.Active}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <div className="admin-stat-icon" style={{ background: "rgba(107,114,128,0.1)", color: "#9ca3af" }}>⏸</div>
          </div>
          <div className="admin-stat-label">Inactive</div>
          <div className="admin-stat-value">{counts.Inactive}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <div className="admin-stat-icon" style={{ background: "rgba(234,179,8,0.1)", color: "#eab308" }}>📋</div>
          </div>
          <div className="admin-stat-label">On Hold</div>
          <div className="admin-stat-value">{counts["On Hold"]}</div>
        </div>
      </div>

      <div className="admin-table-card">
        <div className="admin-table-header">
          <h3>All Departments</h3>
          <div className="admin-toolbar">
            <form onSubmit={handleSearch} className="admin-search-form">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search name, code, head..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="admin-search-input"
              />
            </form>
            <select value={status} onChange={handleStatusFilter} className="admin-filter-select">
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => handleSort("name")}>
                  DEPARTMENT NAME <SortIcon field="name" sortBy={sortBy} order={order} />
                </th>
                <th className="sortable" onClick={() => handleSort("head_member")}>
                  HEAD <SortIcon field="head_member" sortBy={sortBy} order={order} />
                </th>
                <th>DESCRIPTION</th>
                <th className="sortable" onClick={() => handleSort("status")}>
                  STATUS <SortIcon field="status" sortBy={sortBy} order={order} />
                </th>
                <th className="sortable" onClick={() => handleSort("createdAt")}>
                  CREATED <SortIcon field="createdAt" sortBy={sortBy} order={order} />
                </th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="admin-loading">Loading...</td></tr>
              ) : departments.length === 0 ? (
                <tr><td colSpan="6" className="admin-loading">No departments found.</td></tr>
              ) : departments.map((dept, index) => (
                <tr key={dept._id}>
                  <td>
                    <div className="admin-td-flex">
                      <div className="admin-avatar-small" style={{ backgroundColor: `hsl(${index * 40}, 70%, 45%)` }}>
                        {dept.code?.substring(0, 2).toUpperCase() || dept.name?.substring(0, 2).toUpperCase() || "NA"}
                      </div>
                      <div>
                        <div className="admin-bold-text">{dept.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "#a1a1aa" }}>{dept.code}</div>
                      </div>
                    </div>
                  </td>
                  <td>{dept.head_member || "—"}</td>
                  <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#a1a1aa", fontSize: "0.85rem" }}>
                    {dept.description || "—"}
                  </td>
                  <td>
                    <span className={`admin-status-badge ${dept.status === "Active" ? "active" : dept.status === "Inactive" ? "inactive" : "pending"}`}>
                      {dept.status}
                    </span>
                  </td>
                  <td style={{ color: "#a1a1aa", fontSize: "0.85rem" }}>
                    {new Date(dept.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <button className="admin-icon-btn" onClick={() => navigate(`/dashboard?section=edit_department&id=${dept._id}`)}>
                      <FiMoreVertical />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="admin-table-footer">
          <span>Showing {departments.length} of {total} departments</span>
          <div className="admin-pagination">
            <button className={`admin-page-btn${page === 1 ? " disabled" : ""}`} onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>&lt;</button>
            {pages.map((p) => (
              <button key={p} className={`admin-page-btn${p === page ? " active" : ""}`} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button className={`admin-page-btn${page === totalPages ? " disabled" : ""}`} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDepartments;
