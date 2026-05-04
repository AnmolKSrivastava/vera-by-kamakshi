import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import './UserProfile.css';

const UserProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile state
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    phoneNumber: '',
    photoURL: ''
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Address state
  const [addresses, setAddresses] = useState([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState(null);
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });

  const fetchUserData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        setProfileData({
          displayName: data.displayName || '',
          email: data.email || user.email || '',
          phoneNumber: data.phoneNumber || user.phoneNumber || '',
          photoURL: data.photoURL || user.photoURL || ''
        });
        setAddresses(data.addresses || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchUserData();
  }, [user, navigate, fetchUserData]);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: profileData.displayName,
        updatedAt: new Date().toISOString()
      });
      setIsEditingProfile(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm({
      ...addressForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSaveAddress = async () => {
    if (!addressForm.name || !addressForm.phone || !addressForm.addressLine1 || 
        !addressForm.city || !addressForm.state || !addressForm.pincode) {
      alert('Please fill all required fields');
      return;
    }

    setSaving(true);
    try {
      let updatedAddresses = [...addresses];
      
      // If setting as default, unset other defaults
      if (addressForm.isDefault) {
        updatedAddresses = updatedAddresses.map(addr => ({ ...addr, isDefault: false }));
      }
      
      if (editingAddressIndex !== null) {
        // Edit existing address
        updatedAddresses[editingAddressIndex] = addressForm;
      } else {
        // Add new address
        updatedAddresses.push(addressForm);
      }

      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { 
        addresses: updatedAddresses,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setAddresses(updatedAddresses);
      resetAddressForm();
      alert(editingAddressIndex !== null ? 'Address updated!' : 'Address added!');
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleEditAddress = (index) => {
    setAddressForm(addresses[index]);
    setEditingAddressIndex(index);
    setIsAddingAddress(true);
  };

  const handleDeleteAddress = async (index) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;

    setSaving(true);
    try {
      const updatedAddresses = addresses.filter((_, i) => i !== index);
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { 
        addresses: updatedAddresses,
        updatedAt: new Date().toISOString()
      });
      setAddresses(updatedAddresses);
      alert('Address deleted!');
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Failed to delete address');
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefaultAddress = async (index) => {
    setSaving(true);
    try {
      const updatedAddresses = addresses.map((addr, i) => ({
        ...addr,
        isDefault: i === index
      }));
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { 
        addresses: updatedAddresses,
        updatedAt: new Date().toISOString()
      });
      setAddresses(updatedAddresses);
    } catch (error) {
      console.error('Error setting default address:', error);
      alert('Failed to set default address');
    } finally {
      setSaving(false);
    }
  };

  const resetAddressForm = () => {
    setAddressForm({
      name: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: false
    });
    setIsAddingAddress(false);
    setEditingAddressIndex(null);
  };

  if (loading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  return (
    <div className="user-profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>My Account</h1>
          <button className="back-btn" onClick={() => navigate('/')}>← Back to Home</button>
        </div>

        <div className="profile-tabs">
          <button 
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile Information
          </button>
          <button 
            className={`tab-btn ${activeTab === 'addresses' ? 'active' : ''}`}
            onClick={() => setActiveTab('addresses')}
          >
            Saved Addresses ({addresses.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => navigate('/orders')}
          >
            My Orders
          </button>
        </div>

        <div className="profile-content">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="profile-section">
              <div className="profile-card">
                <div className="profile-avatar">
                  {profileData.photoURL ? (
                    <img src={profileData.photoURL} alt={profileData.displayName} />
                  ) : (
                    <div className="avatar-placeholder">
                      {profileData.displayName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                
                <div className="profile-details">
                  <div className="form-group">
                    <label>Name</label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        name="displayName"
                        value={profileData.displayName}
                        onChange={handleProfileChange}
                        placeholder="Enter your name"
                      />
                    ) : (
                      <p className="profile-value">{profileData.displayName || 'Not set'}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <p className="profile-value">{profileData.email || 'Not available'}</p>
                    <small className="field-note">Email cannot be changed</small>
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <p className="profile-value">{profileData.phoneNumber || 'Not available'}</p>
                    <small className="field-note">Phone number cannot be changed</small>
                  </div>

                  <div className="profile-actions">
                    {isEditingProfile ? (
                      <>
                        <button 
                          className="btn-save" 
                          onClick={handleSaveProfile}
                          disabled={saving}
                        >
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button 
                          className="btn-cancel" 
                          onClick={() => {
                            setIsEditingProfile(false);
                            fetchUserData();
                          }}
                          disabled={saving}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button 
                        className="btn-edit" 
                        onClick={() => setIsEditingProfile(true)}
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div className="addresses-section">
              <div className="addresses-header">
                <h2>Saved Addresses</h2>
                {!isAddingAddress && (
                  <button 
                    className="btn-add-address" 
                    onClick={() => setIsAddingAddress(true)}
                  >
                    + Add New Address
                  </button>
                )}
              </div>

              {isAddingAddress && (
                <div className="address-form-card">
                  <h3>{editingAddressIndex !== null ? 'Edit Address' : 'Add New Address'}</h3>
                  <div className="address-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Full Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={addressForm.name}
                          onChange={handleAddressChange}
                          placeholder="Enter full name"
                        />
                      </div>
                      <div className="form-group">
                        <label>Phone Number *</label>
                        <input
                          type="tel"
                          name="phone"
                          value={addressForm.phone}
                          onChange={handleAddressChange}
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Address Line 1 *</label>
                      <input
                        type="text"
                        name="addressLine1"
                        value={addressForm.addressLine1}
                        onChange={handleAddressChange}
                        placeholder="House no., Building name"
                      />
                    </div>

                    <div className="form-group">
                      <label>Address Line 2</label>
                      <input
                        type="text"
                        name="addressLine2"
                        value={addressForm.addressLine2}
                        onChange={handleAddressChange}
                        placeholder="Road name, Area, Colony (Optional)"
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>City *</label>
                        <input
                          type="text"
                          name="city"
                          value={addressForm.city}
                          onChange={handleAddressChange}
                          placeholder="Enter city"
                        />
                      </div>
                      <div className="form-group">
                        <label>State *</label>
                        <input
                          type="text"
                          name="state"
                          value={addressForm.state}
                          onChange={handleAddressChange}
                          placeholder="Enter state"
                        />
                      </div>
                      <div className="form-group">
                        <label>Pincode *</label>
                        <input
                          type="text"
                          name="pincode"
                          value={addressForm.pincode}
                          onChange={handleAddressChange}
                          placeholder="Enter pincode"
                        />
                      </div>
                    </div>

                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          name="isDefault"
                          checked={addressForm.isDefault}
                          onChange={handleAddressChange}
                        />
                        Set as default address
                      </label>
                    </div>

                    <div className="form-actions">
                      <button 
                        className="btn-save" 
                        onClick={handleSaveAddress}
                        disabled={saving}
                      >
                        {saving ? 'Saving...' : 'Save Address'}
                      </button>
                      <button 
                        className="btn-cancel" 
                        onClick={resetAddressForm}
                        disabled={saving}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="addresses-list">
                {addresses.length === 0 ? (
                  <div className="empty-addresses">
                    <p>No saved addresses yet</p>
                    <button 
                      className="btn-add-first" 
                      onClick={() => setIsAddingAddress(true)}
                    >
                      Add Your First Address
                    </button>
                  </div>
                ) : (
                  addresses.map((address, index) => (
                    <div key={index} className={`address-card ${address.isDefault ? 'default' : ''}`}>
                      {address.isDefault && <span className="default-badge">Default</span>}
                      <div className="address-info">
                        <h4>{address.name}</h4>
                        <p>{address.phone}</p>
                        <p>{address.addressLine1}</p>
                        {address.addressLine2 && <p>{address.addressLine2}</p>}
                        <p>{address.city}, {address.state} - {address.pincode}</p>
                      </div>
                      <div className="address-actions">
                        <button 
                          className="btn-edit-small" 
                          onClick={() => handleEditAddress(index)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn-delete-small" 
                          onClick={() => handleDeleteAddress(index)}
                        >
                          Delete
                        </button>
                        {!address.isDefault && (
                          <button 
                            className="btn-default-small" 
                            onClick={() => handleSetDefaultAddress(index)}
                          >
                            Set as Default
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
