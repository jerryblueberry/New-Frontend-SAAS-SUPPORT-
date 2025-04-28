// src/components/Onboarding/AvailabilityForm.jsx
import React, { useState, useCallback,useEffect } from 'react';
import { Calendar, Clock, Plus, Edit2, Trash2, AlertCircle, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import useOnboardingStore, { useAvailabilityMutation } from '../../stores/useOnboardingStore';
import TimeSlotModal from './Modals/TimeSlotModal';
import { daysOfWeek, standardTimeSlots } from '../../utils/constants';
import './css/AvailabilityForm.css'; // We'll create this CSS file separately

const CustomTimeSlotCard = ({ slot, index, onEdit, onRemove, disabled }) => {
  // Format time for better display
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="avail-custom-slot-item">
      <div className="avail-slot-content">
        <div className="avail-slot-day-badge">{slot.dayOfWeek.slice(0, 3)}</div>
        <div className="avail-slot-details">
          <span className="avail-slot-time">
            <Clock size={16} />
            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
          </span>
          <span className="avail-slot-duration">
            {calculateDuration(slot.startTime, slot.endTime)}
          </span>
        </div>
      </div>
      <div className="avail-slot-actions">
        <button 
          type="button" 
          className="avail-btn-icon"
          onClick={() => onEdit(slot, index)}
          disabled={disabled}
          aria-label="Edit slot"
        >
          <Edit2 size={16} />
        </button>
        <button 
          type="button" 
          className="avail-btn-icon avail-btn-danger"
          onClick={() => onRemove(index)}
          disabled={disabled}
          aria-label="Remove slot"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

// Helper function to calculate the duration between two time strings
const calculateDuration = (startTime, endTime) => {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  const durationMinutes = endMinutes - startMinutes;
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  
  if (hours === 0) {
    return `${minutes} mins`;
  } else if (minutes === 0) {
    return `${hours} hr${hours > 1 ? 's' : ''}`;
  } else {
    return `${hours} hr${hours > 1 ? 's' : ''} ${minutes} min${minutes > 1 ? 's' : ''}`;
  }
};

const AvailabilityForm = () => {
  // Get state from store
  const availability = useOnboardingStore(state => state.availability);
  const currentStep = useOnboardingStore(state => state.currentStep);
  
  // Get actions from store
  const updateAvailability = useOnboardingStore(state => state.updateAvailability);
  const toggleTimeSlot = useOnboardingStore(state => state.toggleTimeSlot);
  const addCustomTimeSlot = useOnboardingStore(state => state.addCustomTimeSlot);
  const removeCustomTimeSlot = useOnboardingStore(state => state.removeCustomTimeSlot);
  const prevStep = useOnboardingStore(state => state.prevStep);
  
  // Use the mutation hook
  const { mutate: saveAvailability, isPending, error: mutationError } = useAvailabilityMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [localError, setLocalError] = useState(null);
  const [activeTab, setActiveTab] = useState('standard'); // 'standard' or 'custom'

  // Form submission handler
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    setLocalError(null);
    
    // Validate that at least one time slot is selected
    const hasStandardSlots = availability.weeklySchedule.some(day => day.slots.length > 0);
    const hasCustomSlots = availability.customTimeSlots.length > 0;
    
    if (!hasStandardSlots && !hasCustomSlots) {
      setLocalError("Please select at least one time slot to continue");
      return;
    }
    
    saveAvailability(availability);
  }, [availability, saveAvailability]);

  // Handler for changing notes
  const handleNotesChange = useCallback((e) => {
    updateAvailability({ notes: e.target.value });
  }, [updateAvailability]);

  // Modal handlers
  const handleAddCustomSlot = useCallback(() => {
    setEditingSlot(null);
    setIsModalOpen(true);
  }, []);

  const handleEditCustomSlot = useCallback((slot, index) => {
    setEditingSlot({ ...slot, index });
    setIsModalOpen(true);
  }, []);

  const handleSaveCustomSlot = useCallback((slot) => {
    if (editingSlot?.index !== undefined) {
      // Update existing slot
      const updatedSlots = [...availability.customTimeSlots];
      updatedSlots[editingSlot.index] = slot;
      updateAvailability({ customTimeSlots: updatedSlots });
    } else {
      // Add new slot
      addCustomTimeSlot(slot);
    }
    setIsModalOpen(false);
    // Switch to custom tab after adding
    setActiveTab('custom');
  }, [editingSlot, availability.customTimeSlots, updateAvailability, addCustomTimeSlot]);

  const handleRemoveCustomSlot = useCallback((index) => {
    removeCustomTimeSlot(index);
  }, [removeCustomTimeSlot]);

  // Combine errors
  const error = mutationError || localError;
  // / Add this effect to ensure availability data is loaded correctly
  useEffect(() => {
    // If the weeklySchedule is empty or not properly initialized
    if (!availability.weeklySchedule || availability.weeklySchedule.length === 0) {
      // Initialize with default data from constants
      const defaultWeeklySchedule = daysOfWeek.map(day => ({
        day,
        slots: []
      }));
      
      // Update the store
      updateAvailability({ 
        weeklySchedule: defaultWeeklySchedule,
        // If customTimeSlots is also missing, initialize it
        customTimeSlots: availability.customTimeSlots || [] 
      });
    }
  }, [availability, updateAvailability]);

  return (
    <div className="avail-container">
      <form onSubmit={handleSubmit} className="avail-form">
        {error && (
          <div className="avail-error-message">
            <AlertCircle size={18} />
            <span>
              {typeof error === 'string' ? error : 
                error.response?.data?.message || 'An error occurred while saving your availability'}
            </span>
          </div>
        )}

        <div className="avail-form-header">
          <h2>Your Availability</h2>
          <p className="avail-header-desc">
            Set your regular working hours so clients know when you're available
          </p>
        </div>

        <div className="avail-tabs">
          <button 
            type="button"
            className={`avail-tab ${activeTab === 'standard' ? 'active' : ''}`}
            onClick={() => setActiveTab('standard')}
          >
            <Calendar size={18} />
            <span>Standard Schedule</span>
          </button>
          <button 
            type="button"
            className={`avail-tab ${activeTab === 'custom' ? 'active' : ''}`}
            onClick={() => setActiveTab('custom')}
          >
            <Clock size={18} />
            <span>Custom Time Slots</span>
            {availability.customTimeSlots.length > 0 && (
              <span className="avail-badge">{availability.customTimeSlots.length}</span>
            )}
          </button>
        </div>

        <div className="avail-tab-content">
          {activeTab === 'standard' && (
            <div className="avail-standard-schedule">
              <div className="avail-grid-container">
                <div className="avail-info-message">
                  <Info size={16} />
                  <span>Select the time blocks when you're typically available to work</span>
                </div>
                
                <div className="avail-grid">
                  <div className="avail-grid-header">
                    <div className="avail-day-cell"></div>
                    {standardTimeSlots.map(slot => (
                      <div key={slot.id} className="avail-time-header-cell">{slot.label}</div>
                    ))}
                  </div>

                  <div className="avail-grid-body">
                    {availability.weeklySchedule.map((day, dayIndex) => (
                      <div key={day.day} className="avail-day-row">
                        <div className="avail-day-cell">{day.day}</div>
                        {standardTimeSlots.map(slot => (
                          <div key={slot.id} className="avail-time-cell"  data-time={slot.label}>
                            <input
                              type="checkbox"
                              id={`${day.day}-${slot.id}`}
                              checked={day.slots.includes(slot.id)}
                              onChange={() => toggleTimeSlot(dayIndex, slot.id)}
                              disabled={isPending}
                              className="avail-checkbox-input"
                            />
                            <label 
                              htmlFor={`${day.day}-${slot.id}`}
                              className="avail-checkbox-label"
                              aria-label={`${day.day} ${slot.label}`}
                            ></label>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'custom' && (
            <div className="avail-custom-schedule">
              <div className="avail-info-message">
                <Info size={16} />
                <span>Add specific time slots that don't fit into the regular schedule pattern</span>
              </div>
              
              <div className="avail-custom-slots">
                <div className="avail-slots-header">
                  <h3>Your Custom Time Slots</h3>
                  <button 
                    type="button" 
                    className="avail-btn-add"
                    onClick={handleAddCustomSlot}
                    disabled={isPending}
                  >
                    <Plus size={16} />
                    <span>Add Slot</span>
                  </button>
                </div>
                
                {availability.customTimeSlots.length > 0 ? (
                  <div className="avail-custom-slots-grid">
                    {availability.customTimeSlots.map((slot, index) => (
                      <CustomTimeSlotCard
                        key={index}
                        slot={slot}
                        index={index}
                        onEdit={handleEditCustomSlot}
                        onRemove={handleRemoveCustomSlot}
                        disabled={isPending}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="avail-no-slots">
                    <div className="avail-no-slots-content">
                      <Clock size={40} className="avail-no-slots-icon" />
                      <h4>No custom slots yet</h4>
                      <p>Add specific times when you're available to work</p>
                      <button 
                        type="button" 
                        className="avail-btn-primary avail-btn-add-first"
                        onClick={handleAddCustomSlot}
                      >
                        <Plus size={16} />
                        <span>Add Your First Time Slot</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="avail-form-section">
          <div className="avail-section-header">
            <h3>Additional Notes</h3>
          </div>
          <p className="avail-section-desc">Add any special requests, constraints, or details about your availability</p>
          <textarea
            value={availability.notes}
            onChange={handleNotesChange}
            placeholder="Example: I prefer weekday evenings, I can work weekends with advance notice, I am unavailable during public holidays..."
            className="avail-notes-textarea"
            rows={4}
            disabled={isPending}
          ></textarea>
        </div>

        <div className="avail-form-actions">
          <button 
            type="button" 
            className="avail-btn-secondary"
            onClick={prevStep}
            disabled={isPending}
          >
            <ChevronLeft size={16} />
            <span>Back to Profile</span>
          </button>
          <button 
            type="submit" 
            className="avail-btn-primary"
            disabled={isPending}
          >
            <span>{isPending ? 'Saving...' : 'Next: Certifications'}</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </form>

      {isModalOpen && (
        <TimeSlotModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveCustomSlot}
          initialData={editingSlot}
          daysOfWeek={daysOfWeek}
        />
      )}
    </div>
  );
};

export default React.memo(AvailabilityForm);