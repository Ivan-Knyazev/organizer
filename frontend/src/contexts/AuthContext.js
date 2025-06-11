import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUser, registerUser, fetchUserProfile, validateToken } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // For initial token validation

  useEffect(() => {
    const currentToken = localStorage.getItem('authToken');
    if (currentToken) {
      setToken(currentToken);
      // Validate token with backend
      validateToken(currentToken)
        .then(userData => {
          setUser(userData); // Assuming validateToken returns user data
          setIsAuthenticated(true);
        })
        .catch(() => { // Token invalid or expired
          localStorage.removeItem('authToken');
          setUser(null);
          setToken(null);
          setIsAuthenticated(false);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false); // No token, not loading
    }
  }, []);

  const login = async (credentials) => {
    try {
      const { token: newToken, user: userData } = await loginUser(credentials);
      localStorage.setItem('authToken', newToken);
      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, message: error.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const { token: newToken, user: newUser } = await registerUser(userData);
      localStorage.setItem('authToken', newToken);
      setToken(newToken);
      setUser(newUser);
      setIsAuthenticated(true); // Or redirect to login
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, message: error.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  };
  
  const updateUserProfile = (newProfileData) => {
    setUser(prevUser => ({ ...prevUser, ...newProfileData }));
  };


  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, register, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);