import React from 'react';
import './Profile.css';
import { FiSearch, FiBell, FiEdit2 } from 'react-icons/fi';
import { FaGraduationCap } from 'react-icons/fa';

function Profile() {
  return (
    <div className="profile-container">
    
      <header className="profile-header">
        <h2>Student Profile</h2>
        
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
                <h1>Abdelrahman Elsayed</h1>
                <span className="status-badge">Active Student</span>
              </div>
              <p className="major-info">Bachelor of Science in Computer Science • Senior Year</p>
            </div>
            
            <button className="edit-profile-btn">
              <FiEdit2 /> Edit Profile
            </button>
          </div>

          <div className="stats-container">
            <div className="stat-group">
              <span className="stat-label">Student ID</span>
              <span className="stat-value">2227120</span>
            </div>
            
            <div className="stat-group">
              <span className="stat-label">Major GPA</span>
              <span className="stat-value highlight-yellow">2.5</span>
            </div>
            
            <div className="stat-group">
              <span className="stat-label">credit completed</span>
              <span className="stat-value">102</span>
            </div>
            
            <div className="stat-group">
              <span className="stat-label">credit remaining until graduation</span>
              <span className="stat-value">18</span> 
            </div>
            
            <div className="stat-group">
              <span className="stat-label">Advisor</span>
              <span className="stat-value">Dr.Hassan</span>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}

export default Profile;