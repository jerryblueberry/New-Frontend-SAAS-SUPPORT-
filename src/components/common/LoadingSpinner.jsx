import React from 'react';
import PropTypes from 'prop-types';
import './css/LoadingSpinner.css'; // We'll create this CSS file

const LoadingSpinner = ({ 
  fullPage = false, 
  size = 'md', 
  className = '',
  color = 'primary',
  variant = 'classic'
}) => {
  const spinnerClassNames = [
    'loading-spinner',
    `loading-spinner--${size}`,
    `loading-spinner--${color}`,
    `loading-spinner--${variant}`,
    className
  ].filter(Boolean).join(' ');

  const spinner = (
    <div className={spinnerClassNames} role="status">
      <span className="loading-spinner__sr-only">Loading...</span>
    </div>
  );

  if (fullPage) {
    return (
      <div className="loading-spinner__overlay">
        {spinner}
      </div>
    );
  }

  return spinner;
};

LoadingSpinner.propTypes = {
  fullPage: PropTypes.bool,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  className: PropTypes.string,
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'light', 'dark']),
  variant: PropTypes.oneOf(['classic', 'dots', 'bars', 'pulse'])
};

export default LoadingSpinner;