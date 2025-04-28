import { useEffect, useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm';
import { useGoogleLogin } from '@react-oauth/google';
import { googleAuth } from '../../api/auth';
import './css/Login.css';

const Login = () => {
  const formRef = useRef(null);
  const emailInputRef = useRef(null);
  const googleButtonRef = useRef(null);
  
  const { signIn, authError, isAuthenticated, clearAuthError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [localErrorMessage, setLocalErrorMessage] = useState(null);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorFading, setErrorFading] = useState(false);
  
  // Use this ref to prevent error from disappearing automatically
  const errorCleared = useRef(false);
  const errorTimeout = useRef(null);
  const formSubmitAttempted = useRef(false);

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

  // Error handling animation
  useEffect(() => {
    const errorMessage = getErrorMessage();
    
    if (errorMessage) {
      setErrorVisible(true);
      setErrorFading(false);
      
      // Auto-dismiss error after 10 seconds
      if (errorTimeout.current) clearTimeout(errorTimeout.current);
      errorTimeout.current = setTimeout(() => {
        handleDismissError();
      }, 2000);
    }
    
    return () => {
      if (errorTimeout.current) clearTimeout(errorTimeout.current);
    };
  }, [localErrorMessage, authError]);

  // Focus email input on component mount
  useEffect(() => {
    if (emailInputRef.current && !formSubmitAttempted.current) {
      // Delay focus to ensure the component is fully rendered
      setTimeout(() => {
        emailInputRef.current.focus();
      }, 100);
    }
  }, []);

  const {
    mutate,
    isLoading,
    error: mutationError,
  } = useMutation({
    mutationFn: signIn,
    onSuccess: () => {
      navigate(from, { replace: true });
    },
    onError: (error) => {
      console.log("Login error:", error.response?.data?.message || error.message);
      
      // Set the local error message and reset the cleared flag
      setLocalErrorMessage(error.response?.data?.message || error.message);
      errorCleared.current = false;
      
      // Reset submission flag to enable proper focus management
      formSubmitAttempted.current = false;
    }
  });

  // Sync local error state with auth context errors
  useEffect(() => {
    if (authError && !errorCleared.current) {
      setLocalErrorMessage(authError.message || 'Authentication failed');
    }
  }, [authError]);

  // Process and determine which error message to display
  const getErrorMessage = () => {
    if (errorCleared.current) {
      return null;
    }
    
    if (mutationError || authError || localErrorMessage) {
      // Prefer the mutation error if it exists
      const error = mutationError || authError;
      
      if (error?.response?.status === 401) {
        return error.response.data?.message || localErrorMessage || 'Incorrect email or password';
      } else if (error?.response?.status === 403) {
        return error.response.data?.message || localErrorMessage || 'Account not verified';
      } else {
        return error?.message || localErrorMessage || 'Authentication failed';
      }
    }
    return localErrorMessage;
  };

  const errorMessage = getErrorMessage();

  // Clear errors only when user interacts with form
  const handleClearErrors = () => {
    if (authError || localErrorMessage) {
      handleDismissError();
    }
  };
  
  // Handle error dismissal with animation
  const handleDismissError = () => {
    setErrorFading(true);
    setTimeout(() => {
      errorCleared.current = true;
      if (authError) {
        clearAuthError();
      }
      setLocalErrorMessage(null);
      setErrorVisible(false);
      setErrorFading(false);
      
      // Focus back to email input after error is dismissed
      if (emailInputRef.current) {
        emailInputRef.current.focus();
      }
    }, 500); // Match this with CSS transition duration
  };

  // Google login with proper error handling
  const googleLoginMutation = useMutation({
    mutationFn: googleAuth,
    onSuccess: (data) => {
      // Using the signIn function with skipApiCall to update auth context
      signIn(data.data, true)
        .then(() => {
          navigate(from, { replace: true });
        })
        .catch((err) => {
          console.error('Error updating auth context after Google login:', err);
          setLocalErrorMessage(err.message || 'Google authentication failed');
          errorCleared.current = false;
        });
    },
    onError: (error) => {
      console.error('Google auth failed:', error);
      setLocalErrorMessage(error.message || 'Google authentication failed');
      errorCleared.current = false;
    }
  });

  const googleLogin = useGoogleLogin({
    flow: 'implicit', // Using implicit flow with access token
    onSuccess: async (response) => {
      try {
        const authResult = await googleAuth(response.access_token);
        await signIn(authResult.data, true, true); // Pass isGoogleUser flag
        navigate(from, { replace: true });
      } catch (error) {
        console.error('Google auth failed:', error);
        setLocalErrorMessage(error.message || 'Google authentication failed');
        errorCleared.current = false;
      }
    },
    onError: (error) => {
      console.error('Google login error:', error);
      setLocalErrorMessage(error.message || 'Google login failed');
      errorCleared.current = false;
    },
  });

  const handleLoginSubmit = (credentials) => {
    // Set flag to indicate form submission attempted
    formSubmitAttempted.current = true;
    
    // Reset error cleared flag when submitting the form
    errorCleared.current = false;
    mutate(credentials);
  };

  // Handle Google button click with focus management
  const handleGoogleButtonClick = (e) => {
    e.preventDefault();
    
    // Call the Google login function
    googleLogin();
    
    // Set ref so we know user explicitly clicked Google button
    formSubmitAttempted.current = true;
  };
  
  return (
    <div className="login__container min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="login__card max-w-md w-full space-y-6 p-6 sm:p-8 bg-white rounded-xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl">
        <div className="login__header mb-2">
          <h2 className="login__title text-2xl sm:text-3xl font-bold text-center text-gray-800">
            Welcome Back
          </h2>
          <p className="login__subtitle text-center text-gray-500 text-sm mt-2">
            Sign in to continue to your account
          </p>
        </div>

        {errorMessage && errorVisible && (
          <div 
            className={`login__error-message ${errorFading ? 'fade-out' : ''}`}
            role="alert"
          >
            <svg
              className="w-5 h-5 mr-3 flex-shrink-0 login__error-icon"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              ></path>
            </svg>
            <div className="flex-1">
              <p className="font-medium">{errorMessage}</p>
              {errorMessage.includes('password') && (
                <p className="text-xs mt-1 text-red-700 opacity-80">
                  Please check your credentials and try again
                </p>
              )}
            </div>
            <button 
              className="login__error-dismiss" 
              onClick={handleDismissError}
              aria-label="Dismiss error"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L11 11M1 11L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        )}

        <div className={`login__form-container ${errorMessage ? 'has-error' : ''}`}>
          <LoginForm
            onSubmit={handleLoginSubmit}
            setEmailInputRef={(el) => emailInputRef.current = el}
            loading={isLoading}
            error={errorMessage}
            onInputChange={handleClearErrors}
          />
        </div>

        <div className="login__divider my-6">
          <div className="login__divider-line relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="login__divider-text px-4 bg-white text-gray-500 font-medium">
                Or continue with
              </span>
            </div>
          </div>
        </div>

        <div className="login__social">
          <button
            onClick={handleGoogleButtonClick}
            disabled={googleLoginMutation.isLoading}
            className="login__google-btn w-full flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Sign in with Google"
            ref={googleButtonRef}
            tabIndex={0}
          >
            {googleLoginMutation.isLoading ? (
              <div className="login__spinner flex items-center">
                <svg
                  className="animate-spin h-5 w-5 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="ml-2">Connecting...</span>
              </div>
            ) : (
              <>
                <div className="login__google-icon flex-shrink-0 w-5 h-5 mr-3">
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
        </div>

        <div className="login__footer mt-6 text-center">
          <p className="login__footer-text text-sm text-gray-500">
            Don't have an account?{' '}
            <a
              href="/register"
              className="login__signup-link font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;