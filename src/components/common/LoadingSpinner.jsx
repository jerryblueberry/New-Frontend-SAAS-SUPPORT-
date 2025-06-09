import React from 'react';
import PropTypes from 'prop-types';
import './css/LoadingSpinner.css';

const LoadingSpinner = ({
  size = 'md',
  color = 'primary',
  variant = 'default',
  fullPage = false,
  showLogo = false,
  logoSize = 'md',
  text = '',
  overlayOpacity = 0.8,
  gradientColors = ['#3b82f6', '#10b981'],
  zIndex = 1000,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'loading-spinner--sm',
    md: 'loading-spinner--md',
    lg: 'loading-spinner--lg',
  };

  const colorClasses = {
    primary: 'loading-spinner--primary',
    secondary: 'loading-spinner--secondary',
    light: 'loading-spinner--light',
    dark: 'loading-spinner--dark',
  };

  const variantClasses = {
    default: 'loading-spinner--default',
    gradient: 'loading-spinner--gradient',
    pulse: 'loading-spinner--pulse',
  };

  const logoSizeClasses = {
    sm: 'loading-spinner__logo--sm',
    md: 'loading-spinner__logo--md',
    lg: 'loading-spinner__logo--lg',
  };

  const spinnerClasses = [
    'loading-spinner',
    sizeClasses[size],
    colorClasses[color],
    variantClasses[variant],
    className,
  ].filter(Boolean).join(' ');

  const overlayStyle = {
    '--overlay-opacity': overlayOpacity,
    '--z-index': zIndex,
    '--gradient-start': gradientColors[0],
    '--gradient-end': gradientColors[1],
  };

  if (fullPage) {
    return (
      <div className="loading-spinner__overlay" style={overlayStyle}>
        <div className="loading-spinner__container">
          {showLogo && (
            <div className={`loading-spinner__logo ${logoSizeClasses[logoSize]}`}>
              <img src="/logo.png" alt="Logo" />
            </div>
          )}
          <div className={spinnerClasses} />
          {text && <p className="loading-spinner__text">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="loading-spinner__wrapper">
      <div className={spinnerClasses} />
      {text && <p className="loading-spinner__text">{text}</p>}
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  color: PropTypes.oneOf(['primary', 'secondary', 'light', 'dark']),
  variant: PropTypes.oneOf(['default', 'gradient', 'pulse']),
  fullPage: PropTypes.bool,
  showLogo: PropTypes.bool,
  logoSize: PropTypes.oneOf(['sm', 'md', 'lg']),
  text: PropTypes.string,
  overlayOpacity: PropTypes.number,
  gradientColors: PropTypes.arrayOf(PropTypes.string),
  zIndex: PropTypes.number,
  className: PropTypes.string,
};

export default LoadingSpinner;