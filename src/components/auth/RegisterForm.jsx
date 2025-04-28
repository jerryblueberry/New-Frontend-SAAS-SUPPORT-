import { useState } from 'react';
import { Link } from 'react-router-dom';
import './css/RegisterForm.css'; 

const RegisterForm = ({ onSubmit, loading, error }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  const [passwordMatch, setPasswordMatch] = useState(true);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Check password match when either password field changes
    if (e.target.name === 'password' || e.target.name === 'confirmPassword') {
      if (e.target.name === 'confirmPassword') {
        setPasswordMatch(formData.password === e.target.value);
      } else {
        setPasswordMatch(e.target.value === formData.confirmPassword);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setPasswordMatch(false);
      return;
    }
    onSubmit({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: 'worker'
    });
  };

  return (
    <form className="register-form" onSubmit={handleSubmit}>
      {error && (
        <div className="register-form__error">
          {error.response?.data?.message || error.message}
        </div>
      )}
      
      <div className="register-form__field-group">
        <div className="register-form__field-row">
          <div className="register-form__input-wrapper">
            <label htmlFor="firstName" className="register-form__label">
              First Name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              className="register-form__input"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
            />
          </div>
          <div className="register-form__input-wrapper">
            <label htmlFor="lastName" className="register-form__label">
              Last Name
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              className="register-form__input"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>
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
            className="register-form__input"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        
        <div className="register-form__input-wrapper">
          <label htmlFor="phone" className="register-form__label">
            Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className="register-form__input"
            placeholder="Phone Number (optional)"
            value={formData.phone}
            onChange={handleChange}
          />
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
            minLength="8"
            className="register-form__input"
            placeholder="Password (min 8 characters)"
            value={formData.password}
            onChange={handleChange}
          />
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
            minLength="8"
            className={`register-form__input ${!passwordMatch ? 'register-form__input--invalid' : ''}`}
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          {!passwordMatch && formData.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
          )}
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading || !passwordMatch}
          className="register-form__button"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </div>
      
      <div className="register-form__signin-link">
        <span>Already have an account? </span>
        <Link to="/login" className="register-form__link">
          Sign in
        </Link>
      </div>
    </form>
  );
};

export default RegisterForm;