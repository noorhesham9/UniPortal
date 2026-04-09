import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiAlertTriangle } from "react-icons/fi";
import { getRooms, updateRoom, deleteRoom } from "../../../../services/RoomServices";
import RoomForm from "./RoomForm";
import "./RoomManagement.css";

const EditRoom = ({ roomId }) => {
  const navigate = useNavigate();
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!roomId) return;
    const fetchRoom = async () => {
      setLoading(true);
      try {
        const rooms = await getRooms();
        const found = (Array.isArray(rooms) ? rooms : rooms.rooms || []).find((r) => r._id === roomId);
        if (found) setRoomData(found);
      } catch (err) {
        setError("Failed to load room data.");
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [roomId]);

  const handleUpdate = async (data) => {
    setSaving(true);
    setError(null);
    try {
      await updateRoom(roomId, data);
      navigate("/dashboard?section=admin_rooms");
    } catch (err) {
      setError(err?.message || "Failed to update room.");
    } finally {
      setSaving(false);
    }
  };

  const handleDecommission = async () => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    try {
      await deleteRoom(roomId);
      navigate("/dashboard?section=admin_rooms");
    } catch (err) {
      setError(err?.message || "Failed to delete room.");
    }
  };

  if (loading) return <div className="room-container">Loading...</div>;

  return (
    <div className="room-container">
      <h1 className="room-title">Edit Room/Lab Details</h1>
      <p className="room-subtitle">Update facility specifications, safety parameters, and capacity settings.</p>
      {error && (
        <div style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      <RoomForm initialData={roomData} onSubmit={handleUpdate} buttonText={saving ? "Saving..." : "Save Changes"} />
      <div className="danger-container">
        <div className="danger-text">
          <h4><FiAlertTriangle /> Danger Zone</h4>
          <p>Once a room is deleted, all historical schedule data will be archived.</p>
        </div>
        <button className="btn-danger" onClick={handleDecommission}>Decommission Room</button>
      </div>
    </div>
  );
};

export default EditRoom;
