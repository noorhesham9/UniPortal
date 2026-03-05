import React from 'react';
import { useSchedule } from '../context/ScheduleContext';

const TIMES = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', 
  '06:00 PM', '07:00 PM', '08:00 PM'
];

const ScheduledCourseCard = ({ course }) => {
  const { removeCourseFromSchedule } = useSchedule();

  const calculatePosition = (startTime) => {
    const index = TIMES.indexOf(startTime);
    if (index === -1) return { top: '0px', height: '100px' };
    
    const topPosition = index * 80;
    return {
      top: `${topPosition + 4}px`, 
      // لو متعارضة، هنخلي الارتفاع auto عشان الكلام براحته
      height: course.isConflict ? 'auto' : '90px', 
      minHeight: '90px',
      zIndex: course.isConflict ? 10 : 5 
    };
  };

  const dynamicStyles = calculatePosition(course.startTime);
  const cardClass = course.isConflict ? 'scheduled-card conflict-card' : 'scheduled-card normal-card';

  return (
    <div className={cardClass} style={dynamicStyles}>
      <div className="scheduled-card-header">
        <span className="scheduled-course-id">{course.id}</span>
        
        <span 
          className="close-icon" 
          onClick={(e) => {
            e.stopPropagation(); // 🔥 السر هنا! بيمنع إن الكليك يضيع جوه الجدول
            removeCourseFromSchedule(course.id);
          }}
          title="Remove Course"
        >
          ×
        </span>
      </div>
      
      <div className="scheduled-course-name">{course.name}</div>
      
      <div className="scheduled-course-details">
        <span>📍 Rm 304</span>
        <span>🕒 {course.startTime} - {course.endTime}</span>
      </div>

      {course.isConflict && (
        <div className="conflict-message">
          <span className="conflict-icon">⚠️</span>
          <span>{course.conflictMessage}</span>
        </div>
      )}
    </div>
  );
};

export default ScheduledCourseCard;