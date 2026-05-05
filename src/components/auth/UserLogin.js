import React, { useState, useEffect } from 'react';
import './UserLogin.css';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { isAdmin } from '../../services/adminService';

const UserLogin = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [loginMethod, setLoginMethod] = useState('google'); // Default to 'google' since phone needs setup
  // Removed unused checkingAdmin state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: enter phone, 2: enter OTP
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Close modal if user logs in
  useEffect(() => {
    if (user) {
      onClose();
    }
  }, [user, onClose]);

  // Cleanup reCAPTCHA on unmount
  useEffect(() => {
    return () => {
      authService.cleanupRecaptcha();
    };
  }, []);

  // Send OTP to phone
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    // removed setCheckingAdmin
    // Validate phone number format
    if (!phoneNumber.match(/^\+91\d{10}$/)) {
      setError('Please enter a valid Indian phone number with +91');
      // removed setCheckingAdmin
      return;
    }

    setLoading(true);
    try {
      // Check if phone number is registered as admin
      // Assume admin emails are used for admin login, so check if any admin email matches this phone number (if you store phone numbers for admins, adjust this logic)
      // If admin phone numbers are not stored, skip this check
      // If admin emails are used as phone numbers, check accordingly
      // Here, we check if the phone number matches any admin email (unlikely, but for completeness)
      const adminEmails = await import('../../services/adminService').then(mod => mod.fetchAdminEmails());
      if (adminEmails && adminEmails.length > 0 && adminEmails.includes(phoneNumber)) {
        setError('This phone number is registered as an admin and cannot be used for user login.');
        setLoading(false);
        // removed setCheckingAdmin
        return;
      }
      const confirmation = await authService.signInWithPhone(phoneNumber, 'recaptcha-container');
      setConfirmationResult(confirmation);
      setStep(2);
      setMessage('OTP sent successfully!');
    } catch (err) {
      console.error('Error sending OTP:', err);
      // User-friendly error messages
      let errorMessage = 'Failed to send OTP. Please try again.';
      if (err.message === 'TIMEOUT') {
        errorMessage = 'Phone authentication is not properly configured in Firebase. Please use Google sign-in instead or contact support.';
      } else if (err.code === 'auth/invalid-app-credential') {
        errorMessage = 'reCAPTCHA verification failed. Please refresh the page and try again. If the issue persists, contact support.';
      } else if (err.code === 'auth/billing-not-enabled') {
        errorMessage = 'Phone authentication requires billing. Please use Google sign-in or contact support.';
      } else if (err.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number format. Use +91XXXXXXXXXX';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later.';
      } else if (err.message && err.message.includes('reCAPTCHA')) {
        errorMessage = 'reCAPTCHA error. Please refresh the page and try again.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      authService.cleanupRecaptcha();
    }
    setLoading(false);
    // removed setCheckingAdmin
  }

  // Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      await authService.verifyOTP(confirmationResult, otp);
      setMessage('Sign in successful!');
      setTimeout(() => {
        onClose();
        resetForm();
      }, 500);
    } catch (err) {
      console.error('Error verifying OTP:', err);
      let errorMessage = 'Invalid OTP. Please try again.';
      
      if (err.code === 'auth/invalid-verification-code') {
        errorMessage = 'Invalid OTP code. Please check and try again.';
      } else if (err.code === 'auth/code-expired') {
        errorMessage = 'OTP has expired. Please request a new code.';
      }
      
      setError(errorMessage);
    }
    setLoading(false);
  };

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    // removed setCheckingAdmin
    try {
      // Get email from Google popup before proceeding
      const result = await authService.signInWithGoogle({ onlyGetUser: true });
      const email = result?.user?.email;
      if (!email) throw new Error('No email found from Google account.');
      const admin = await isAdmin(email);
      if (admin) {
        setError('This email is registered as an admin and cannot be used for user login.');
        setLoading(false);
        // removed setCheckingAdmin
        // Optionally sign out the user if already signed in
        if (result?.user) await authService.signOut();
        return;
      }
      // Proceed with normal sign-in
      await authService.signInWithGoogle();
      setMessage('Sign in successful!');
      setTimeout(() => {
        onClose();
        resetForm();
      }, 500);
    } catch (err) {
      console.error('Google sign-in error:', err);
      let errorMessage = 'Failed to sign in with Google';
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in cancelled. Please try again.';
      } else if (err.code === 'auth/popup-blocked') {
        errorMessage = 'Pop-up blocked. Please allow pop-ups and try again.';
      } else if (err.code === 'auth/unauthorized-domain') {
        errorMessage = 'This domain is not authorized. Please contact support.';
      } else if (err.message && err.message.includes('permissions')) {
        errorMessage = 'Database permission error. Please try again or contact support.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    }
    setLoading(false);
    // removed setCheckingAdmin
  };

  const resetForm = () => {
    setPhoneNumber('');
    setOtp('');
    setStep(1);
    setConfirmationResult(null);
    setError('');
    setMessage('');
    setLoginMethod('google'); // Reset to Google since it's the working method
    authService.cleanupRecaptcha();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleBackToPhone = () => {
    setStep(1);
    setOtp('');
    setError('');
    setMessage('');
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="user-login-backdrop" onClick={handleClose}></div>
      <div className="user-login-modal">
        <button className="close-btn" onClick={handleClose}>×</button>
        
        <h2 className="login-title">Welcome to VERA</h2>
        <p className="login-subtitle">Sign in to start shopping luxury bags</p>

        {/* Login Method Tabs */}
        <div className="login-methods">
          <button 
            className={`method-btn ${loginMethod === 'phone' ? 'active' : ''}`}
            onClick={() => setLoginMethod('phone')}
          >
            <svg className="method-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
              <line x1="12" y1="18" x2="12.01" y2="18"/>
            </svg>
            Phone
          </button>
          <button 
            className={`method-btn ${loginMethod === 'google' ? 'active' : ''}`}
            onClick={() => setLoginMethod('google')}
          >
            <svg className="method-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
        </div>

        {/* Phone OTP Login */}
        {loginMethod === 'phone' && (
          <div className="phone-login-section">
            {step === 1 ? (
              <form onSubmit={handleSendOTP}>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91XXXXXXXXXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    className="phone-input"
                  />
                  <small className="input-hint">Enter number with country code (+91)</small>
                </div>
                <button 
                  type="submit" 
                  className="user-login-btn" 
                  disabled={loading}
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
                <div id="recaptcha-container"></div>
                <small className="input-hint recaptcha-hint">Complete verification above to continue</small>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP}>
                <div className="form-group">
                  <label>Enter OTP</label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    className="otp-input"
                    maxLength="6"
                  />
                  <small className="input-hint">Sent to {phoneNumber}</small>
                </div>
                <button 
                  type="submit" 
                  className="user-login-btn" 
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <button 
                  type="button" 
                  className="user-back-btn" 
                  onClick={handleBackToPhone}
                >
                  ← Change Number
                </button>
              </form>
            )}
          </div>
        )}

        {/* Google Login */}
        {loginMethod === 'google' && (
          <div className="google-login-section">
            <p className="google-desc">Sign in quickly with your Google account</p>
            <button 
              className="google-signin-btn" 
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <img 
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                alt="Google" 
                className="google-icon"
              />
              {loading ? 'Signing in...' : 'Sign in with Google'}
            </button>
          </div>
        )}

        {/* Messages */}
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <p className="login-footer">
          By continuing, you agree to our Terms & Conditions
        </p>
        <p className="login-hint">
          New to VERA? Your account will be created automatically
        </p>
      </div>
    </>
  );
};

export default UserLogin;
