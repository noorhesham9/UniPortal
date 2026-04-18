import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPublicDepartments } from "../../services/publicServices";
import "./DepartmentsPage.css";

const icons = ["🖥️", "⚙️", "📊", "🎨", "🔬", "📚", "🏛️", "🌍"];

export default function DepartmentsPage() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.classList.add("public-page");
    return () => document.body.classList.remove("public-page");
  }, []);

  useEffect(() => {
    getPublicDepartments()
      .then((d) => setDepartments(d.departments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="dept-page">
      {/* ── Navbar ── */}
      <nav className="dept-nav">
        <span className="dept-nav-logo" onClick={() => navigate("/")}>UniPortal</span>
        <div className="dept-nav-links">
          <a href="/">Home</a>
          <span className="dept-nav-active">Departments</span>
        </div>
        <button className="dept-btn-primary" onClick={() => navigate("/login")}>Login</button>
      </nav>

      {/* ── Header ── */}
      <header className="dept-header">
        <div className="dept-header-bar" />
        <h1>Academic Departments</h1>
        <p>Official course catalogue and professional pathways for the current academic session.<br />Browse our core faculties and their associated industry alignments.</p>
      </header>

      {/* ── Grid ── */}
      <section className="dept-grid-section">
        {loading ? (
          <div className="dept-loading">Loading departments...</div>
        ) : departments.length === 0 ? (
          <p className="dept-empty">No departments available.</p>
        ) : (
          <div className="dept-grid">
            {departments.map((dept, i) => (
              <div key={dept._id} className="dept-card">
                <div className="dept-card-top">
                  <h2>{dept.name}</h2>
                  <span className="dept-card-icon">{icons[i % icons.length]}</span>
                </div>
                <p className="dept-card-desc">{dept.description || "No description available."}</p>
                {dept.head_member && (
                  <div className="dept-card-head">
                    <small>HEAD OF DEPARTMENT</small>
                    <span>{dept.head_member}</span>
                  </div>
                )}
                <div className="dept-card-code">
                  <span>{dept.code}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Info strip ── */}
      <section className="dept-info-strip">
        <div className="dept-info-item">
          <strong>ACADEMIC INTEGRITY</strong>
          <p>All departments adhere to the highest standards of original research and scholarly conduct.</p>
        </div>
        <div className="dept-info-item">
          <strong>CROSS-DISCIPLINARY STUDY</strong>
          <p>Inter-departmental collaboration is encouraged. 25% of all credits may be earned outside a student's primary faculty.</p>
        </div>
        <div className="dept-info-item">
          <strong>GLOBAL ACCREDITATION</strong>
          <p>Our degrees are recognized by international academic bodies and industrial regulatory authorities.</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="dept-footer">
        <span className="dept-footer-logo">UniPortal</span>
        <div className="dept-footer-links">
          <a href="/">Home</a>
          <a href="/login">Student Portal</a>
        </div>
        <p>© 2024 UniPortal Academic Institution. All rights reserved.</p>
      </footer>
    </div>
  );
}
