import React, { useState } from 'react';
import CourseCard from './CourseCard';
import CourseFilters from './CourseFilters';
import { initialCourses } from './coursesData';
import './ViewCourses.css'; // استيراد ملف الـ CSS

const ViewCourses = () => {
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [typeFilter, setTypeFilter] = useState('All');
  const [selectedCourseIds, setSelectedCourseIds] = useState(['cs101', 'eng102']); 

  const toggleCourse = (id) => {
    setSelectedCourseIds(prev => 
      prev.includes(id) ? prev.filter(courseId => courseId !== id) : [...prev, id]
    );
  };

  const filteredCourses = initialCourses.filter(course => {
    const matchDept = departmentFilter === 'All Departments' || course.department === departmentFilter;
    const matchType = typeFilter === 'All' || course.type === typeFilter;
    return matchDept && matchType;
  });

  const selectedCoursesData = initialCourses.filter(c => selectedCourseIds.includes(c.id));
  const totalCredits = selectedCoursesData.reduce((sum, course) => sum + course.credits, 0);

  return (
    <div className="vc-container">
      
      <div className="vc-main">
        <CourseFilters 
          activeType={typeFilter} 
          setType={setTypeFilter}
          activeDepartment={departmentFilter}
          setDepartment={setDepartmentFilter}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredCourses.map(course => (
            <CourseCard 
              key={course.id}
              course={course}
              isSelected={selectedCourseIds.includes(course.id)}
              onToggle={() => toggleCourse(course.id)}
            />
          ))}
        </div>
      </div>

      <div className="vc-sidebar">
        
        <div className="vc-side-card">
          <h2 className="vc-side-title">🛒 My Selection</h2>
          
          <div>
            {selectedCoursesData.length === 0 ? (
              <p className="vc-empty-sel">No courses selected yet.</p>
            ) : (
              selectedCoursesData.map(course => (
                <div key={course.id} className="vc-sel-item">
                  <div>
                    <h4 className="vc-sel-title">{course.code}: {course.title.substring(0, 15)}...</h4>
                    <p className="vc-sel-meta">{course.schedule}</p>
                  </div>
                  <div className="vc-sel-right">
                    <span className="vc-sel-cr">{course.credits} CR</span>
                    <button onClick={() => toggleCourse(course.id)} className="vc-sel-remove">Remove</button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="vc-summary">
            <div className="vc-summary-row">
              <span className="vc-summary-lbl">Total Credits</span>
              <div>
                <span className="vc-summary-val">{totalCredits}</span>
                <span className="vc-summary-max"> / 18</span>
              </div>
            </div>
            
            <div className="vc-progress-bg">
              <div 
                className="vc-progress-fill" 
                style={{ width: `${Math.min((totalCredits / 18) * 100, 100)}%` }}
              ></div>
            </div>

            {totalCredits < 12 && (
              <div className="vc-alert-box">
                <span>ℹ️</span>
                <p className="vc-alert-txt">You need {12 - totalCredits} more credits to meet the full-time student minimum requirement.</p>
              </div>
            )}

            <button className="vc-confirm-btn">
              Confirm Registration <span>→</span>
            </button>
          </div>
        </div>

        <div className="vc-side-card">
          <h3 className="vc-side-title" style={{ fontSize: '16px', marginBottom: '20px' }}>Academic Status</h3>
          <div>
            <div className="vc-status-row">
              <span className="vc-status-lbl">Current GPA</span>
              <span className="vc-status-val">3.8</span>
            </div>
            <div className="vc-status-row">
              <span className="vc-status-lbl">Class Standing</span>
              <span className="vc-status-val">Junior</span>
            </div>
            <div className="vc-status-row">
              <span className="vc-status-lbl">Advisor</span>
              <span className="vc-status-val">Dr. K. Miller</span>
            </div>
          </div>
          <a href="#!" className="vc-link">
  Contact Advisor <span>↗</span>
</a>
        </div>

      </div>
    </div>
  );
};

export default ViewCourses;