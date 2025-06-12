import React from 'react';
import './css/ErrorMessage.css';

export const ErrorMessage = ({ message = 'An error occurred', className = '' }) => {
  return (
    <div className={`error-message ${className}`}>
      <div className="error-icon">!</div>
      <p className="error-text">{message}</p>
    </div>
  );
}; 