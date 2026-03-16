import React from 'react';
import './Login.css';
import { authService } from '../../services/authService';
import { useNavigate } from 'react-router-dom';

function AdminLogin({ onClose, asPage = false, onLoginSuccess }) {
  const [error, setError] = React.useState(null);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      await authService.signInWithGoogle();
      setError(null);
      if (onLoginSuccess) onLoginSuccess();
      navigate('/admin');
      if (onClose) onClose();
    } catch (err) {
      setError('Google sign-in failed. Please try again.');
    }
  };

  // If used as a page (not modal), render without overlay
  if (asPage) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '2rem' }}>
        <div className="login-card" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.1)', padding: '2.5rem', borderRadius: '12px', maxWidth: '400px', width: '100%' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Admin Login</h2>
          <button className="google-login-btn" onClick={handleGoogleLogin}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" className="google-logo" />
            Continue with Google
          </button>
          {error && <div className="login-error">{error}</div>}
        </div>
      </div>
    );
  }

  // Modal version
  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-modal" onClick={e => e.stopPropagation()}>
        <button className="login-close-btn" onClick={onClose} aria-label="Close admin login popup">&times;</button>
        <div className="login-card">
          <h2>Admin Login</h2>
          <button className="google-login-btn" onClick={handleGoogleLogin}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" className="google-logo" />
            Continue with Google
          </button>
          {error && <div className="login-error">{error}</div>}
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
