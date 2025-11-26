import api from './api';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.name - User's full name
 * @param {string} userData.email - User's email
 * @param {string} userData.password - User's password
 * @param {string} userData.role - User's role (player/organizer)
 * @param {string} userData.collegeName - User's college name
 * @returns {Promise<Object>} - Response with token and user data
 */
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Registration failed' };
  }
};

/**
 * Login user
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User's email
 * @param {string} credentials.password - User's password
 * @returns {Promise<Object>} - Response with token and user data
 */
export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Login failed' };
  }
};

/**
 * Get current user profile
 * @returns {Promise<Object>} - User profile data
 */
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/api/auth/me');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch user profile' };
  }
};

/**
 * Logout user (client-side only)
 * Clears token from local storage
 */
export const logoutUser = () => {
  localStorage.removeItem('token');
};
