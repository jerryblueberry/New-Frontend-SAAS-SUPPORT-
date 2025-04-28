// src/components/Onboarding/Modals/TimeSlotModal.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, X } from 'lucide-react';

const TimeSlotModal = ({ isOpen, onClose, onSave, initialData, daysOfWeek }) => {
  const [formData, setFormData] = useState(
    initialData || {
      dayOfWeek: daysOfWeek[0],
      startTime: '09:00',
      endTime: '17:00',
    }
  );

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        dayOfWeek: daysOfWeek[0],
        startTime: '09:00',
        endTime: '17:00',
      });
    }
  }, [initialData, daysOfWeek]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate that end time is after start time
    if (formData.startTime >= formData.endTime) {
      alert('End time must be after start time');
      return;
    }
    
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="avail-modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="avail-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="avail-modal-header">
          <div className="avail-modal-title">
            <h3>{initialData && initialData.dayOfWeek ? 'Edit Time Slot' : 'Add Custom Time Slot'}</h3>
            <p className="avail-modal-subtitle">Set specific hours when you're available to work</p>
          </div>
          <button 
            type="button" 
            className="avail-modal-close" 
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="avail-modal-form">
          <div className="avail-form-group">
            <label htmlFor="dayOfWeek" className="avail-form-label">
              <Calendar size={18} />
              <span>Day of Week</span>
            </label>
            <select
              id="dayOfWeek"
              name="dayOfWeek"
              value={formData.dayOfWeek}
              onChange={handleChange}
              className="avail-form-select"
              required
            >
              {daysOfWeek.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>
          
          <div className="avail-form-row">
            <div className="avail-form-group">
              <label htmlFor="startTime" className="avail-form-label">
                <Clock size={18} />
                <span>Start Time</span>
              </label>
              <input
                id="startTime"
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleChange}
                className="avail-form-input"
                required
              />
            </div>
            
            <div className="avail-form-group">
              <label htmlFor="endTime" className="avail-form-label">
                <Clock size={18} />
                <span>End Time</span>
              </label>
              <input
                id="endTime"
                name="endTime"
                type="time"
                value={formData.endTime}
                onChange={handleChange}
                className="avail-form-input"
                required
              />
            </div>
          </div>
          
          <div className="avail-modal-actions">
            <button 
              type="button" 
              className="avail-btn-secondary" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="avail-btn-primary">
              Save Time Slot
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TimeSlotModal;