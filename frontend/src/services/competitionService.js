import api from './api';

/**
 * Competition Service
 * Handles all competition-related API calls
 */

/**
 * Get all competitions (public access)
 * @returns {Promise<Array>} - List of all competitions
 */
export const getAllCompetitions = async () => {
  try {
    const response = await api.get('/api/competitions');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch competitions' };
  }
};

/**
 * Get single competition by ID
 * @param {string} id - Competition ID
 * @returns {Promise<Object>} - Competition details
 */
export const getCompetitionById = async (id) => {
  try {
    const response = await api.get(`/api/competitions/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch competition details' };
  }
};

/**
 * Get competitions created by logged-in organizer
 * @returns {Promise<Array>} - List of organizer's competitions
 */
export const getMyCompetitions = async () => {
  try {
    const response = await api.get('/api/competitions/my/list');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch your competitions' };
  }
};

/**
 * Create a new competition (organizer only)
 * @param {Object} competitionData - Competition details
 * @param {string} competitionData.title - Competition title
 * @param {string} competitionData.game - Game name
 * @param {string} competitionData.description - Competition description
 * @param {Date} competitionData.startDate - Start date
 * @param {Date} competitionData.endDate - End date
 * @param {number} competitionData.entryFee - Entry fee amount
 * @param {number} competitionData.prizePool - Prize pool amount
 * @param {number} competitionData.maxParticipants - Maximum participants
 * @param {string} competitionData.status - Competition status
 * @returns {Promise<Object>} - Created competition data
 */
export const createCompetition = async (competitionData) => {
  try {
    const response = await api.post('/api/competitions/create', competitionData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create competition' };
  }
};

/**
 * Update competition details (organizer only)
 * @param {string} id - Competition ID
 * @param {Object} competitionData - Updated competition data
 * @returns {Promise<Object>} - Updated competition data
 */
export const updateCompetition = async (id, competitionData) => {
  try {
    const response = await api.put(`/api/competitions/${id}`, competitionData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update competition' };
  }
};

/**
 * Delete competition (organizer only)
 * @param {string} id - Competition ID
 * @returns {Promise<Object>} - Success message
 */
export const deleteCompetition = async (id) => {
  try {
    const response = await api.delete(`/api/competitions/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete competition' };
  }
};

/**
 * Register player for a competition
 * @param {string} id - Competition ID
 * @param {Object} registrationData - Registration data (inGamePlayerID, teamName, teamMembers)
 * @returns {Promise<Object>} - Registration success with updated data
 */
export const registerForCompetition = async (id, registrationData = {}) => {
  try {
    const response = await api.post(`/api/competitions/${id}/register`, registrationData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to register for competition' };
  }
};

/**
 * Unregister player from a competition
 * @param {string} id - Competition ID
 * @returns {Promise<Object>} - Unregistration success with refund info
 */
export const unregisterFromCompetition = async (id) => {
  try {
    const response = await api.post(`/api/competitions/${id}/unregister`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to unregister from competition' };
  }
};

/**
 * Get registered participants for a competition (organizer/admin only)
 * @param {string} id - Competition ID
 * @returns {Promise<Object>} - Participants list with stats
 */
export const getCompetitionParticipants = async (id) => {
  try {
    const response = await api.get(`/api/competitions/${id}/participants`);
    return response;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch participants' };
  }
};

/**
 * Get competitions that the logged-in player has registered for
 * @returns {Promise<Array>} - List of registered competitions
 */
export const getMyRegistrations = async () => {
  try {
    const response = await api.get('/api/competitions/my-registrations');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch registered competitions' };
  }
};

/**
 * Get all registrations for a competition (organizer only)
 * @param {string} id - Competition ID
 * @returns {Promise<Object>} - Registrations with stats
 */
export const getCompetitionRegistrations = async (id) => {
  try {
    const response = await api.get(`/api/competitions/${id}/registrations`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch registrations' };
  }
};

/**
 * Verify a player registration (organizer only)
 * @param {string} competitionId - Competition ID
 * @param {string} registrationId - Registration ID
 * @param {Object} data - Battle credentials (battleRoomID, battleRoomPassword, timeSlot)
 * @returns {Promise<Object>} - Success message
 */
export const verifyRegistration = async (competitionId, registrationId, data = {}) => {
  try {
    const response = await api.put(`/api/competitions/${competitionId}/registrations/${registrationId}/verify`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to verify registration' };
  }
};

/**
 * Reject a player registration (organizer only)
 * @param {string} competitionId - Competition ID
 * @param {string} registrationId - Registration ID
 * @param {string} rejectionReason - Reason for rejection
 * @returns {Promise<Object>} - Success message
 */
export const rejectRegistration = async (competitionId, registrationId, rejectionReason = '') => {
  try {
    const response = await api.put(`/api/competitions/${competitionId}/registrations/${registrationId}/reject`, { rejectionReason });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to reject registration' };
  }
};

export default {
  getAllCompetitions,
  getCompetitionById,
  getMyCompetitions,
  createCompetition,
  updateCompetition,
  deleteCompetition,
  registerForCompetition,
  unregisterFromCompetition,
  getCompetitionParticipants,
  getMyRegistrations,
  getCompetitionRegistrations,
  verifyRegistration,
  rejectRegistration,
};
