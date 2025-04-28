import { useMutation } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { verifyEmail } from '../../api/auth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('pending'); // 'pending', 'loading', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const { signIn } = useAuth();

  const mutation = useMutation({
    mutationFn: (token) => verifyEmail(token),
    onSuccess: (response) => {
      setStatus('success');
      
      setTimeout(() => {
        try {
          // Check onboarding status before redirecting
          if (response.data?.user?.onboardingStep && 
              response.data.user.onboardingStep !== 'completed') {
            navigate('/onboarding');
          } else {
            navigate('/dashboard');
          }
        } catch (navError) {
          console.error('Navigation after verification failed:', navError);
          navigate('/login');
        }
      }, 1500); // Give user time to see success message
    },
    onError: (err) => {
      console.error('Verification error:', err);
      const msg = err.response?.data?.message;
      
      if (msg?.includes('already verified')) {
        setStatus('success');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setErrorMessage(msg || 'The verification link is invalid or has expired.');
        setStatus('error');
      }
    }
  });

  useEffect(() => {
    if (token && status === 'pending') {
      setStatus('loading');
      
      // Add timeout protection
      const timeoutId = setTimeout(() => {
        if (status === 'loading') {
          setErrorMessage('Verification request timed out. Please try again later.');
          setStatus('error');
        }
      }, 15000); // 15s timeout
      
      mutation.mutate(token);
      
      return () => clearTimeout(timeoutId);
    }
  }, [token, status, mutation]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-center">Verifying Your Email</h2>
          <div className="flex justify-center">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-center text-red-600">Verification Failed</h2>
          <p className="text-gray-700 mb-6 text-center">{errorMessage}</p>
          <div className="flex justify-center">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-center text-green-600">Email Verified!</h2>
          <p className="text-gray-700 mb-6 text-center">
            Your email has been successfully verified. You will be redirected automatically.
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default VerifyEmail;