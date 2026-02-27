import { FaGraduationCap } from "react-icons/fa";
import { FiBell, FiEdit2, FiSearch } from "react-icons/fi";
import "./Profile.css";

function Profile({ user }) {
  return (
    <div className="profile-container">
      <header className="profile-header">
        <h2>{user?.role?.name || "Student"} Profile</h2>

        <div className="header-actions">
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input type="text" placeholder="Search records..." />
          </div>

          <div className="notification-icon">
            <FiBell />
            <span className="notification-dot"></span>
          </div>
        </div>
      </header>

      <main className="profile-content">
        <div className="profile-card">
          <div className="background-icon-container">
            <FaGraduationCap className="background-icon" />
          </div>

          <div className="card-top">
            <div className="user-details">
              <div className="name-status">
                <h1>{user?.name}</h1>
                <span className="status-badge">
                  {user?.is_active
                    ? `Active ${user?.role?.name || "Student"}`
                    : "Inactive Account"}
                </span>
              </div>
              <p className="major-info">{user?.department?.name}</p>
            </div>

            <button className="edit-profile-btn">
              <FiEdit2 /> Edit Profile
            </button>
          </div>

          <div className="stats-container">
            <div className="stat-group">
              <span className="stat-label">Student ID</span>
              <span className="stat-value">
                {user?.student_id ? user?.student_id : "N/A"}
              </span>
            </div>

            <div className="stat-group">
              <span className="stat-label">Major GPA</span>
              <span className="stat-value highlight-yellow">
                {user?.gpa ? user?.gpa : "N/A"}
              </span>
            </div>

            <div className="stat-group">
              <span className="stat-label">credit completed</span>
              <span className="stat-value">
                {user?.completed_credits ? user?.completed_credits : "N/A"}
              </span>
            </div>

            <div className="stat-group">
              <span className="stat-label">
                credit remaining until graduation
              </span>
              <span className="stat-value">
                {user?.remaining_credits ? user?.remaining_credits : "N/A"}
              </span>
            </div>

            <div className="stat-group">
              <span className="stat-label">Advisor</span>
              <span className="stat-value">
                {user?.advisor ? user?.advisor : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Profile;
