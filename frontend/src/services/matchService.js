import api from './api';

/**
 * Match Service
 * Handles all match-related API calls
 */

/**
 * Create a new match for a competition
 * @param {Object} matchData - Match creation data
 * @returns {Promise<Object>} - Created match data
 */
export const createMatch = async (matchData) => {
  try {
    const response = await api.post('/api/matches/create', matchData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create match' };
  }
};

/**
 * Get match by ID
 * @param {string} matchId - Match ID
 * @returns {Promise<Object>} - Match details
 */
export const getMatchById = async (matchId) => {
  try {
    const response = await api.get(`/api/matches/${matchId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch match details' };
  }
};

/**
 * Get all matches for a competition
 * @param {string} competitionId - Competition ID
 * @returns {Promise<Array>} - List of matches
 */
export const getMatchesByCompetition = async (competitionId) => {
  try {
    const response = await api.get(`/api/matches/competition/${competitionId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch matches' };
  }
};

/**
 * Get matches for logged-in player
 * @returns {Promise<Array>} - List of player's matches
 */
export const getMyMatches = async () => {
  try {
    const response = await api.get('/api/matches/my/list');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch your matches' };
  }
};

/**
 * Start a match (organizer only)
 * @param {string} matchId - Match ID
 * @returns {Promise<Object>} - Updated match data
 */
export const startMatch = async (matchId) => {
  try {
    const response = await api.post(`/api/matches/${matchId}/start`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to start match' };
  }
};

/**
 * End a match (organizer only)
 * @param {string} matchId - Match ID
 * @returns {Promise<Object>} - Final match results
 */
export const endMatch = async (matchId) => {
  try {
    const response = await api.post(`/api/matches/${matchId}/end`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to end match' };
  }
};

/**
 * Update player score in match (organizer only)
 * @param {string} matchId - Match ID
 * @param {string} playerId - Player ID
 * @param {number} score - Player's score
 * @returns {Promise<Object>} - Updated score data
 */
export const updateMatchScore = async (matchId, playerId, score) => {
  try {
    const response = await api.put(`/api/matches/${matchId}/score`, {
      playerId,
      score,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update score' };
  }
};

/**
 * Delete a match (organizer only)
 * @param {string} matchId - Match ID
 * @returns {Promise<Object>} - Success message
 */
export const deleteMatch = async (matchId) => {
  try {
    const response = await api.delete(`/api/matches/${matchId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete match' };
  }
};

/**
 * Get player analytics and stats
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Player analytics data
 */
export const getPlayerAnalytics = async (userId) => {
  try {
    const response = await api.get(`/api/matches/analytics/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch analytics' };
  }
};
