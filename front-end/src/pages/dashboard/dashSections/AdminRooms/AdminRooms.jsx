import { useEffect, useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiPlus, FiSearch } from "react-icons/fi";
import { getRooms } from "../../../../services/RoomServices";
import "./AdminRooms.css";

const LIMIT = 10;
const ROOM_TYPES = ["", "Lecture Hall", "Lab", "Tutorial", "Physics Lab"];

const AdminRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);

  // Filters & sort
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState("room_name");
  const [order, setOrder] = useState("asc");
  const debounceRef = useRef(null);

  useEffect(() => { setPage(1); }, [search, typeFilter, statusFilter, sort, order]);
  useEffect(() => { fetchRooms(); }, [page, search, typeFilter, statusFilter, sort, order]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const data = await getRooms({ page, limit: LIMIT, search, type: typeFilter, is_active: statusFilter, sort, order });
      setRooms(data.rooms || []);
      if (data.pagination) setPagination(data.pagination);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {}, 0);
  };

  const toggleSort = (field) => {
    if (sort === field) setOrder((o) => (o === "asc" ? "desc" : "asc"));
    else { setSort(field); setOrder("asc"); }
  };

  const sortIcon = (field) => sort === field ? (order === "asc" ? " ↑" : " ↓") : "";

  const goToPage = (p) => {
    if (p < 1 || p > pagination.totalPages) return;
    setPage(p);
  };

  // Stats derived from current page data
  const activeCount = rooms.filter((r) => r.is_active).length;
  const labCount = rooms.filter((r) => r.type === "Lab" || r.type === "Physics Lab").length;

  return (
    <div className="admin-rm-container">
      <div className="admin-rm-title-group">
        <h1 className="admin-rm-title">Facility Management</h1>
        <p className="admin-rm-subtitle">Manage and monitor all institutional spaces and resources.</p>
      </div>

      {/* Stats */}
      <div className="admin-stats-container">
        <div className="admin-stat-card">
          <div className="admin-stat-header"><span className="admin-stat-label">Total Rooms</span><div className="admin-stat-icon" style={{ color: "#3b82f6" }}>🚪</div></div>
          <div className="admin-stat-value">{pagination.total}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header"><span className="admin-stat-label">Active (this page)</span><div className="admin-stat-icon" style={{ color: "#10b981" }}>✓</div></div>
          <div className="admin-stat-value">{activeCount}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header"><span className="admin-stat-label">Labs (this page)</span><div className="admin-stat-icon" style={{ color: "#eab308" }}>⚗️</div></div>
          <div className="admin-stat-value">{labCount}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header"><span className="admin-stat-label">Total Pages</span><div className="admin-stat-icon" style={{ color: "#a855f7" }}>📄</div></div>
          <div className="admin-stat-value">{pagination.totalPages}</div>
        </div>
      </div>

      <div className="admin-table-card">
        {/* Toolbar */}
        <div className="admin-rm-toolbar">
          <div className="admin-rm-search-wrapper">
            <FiSearch className="admin-rm-search-icon" />
            <input
              type="text"
              className="admin-rm-search-input"
              placeholder="Search name, building, equipment..."
              value={search}
              onChange={handleSearch}
            />
          </div>

          <select className="admin-co-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            {ROOM_TYPES.filter(Boolean).map((t) => <option key={t} value={t}>{t}</option>)}
          </select>

          <select className="admin-co-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          <button className="admin-btn-primary bg-blue-primary" style={{ whiteSpace: "nowrap" }}>
            <FiPlus /> Add Room
          </button>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => toggleSort("room_name")}>ROOM NAME{sortIcon("room_name")}</th>
                <th className="sortable" onClick={() => toggleSort("building_section")}>BUILDING{sortIcon("building_section")}</th>
                <th className="sortable" onClick={() => toggleSort("type")}>TYPE{sortIcon("type")}</th>
                <th className="sortable" onClick={() => toggleSort("capacity")}>CAPACITY{sortIcon("capacity")}</th>
                <th>KEYCARD</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="admin-loading">Loading...</td></tr>
              ) : rooms.length === 0 ? (
                <tr><td colSpan="7" className="admin-loading">No rooms found.</td></tr>
              ) : rooms.map((room) => (
                <tr key={room._id}>
                  <td>
                    <div className="admin-bold-text">{room.room_name}</div>
                    {room.equipment_notes && <div className="admin-co-meta">{room.equipment_notes}</div>}
                  </td>
                  <td>{room.building_section}</td>
                  <td><span className={`admin-rm-badge-outline ${room.type === "Lab" || room.type === "Physics Lab" ? "text-yellow" : "text-blue"}`}>{room.type}</span></td>
                  <td><div className="admin-bold-text">{room.capacity} seats</div></td>
                  <td>{room.keycard_access ? <span style={{ color: "#10b981" }}>✓</span> : <span style={{ color: "#64748b" }}>—</span>}</td>
                  <td>
                    <span className={`admin-rm-status-text ${room.is_active ? "green" : "red"}`}>
                      ● {room.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="admin-usr-action-btns">
                      <button className="admin-usr-btn blue">Edit</button>
                      <button className="admin-usr-btn red">{room.is_active ? "Deactivate" : "Activate"}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="admin-table-footer">
          <span>
            Showing {rooms.length > 0 ? (page - 1) * LIMIT + 1 : 0}–{Math.min(page * LIMIT, pagination.total)} of {pagination.total} rooms
          </span>
          <div className="admin-pagination">
            <button className={`admin-page-btn ${page === 1 ? "disabled" : ""}`} onClick={() => goToPage(page - 1)}><FiChevronLeft /></button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((n) => n === 1 || n === pagination.totalPages || Math.abs(n - page) <= 1)
              .reduce((acc, n, i, arr) => {
                if (i > 0 && n - arr[i - 1] > 1) acc.push(<span key={`e${n}`} style={{ padding: "0 0.5rem" }}>...</span>);
                acc.push(<button key={n} className={`admin-page-btn ${page === n ? "active" : ""}`} onClick={() => goToPage(n)}>{n}</button>);
                return acc;
              }, [])}
            <button className={`admin-page-btn ${page === pagination.totalPages ? "disabled" : ""}`} onClick={() => goToPage(page + 1)}><FiChevronRight /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRooms;
