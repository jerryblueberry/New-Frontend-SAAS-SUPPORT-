import React, { useEffect, useRef } from 'react';
import './css/Toast.css';

const Toast = ({ message, type = 'error', onClose, duration = 2000 }) => {
  const timerRef = useRef(null);
  const messageRef = useRef(message);

  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Only set timer if duration is provided and message exists
    if (duration && message) {
      timerRef.current = setTimeout(() => {
        onClose();
      }, duration);
    }

    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [message, duration, onClose]); // Include message in dependencies

  // Update message ref when message changes
  useEffect(() => {
    messageRef.current = message;
  }, [message]);

  if (!message) return null;

  return (
    <div className={`toast toast--${type}`} role="alert">
      <div className="toast__content">
        <div className="toast__icon">
          {type === 'error' && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
          {type === 'success' && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          )}
        </div>
        <div className="toast__message">{message}</div>
      </div>
      <button className="toast__close" onClick={onClose} aria-label="Close notification">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
};

export default Toast;