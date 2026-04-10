import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoom } from '../../../../services/RoomServices';
import RoomForm from './RoomForm';
import './RoomManagement.css';

const AddRoom = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleCreate = async (data) => {
        setLoading(true);
        setError(null);
        try {
            await createRoom(data);
            navigate('/dashboard?section=admin_rooms');
        } catch (err) {
            setError(err?.message || 'Failed to create room. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="room-container">
            <h1 className="room-title">Add Room</h1>
            <p className="room-subtitle">Create a new facility and set its parameters.</p>
            {error && (
                <div style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
                    {error}
                </div>
            )}
            <RoomForm onSubmit={handleCreate} buttonText={loading ? 'Saving...' : 'Save Changes'} />
        </div>
    );
};

export default AddRoom;