import React from 'react';
import RoomForm from './RoomForm';

const AddRoom = () => {
    const handleCreate = async (data) => {
        // نداء الـ API الخاص بالإطافة
        console.log("Creating Room:", data);
        // fetch('/api/rooms', { method: 'POST', body: JSON.stringify(data) ... })
    };

    return (
        <div className="room-container">
            <h2 style={{marginBottom: '20px'}}>Add New Room/Lab</h2>
            <RoomForm onSubmit={handleCreate} buttonText="Save Changes" />
        </div>
    );
};

export default AddRoom;