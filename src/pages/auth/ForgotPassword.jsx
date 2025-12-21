import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaEnvelope, FaKey, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import './css/ForgotPassword.css'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:8000/api/v1';
// axios.defaults.baseURL = 'https://backend-for-the-saas-short-job-finder.vercel.app/api/v1';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Toast configuration
const toastConfig = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
    resetToken: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    
    // Validate email
    if (!validateEmail(formData.email)) {
      return toast.error("Please enter a valid email address", toastConfig);
    }

    setLoading(true);
    try {
      const response = await axios.post("/auth/forgot-password", {
        email: formData.email.trim(),
      });

      if (response.data.status === 'success') {
        toast.success(response.data.message, toastConfig);
        setStep(2);
      } else {
        toast.error(response.data.message || "Failed to send OTP", toastConfig);
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error(
        error.response?.data?.message || 
        "Failed to send OTP. Please try again later.",
        toastConfig
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    // Validate OTP
    if (!formData.otp || formData.otp.length !== 6) {
      return toast.error("Please enter a valid 6-digit OTP", toastConfig);
    }

    setLoading(true);
    try {
      const response = await axios.post("/auth/verify-otp", {
        email: formData.email.trim(),
        otp: formData.otp.trim(),
      });

      if (response.data.status === 'success') {
        setFormData({ ...formData, resetToken: response.data.resetToken });
        toast.success(response.data.message, toastConfig);
        setStep(3);
      } else {
        toast.error(response.data.message || "Failed to verify OTP", toastConfig);
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      toast.error(
        error.response?.data?.message || 
        "Failed to verify OTP. Please try again.",
        toastConfig
      );
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    const errors = [];
    if (!isLongEnough) errors.push("at least 8 characters");
    if (!hasUpperCase) errors.push("one uppercase letter");
    if (!hasLowerCase) errors.push("one lowercase letter");
    if (!hasNumbers) errors.push("one number");
    if (!hasSpecialChar) errors.push("one special character");

    return {
      isValid: hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar && isLongEnough,
      errors
    };
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    // Validate passwords
    const passwordValidation = validatePassword(formData.newPassword);
    if (!passwordValidation.isValid) {
      return toast.error(
        `Password must contain ${passwordValidation.errors.join(", ")}`,
        toastConfig
      );
    }

    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error("Passwords do not match", toastConfig);
    }

    setLoading(true);
    try {
      const response = await axios.patch("/auth/reset-password", {
        token: formData.resetToken,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      if (response.data.status === 'success') {
        toast.success("Password reset successful! Redirecting to login...", toastConfig);
        // Clear form data
        setFormData({
          email: "",
          otp: "",
          newPassword: "",
          confirmPassword: "",
          resetToken: "",
        });
        // Add a small delay before navigation
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        toast.error(response.data.message || "Failed to reset password", toastConfig);
      }
    } catch (error) {
      console.error("Reset password error:", error);
      const errorMessage = error.response?.data?.message || 
        "Failed to reset password. Please try again.";
      toast.error(errorMessage, toastConfig);
      
      // If token is invalid or expired, go back to step 1
      if (errorMessage.toLowerCase().includes("token") || 
          errorMessage.toLowerCase().includes("expired")) {
        setStep(1);
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2 className="forgot-password-title">Reset Password</h2>
        
        {step === 1 && (
          <form onSubmit={handleRequestOTP} className="forgot-password-form">
            <div className="form-group">
              <label htmlFor="email">
                <FaEnvelope className="input-icon" />
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                className="form-input"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="submit-button"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="forgot-password-form">
            <div className="form-group">
              <label htmlFor="otp">
                <FaKey className="input-icon" />
                Enter OTP
              </label>
              <input
                type="text"
                id="otp"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                placeholder="Enter OTP sent to your email"
                required
                className="form-input"
                maxLength="6"
                pattern="[0-9]*"
                inputMode="numeric"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="submit-button"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="forgot-password-form">
            <div className="form-group">
              <label htmlFor="newPassword">
                <FaLock className="input-icon" />
                New Password
              </label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  required
                  className="form-input"
                  minLength="8"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="password-toggle-button"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <small className="password-hint">
                Password must be at least 8 characters and include uppercase, lowercase, number, and special character
              </small>
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">
                <FaLock className="input-icon" />
                Confirm Password
              </label>
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  required
                  className="form-input"
                  minLength="8"
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="password-toggle-button"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="submit-button"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <div className="forgot-password-footer">
          <button
            onClick={() => navigate("/")}
            className="back-to-login"
          >
            Back to Home
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ForgotPassword;