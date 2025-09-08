import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Predefined delivery partners
const DELIVERY_PARTNERS = [
  { id: 1, username: 'rider1', password: 'pass1', name: 'Raj Sharma' },
  { id: 2, username: 'rider2', password: 'pass2', name: 'Vikram Singh' },
  { id: 3, username: 'rider3', password: 'pass3', name: 'Sunil Kumar' },
  { id: 4, username: 'rider4', password: 'pass4', name: 'Ankit Patel' },
  { id: 5, username: 'rider5', password: 'pass5', name: 'Mohan Das' },
  { id: 6, username: 'rider6', password: 'pass6', name: 'Suresh Nair' },
  { id: 7, username: 'rider7', password: 'pass7', name: 'Rahul Mehta' },
  { id: 8, username: 'rider8', password: 'pass8', name: 'Amit Verma' },
  { id: 9, username: 'rider9', password: 'pass9', name: 'Nitin Joshi' },
  { id: 10, username: 'rider10', password: 'pass10', name: 'Prakash Gupta' }
];

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('deliveryPartner');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (user) => {
    setCurrentUser(user);
    localStorage.setItem('deliveryPartner', JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('deliveryPartner');
  };

  const value = {
    currentUser,
    login,
    logout,
    deliveryPartners: DELIVERY_PARTNERS
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};