import React, { useState } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { ScheduleProvider, useSchedule } from './context/ScheduleContext';
import Sidebar from './components/Sidebar'; 
import CalendarGrid from './components/CalendarGrid';
import DraggableCourseCard from './components/DraggableCourseCard';
import Toast from './components/Toast'; // 👈 استدعاء مكون الرسالة
import './ScheduleBuilder.css';

const ScheduleLayout = () => {
  const { addCourseToSchedule } = useSchedule();
  const [activeCourse, setActiveCourse] = useState(null);

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveCourse(active.data.current.course);
  };

  const handleDragEnd = (event) => {
    setActiveCourse(null);
    const { active, over } = event;
    
    if (!over) return;

    const draggedCourse = active.data.current.course;
    const targetDay = over.data.current.day;
    const targetTime = over.data.current.time;

    const calculateEndTime = (startTime) => {
      if (!startTime) return "09:20 AM";
      let [time, modifier] = startTime.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      
      let endHours = hours + 1;
      if (endHours === 13) endHours = 1;
      let endModifier = (hours === 11) ? (modifier === 'AM' ? 'PM' : 'AM') : modifier;
      
      return `${endHours < 10 ? '0'+endHours : endHours}:20 ${endModifier}`;
    };

    const updatedCourse = {
      ...draggedCourse,
      days: [targetDay],
      startTime: targetTime,
      endTime: calculateEndTime(targetTime),
    };

    addCourseToSchedule(updatedCourse);
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {/* لازم نخلي الحاوية دي relative عشان الـ Toast يظهر جواها في الكورنر */}
      <div className="schedule-workspace" style={{ position: 'relative' }}>
        <Sidebar />
        <div className="calendar-section">
          <CalendarGrid />
        </div>
        
        {/* 👈 عرض الرسالة هنا */}
        <Toast /> 
      </div>

      <DragOverlay>
        {activeCourse ? <DraggableCourseCard course={activeCourse} /> : null}
      </DragOverlay>
    </DndContext>
  );
};

const ScheduleBuilder = () => {
  return (
    <ScheduleProvider>
      <ScheduleLayout />
    </ScheduleProvider>
  );
};

export default ScheduleBuilder;