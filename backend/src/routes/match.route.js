import express from 'express';
import {
  createMatch,
  getMatchById,
  getMatchesByCompetition,
  getMyMatches,
  startMatch,
  endMatch,
  updateMatchScore,
  deleteMatch,
  getPlayerAnalytics,
} from '../controllers/match.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';

const router = express.Router();

// ========== Public Routes ==========

/**
 * @route   GET /api/matches/:id
 * @desc    Get match by ID
 * @access  Public
 */
router.get('/:id', getMatchById);

/**
 * @route   GET /api/matches/competition/:competitionId
 * @desc    Get all matches for a competition
 * @access  Public
 */
router.get('/competition/:competitionId', getMatchesByCompetition);

/**
 * @route   GET /api/matches/analytics/:userId
 * @desc    Get player analytics and match history
 * @access  Public
 */
router.get('/analytics/:userId', getPlayerAnalytics);

// ========== Protected Routes (All Authenticated Users) ==========

/**
 * @route   GET /api/matches/my/list
 * @desc    Get matches for logged-in player
 * @access  Private
 */
router.get('/my/list', authMiddleware, getMyMatches);

// ========== Organizer-Only Protected Routes ==========

/**
 * @route   POST /api/matches/create
 * @desc    Create a new match
 * @access  Private (Organizer only)
 */
router.post(
  '/create',
  authMiddleware,
  roleMiddleware('organizer', 'admin'),
  createMatch
);

/**
 * @route   POST /api/matches/:id/start
 * @desc    Start a match
 * @access  Private (Organizer only)
 */
router.post(
  '/:id/start',
  authMiddleware,
  roleMiddleware('organizer', 'admin'),
  startMatch
);

/**
 * @route   POST /api/matches/:id/end
 * @desc    End a match and finalize results
 * @access  Private (Organizer only)
 */
router.post(
  '/:id/end',
  authMiddleware,
  roleMiddleware('organizer', 'admin'),
  endMatch
);

/**
 * @route   PUT /api/matches/:id/score
 * @desc    Update player score in match
 * @access  Private (Organizer only)
 */
router.put(
  '/:id/score',
  authMiddleware,
  roleMiddleware('organizer', 'admin'),
  updateMatchScore
);

/**
 * @route   DELETE /api/matches/:id
 * @desc    Delete a match
 * @access  Private (Organizer only)
 */
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('organizer', 'admin'),
  deleteMatch
);

export default router;
