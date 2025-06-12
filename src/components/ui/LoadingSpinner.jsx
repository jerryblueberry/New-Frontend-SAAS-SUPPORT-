import React from 'react';
import './css/LoadingSpinner.css';

export const LoadingSpinner = ({ size = 'medium', className = '' }) => {
  return (
    <div className={`loading-spinner ${size} ${className}`}>
      <div className="spinner"></div>
    </div>
  );
}; 