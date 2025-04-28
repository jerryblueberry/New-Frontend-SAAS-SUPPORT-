// --- components/ui/Input.jsx ---
import React from 'react';

const Input = ({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  helperText,
  className = '',
  ...props
}) => {
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="text-danger"> *</span>}
        </label>
      )}
      
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`form-control ${error ? 'border-danger' : ''}`}
        {...props}
      />
      
      {error && (
        <div className="text-danger" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
          {error}
        </div>
      )}
      
      {helperText && !error && (
        <div className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
          {helperText}
        </div>
      )}
    </div>
  );
};

export default Input;