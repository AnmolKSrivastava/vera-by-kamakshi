// src/components/common/ErrorMessage.js
import React from 'react';
import './ErrorMessage.css';

const ErrorMessage = ({ 
  error, 
  onRetry = null, 
  title = 'Oops! Something went wrong' 
}) => {
  if (!error) return null;

  return (
    <div className="error-message-container">
      <div className="error-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <h3 className="error-title">{title}</h3>
      <p className="error-text">{error}</p>
      {onRetry && (
        <button className="error-retry-btn" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
