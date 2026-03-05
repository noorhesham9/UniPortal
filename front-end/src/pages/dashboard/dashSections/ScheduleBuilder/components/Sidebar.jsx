import React, { useState } from 'react';
import DraggableCourseCard from './DraggableCourseCard';
import { useSchedule } from '../context/ScheduleContext'; 

const MOCK_UNASSIGNED = [
  { id: 'CS 101', name: 'Intro to Computer Science', prof: 'Prof. A. Smith', credits: 3, type: 'CS' },
  { id: 'MATH 202', name: 'Calculus II', prof: 'Prof. B. Johnson', credits: 4, type: 'MATH' },
  { id: 'BIO 105', name: 'Biology Fundamentals', prof: 'Pending', credits: 3, type: 'BIO' },
  { id: 'CS 320', name: 'Data Structures', prof: 'Prof. K. Lee', credits: 3, type: 'CS' },
];

const Sidebar = () => {
  const { scheduledCourses } = useSchedule();
  
  // 1. إنشاء States لحفظ قيمة البحث والفلتر النشط
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All'); // 'All', 'CS', 'MATH'

  // 2. فلترة المواد المتاحة (اللي لسه مش في الجدول)
  let availableCourses = MOCK_UNASSIGNED.filter(
    (mockCourse) => !scheduledCourses.some(scheduled => scheduled.id === mockCourse.id)
  );

  // 3. تطبيق فلتر الأقسام (CS Only, Math Only)
  if (activeFilter !== 'All') {
    availableCourses = availableCourses.filter(course => course.type === activeFilter);
  }

  // 4. تطبيق فلتر البحث (بالكود أو بالاسم)
  if (searchQuery.trim() !== '') {
    const query = searchQuery.toLowerCase();
    availableCourses = availableCourses.filter(course => 
      course.id.toLowerCase().includes(query) || 
      course.name.toLowerCase().includes(query)
    );
  }

  return (
    <aside className="schedule-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">
          <h3>Unassigned Courses</h3>
          <p>Drag courses to the calendar to assign.</p>
        </div>
        
        {/* ربط حقل البحث بالـ State */}
        <input 
          type="text" 
          placeholder="🔍 Filter by code or name..." 
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* ربط زراير الفلتر وتغيير الكلاس بناءً على الفلتر النشط */}
        <div className="filter-buttons">
          <button 
            className={`btn-filter ${activeFilter === 'All' ? 'active' : ''}`}
            onClick={() => setActiveFilter('All')}
          >
            All Depts
          </button>
          <button 
            className={`btn-filter ${activeFilter === 'CS' ? 'active' : ''}`}
            onClick={() => setActiveFilter('CS')}
          >
            CS Only
          </button>
          <button 
            className={`btn-filter ${activeFilter === 'MATH' ? 'active' : ''}`}
            onClick={() => setActiveFilter('MATH')}
          >
            Math Only
          </button>
        </div>
      </div>

      <div className="courses-list">
        {/* عرض المواد بعد تطبيق الفلاتر والبحث */}
        {availableCourses.length > 0 ? (
          availableCourses.map(course => (
            <DraggableCourseCard key={course.id} course={course} />
          ))
        ) : (
          <p style={{textAlign: 'center', color: '#94A3B8', marginTop: '20px', fontSize: '13px'}}>
            {searchQuery || activeFilter !== 'All' ? "No courses match your search." : "✅ All courses assigned!"}
          </p>
        )}
      </div>

      <div className="sidebar-footer">
        <div className="progress-text">
          <span>Progress</span>
          <span>{scheduledCourses.length} / {MOCK_UNASSIGNED.length} Assigned</span>
        </div>
        <div className="progress-bar-bg">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${(scheduledCourses.length / MOCK_UNASSIGNED.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;