import React from 'react';
import { useSchedule } from '../context/ScheduleContext';
// تأكد إنك رابط الـ CSS لو مش مربوط في المايسترو
import '../ScheduleBuilder.css'; 

const Toast = () => {
  const { toast } = useSchedule();

  if (!toast.visible) return null;

  const isError = toast.type === 'error';
  const icon = isError ? '⚠️' : (toast.type === 'success' ? '✅' : 'ℹ️');

  return (
    <div className={`custom-toast ${isError ? 'toast-error' : ''}`}>
      <div className="toast-icon-wrapper">
        <span className="toast-icon">{icon}</span>
      </div>
      <div className="toast-content">
        <h4 className="toast-title">{toast.title}</h4>
        <p className="toast-message">{toast.message}</p>
      </div>
    </div>
  );
};

export default Toast;