import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

const DraggableCourseCard = ({ course }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: course.id,
    data: { course },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 99 : 1,
  };

  // تحديد لون البادج بناءً على القسم
  let badgeClass = 'badge-cs';
  if (course.type === 'MATH') badgeClass = 'badge-math';
  if (course.type === 'BIO') badgeClass = 'badge-bio';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="draggable-card"
    >
      <div className="card-header-drag">
        <span className={`card-badge ${badgeClass}`}>{course.id}</span>
        <span className="credits-text">{course.credits} Credits</span>
      </div>
      <h4 className="card-title">{course.name}</h4>
      <p className="card-prof">👤 {course.prof}</p>
    </div>
  );
};

export default DraggableCourseCard;