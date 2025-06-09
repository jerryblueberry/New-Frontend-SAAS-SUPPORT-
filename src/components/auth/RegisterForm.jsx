import React, { useState, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import './css/RegisterForm.css';

const RegisterForm = ({ 
  onSubmit, 
  onGoogleRegister,
  loading, 
  loadingMessage,
  error 
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = useCallback(() => {
    const errors = {};
    const { firstName, lastName, email, password, confirmPassword } = formData;
    
    if (!firstName.trim()) errors.firstName = 'First name is required';
    else if (firstName.length < 2) errors.firstName = 'First name must be at least 2 characters';

    if (!lastName.trim()) errors.lastName = 'Last name is required';
    else if (lastName.length < 2) errors.lastName = 'Last name must be at least 2 characters';

    if (!email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Please enter a valid email';

    if (!password) errors.password = 'Password is required';
    else if (password.length < 8) errors.password = 'Password must be at least 8 characters';
    else if (!/(?=.*[a-z])/.test(password)) errors.password = 'Password must contain a lowercase letter';
    else if (!/(?=.*[A-Z])/.test(password)) errors.password = 'Password must contain an uppercase letter';
    else if (!/(?=.*\d)/.test(password)) errors.password = 'Password must contain a number';

    if (!confirmPassword) errors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [validationErrors]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSubmit(formData);
  };

  return (
    <div className="register-form__container">
      <form className="register-form" onSubmit={handleSubmit} noValidate>
        <div className="register-form__field-group">
          <div className="register-form__input-wrapper">
            <label htmlFor="firstName" className="register-form__label">
              First name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              autoComplete="given-name"
              required
              value={formData.firstName}
              onChange={handleChange}
              className={`register-form__input ${validationErrors.firstName ? 'register-form__input--invalid' : ''}`}
              placeholder="Enter your first name"
              disabled={loading}
              aria-invalid={!!validationErrors.firstName}
              aria-describedby={validationErrors.firstName ? "firstName-error" : undefined}
            />
            {validationErrors.firstName && (
              <div id="firstName-error" className="register-form__error">
                {validationErrors.firstName}
              </div>
            )}
          </div>

          <div className="register-form__input-wrapper">
            <label htmlFor="lastName" className="register-form__label">
              Last name
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              required
              value={formData.lastName}
              onChange={handleChange}
              className={`register-form__input ${validationErrors.lastName ? 'register-form__input--invalid' : ''}`}
              placeholder="Enter your last name"
              disabled={loading}
              aria-invalid={!!validationErrors.lastName}
              aria-describedby={validationErrors.lastName ? "lastName-error" : undefined}
            />
            {validationErrors.lastName && (
              <div id="lastName-error" className="register-form__error">
                {validationErrors.lastName}
              </div>
            )}
          </div>

          <div className="register-form__input-wrapper">
            <label htmlFor="email" className="register-form__label">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className={`register-form__input ${validationErrors.email ? 'register-form__input--invalid' : ''}`}
              placeholder="Enter your email address"
              disabled={loading}
              aria-invalid={!!validationErrors.email}
              aria-describedby={validationErrors.email ? "email-error" : undefined}
            />
            {validationErrors.email && (
              <div id="email-error" className="register-form__error">
                {validationErrors.email}
              </div>
            )}
          </div>

          <div className="register-form__input-wrapper">
            <label htmlFor="password" className="register-form__label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={handleChange}
              className={`register-form__input ${validationErrors.password ? 'register-form__input--invalid' : ''}`}
              placeholder="Create a password"
              disabled={loading}
              aria-invalid={!!validationErrors.password}
              aria-describedby={validationErrors.password ? "password-error" : undefined}
            />
            {validationErrors.password && (
              <div id="password-error" className="register-form__error">
                {validationErrors.password}
              </div>
            )}
          </div>

          <div className="register-form__input-wrapper">
            <label htmlFor="confirmPassword" className="register-form__label">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`register-form__input ${validationErrors.confirmPassword ? 'register-form__input--invalid' : ''}`}
              placeholder="Confirm your password"
              disabled={loading}
              aria-invalid={!!validationErrors.confirmPassword}
              aria-describedby={validationErrors.confirmPassword ? "confirmPassword-error" : undefined}
            />
            {validationErrors.confirmPassword && (
              <div id="confirmPassword-error" className="register-form__error">
                {validationErrors.confirmPassword}
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="register-form__submit-button"
          disabled={loading}
          aria-busy={loading}
        >
          <span className="register-form__button-content">
            {loading ? (
              <>
                <div className="register-form__spinner"></div>
                {loadingMessage || 'Creating Account...'}
              </>
            ) : (
              'Create Account'
            )}
          </span>
        </button>

        <div className="register-form__login-link">
          Already have an account?{' '}
          <Link to="/login" className="register-form__link">
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
};

export default memo(RegisterForm);