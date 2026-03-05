import React from 'react';

const CourseFilters = ({ activeType, setType, activeDepartment, setDepartment }) => {
  const types = ['All', 'Core', 'Electives'];
  const departments = ['All Departments', 'Computer Science', 'Mathematics', 'Physics', 'Humanities'];

  return (
    <div>
      <div className="vc-header-row">
        <div>
          <h1 className="vc-title">Fall 2024 Registration</h1>
          <p className="vc-subtitle">Select courses to build your schedule. Minimum 12 credits required.</p>
        </div>
        
        <div className="vc-type-toggle">
          {types.map(type => (
            <button
              key={type}
              onClick={() => setType(type)}
              className={`vc-type-btn ${activeType === type ? 'active' : ''}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="vc-dept-filters">
        {departments.map(dept => (
          <button
            key={dept}
            onClick={() => setDepartment(dept)}
            className={`vc-dept-btn ${activeDepartment === dept ? 'active' : ''}`}
          >
            {dept === 'All Departments' && (
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            )}
            {dept}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CourseFilters;