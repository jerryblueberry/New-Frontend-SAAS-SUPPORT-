import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import RegisterForm from '../../components/auth/RegisterForm';
import { register, googleAuth } from '../../api/auth';
import { useAuth } from '../../hooks/useAuth';
import { FaUserFriends, FaHandshake, FaChartLine, FaHeart, FaShieldAlt, FaLightbulb } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './css/Register.css';
import Logo from '../../assets/AECUS LOGO.webp';
import { useState, useMemo } from 'react';

const Register = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Regular email/password registration mutation
  const { mutate: registerUser, error: registerError } = useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      toast.success('Account created successfully! Please verify your email.');
      navigate('/verify-email-instructions', { 
        state: { email: data.email, verificationUrl: data.verificationUrl } 
      });
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Registration failed';
      if (error.response?.status === 400 && message === 'Email already in use') {
        toast.error('This email is already registered. Please use a different email.');
      } else {
        toast.error(message);
      }
      setIsLoading(false);
    }
  });

  // Google registration/login mutation
  const { mutate: googleSignup, error: googleError } = useMutation({
    mutationFn: googleAuth,
    onSuccess: async (data) => {
      toast.success('Successfully connected with Google!');
      try {
        await signIn(data.data, true, true);
        navigate('/onboarding');
      } catch (error) {
        toast.error('Failed to sign in after Google authentication');
        setIsLoading(false);
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Google authentication failed');
      setIsLoading(false);
    }
  });

  const googleLogin = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (response) => {
      setLoadingMessage('Connecting with Google...');
      setIsLoading(true);
      try {
        const authResult = await googleAuth(response.access_token);
        await signIn(authResult.data, true, true);
        navigate('/onboarding');
      } catch (error) {
        console.error('Google auth failed:', error);
        toast.error(error.message || 'Google authentication failed');
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google login error:', error);
      toast.error(error.message || 'Google login failed');
      setIsLoading(false);
    },
  });

  // Handle registration form submission
  const handleRegister = (formData) => {
    setLoadingMessage('Creating your account...');
    setIsLoading(true);
    registerUser(formData);
  };

  // Handle Google registration
  const handleGoogleRegister = () => {
    googleLogin();
  };

  // Get error message for display
  const errorMessage = useMemo(() => {
    if (registerError) {
      const message = registerError.response?.data?.message || 'Registration failed';
      if (registerError.response?.status === 400 && message === 'Email already in use') {
        return 'This email is already registered. Please use a different email.';
      }
      return message;
    }
    if (googleError) {
      return googleError.response?.data?.message || 'Google authentication failed';
    }
    return null;
  }, [registerError, googleError]);

  return (
    <div className="register-page">
      <div className="register-page__container">
        <div className="register-page__content">
          <div className="register-page__right">
            <div className="register-page__form-container">
              <div className="register-page__logo">
                <img src={Logo} alt="Support Worker Platform" className="register-page__logo-img" loading="lazy" />
              </div>
              
              <div className="register-page__form-header">
                <h2 className="register-page__form-title">Create Your Account</h2>
                <p className="register-page__form-subtitle">Join our community of support workers</p>
              </div>
              
              {errorMessage && (
                <div className="register-page__error">
                  {errorMessage}
                </div>
              )}
              
              <RegisterForm 
                onSubmit={handleRegister}
                onGoogleRegister={handleGoogleRegister}
                loading={isLoading}
                loadingMessage={loadingMessage}
                error={errorMessage}
              />
              
              <div className="register-page__social-buttons">
                <div className="register-page__divider">
                  <div className="register-page__divider-line"></div>
                  <span className="register-page__divider-text">
                    Or sign up with
                  </span>
                </div>

                <button
                  onClick={handleGoogleRegister}
                  disabled={isLoading}
                  className="register-page__google-button"
                  aria-label="Sign up with Google"
                >
                  <div className="register-page__google-icon">
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
                </button>
              </div>
              
              <div className="register-page__footer">
                By signing up, you agree to our 
                <a href="/terms" className="register-page__link"> Terms of Service </a> 
                and 
                <a href="/privacy" className="register-page__link"> Privacy Policy</a>
              </div>
            </div>
          </div>

          <div className="register-page__left">
            <div className="register-page__header">
              <h2 className="register-page__title">Join Our Support Worker Community</h2>
              <p className="register-page__subtitle">Start your journey to make a difference in people's lives</p>
            </div>

            <div className="register-page__quote">
              <blockquote>
                "The best way to find yourself is to lose yourself in the service of others."
                <footer>— Mahatma Gandhi</footer>
              </blockquote>
            </div>

            <div className="register-page__benefits">
              <div className="register-page__benefit-item">
                <FaUserFriends className="register-page__benefit-icon" />
                <div className="register-page__benefit-content">
                  <h3>Connect with Clients</h3>
                  <p>Build meaningful relationships with those who need your support</p>
                </div>
              </div>

              <div className="register-page__benefit-item">
                <FaHandshake className="register-page__benefit-icon" />
                <div className="register-page__benefit-content">
                  <h3>Flexible Work</h3>
                  <p>Choose your own schedule and work on your terms</p>
                </div>
              </div>

              <div className="register-page__benefit-item">
                <FaChartLine className="register-page__benefit-icon" />
                <div className="register-page__benefit-content">
                  <h3>Career Growth</h3>
                  <p>Access training and development opportunities</p>
                </div>
              </div>

              <div className="register-page__benefit-item">
                <FaHeart className="register-page__benefit-icon" />
                <div className="register-page__benefit-content">
                  <h3>Make an Impact</h3>
                  <p>Create positive change in people's lives every day</p>
                </div>
              </div>

              <div className="register-page__benefit-item">
                <FaShieldAlt className="register-page__benefit-icon" />
                <div className="register-page__benefit-content">
                  <h3>Secure Platform</h3>
                  <p>Work with confidence on our trusted platform</p>
                </div>
              </div>

              <div className="register-page__benefit-item">
                <FaLightbulb className="register-page__benefit-icon" />
                <div className="register-page__benefit-content">
                  <h3>Continuous Learning</h3>
                  <p>Stay updated with the latest care practices</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;