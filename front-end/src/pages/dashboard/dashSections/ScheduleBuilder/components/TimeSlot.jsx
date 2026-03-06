import React from 'react';
import { useDroppable } from '@dnd-kit/core';

const TimeSlot = ({ day, time }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `${day}-${time}`,
    data: { day, time },
  });

  return (
    <div
      ref={setNodeRef}
      className={`time-slot ${isOver ? 'time-slot-hover' : ''}`}
    >
      {/* الخانة دي فاضية، بتستنى الـ Drop بس */}
    </div>
  );
};

export default TimeSlot;