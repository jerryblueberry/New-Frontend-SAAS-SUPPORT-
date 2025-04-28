import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './css/LoginForm.css';

const LoginForm = ({ onSubmit, setEmailInputRef, loading, error, onInputChange }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [formFocus, setFormFocus] = useState({
    email: false,
    password: false
  });
  
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });
  
  // Ref to store previous values for comparison
  const prevErrorRef = useRef(error);
  const formRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const submitButtonRef = useRef(null);
  
  // Track if this is the first error after a submission
  const [isNewError, setIsNewError] = useState(false);
  
  // Reset the new error flag when error changes
  useEffect(() => {
    if (error !== prevErrorRef.current) {
      setIsNewError(true);
      prevErrorRef.current = error;
      
      // When error appears, keep focus within the form
      if (error && submitButtonRef.current) {
        // Delay focus to ensure it happens after any other focus events
        setTimeout(() => {
          submitButtonRef.current.focus();
        }, 50);
      }
    }
  }, [error]);
  
  // Set email input ref when component mounts
  useEffect(() => {
    if (setEmailInputRef && emailRef.current) {
      setEmailInputRef(emailRef.current);
    }
  }, [setEmailInputRef]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prevent event propagation to avoid focus issues
    e.stopPropagation();
    
    // Mark all fields as touched on submit
    setTouched({
      email: true,
      password: true
    });
    
    // Save active element to restore focus later if needed
    const activeElement = document.activeElement;
    
    onSubmit(formData);
    
    // Keep focus on submit button to prevent it from jumping to other elements
    if (submitButtonRef.current) {
      submitButtonRef.current.focus();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Clear errors only when user starts typing after seeing an error
    if (error && isNewError) {
      setIsNewError(false);
      if (onInputChange) {
        onInputChange();
      }
    }
  };
  
  const handleFocus = (e) => {
    const { name } = e.target;
    setFormFocus(prev => ({
      ...prev,
      [name]: true
    }));
  };
  
  const handleBlur = (e) => {
    const { name } = e.target;
    setFormFocus(prev => ({
      ...prev,
      [name]: false
    }));
    
    // Mark as touched when field loses focus
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  return (
    <form 
      className={`loginform__container ${error ? 'has-error' : ''}`} 
      onSubmit={handleSubmit}
      ref={formRef}
    >
      <div className="loginform__input-group">
        <label htmlFor="email" className="sr-only">
          Email address
        </label>
        <div className="loginform__input-wrapper">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={`loginform__input ${touched.email && !formData.email ? 'input-error' : ''}`}
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            aria-invalid={touched.email && !formData.email}
            ref={emailRef}
          />
          {formFocus.email && (
            <div className="loginform__input-highlight"></div>
          )}
        </div>
      </div>
      
      <div className="loginform__input-group">
        <label htmlFor="password" className="sr-only">
          Password
        </label>
        <div className="loginform__input-wrapper">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className={`loginform__input ${touched.password && !formData.password ? 'input-error' : ''}`}
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            aria-invalid={touched.password && !formData.password}
            ref={passwordRef}
          />
          {formFocus.password && (
            <div className="loginform__input-highlight"></div>
          )}
        </div>
      </div>

      <div className="loginform__options-row">
        <div className="loginform__checkbox-container">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="loginform__checkbox"
          />
          <label htmlFor="remember-me" className="loginform__checkbox-label">
            Remember me
          </label>
        </div>

        <div>
          <Link to="/forgot-password" className="loginform__forgot-link">
            Forgot your password?
          </Link>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className={`loginform__submit-btn ${loading ? 'loginform__submit-btn--loading' : ''}`}
          ref={submitButtonRef}
        >
          {loading ? (
            <div className="loginform__spinner">
              <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </div>
          ) : (
            'Sign in'
          )}
        </button>
      </div>
    </form>
  );
};

export default LoginForm;