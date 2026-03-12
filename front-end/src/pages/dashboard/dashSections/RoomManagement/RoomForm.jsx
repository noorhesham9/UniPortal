import React, { useState, useEffect } from 'react';
import './RoomManagement.css';

const RoomForm = ({ initialData, onSubmit, buttonText }) => {
    const [formData, setFormData] = useState({
        room_name: '',
        building_section: 'Science Block A',
        type: 'Physics Lab',
        capacity: '',
        equipment_notes: '',
        is_active: true,
        keycard_access: false
    });

    useEffect(() => {
        if (initialData) setFormData(initialData);
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <form className="room-form-card" onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}>
            <div className="section-title"><span>ⓘ</span> General Information</div>
            
            <div className="form-grid">
                <div className="input-group">
                    <label>Room Name/Label</label>
                    <input name="room_name" value={formData.room_name} onChange={handleChange} required />
                </div>
                <div className="input-group">
                    <label>Building Section</label>
                    <select name="building_section" value={formData.building_section} onChange={handleChange}>
                        <option value="Science Block A">Science Block A</option>
                        <option value="Science Block B">Science Block B</option>
                    </select>
                </div>
                <div className="input-group">
                    <label>Room Type</label>
                    <select name="type" value={formData.type} onChange={handleChange}>
                        <option value="Physics Lab">Physics Lab</option>
                        <option value="Lecture Hall">Lecture Hall</option>
                        <option value="Tutorial">Tutorial</option>
                    </select>
                </div>
                <div className="input-group">
                    <label>Max Capacity</label>
                    <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} />
                </div>
                <div className="input-group full-width">
                    <label>Equipment Notes</label>
                    <textarea name="equipment_notes" rows="4" value={formData.equipment_notes} onChange={handleChange}></textarea>
                </div>

                {/* Toggles */}
                <div className="toggle-container">
                    <div>
                        <div style={{fontSize: '0.8rem', fontWeight: 'bold'}}>ACTIVE STATUS</div>
                        <div style={{fontSize: '0.7rem', color: '#718096'}}>Enable for scheduling</div>
                    </div>
                    <label className="switch">
                        <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} />
                        <span className="slider"></span>
                    </label>
                </div>

                <div className="toggle-container">
                    <div>
                        <div style={{fontSize: '0.8rem', fontWeight: 'bold'}}>KEYCARD ACCESS</div>
                        <div style={{fontSize: '0.7rem', color: '#718096'}}>Require digital entry</div>
                    </div>
                    <label className="switch">
                        <input type="checkbox" name="keycard_access" checked={formData.keycard_access} onChange={handleChange} />
                        <span className="slider"></span>
                    </label>
                </div>
            </div>

            <div style={{display: 'flex', justifyContent: 'end', gap: '15px', marginTop: '30px'}}>
                <button type="button" style={{background: 'none', border: 'none', color: '#a0aec0', cursor: 'pointer'}}>Cancel</button>
                <button type="submit" className="btn-save">{buttonText}</button>
            </div>
        </form>
    );
};

export default RoomForm;