import React from 'react';
import PropTypes from 'prop-types';
import './css/LoadingSpinner.css'; // We'll create this CSS file

const LoadingSpinner = ({ 
  fullPage = false, 
  size = 'md', 
  className = '',
  color = 'primary',
  variant = 'classic',
  text = '',
  overlayOpacity = 0.3,
  overlayColor = 'rgba(0, 0, 0, 0.3)',
  zIndex = 1000,
  showLogo = false,
  logoSize = 'md',
  gradientColors = ['#3b82f6', '#10b981', '#ef4444']
}) => {
  const spinnerClassNames = [
    'loading-spinner',
    `loading-spinner--${size}`,
    `loading-spinner--${color}`,
    `loading-spinner--${variant}`,
    className
  ].filter(Boolean).join(' ');

  const logoClassNames = [
    'loading-spinner__logo',
    `loading-spinner__logo--${logoSize}`
  ].filter(Boolean).join(' ');

  const spinner = (
    <div className="loading-spinner__container">
      {showLogo && (
        <div className={logoClassNames}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
      <div 
        className={spinnerClassNames} 
        role="status"
        style={variant === 'gradient' ? {
          background: `linear-gradient(45deg, ${gradientColors.join(', ')})`,
          backgroundSize: '200% 200%'
        } : undefined}
      >
        <span className="loading-spinner__sr-only">Loading...</span>
      </div>
      {text && <div className="loading-spinner__text">{text}</div>}
    </div>
  );

  if (fullPage) {
    return (
      <div 
        className="loading-spinner__overlay"
        style={{ 
          backgroundColor: overlayColor,
          opacity: overlayOpacity,
          zIndex
        }}
      >
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
  variant: PropTypes.oneOf(['classic', 'dots', 'bars', 'pulse', 'gradient']),
  text: PropTypes.string,
  overlayOpacity: PropTypes.number,
  overlayColor: PropTypes.string,
  zIndex: PropTypes.number,
  showLogo: PropTypes.bool,
  logoSize: PropTypes.oneOf(['sm', 'md', 'lg']),
  gradientColors: PropTypes.arrayOf(PropTypes.string)
};

export default LoadingSpinner;