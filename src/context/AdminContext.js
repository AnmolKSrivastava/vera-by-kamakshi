// src/context/AdminContext.js
import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';

const AdminContext = createContext();

/**
 * Hook to use admin context
 * Must be used within AdminProvider
 */
export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};

/**
 * Admin Context Provider
 * Manages admin-specific state and operations
 */
export const AdminProvider = ({ children }) => {
  const { isAdmin } = useAuth();
  const [adminSession, setAdminSession] = useState(false);

  /**
   * Start admin session
   * Used to track if admin has explicitly logged in to admin panel
   */
  const startAdminSession = () => {
    setAdminSession(true);
  };

  /**
   * End admin session
   */
  const endAdminSession = () => {
    setAdminSession(false);
  };

  const value = {
    isAdmin,
    adminSession,
    startAdminSession,
    endAdminSession
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};
