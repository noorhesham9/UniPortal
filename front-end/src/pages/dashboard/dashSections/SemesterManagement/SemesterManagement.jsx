import { useEffect, useState, useRef } from "react";
import { FiCheck, FiEye, FiEyeOff, FiCalendar, FiPlus, FiX, FiChevronLeft, FiChevronRight, FiSearch, FiFilter } from "react-icons/fi";
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

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState(null);
  const [sortBy, setSortBy] = useState("year");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filters, setFilters] = useState({
    year: "",
    term: "",
    is_active: "",
    show_final_results: "",
    search: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    loadSemesters();
  }, [page, sortBy, sortOrder, filters]);

  const loadSemesters = () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder,
    });

    // Add filters
    if (filters.year) params.append("year", filters.year);
    if (filters.term) params.append("term", filters.term);
    if (filters.is_active) params.append("is_active", filters.is_active);
    if (filters.show_final_results) params.append("show_final_results", filters.show_final_results);
    if (filters.search) params.append("search", filters.search);

    api.get(`/semesters?${params}`)
      .then((r) => {
        setSemesters(r.data.semesters || []);
        setPagination(r.data.pagination);
      })
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

  const handleSearchChange = (value) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: value }));
      setPage(1);
    }, 300);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      year: "",
      term: "",
      is_active: "",
      show_final_results: "",
      search: "",
    });
    setPage(1);
  };

  if (loading && page === 1) return <div className="sm-loading">Loading semesters...</div>;

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

      {/* Filters & Search */}
      <div className="sm-toolbar">
        <div className="sm-search-wrap">
          <FiSearch className="sm-search-icon" />
          <input
            type="text"
            className="sm-search"
            placeholder="Search by year or term..."
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <button className="sm-filter-btn" onClick={() => setShowFilters(!showFilters)}>
          <FiFilter size={14} /> Filters
        </button>
      </div>

      {showFilters && (
        <div className="sm-filters-panel">
          <div className="sm-filters-grid">
            <div className="sm-filter-group">
              <label>Year</label>
              <input
                type="number"
                value={filters.year}
                onChange={(e) => handleFilterChange("year", e.target.value)}
                placeholder="e.g. 2025"
              />
            </div>
            <div className="sm-filter-group">
              <label>Term</label>
              <select value={filters.term} onChange={(e) => handleFilterChange("term", e.target.value)}>
                <option value="">All Terms</option>
                <option value="Fall">Fall</option>
                <option value="Spring">Spring</option>
                <option value="Summer">Summer</option>
              </select>
            </div>
            <div className="sm-filter-group">
              <label>Status</label>
              <select value={filters.is_active} onChange={(e) => handleFilterChange("is_active", e.target.value)}>
                <option value="">All</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div className="sm-filter-group">
              <label>Results</label>
              <select value={filters.show_final_results} onChange={(e) => handleFilterChange("show_final_results", e.target.value)}>
                <option value="">All</option>
                <option value="true">Visible</option>
                <option value="false">Hidden</option>
              </select>
            </div>
          </div>
          <button className="sm-clear-filters" onClick={clearFilters}>Clear Filters</button>
        </div>
      )}

      <div className="sm-table-wrap">
        <table className="sm-table">
          <thead>
            <tr>
              <th onClick={() => handleSort("term")} className="sm-sortable">
                Term {sortBy === "term" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th onClick={() => handleSort("year")} className="sm-sortable">
                Year {sortBy === "year" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th onClick={() => handleSort("start_date")} className="sm-sortable">
                Start Date {sortBy === "start_date" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th onClick={() => handleSort("end_date")} className="sm-sortable">
                End Date {sortBy === "end_date" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th>Status</th>
              <th>Final Results</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="sm-loading-row">Loading...</td></tr>
            ) : semesters.length === 0 ? (
              <tr><td colSpan={7} className="sm-empty-row">No semesters found.</td></tr>
            ) : semesters.map((s) => (
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

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="sm-pagination">
          <span className="sm-page-info">
            Showing {semesters.length} of {pagination.total} semesters
          </span>
          <div className="sm-page-btns">
            <button
              className="sm-page-btn"
              onClick={() => setPage((p) => p - 1)}
              disabled={!pagination.hasPrevPage}
            >
              <FiChevronLeft />
            </button>
            {Array.from({ length: Math.min(3, pagination.totalPages) }, (_, i) => {
              const p = Math.max(1, page - 1) + i;
              if (p > pagination.totalPages) return null;
              return (
                <button
                  key={p}
                  className={`sm-page-btn ${page === p ? "active" : ""}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              );
            })}
            <button
              className="sm-page-btn"
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination.hasNextPage}
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      )}

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
