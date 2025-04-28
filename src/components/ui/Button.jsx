// --- components/ui/Button.jsx ---
import React from 'react';

const Button = ({ 
  children, 
  type = 'button', 
  variant = 'primary', 
  size = 'medium', 
  fullWidth = false, 
  onClick, 
  disabled = false,
  className = '',
  ...props 
}) => {
  const baseClass = 'btn';
  
  const variantClass = variant === 'outline' 
    ? 'btn-outline' 
    : variant === 'secondary'
      ? 'btn-secondary'
      : 'btn-primary';
  
  const sizeClass = size === 'small' 
    ? 'py-2 px-3 text-sm' 
    : size === 'large'
      ? 'py-3 px-6 text-lg'
      : ''; // Default size is already set in CSS
  
  const widthClass = fullWidth ? 'btn-block' : '';
  
  const finalClassName = `${baseClass} ${variantClass} ${sizeClass} ${widthClass} ${className}`.trim();
  
  return (
    <button
      type={type}
      className={finalClassName}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
