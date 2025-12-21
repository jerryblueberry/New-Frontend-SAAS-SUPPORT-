import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/EmailVerifyInstruction.css';

const EmailVerifyInstruction = () => {
  const [countdown, setCountdown] = useState(60);
  const [isCounting, setIsCounting] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (isCounting && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setIsCounting(false);
    }
    return () => clearTimeout(timer);
  }, [countdown, isCounting]);

  const handleResendEmail = () => {
    // Here you would call your API to resend the verification email
    console.log('Resending verification email...');
    setCountdown(60);
    setIsCounting(true);
  };

  return (
    <div className="verify-container">
      <div className="verify-card">
        <div className="verify-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
        </div>
        
        <h1 className="verify-title">Verify Your Email</h1>
        
        <p className="verify-message">
          We've sent a verification link to your email address. 
          Please check your inbox and click the link to verify your account.
        </p>
        
        <p className="verify-note">
          Didn't receive the email? Check your spam folder or click below to resend.
        </p>
        
        <button 
          className={`resend-button ${isCounting ? 'disabled' : ''}`}
          onClick={handleResendEmail}
          disabled={isCounting}
        >
          {isCounting ? `Resend in ${countdown}s` : 'Resend Verification Email'}
        </button>
        
        <button 
          className="back-to-login"
          onClick={() => navigate('/')}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default EmailVerifyInstruction;