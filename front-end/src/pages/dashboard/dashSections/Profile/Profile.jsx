import axios from "axios";
import { signOut } from "firebase/auth";
import { FaGraduationCap } from "react-icons/fa";
import { FiBell, FiEdit2, FiLogOut, FiSearch } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../../../services/store/reducers/authSlice";
import { auth } from "../../../../utils/firebaseConfig";
import "./Profile.css";

function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      // Logout from backend
      await axios.get("http://localhost:3100/api/v1/auth/logout", {
        withCredentials: true,
      });

      // Logout from Firebase
      await signOut(auth);

      // Clear local state
      dispatch(logoutUser());

      // Navigate to login
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Still logout locally even if backend fails
      dispatch(logoutUser());
      navigate("/login");
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

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
            <div
              style={{
                display: "flex",
                gap: "5px",
                flexWrap: "wrap",
              }}
            >
              <button className="edit-profile-btn">
                <FiEdit2 /> Edit Profile
              </button>
              <button
                onClick={() => handleLogout()}
                className="edit-profile-btn"
              >
                <FiLogOut /> Log Out
              </button>
            </div>
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
