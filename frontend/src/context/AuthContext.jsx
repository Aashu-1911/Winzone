import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../services/authService';

// Create Auth Context
const AuthContext = createContext(null);

/**
 * Custom hook to use Auth Context
 * @returns {Object} - Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

/**
 * Auth Provider Component
 * Manages authentication state globally with real API integration
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  /**
   * Fetch current user data from backend API
   */
  const fetchCurrentUser = async () => {
    try {
      const data = await getCurrentUser();
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        // Invalid response, clear token
        logout();
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      // Token is invalid or expired, clear it
      logout();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login user and store token
   * @param {Object} userData - User data from login response
   * @param {string} authToken - JWT token
   */
  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
  };

  /**
   * Register user and store token
   * @param {Object} userData - User data from register response
   * @param {string} authToken - JWT token
   */
  const register = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
  };

  /**
   * Logout user and clear token
   */
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  const isAuthenticated = () => {
    return !!token && !!user;
  };

  /**
   * Check if user has specific role
   * @param {string} role - Role to check
   * @returns {boolean}
   */
  const hasRole = (role) => {
    return user?.role === role;
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    hasRole,
    fetchCurrentUser, // Expose for refreshing user data
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
