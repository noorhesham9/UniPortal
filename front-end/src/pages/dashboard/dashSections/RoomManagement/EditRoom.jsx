import React, { useState, useEffect } from 'react';
import RoomForm from './RoomForm';

const EditRoom = () => {
    const [roomData, setRoomData] = useState(null);

    useEffect(() => {
        // هنا هتجيب بيانات الغرفة من الـ Back-end بناءً على الـ ID
        // setRoomData(fetchedData);
    }, []);

    const handleUpdate = (data) => {
        console.log("Updating Room:", data);
    };

    return (
        <div className="room-container">
            <h2 style={{marginBottom: '5px'}}>Edit Room/Lab Details</h2>
            <p style={{color: '#a0aec0', fontSize: '0.9rem', marginBottom: '25px'}}>Update facility specifications and capacity settings.</p>
            
            <RoomForm initialData={roomData} onSubmit={handleUpdate} buttonText="Save Changes" />

            <div className="danger-zone">
                <div>
                    <div style={{color: '#f56565', fontWeight: 'bold'}}>Danger Zone</div>
                    <div style={{color: '#718096', fontSize: '0.8rem'}}>Once a room is deleted, all data will be archived.</div>
                </div>
                <button style={{background: 'none', border: '1px solid #f56565', color: '#f56565', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer'}}>
                    Decommission Room
                </button>
            </div>
        </div>
    );
};

export default EditRoom;