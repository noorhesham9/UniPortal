import React, { useState, useEffect } from 'react';
import { FiInfo, FiShield, FiLock, FiSave } from 'react-icons/fi';
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
            <div className="section-header">
                <FiInfo style={{ fontSize: '1.2rem' }} /> 
                <span>General Information</span>
            </div>
            
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
                <div className="toggle-card">
                    <div className="toggle-info">
                        <FiShield style={{ color: '#e3b341', fontSize: '1.5rem' }} />
                        <div>
                            <div className="toggle-label">Active Status</div>
                            <div className="toggle-desc">Enable for scheduling</div>
                        </div>
                    </div>
                    <label className="switch">
                        <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} />
                        <span className="slider"></span>
                    </label>
                </div>

                <div className="toggle-card">
                    <div className="toggle-info">
                        <FiLock style={{ color: '#e3b341', fontSize: '1.5rem' }} />
                        <div>
                            <div className="toggle-label">Keycard Access</div>
                            <div className="toggle-desc">Require digital entry</div>
                        </div>
                    </div>
                    <label className="switch">
                        <input type="checkbox" name="keycard_access" checked={formData.keycard_access} onChange={handleChange} />
                        <span className="slider"></span>
                    </label>
                </div>
            </div>

            <div className="form-actions">
                <button type="button" className="btn-cancel">Cancel</button>
                <button type="submit" className="btn-save">
                    <FiSave style={{ fontSize: '1.1rem' }} /> {buttonText}
                </button>
            </div>
        </form>
    );
};

export default RoomForm;