import React from 'react';
import RoomForm from './RoomForm';
import './RoomManagement.css'; // تأكد إنك عامل Import للـ CSS هنا برضه

const AddRoom = () => {
    const handleCreate = async (data) => {
        console.log("Creating Room:", data);
    };

    return (
        <div className="room-container">
            <h1 className="room-title">Edit Room/Lab Details</h1>
            <p className="room-subtitle">Create a new facility and set its parameters.</p>
            <RoomForm onSubmit={handleCreate} buttonText="Save Changes" />
        </div>
    );
};

export default AddRoom;