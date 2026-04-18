import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPublicAnnouncements } from "../../services/publicServices";
import "./Home.css";

const typeLabel = { news: "NEWS UPDATE", document: "DOCUMENT RELEASE", event: "EVENT" };

export default function HomePage() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [lightbox, setLightbox]           = useState(null); // { imageUrl, title }

  useEffect(() => {
    document.body.classList.add("public-page");
    return () => document.body.classList.remove("public-page");
  }, []);

  useEffect(() => {
    getPublicAnnouncements()
      .then((d) => setAnnouncements(d.announcements || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Close lightbox on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setLightbox(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const mainAnnouncements = announcements.filter((a) => a.type !== "document");
  const documents         = announcements.filter((a) => a.type === "document");

  return (
    <div className="home-page">
      {/* ── Navbar ── */}
      <nav className="home-nav">
        <span className="home-nav-logo">UniPortal</span>
        <div className="home-nav-links">
          <a href="/about">About</a>
          <a href="/departments">Departments</a>
        </div>
        <div className="home-nav-actions">
          <button className="home-btn-ghost" onClick={() => navigate("/login")}>Login</button>
          <button className="home-btn-primary" onClick={() => navigate("/register")}>Apply Now</button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="home-hero">
        <div className="home-hero-content">
          <span className="home-hero-badge">GLOBAL EXCELLENCE</span>
          <h1>Welcome to <span className="home-hero-accent">UniPortal</span></h1>
          <p>The Future of Knowledge begins here. A premier gateway for academic distinction and innovative research.</p>
          <div className="home-hero-cta">
            <button className="home-btn-primary" onClick={() => navigate("/register")}>Apply Now</button>
            <button className="home-btn-ghost" onClick={() => navigate("/departments")}>Explore Departments</button>
          </div>
        </div>
        <div className="home-hero-status">
          <div className="home-status-header">
            <span>⚡ System Status</span>
            <span className="home-status-live">● LIVE UPDATES</span>
          </div>
          <div className="home-status-grid">
            <div><small>ACADEMIC YEAR</small><strong>2024-2025</strong></div>
            <div><small>CURRENT SEMESTER</small><strong>Fall</strong></div>
            <div><small>REGISTRATION</small><strong>Open</strong></div>
            <div><small>CURRENT PHASE</small><strong>Midterms</strong></div>
          </div>
        </div>
      </section>

      {/* ── Announcements + Sidebar ── */}
      <section className="home-announcements" id="announcements">
        <div className="home-section-header">
          <h2>Latest Announcements</h2>
        </div>

        <div className="home-ann-layout">
          {/* Main content */}
          <div className="home-ann-main">
            {loading ? (
              <div className="home-loading">Loading...</div>
            ) : mainAnnouncements.length === 0 ? (
              <p className="home-empty">No announcements yet.</p>
            ) : (
              <div className="home-ann-grid">
                {mainAnnouncements.map((ann) => (
                  <div key={ann._id} className="home-ann-card">
                    <div className="home-ann-meta">
                      <span className="home-ann-type">{typeLabel[ann.type] || "UPDATE"}</span>
                      <span className="home-ann-date">
                        {new Date(ann.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>

                    <div className="home-ann-body">
                      {ann.imageUrl && (
                        <div className="home-ann-img-wrap">
                          <img
                            src={ann.imageUrl}
                            alt={ann.title}
                            className="home-ann-img"
                            onClick={() => setLightbox({ imageUrl: ann.imageUrl, title: ann.title })}
                          />
                          <button
                            className="home-ann-show-btn"
                            onClick={() => setLightbox({ imageUrl: ann.imageUrl, title: ann.title })}
                          >
                            Show Details
                          </button>
                        </div>
                      )}
                      <div className="home-ann-text">
                        <h3>{ann.title}</h3>
                        <p>{ann.body}</p>
                        {ann.fileUrl && (
                          <a
                            href={ann.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="home-ann-download"
                            download={ann.fileName || `${ann.title}.pdf`}
                          >
                            ↓ {ann.fileName || "Download"} {ann.fileSize && `· ${ann.fileSize}`}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar: Quick Downloads */}
          {documents.length > 0 && (
            <aside className="home-ann-sidebar">
              <div className="home-sidebar-header">
                <span className="home-sidebar-icon">📎</span>
                <h3>Quick Downloads</h3>
              </div>
              <ul className="home-sidebar-links">
                {documents.map((doc) => (
                  <li key={doc._id}>
                    <a
                      href={doc.fileUrl || "#"}
                      target="_blank"
                      rel="noreferrer"
                      download={doc.fileName || doc.title}
                      className="home-sidebar-link"
                    >
                      <span className="home-sidebar-link-icon">📄</span>
                      <span className="home-sidebar-link-text">
                        <span className="home-sidebar-link-title">{doc.title}</span>
                        {doc.fileSize && <span className="home-sidebar-link-size">{doc.fileSize}</span>}
                      </span>
                      <span className="home-sidebar-link-arrow">↓</span>
                    </a>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>
      </section>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div className="home-lightbox" onClick={() => setLightbox(null)}>
          <div className="home-lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button className="home-lightbox-close" onClick={() => setLightbox(null)}>✕</button>
            <img src={lightbox.imageUrl} alt={lightbox.title} className="home-lightbox-img" />
            {lightbox.title && <p className="home-lightbox-caption">{lightbox.title}</p>}
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <footer className="home-footer">
        <div className="home-footer-col">
          <strong>UniPortal Academic Institution</strong>
          <p>Dedicated to advancing human knowledge through rigorous academic inquiry.</p>
        </div>
        <div className="home-footer-col">
          <strong>Quick Links</strong>
          <a href="/departments">Departments</a>
          <a href="/login">Student Portal</a>
        </div>
        <p className="home-footer-copy">© 2024 UniPortal Academic Institution. All rights reserved.</p>
      </footer>
    </div>
  );
}
