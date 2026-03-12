import React, { useState, useEffect } from 'react';
import { FiAlertTriangle } from 'react-icons/fi'; // أيقونة التحذير للDanger Zone
import RoomForm from './RoomForm';
import './RoomManagement.css';

const EditRoom = ({ roomId }) => {
    const [roomData] = useState(null);

    useEffect(() => {
        if (roomId) {
            console.log("Fetching data for room ID:", roomId);
            // setRoomData({ ... });
        }
    }, [roomId]);

    const handleUpdate = (data) => {
        console.log("Updating Room:", data);
    };

    return (
        <div className="room-container">
            <h1 className="room-title">Edit Room/Lab Details</h1>
            <p className="room-subtitle">Update facility specifications, safety parameters, and capacity settings.</p>
            
            <RoomForm initialData={roomData} onSubmit={handleUpdate} buttonText="Save Changes" />

            <div className="danger-container">
                <div className="danger-text">
                    <h4><FiAlertTriangle /> Danger Zone</h4>
                    <p>Once a room is deleted, all historical schedule data will be archived.</p>
                </div>
                <button className="btn-danger">
                    Decommission Room
                </button>
            </div>
        </div>
    );
};

export default EditRoom;    