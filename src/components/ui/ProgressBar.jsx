import React from 'react';
import './css/ProgressBar.css';

const ProgressBar = ({
  currentStep = 1,
  totalSteps = 4,
  steps = [],
  variant = 'primary',
  animated = true,
  className = '',
  ...props
}) => {
  // Ensure currentStep is valid
  const normalizedStep = Math.min(Math.max(1, currentStep), totalSteps);
  
  // Calculate percentage
  const percentage = ((normalizedStep - 1) / (totalSteps - 1)) * 100;
  
  return (
    <div className={`step-progress-container ${className}`} {...props}>
      <div className="step-progress-track">
        <div 
          className={`step-progress-bar step-progress-${variant} ${animated ? 'step-progress-animated' : ''}`}
          style={{ width: `${percentage}%` }}
        >
          {animated && (
            <div 
              className="step-progress-glow" 
              style={{ left: `${percentage}%` }}
            />
          )}
        </div>
      </div>
      
      <div className="step-indicators">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber <= normalizedStep;
          const isCurrent = stepNumber === normalizedStep;
          const stepPosition = `${(index / (totalSteps - 1)) * 100}%`;
          
          return (
            <div
              key={index}
              className={`step-indicator ${isActive ? 'step-active' : ''} ${isCurrent ? 'step-current' : ''}`}
            >
              <div className="step-dot"></div>
              {steps[index] && (
                <div className="step-label">
                  {steps[index].label || stepNumber}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressBar;