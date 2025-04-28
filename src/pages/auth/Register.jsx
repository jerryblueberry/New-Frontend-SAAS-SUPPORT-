import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import RegisterForm from '../../components/auth/RegisterForm';
import { register, googleAuth } from '../../api/auth';
import { useAuth } from '../../hooks/useAuth';
import './css/Register.css';

const Register = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  // Regular email/password registration mutation
  const { mutate, isLoading, error } = useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      navigate('/verify-email-instructions', { 
        state: { email: data.email, verificationUrl: data.verificationUrl } 
      });
    }
  });

  // Google registration/login mutation
  const googleSignupMutation = useMutation({
    mutationFn: googleAuth,
    onSuccess: (data) => {
      // Sign in the user after successful Google auth
      signIn(data.data, true, true) // Pass isGoogleUser flag
        .then(() => {
          navigate('/onboarding'); 
        });
    }
  });

  const googleLogin = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (response) => {
      googleSignupMutation.mutate(response.access_token);
    },
    onError: (error) => {
      console.error('Google auth error:', error);
    }
  });

  let errorMessage = null;
  if (error) {
    errorMessage = error.response?.data?.message || 'Registration failed';
    if (error.response?.status === 400 && error.response?.data?.message === 'Email already in use') {
      errorMessage = 'This email is already registered. Please use a different email.';
    }
  }

  return (
    <div className="register-page">
      <div className="register-page__container">
        <div className="register-page__header">
          <h2 className="register-page__title">Create your account</h2>
          <p className="register-page__subtitle">Join us today and get started</p>
        </div>
        
        {/* Display errors from either form */}
        {(errorMessage || googleSignupMutation.error) && (
          <div className="register-page__error">
            {errorMessage || 'Google authentication failed. Please try again.'}
          </div>
        )}
        
        <RegisterForm 
          onSubmit={mutate} 
          loading={isLoading} 
          error={error} 
        />
        
        <div className="register-page__social-buttons">
          <div className="register-page__divider">
            <div className="register-page__divider-line"></div>
            <span className="register-page__divider-text">
              Or sign up with
            </span>
          </div>

          <button
            onClick={() => googleLogin()}
            disabled={googleSignupMutation.isLoading}
            className="register-page__google-button"
          >
            {googleSignupMutation.isLoading ? (
              <span className="register-page__loading">Loading...</span>
            ) : (
              <>
                <img 
                  className="register-page__google-icon" 
                  src="https://www.google.com/favicon.ico" 
                  alt="Google logo"
                />
                Continue with Google
              </>
            )}
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
  );
};

export default Register;