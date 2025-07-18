import React from 'react';
import PropTypes from 'prop-types';
import './css/LoadingSpinner.css';
import LogoImg from '../../assets/aecus-logo.png'

const LoadingSpinner = ({
  size = 'lg',
  color = 'secondary',
  variant = 'default',
  fullPage = false,
  showLogo = true,
  logoSize = 'lg',
  logoUrl = LogoImg,
  text = 'Loading...',
  overlayOpacity = 0.95,
  gradientColors = ['blue', 'red'],
  zIndex = 1000,
  className = '',
}) => {
  const sizeClasses = {
    xs: 'loading-spinner--xs',
    sm: 'loading-spinner--sm',
    md: 'loading-spinner--md',
    lg: 'loading-spinner--lg',
    xl: 'loading-spinner--xl',
  };

  const colorClasses = {
    primary: 'loading-spinner--primary',
    secondary: 'loading-spinner--secondary',
    success: 'loading-spinner--success',
    danger: 'loading-spinner--danger',
    light: 'loading-spinner--light',
    dark: 'loading-spinner--dark',
  };

  const variantClasses = {
    default: '',
    gradient: 'loading-spinner--gradient',
    pulse: 'loading-spinner--pulse',
    dots: 'loading-spinner--dots',
    bars: 'loading-spinner--bars',
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

  const renderLogo = () => {
    if (!showLogo) return null;
    return (
      <div className={`loading-spinner__logo ${logoSizeClasses[logoSize]}`}>
        <img 
          src={logoUrl} 
          alt="Loading" 
          style={{
            maxWidth: '100%',
            height: 'auto',
            transition: 'transform 0.3s ease'
          }}
        />
      </div>
    );
  };

  if (fullPage) {
    return (
      <div className="loading-spinner__overlay" style={overlayStyle}>
        <div className="loading-spinner__container">
          {renderLogo()}
          <div className={spinnerClasses} />
          {text && <p className="loading-spinner__text">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="loading-spinner__container">
      {renderLogo()}
      <div className={spinnerClasses} />
      {text && <p className="loading-spinner__text">{text}</p>}
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'light', 'dark']),
  variant: PropTypes.oneOf(['default', 'gradient', 'pulse', 'dots', 'bars']),
  fullPage: PropTypes.bool,
  showLogo: PropTypes.bool,
  logoSize: PropTypes.oneOf(['sm', 'md', 'lg']),
  logoUrl: PropTypes.string,
  text: PropTypes.string,
  overlayOpacity: PropTypes.number,
  gradientColors: PropTypes.arrayOf(PropTypes.string),
  zIndex: PropTypes.number,
  className: PropTypes.string,
};

export default LoadingSpinner;