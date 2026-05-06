import React, { useEffect } from 'react';
import './ActionModal.css';

const ActionModal = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
  showCancel = true,
  loading = false,
}) => {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (event) => {
      if (event.key === 'Escape' && !loading) {
        onCancel?.();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, loading, onCancel]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="action-modal-overlay" onClick={!loading ? onCancel : undefined}>
      <div className={`action-modal action-modal-${variant}`} onClick={(e) => e.stopPropagation()}>
        <div className="action-modal-header">
          <h3>{title}</h3>
          {!loading && (
            <button className="action-modal-close" onClick={onCancel} aria-label="Close modal">
              ×
            </button>
          )}
        </div>
        <div className="action-modal-body">
          <p>{message}</p>
        </div>
        <div className="action-modal-footer">
          {showCancel && (
            <button className="action-modal-btn secondary" onClick={onCancel} disabled={loading}>
              {cancelText}
            </button>
          )}
          <button
            className={`action-modal-btn ${variant === 'danger' ? 'danger' : 'primary'}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Please wait...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionModal;