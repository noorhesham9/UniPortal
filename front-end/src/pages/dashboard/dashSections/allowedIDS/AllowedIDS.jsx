import { useEffect, useMemo, useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiUserPlus,
} from "react-icons/fi";
import { getAllowedStudents, addAllowedStudent, deleteAllowedStudent } from "../../../../services/AdminServices";
import "./AllowedIDS.css";

const AllowedIDS = () => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [pendingSeats, setPendingSeats] = useState(0);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const [studentId, setStudentId] = useState("");
  const [referenceNote, setReferenceNote] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const totalPages = useMemo(
    () => (total && pageSize ? Math.max(1, Math.ceil(total / pageSize)) : 1),
    [total, pageSize],
  );

  const rangeLabel = useMemo(() => {
    if (!total) return "Showing 0 of 0 authorized IDs";
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, total);
    return `Showing ${start}-${end} of ${total} authorized IDs`;
  }, [page, pageSize, total]);

  const fetchAllowedIds = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllowedStudents();
      setItems(data?.items || []);
      setTotal(data?.total || 0);
      setActiveCount(data?.activeRegistrations || 0);
      setPendingSeats(data?.pendingSeats || 0);
    } catch (err) {
      setError(err?.message || "Something went wrong while loading IDs");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!studentId.trim()) return;
    try {
      setSubmitting(true);
      setError(null);
      await addAllowedStudent(studentId.trim(), referenceNote.trim() || undefined);
      setStudentId("");
      setReferenceNote("");
      await fetchAllowedIds();
    } catch (err) {
      setError(err?.message || "Something went wrong while adding ID");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setError(null);
      await deleteAllowedStudent(id);
      await fetchAllowedIds();
    } catch (err) {
      setError(err?.message || "Something went wrong while deleting ID");
    }
  };

  const handlePrevPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setPage((prev) => Math.min(totalPages, prev + 1));
  };

  useEffect(() => {
    fetchAllowedIds();
  }, []);

  return (
    <div className="allowed-ids-page">
      <div className="allowed-ids-layout">
        <main className="allowed-ids-main">
          <div className="allowed-ids-main-inner">
            {/* Page Title & Intro */}
            <section className="allowed-ids-intro">
              <h1 className="allowed-ids-title">Registration Whitelist</h1>
              <p className="allowed-ids-subtitle">
                Manage student IDs authorized for portal registration.
              </p>
            </section>

            {/* Single Entry Form */}
            <section className="allowed-ids-card">
              <div className="allowed-ids-card-header">
                <FiUserPlus className="allowed-ids-header-icon" />
                <h3>Add Single Entry</h3>
              </div>

              {error && <p className="allowed-ids-error">{error}</p>}

              <div className="allowed-ids-form-row">
                <label className="allowed-ids-field">
                  <span className="allowed-ids-label">Student ID</span>
                  <input
                    type="text"
                    placeholder="e.g. 2023-10452"
                    className="allowed-ids-input"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                  />
                </label>

                <label className="allowed-ids-field">
                  <span className="allowed-ids-label">Reference Note</span>
                  <input
                    type="text"
                    placeholder="Optional department or batch info"
                    className="allowed-ids-input"
                    value={referenceNote}
                    onChange={(e) => setReferenceNote(e.target.value)}
                  />
                </label>

                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={submitting || !studentId.trim()}
                  className="allowed-ids-submit"
                >
                  <FiPlus />
                  {submitting ? "Adding..." : "Whitelist ID"}
                </button>
              </div>
            </section>

            <section className="allowed-ids-list">
              <div className="allowed-ids-list-header">
                <h2 className="allowed-ids-list-title">Allowed IDs</h2>
                <div className="allowed-ids-search">
                  <FiSearch className="allowed-ids-search-icon" />
                  <input
                    type="text"
                    placeholder="Search by ID or note..."
                    className="allowed-ids-search-input"
                    value={search}
                    onChange={(e) => {
                      setPage(1);
                      setSearch(e.target.value);
                    }}
                  />
                </div>
              </div>

              <div className="allowed-ids-table-wrapper">
                <table className="allowed-ids-table">
                  <thead>
                    <tr>
                      <th>Student ID</th>
                      <th>Reference Note</th>
                      <th>Date Added</th>
                      <th className="allowed-ids-table-actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="allowed-ids-table-empty">
                          Loading allowed IDs...
                        </td>
                      </tr>
                    ) : items.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="allowed-ids-table-empty">
                          No allowed IDs found.
                        </td>
                      </tr>
                    ) : (
                      items.map((item) => (
                        <tr
                          key={item.id || item._id || item.studentId}
                          className="allowed-ids-table-row"
                        >
                          <td className="allowed-ids-table-id">
                            {item.studentId}
                          </td>
                          <td className="allowed-ids-table-note">
                            {item.note || "-"}
                          </td>
                          <td className="allowed-ids-table-date">
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="allowed-ids-table-actions">
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id || item._id)}
                              className="allowed-ids-delete-button"
                              title="Remove ID"
                            >
                              <FiTrash2 />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="allowed-ids-pagination">
                <p className="allowed-ids-pagination-text">{rangeLabel}</p>
                <div className="allowed-ids-pagination-controls">
                  <button
                    type="button"
                    onClick={handlePrevPage}
                    disabled={page === 1}
                    className="allowed-ids-page-button"
                  >
                    <FiChevronLeft />
                  </button>
                  <span className="allowed-ids-page-indicator">
                    {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextPage}
                    disabled={page === totalPages}
                    className="allowed-ids-page-button"
                  >
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            </section>
          </div>
        </main>

        {/* Footer Stats */}
        <footer className="allowed-ids-footer">
          <div className="allowed-ids-footer-inner">
            <div className="allowed-ids-metric">
              <span className="allowed-ids-metric-label">Total Authorized</span>
              <span className="allowed-ids-metric-value allowed-ids-metric-value--primary">
                {total}
              </span>
            </div>
            <div className="allowed-ids-metric">
              <span className="allowed-ids-metric-label">
                Active Registrations
              </span>
              <span className="allowed-ids-metric-value">{activeCount}</span>
            </div>
            <div className="allowed-ids-metric">
              <span className="allowed-ids-metric-label">Pending Seats</span>
              <span className="allowed-ids-metric-value">{pendingSeats}</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AllowedIDS;
