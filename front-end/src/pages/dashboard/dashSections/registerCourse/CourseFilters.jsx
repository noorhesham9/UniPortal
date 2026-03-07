import React from 'react';

const CourseFilters = ({ activeType, setType, activeDepartment, setDepartment }) => {
  const types = ['All', 'Core', 'Electives'];
  const departments = ['All Departments', 'Computer Science', 'Mathematics', 'Physics', 'Humanities'];

  return (
      <div className="vc-header-row">
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          textAlign: "left",
        }}>
          <h1 className="vc-title">Fall 2024 Registration</h1>
          <p className="vc-subtitle">Select courses to build your schedule. Minimum 12 credits required.</p>
        </div>

      </div>

  );
};

export default CourseFilters;