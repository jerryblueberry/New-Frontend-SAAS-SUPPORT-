import React, { useState, useEffect } from 'react';
import './css/ProgressBar.css';

const StepModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;
  
  return (
    <div className="step-modal-overlay" onClick={onClose}>
      <div className="step-modal" onClick={(e) => e.stopPropagation()}>
        <div className="step-modal-header">
          <h3>Incomplete Step</h3>
          <button className="step-modal-close" onClick={onClose} aria-label="Close modal">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="step-modal-body">
          <div className="step-modal-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#FF5252" strokeWidth="2" />
              <path d="M12 7V13" stroke="#FF5252" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="17" r="1" fill="#FF5252" />
            </svg>
          </div>
          <p>{message || "Please complete the current step before proceeding."}</p>
        </div>
        <div className="step-modal-footer">
          <button className="step-modal-button" onClick={onClose}>OK</button>
        </div>
      </div>
    </div>
  );
};

const ProgressBar = ({
  currentStep = 1,
  totalSteps = 4,
  steps = [],
  variant = 'primary',
  animated = true,
  className = '',
  onStepClick,
  completedSteps = [],
  ...props
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [animationActive, setAnimationActive] = useState(false);
  
  const normalizedStep = Math.min(Math.max(1, currentStep), totalSteps);
  const percentage = ((normalizedStep - 1) / (totalSteps - 1)) * 100;
  
  useEffect(() => {
    // Trigger animation when currentStep changes
    setAnimationActive(true);
    const timer = setTimeout(() => setAnimationActive(false), 1500);
    return () => clearTimeout(timer);
  }, [currentStep]);

  // Normalize steps data
  const stepsData = Array.from({ length: totalSteps }).map((_, index) => {
    const stepNumber = index + 1;
    return {
      number: stepNumber,
      label: steps[index]?.label || `Step ${stepNumber}`,
      ...(steps[index] || {})
    };
  });

  const handleStepClick = (stepNumber) => {
    // Allow navigation to completed steps or to the current step
    if (completedSteps.includes(stepNumber) || stepNumber === currentStep) {
      if (onStepClick) {
        onStepClick(stepNumber);
      }
    } else if (stepNumber > currentStep) {
      // Show modal when trying to access a future uncompleted step
      setModalMessage(`Please complete Step ${currentStep} before proceeding to Step ${stepNumber}.`);
      setModalOpen(true);
    } else {
      // For past steps that aren't completed (shouldn't happen with proper state management)
      setModalMessage(`Please complete Step ${stepNumber} before proceeding.`);
      setModalOpen(true);
    }
  };

  // Determine color class based on variant
  const colorClass = `step-progress-${variant}`;

  return (
    <div className={`step-progress-container ${className}`} {...props}>
      <div className="step-progress-track">
        <div 
          className={`step-progress-bar ${colorClass} ${animated ? 'step-progress-animated' : ''} ${animationActive ? 'animate-progress' : ''}`}
          style={{ width: `${percentage}%` }}
        >
          {animated && (
            <>
              <div className="step-progress-glow"></div>
              <div className="step-progress-pulse"></div>
            </>
          )}
        </div>
      </div>
      
      <div className="step-indicators">
        {stepsData.map((step, index) => {
          const stepNumber = step.number;
          const isActive = stepNumber <= normalizedStep;
          const isCurrent = stepNumber === normalizedStep;
          const isCompleted = completedSteps.includes(stepNumber);
          
          return (
            <div
              key={index}
              className={`step-indicator ${isActive ? 'step-active' : ''} ${isCurrent ? 'step-current' : ''} ${isCompleted ? 'step-completed' : ''}`}
              onClick={() => handleStepClick(stepNumber)}
              style={{
                left: `${(index / (totalSteps - 1)) * 100}%`
              }}
              aria-current={isCurrent ? "step" : undefined}
              aria-label={`${step.label}${isCompleted ? ' (completed)' : isCurrent ? ' (current)' : ''}`}
            >
              <div className="step-dot">
                {isCompleted && !isCurrent ? (
                  <svg className="step-completed-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12L10 17L19 8" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <span className="step-number">{stepNumber}</span>
                )}
              </div>
              <div className="step-label">
                {step.label}
              </div>
            </div>
          );
        })}
      </div>
      
      {totalSteps > 1 && (
        <div className="step-connector">
          {stepsData.map((_, index) => {
            // Don't render the last connector
            if (index === totalSteps - 1) return null;
            
            const connectorActive = normalizedStep > index + 1;
            const connectorStart = (index / (totalSteps - 1)) * 100;
            const connectorEnd = ((index + 1) / (totalSteps - 1)) * 100;
            const connectorWidth = connectorEnd - connectorStart;
            
            return (
              <div 
                key={index}
                className={`step-connector-line ${connectorActive ? 'connector-active' : ''}`}
                style={{
                  left: `${connectorStart}%`,
                  width: `${connectorWidth}%`
                }}
              />
            );
          })}
        </div>
      )}
      
      {/* Modal for incomplete steps */}
      <StepModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        message={modalMessage} 
      />
    </div>
  );
};

export default ProgressBar;