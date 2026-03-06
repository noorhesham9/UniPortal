import React from 'react';
import { FiClock, FiUser, FiInbox } from 'react-icons/fi'; 

const CourseCard = ({ course, isSelected, onToggle }) => {
  return (
    <div className={`vc-card ${isSelected ? 'selected' : ''}`}>
      
      <div className="vc-card-badge">
        <span className="vc-badge-lbl">Credits</span>
        <span className="vc-badge-val">{course.credits}</span>
      </div>

      <div className="vc-card-content">
        <div className="vc-tags">
          <span className="vc-tag-code">{course.code}</span>
          <span className={`vc-tag-status ${course.prereqsMet ? 'success' : 'warning'}`}>
            {course.prereqsMet ? '✅ Prereqs Met' : '⚠️ Check Prereqs'}
          </span>
        </div>

        <h3 className="vc-card-title">{course.title}</h3>
        <p className="vc-card-desc">{course.description}</p>

        <div className="vc-card-meta">
          <span className="vc-meta-item">
            <FiClock className="vc-meta-icon" /> {course.schedule}
          </span>
          <span className="vc-meta-item">
            <FiUser className="vc-meta-icon" /> {course.instructor}
          </span>
          <span className={`vc-meta-item ${course.alertText ? 'alert' : ''}`}>
             <FiInbox className="vc-meta-icon" /> {course.seatsInfo}
          </span>
        </div>
      </div>

      <div className={`vc-toggle ${isSelected ? 'selected' : ''}`} onClick={onToggle}>
        <div className="vc-toggle-circle" />
      </div>

    </div>
  );
};

export default CourseCard;