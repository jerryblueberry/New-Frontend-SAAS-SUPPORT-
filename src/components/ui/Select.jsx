import React from 'react';
import './css/Select.css';

const Select = ({
  id,
  name,
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  required = false,
  error,
  helperText,
  size = 'medium',
  className = '',
  ...props
}) => {
  // Generate a unique ID if none is provided
  const selectId = id || `wrkr-select-${name || Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className={`wrkr-select-group ${className} ${size === 'small' ? 'wrkr-select-sm' : size === 'large' ? 'wrkr-select-lg' : ''}`}>
      {label && (
        <label htmlFor={selectId} className="wrkr-select-label">
          {label}
          {required && <span className="wrkr-select-required-mark"> *</span>}
        </label>
      )}
      
      <div className="wrkr-select-wrapper">
        <select
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          className={`wrkr-select-control ${error ? 'wrkr-select-error' : ''}`}
          required={required}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="wrkr-select-arrow"></div>
      </div>
      
      {error && (
        <div className="wrkr-select-error-message">
          {error}
        </div>
      )}
      
      {helperText && !error && (
        <div className="wrkr-select-helper-text">
          {helperText}
        </div>
      )}
    </div>
  );
};

export default Select;