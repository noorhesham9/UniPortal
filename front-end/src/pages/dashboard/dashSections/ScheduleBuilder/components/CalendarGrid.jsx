import React, { useState } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import ScheduledCourseCard from './ScheduledCourseCard';
import TimeSlot from './TimeSlot';

const TIMES = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', 
  '06:00 PM', '07:00 PM', '08:00 PM'
];

const CalendarGrid = () => {
  const { scheduledCourses } = useSchedule();

  // 1. حالة لحفظ تاريخ بداية الأسبوع (افتراضياً 14 سبتمبر 2024 زي التصميم)
  const [weekStart, setWeekStart] = useState(new Date(2024, 8, 14)); // شهر 8 في الجافاسكريبت يعني شهر 9 (سبتمبر)

  // 2. دالة لتقليب الأسابيع (الأسهم)
  const changeWeek = (offsetDays) => {
    const newDate = new Date(weekStart);
    newDate.setDate(newDate.getDate() + offsetDays);
    setWeekStart(newDate);
  };

  // 3. دالة بتولد أيام الأسبوع بناءً على تاريخ البداية
  const generateDays = () => {
    const daysArray = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 0; i < 6; i++) { // 6 أيام من السبت للخميس
      const currentDate = new Date(weekStart);
      currentDate.setDate(currentDate.getDate() + i);
      
      daysArray.push({
        id: dayNames[currentDate.getDay()], // بيجيب اسم اليوم
        num: currentDate.getDate().toString() // بيجيب رقم اليوم في الشهر
      });
    }
    return daysArray;
  };

  const DAYS = generateDays();

  // 4. دالة بتكتب العنوان اللي فوق (مثال: Sept 14 - Sept 19, 2024)
  const formatHeaderDate = () => {
    const endOfWeek = new Date(weekStart);
    endOfWeek.setDate(endOfWeek.getDate() + 5); // بنزود 5 أيام عشان نوصل للخميس

    const options = { month: 'short', day: 'numeric' };
    const startStr = weekStart.toLocaleDateString('en-US', options);
    const endStr = endOfWeek.toLocaleDateString('en-US', options);
    const year = weekStart.getFullYear();

    return `${startStr} - ${endStr}, ${year}`;
  };

  return (
    <>
      <div className="calendar-controls">
        <div style={{fontWeight: 700, color: '#0F172A', fontSize: '14px'}}>
          <span style={{background: '#F1F5F9', padding: '6px 12px', borderRadius: '6px', marginRight: '8px'}}>Weekly View</span>
          <span style={{color: '#64748B'}}>Room View</span>
        </div>
        
        {/* الأسهم هنا دلوقتي شغالة وبتقلب الأسبوع بجد! */}
        <div style={{fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '16px'}}>
          <span style={{cursor: 'pointer', padding: '0 8px'}} onClick={() => changeWeek(-7)}>&lt;</span>
          <span style={{width: '200px', textAlign: 'center'}}>{formatHeaderDate()}</span>
          <span style={{cursor: 'pointer', padding: '0 8px'}} onClick={() => changeWeek(7)}>&gt;</span>
        </div>
        
        <div style={{fontSize: '12px', fontWeight: 500, color: '#64748B'}}>
          <input type="checkbox" defaultChecked style={{marginRight: '8px', accentColor: '#F2D00D'}} /> 
          Show Conflicts
        </div>
      </div>

      <div className="calendar-grid-container">
        <div className="calendar-main">
          <div className="calendar-header">
            <div className="time-column-header">TIME</div>
            {DAYS.map((day, index) => (
              <div key={index} className="day-header">
                <h4>{day.id}</h4>
                <p>{day.num}</p>
              </div>
            ))}
          </div>

          <div className="calendar-body">
            <div className="time-column">
              {TIMES.map((time, index) => (
                <div key={index} className="time-label">{time}</div>
              ))}
            </div>

            {DAYS.map((day, index) => (
              <div key={index} className="day-column">
                {TIMES.map((time, idx) => (
                  <TimeSlot key={`${day.id}-${time}-${idx}`} day={day.id} time={time} />
                ))}

                {scheduledCourses
                  .filter(course => course.days.includes(day.id))
                  .map(course => (
                    <ScheduledCourseCard key={`${course.id}-${day.id}`} course={course} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default CalendarGrid;