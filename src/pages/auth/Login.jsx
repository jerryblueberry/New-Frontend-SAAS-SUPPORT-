import { useEffect, useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm';
import { useGoogleLogin } from '@react-oauth/google';
import { googleAuth } from '../../api/auth';
import Toast from '../../components/common/Toast';
import { FaUserFriends, FaChartLine, FaHandshake, FaCalendarAlt } from 'react-icons/fa';
import AECUSLogo from '../../assets/aecus-logo.png';
import './css/Login.css';

const LoadingSpinner = () => (
  <div className="login__spinner-container">
    <div className="login__spinner-wrapper">
      <svg className="login__spinner-svg" viewBox="0 0 50 50">
        <circle
          className="login__spinner-circle"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth="4"
        />
        <circle
          className="login__spinner-progress"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth="4"
        />
      </svg>
      <div className="login__spinner-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  </div>
);

const RandomLogoAnimation = () => {
  const [currentLogo, setCurrentLogo] = useState(0);
  const logos = [
    // Logo 1 - Abstract
    <svg key="logo1" className="login__random-logo" viewBox="0 0 100 100">
      <path
        className="login__random-logo-path"
        d="M50 10 L90 90 L10 90 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle
        className="login__random-logo-circle"
        cx="50"
        cy="50"
        r="30"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>,
    // Logo 2 - Geometric
    <svg key="logo2" className="login__random-logo" viewBox="0 0 100 100">
      <rect
        className="login__random-logo-rect"
        x="20"
        y="20"
        width="60"
        height="60"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        className="login__random-logo-path"
        d="M20 20 L80 80 M80 20 L20 80"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>,
    // Logo 3 - Wave
    <svg key="logo3" className="login__random-logo" viewBox="0 0 100 100">
      <path
        className="login__random-logo-wave"
        d="M10 50 Q30 10 50 50 T90 50"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        className="login__random-logo-wave"
        d="M10 70 Q30 30 50 70 T90 70"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLogo((prev) => (prev + 1) % logos.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="login__random-logo-container">
      {logos[currentLogo]}
    </div>
  );
};

const Login = () => {
  const formRef = useRef(null);
  const emailInputRef = useRef(null);
  const googleButtonRef = useRef(null);
  
  const { signIn, authError, isAuthenticated, clearAuthError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [toast, setToast] = useState(null);
  const [lastErrorMessage, setLastErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const from =
    location.state?.from?.pathname ||
    searchParams.get('returnTo') ||
    '/dashboard';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Improved error display with unique toast and prevention of duplicate messages
  const showErrorToast = (message) => {
    if (message === lastErrorMessage) return;
    setLastErrorMessage(message);
    setToast({
      message,
      type: 'error',
      duration: 3000, // 8 seconds
      id: Date.now(),
    });
  };

  const hideToast = () => {
    setToast(null);
    setLastErrorMessage('');
  };

  // Improved error handling in useEffect
  useEffect(() => {
    if (authError && authError.message) {
      showErrorToast(authError.message || 'Authentication failed');
    }
  }, [authError?.message]);

  const {
    mutate,
    isLoading,
    error: mutationError,
  } = useMutation({
    mutationFn: signIn,
    onSuccess: () => {
      clearAuthError();
      navigate(from, { replace: true });
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message || 'Authentication failed. Please check your credentials.';
      console.log("Login error:", errorMessage);
      showErrorToast(errorMessage);
      setIsSubmitting(false);
    }
  });

  // Google login with improved error handling
  const googleLogin = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (response) => {
      setIsGoogleLoading(true);
      try {
        const authResult = await googleAuth(response.access_token);
        await signIn(authResult.data, true, true);
        clearAuthError();
        navigate(from, { replace: true });
      } catch (error) {
        console.error('Google auth failed:', error);
        showErrorToast(error.response?.data?.message || error.message || 'Google authentication failed');
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google login error:', error);
      showErrorToast('Google login failed. Please try again.');
      setIsGoogleLoading(false);
    },
  });

  const handleLoginSubmit = async (credentials, error) => {
    if (error) {
      showErrorToast(error.response?.data?.message || error.message || 'Authentication failed');
      return;
    }
    setIsSubmitting(true);
    try {
      await signIn(credentials);
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      showErrorToast(error.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Google button click with focus management
  const handleGoogleButtonClick = (e) => {
    e.preventDefault();
    googleLogin();
  };
  
  return (
    <>
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
          duration={toast.duration}
        />
      )}
      <div className="login__container">
        {/* Left side - Branding section */}
        <div className="login__branding">
          <h1 className="login__branding-title">
            Independent Support Worker Platform
          </h1>
          <p className="login__branding-subtitle">
            Join our community of dedicated support workers and make a real difference in people's lives
          </p>

          <div className="login__features">
            <div className="login__feature-item">
              <FaUserFriends className="login__feature-icon" />
              <h3 className="login__feature-title">Connect with Clients</h3>
              <p className="login__feature-description">
                Build meaningful relationships with clients who value your expertise and dedication
              </p>
            </div>
            <div className="login__feature-item">
              <FaChartLine className="login__feature-icon" />
              <h3 className="login__feature-title">Career Growth</h3>
              <p className="login__feature-description">
                Access training, certifications, and opportunities to advance your career
              </p>
            </div>
            <div className="login__feature-item">
              <FaHandshake className="login__feature-icon" />
              <h3 className="login__feature-title">Flexible Work</h3>
              <p className="login__feature-description">
                Choose your schedule and work with clients that match your expertise
              </p>
            </div>
            <div className="login__feature-item">
              <FaCalendarAlt className="login__feature-icon" />
              <h3 className="login__feature-title">Easy Management</h3>
              <p className="login__feature-description">
                Streamline your work with our intuitive scheduling and management tools
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Login form section */}
        <div className="login__form-section">
          <div className="login__card">
            <div className="login__logo-container">
              <img src={AECUSLogo} alt="AECUS Logo" className="login__logo-img" />
            </div>
            <div className="login__header">
              <h2 className="login__title">Welcome Back</h2>
              <p className="login__subtitle">Sign in to continue your journey of making a difference</p>
            </div>

            <LoginForm
              onSubmit={handleLoginSubmit}
              setEmailInputRef={(el) => emailInputRef.current = el}
              loading={isLoading || isSubmitting}
              error={mutationError}
            />

            <div className="login__divider">
              <div className="login__divider-line">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="login__divider-text">
                    Or continue with
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleGoogleButtonClick}
              disabled={isGoogleLoading}
              className="login__google-btn"
              aria-label="Sign in with Google"
              ref={googleButtonRef}
            >
              {isGoogleLoading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <div className="login__google-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                      <path
                        fill="#FFC107"
                        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                      />
                      <path
                        fill="#FF3D00"
                        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
                      />
                      <path
                        fill="#4CAF50"
                        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
                      />
                      <path
                        fill="#1976D2"
                        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
                      />
                    </svg>
                  </div>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <div className="login__footer">
              <p className="login__footer-text">
                New to our platform?{' '}
                <a
                  href="/register"
                  className="login__signup-link"
                >
                  Create an account
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;