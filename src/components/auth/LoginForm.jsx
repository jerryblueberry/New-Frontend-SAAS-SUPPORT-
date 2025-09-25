import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaGoogle, FaEye, FaEyeSlash } from 'react-icons/fa';
import LoadingSpinner from '../common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import './css/LoginForm.css';

const LoginForm = ({ onSubmit, setEmailInputRef, loading, error, onInputChange }) => {
  const { signIn, signInWithGoogle } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const errors = {};
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (onInputChange) onInputChange();
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await signIn(formData);
      if (onSubmit) onSubmit(formData);
    } catch (err) {
      console.error('Login error:', err);
      if (onSubmit) onSubmit(formData, err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google login error:', err);
      if (onSubmit) onSubmit(null, err);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  // Show loading state
  if (loading || isSubmitting || isGoogleLoading) {
    return (
      <div className="loginform__loading-container">
        <div className="loginform__loading-content">
          <LoadingSpinner
            size="lg"
            color="primary"
            variant="gradient"
            showLogo
            logoSize="lg"
            text={isSubmitting ? "Signing in..." : "Connecting to Google..."}
            overlayOpacity={0.8}
            gradientColors={['#3b82f6', '#10b981', '#ef4444']}
          />
        </div>
      </div>
    );
  }

  return (
    <form className="loginform__container" onSubmit={handleSubmit}>
      <div className="loginform__form-group">
        <label htmlFor="email" className="loginform__label">
          Email address
        </label>
        <div className="loginform__input-wrapper">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            ref={setEmailInputRef}
            className={`loginform__input ${validationErrors.email ? 'input-error' : ''}`}
            placeholder="Enter your email"
            disabled={loading || isSubmitting}
          />
          {validationErrors.email && (
            <div className="loginform__error-message">
              <svg
                className="loginform__error-icon"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              {validationErrors.email}
            </div>
          )}
        </div>
      </div>

      <div className="loginform__form-group">
        <label htmlFor="password" className="loginform__label">
          Password
        </label>
        <div className="loginform__input-wrapper">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={formData.password}
            onChange={handleChange}
            className={`loginform__input loginform__input--password ${validationErrors.password ? 'input-error' : ''}`}
            placeholder="Enter your password"
            disabled={loading || isSubmitting}
          />
          <button
            type="button"
            className="loginform__password-toggle"
            onClick={togglePasswordVisibility}
            disabled={loading || isSubmitting}
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showPassword ? (
              <FaEyeSlash className="loginform__password-icon" />
            ) : (
              <FaEye className="loginform__password-icon" />
            )}
          </button>
          {validationErrors.password && (
            <div className="loginform__error-message">
              <svg
                className="loginform__error-icon"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              {validationErrors.password}
            </div>
          )}
        </div>
      </div>

      <div className="loginform__checkbox-container">
        <input
          id="remember-me"
          name="rememberMe"
          type="checkbox"
          checked={formData.rememberMe}
          onChange={handleChange}
          className="loginform__checkbox"
          disabled={loading || isSubmitting}
        />
        <label htmlFor="remember-me" className="loginform__checkbox-label">
          Remember me
        </label>
      </div>

      <div className="loginform__form-group">
        <button
          type="submit"
          disabled={loading || isSubmitting || isGoogleLoading}
          className={`loginform__submit-btn ${isSubmitting ? 'loginform__submit-btn--loading' : ''}`}
        >
          {isSubmitting ? (
            <>
              <span className="loginform__spinner" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </div>

      <div className="loginform__form-group">
        <Link
          to="/forgot-password"
          className="loginform__forgot-password"
        >
          Forgot your password?
        </Link>
      </div>
    </form>
  );
};

export default LoginForm;