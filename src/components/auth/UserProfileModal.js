// src/components/auth/UserProfileModal.js
import React, { useState, useEffect } from 'react';
import './UserProfileModal.css';
import LoadingSpinner from '../common/LoadingSpinner';

const UserProfileModal = ({ isOpen, onClose, onSubmit, initialData = {}, loading = false }) => {
  const [formData, setFormData] = useState({
    fullName: initialData.fullName || '',
    email: initialData.email || '',
    phoneNumber: initialData.phoneNumber || ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.fullName || '',
        email: initialData.email || '',
        phoneNumber: initialData.phoneNumber || ''
      });
    }
  }, [initialData]);

  // Validate individual field
  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'fullName':
        if (!value.trim()) {
          error = 'Full Name is required';
        } else if (value.trim().length < 2) {
          error = 'Full Name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          error = 'Full Name can only contain letters and spaces';
        }
        break;

      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;

      case 'phoneNumber':
        if (!value.trim()) {
          error = 'Mobile Number is required';
        } else if (!/^\+91\d{10}$/.test(value)) {
          error = 'Please enter a valid Indian mobile number with +91';
        }
        break;

      default:
        break;
    }

    return error;
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle phone number formatting
  const handlePhoneChange = (e) => {
    let value = e.target.value;
    
    // Only allow numbers and +
    value = value.replace(/[^\d+]/g, '');
    
    // If user enters without +91, add it
    if (value && !value.startsWith('+91')) {
      if (value.startsWith('91')) {
        value = '+' + value;
      } else if (value.startsWith('+')) {
        value = '+91';
      } else {
        value = '+91' + value;
      }
    }
    
    // Limit to +91 and 10 digits
    if (value.length > 13) {
      value = value.substring(0, 13);
    }

    setFormData(prev => ({ ...prev, phoneNumber: value }));
    
    // Clear error for phone field
    if (errors.phoneNumber) {
      setErrors(prev => ({ ...prev, phoneNumber: '' }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      // Error handled by parent
    } finally {
      setSubmitting(false);
    }
  };

  // Prevent closing modal when clicking outside or pressing escape
  const handleBackdropClick = (e) => {
    e.stopPropagation();
    // Modal cannot be closed until profile is completed
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="profile-modal-backdrop" onClick={handleBackdropClick}></div>
      <div className="profile-modal">
        <div className="profile-modal-header">
          <h2>Complete Your Profile</h2>
          <p className="profile-modal-subtitle">
            Please provide the following information to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="profile-modal-form">
          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="fullName">
              Full Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={errors.fullName ? 'error' : ''}
              disabled={submitting || loading}
              autoComplete="name"
            />
            {errors.fullName && (
              <span className="field-error">{errors.fullName}</span>
            )}
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">
              Email Address <span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              className={errors.email ? 'error' : ''}
              disabled={submitting || loading || !!initialData.email}
              autoComplete="email"
            />
            {errors.email && (
              <span className="field-error">{errors.email}</span>
            )}
            {initialData.email && (
              <span className="field-hint">Email from your login account</span>
            )}
          </div>

          {/* Mobile Number */}
          <div className="form-group">
            <label htmlFor="phoneNumber">
              Mobile Number <span className="required">*</span>
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handlePhoneChange}
              placeholder="+91XXXXXXXXXX"
              className={errors.phoneNumber ? 'error' : ''}
              disabled={submitting || loading || !!initialData.phoneNumber}
              autoComplete="tel"
            />
            {errors.phoneNumber && (
              <span className="field-error">{errors.phoneNumber}</span>
            )}
            {initialData.phoneNumber && (
              <span className="field-hint">Phone from your login account</span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="profile-submit-btn"
            disabled={submitting || loading}
          >
            {submitting || loading ? (
              <>
                <LoadingSpinner size="small" />
                <span>Creating Account...</span>
              </>
            ) : (
              'Complete Registration'
            )}
          </button>

          <p className="profile-modal-note">
            All fields are mandatory to create your account
          </p>
        </form>
      </div>
    </>
  );
};

export default UserProfileModal;
