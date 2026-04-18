import React from 'react';
import './AcademicRecord/AcademicRecord.css';

const AcademicRecords = () => {
  return (
    <div className="ar-root">
      {/* Header */}
      <header className="ar-header">
        <div className="ar-header-inner">
          <div className="ar-header-left">
            <div className="ar-avatar">
              <img alt="Student profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-RkoxjPtkxDGmwbpbc2D0vLfXkWEWb7Wu4xhqt_pWzigxmAEbhnN05hKuuNe2_-q7_e92T4sIWbcM8Lc5_t6EuvPod8K9KM3Z1iU2gufUiPGWekmy1HD-eUsyBh9Xia2WsfhYfZNO7qi0A165R_c8Xz9Q1hpEzzF0eS5u207qwMGU7LfD-jQj6vupytOu3_j0DtWWniHlY7HDq-DfW_vHPSXwxJpAoeir2aYH5uyAjnDGSH-FovApxx2NtLSjZk2VaudRMsnLiefu" />
            </div>
            <span className="ar-logo">LUMEN</span>
          </div>
          <div className="ar-header-right">
            <button className="ar-icon-btn">
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
        </div>
      </header>

      <main className="ar-main">
        {/* Hero GPA Section */}
        <section className="ar-hero">
          <div className="ar-hero-card">
            <div className="ar-hero-decoration"></div>
            <div className="ar-hero-content">
              <div className="ar-ring-wrap">
                <svg className="ar-ring-svg">
                  <circle cx="96" cy="96" fill="transparent" r="88" stroke="rgba(72,72,74,0.3)" strokeWidth="12"></circle>
                  <circle cx="96" cy="96" fill="transparent" r="88" stroke="url(#gpaGradient)" strokeDasharray="552.9" strokeDashoffset="138" strokeLinecap="round" strokeWidth="12"></circle>
                  <defs>
                    <linearGradient id="gpaGradient" x1="0%" x2="100%" y1="0%" y2="0%">
                      <stop offset="0%" style={{ stopColor: '#ffd16c' }}></stop>
                      <stop offset="100%" style={{ stopColor: '#fdc003' }}></stop>
                    </linearGradient>
                  </defs>
                </svg>
                <div className="ar-ring-center">
                  <span className="ar-gpa-value">3.85</span>
                  <span className="ar-gpa-label">Cumulative GPA</span>
                </div>
              </div>
              <div className="ar-stats-grid">
                <div className="ar-stat">
                  <span className="ar-stat-value">124</span>
                  <span className="ar-stat-label">Credits Earned</span>
                </div>
                <div className="ar-stat ar-stat-divider">
                  <span className="ar-stat-value">A</span>
                  <span className="ar-stat-label">Avg Grade</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Semester History */}
        <section className="ar-history">
          <div className="ar-history-header">
            <h2 className="ar-history-title">Academic History</h2>
            <span className="ar-history-count">8 Semesters</span>
          </div>

          {/* Current Semester */}
          <div className="ar-card-active">
            <div className="ar-card-active-header">
              <div>
                <h3 className="ar-card-active-title">Spring 2024</h3>
                <p className="ar-card-active-sub">Current Term • Full-Time</p>
              </div>
              <div className="ar-badge">In Progress</div>
            </div>
            <div className="ar-card-stats">
              <div className="ar-card-stat">
                <span className="ar-card-stat-label">Semester GPA</span>
                <span className="ar-card-stat-value">3.92</span>
              </div>
              <div className="ar-card-stat">
                <span className="ar-card-stat-label">Credits</span>
                <span className="ar-card-stat-value ar-card-stat-value-neutral">16.0</span>
              </div>
            </div>
            <button className="ar-details-btn">
              <span>View Details</span>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_forward_ios</span>
            </button>
          </div>

          {/* Fall 2023 */}
          <div className="ar-card-past">
            <div className="ar-card-past-inner">
              <div className="ar-card-past-left">
                <div className="ar-card-icon">
                  <span className="material-symbols-outlined">school</span>
                </div>
                <div>
                  <h3 className="ar-card-past-title">Fall 2023</h3>
                  <div className="ar-card-past-meta">
                    <span>GPA: <b style={{ color: 'var(--ar-on-surface)' }}>3.80</b></span>
                    <span>Credits: <b style={{ color: 'var(--ar-on-surface)' }}>15.0</b></span>
                  </div>
                </div>
              </div>
              <button className="ar-expand-btn">
                <span className="material-symbols-outlined">expand_more</span>
              </button>
            </div>
          </div>

          {/* Spring 2023 */}
          <div className="ar-card-past">
            <div className="ar-card-past-inner">
              <div className="ar-card-past-left">
                <div className="ar-card-icon">
                  <span className="material-symbols-outlined">history_edu</span>
                </div>
                <div>
                  <h3 className="ar-card-past-title">Spring 2023</h3>
                  <div className="ar-card-past-meta">
                    <span>GPA: <b style={{ color: 'var(--ar-on-surface)' }}>3.75</b></span>
                    <span>Credits: <b style={{ color: 'var(--ar-on-surface)' }}>18.0</b></span>
                  </div>
                </div>
              </div>
              <button className="ar-expand-btn">
                <span className="material-symbols-outlined">expand_more</span>
              </button>
            </div>
          </div>

          {/* Fall 2022 */}
          <div className="ar-card-past">
            <div className="ar-card-past-inner">
              <div className="ar-card-past-left">
                <div className="ar-card-icon">
                  <span className="material-symbols-outlined">verified</span>
                </div>
                <div>
                  <h3 className="ar-card-past-title">Fall 2022</h3>
                  <div className="ar-card-past-meta">
                    <span>GPA: <b style={{ color: 'var(--ar-on-surface)' }}>3.90</b></span>
                    <span>Credits: <b style={{ color: 'var(--ar-on-surface)' }}>14.0</b></span>
                  </div>
                </div>
              </div>
              <button className="ar-expand-btn">
                <span className="material-symbols-outlined">expand_more</span>
              </button>
            </div>
          </div>

          <button className="ar-load-more">Load Older Records</button>
        </section>
      </main>

      {/* Bottom Nav */}
      <nav className="ar-bottom-nav">
        <div className="ar-bottom-nav-inner">
          <a className="ar-nav-item" href="#">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="ar-nav-label">Dashboard</span>
          </a>
          <a className="ar-nav-item active" href="#">
            <span className="material-symbols-outlined">description</span>
            <span className="ar-nav-label">Records</span>
          </a>
          <a className="ar-nav-item" href="#">
            <span className="material-symbols-outlined">calendar_month</span>
            <span className="ar-nav-label">Schedule</span>
          </a>
          <a className="ar-nav-item" href="#">
            <span className="material-symbols-outlined">settings</span>
            <span className="ar-nav-label">Settings</span>
          </a>
        </div>
      </nav>
    </div>
  );
};

export default AcademicRecords;
