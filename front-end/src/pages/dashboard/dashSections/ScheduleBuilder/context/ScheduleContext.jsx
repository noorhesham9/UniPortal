import React, { createContext, useState, useContext } from 'react';
import { detectConflict } from '../utils/conflictDetector';

export const ScheduleContext = createContext();

export const ScheduleProvider = ({ children }) => {
  const [scheduledCourses, setScheduledCourses] = useState([]);
  
  // حالة الإشعار
  const [toast, setToast] = useState({ visible: false, title: '', message: '', type: 'info' });

  // دالة لتشغيل الإشعار وإخفائه بعد 4 ثواني
  const showToast = (title, message, type = 'info') => {
    setToast({ visible: true, title, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 4000);
  };

  // دالة إضافة المادة للجدول
  const addCourseToSchedule = (newCourse) => {
    const isAlreadyScheduled = scheduledCourses.some(course => course.id === newCourse.id);
    
    // إشعار في حالة التكرار
    if (isAlreadyScheduled) {
      showToast("Cannot Add Course", `Course ${newCourse.id} is already in your schedule!`, "error");
      return;
    }

    const { hasConflict, conflictingCourse } = detectConflict(newCourse, scheduledCourses);

    const courseToAdd = {
      ...newCourse,
      isConflict: hasConflict,
      conflictMessage: hasConflict ? `Conflict with ${conflictingCourse.name}` : null,
    };

    setScheduledCourses((prev) => {
      const updatedSchedule = [...prev, courseToAdd];
      // إشعار بالنجاح والعدد
      showToast("Course Added", `You have assigned ${updatedSchedule.length} courses so far.`, "success");
      return updatedSchedule;
    });
  };

  // دالة الحذف
  const removeCourseFromSchedule = (courseId) => {
    setScheduledCourses((prev) => {
      const updatedSchedule = prev.filter(course => course.id !== courseId);
      // إشعار بالحذف
      showToast("Course Removed", `Course removed. ${updatedSchedule.length} courses currently assigned.`, "info");
      return updatedSchedule;
    });
  };

  return (
    <ScheduleContext.Provider value={{ scheduledCourses, addCourseToSchedule, removeCourseFromSchedule, toast }}>
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error("useSchedule must be used within a ScheduleProvider");
  }
  return context;
};