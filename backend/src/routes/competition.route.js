import express from 'express';
import {
  createCompetition,
  getMyCompetitions,
  getCompetitionById,
  updateCompetition,
  deleteCompetition,
  getAllCompetitions,
  registerForCompetition,
  unregisterFromCompetition,
  getCompetitionParticipants,
  getMyRegistrations,
} from '../controllers/competition.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';

const router = express.Router();

// ========== Public Routes ==========

/**
 * @route   GET /api/competitions
 * @desc    Get all competitions (for players to browse)
 * @access  Public
 */
router.get('/', getAllCompetitions);

// ========== Player Protected Routes ==========

/**
 * @route   GET /api/competitions/my-registrations
 * @desc    Get all competitions the player has registered for
 * @access  Private (Player only)
 */
router.get(
  '/my-registrations',
  authMiddleware,
  roleMiddleware('player'),
  getMyRegistrations
);

/**
 * @route   GET /api/competitions/:id
 * @desc    Get a single competition by ID
 * @access  Public
 */
router.get('/:id', getCompetitionById);

/**
 * @route   POST /api/competitions/:id/register
 * @desc    Register player for a competition
 * @access  Private (Player only)
 */
router.post(
  '/:id/register',
  authMiddleware,
  roleMiddleware('player'),
  registerForCompetition
);

/**
 * @route   POST /api/competitions/:id/unregister
 * @desc    Unregister player from a competition
 * @access  Private (Player only)
 */
router.post(
  '/:id/unregister',
  authMiddleware,
  roleMiddleware('player'),
  unregisterFromCompetition
);

// ========== Organizer-Only Protected Routes ==========

/**
 * @route   POST /api/competitions/create
 * @desc    Create a new competition
 * @access  Private (Organizer only)
 */
router.post(
  '/create',
  authMiddleware,
  roleMiddleware('organizer', 'admin'),
  createCompetition
);

/**
 * @route   GET /api/competitions/my
 * @desc    Get all competitions created by the logged-in organizer
 * @access  Private (Organizer only)
 */
router.get(
  '/my/list',
  authMiddleware,
  roleMiddleware('organizer', 'admin'),
  getMyCompetitions
);

/**
 * @route   GET /api/competitions/:id/participants
 * @desc    Get all registered players for a competition
 * @access  Private (Organizer only - own competitions)
 */
router.get(
  '/:id/participants',
  authMiddleware,
  roleMiddleware('organizer', 'admin'),
  getCompetitionParticipants
);

/**
 * @route   PUT /api/competitions/:id
 * @desc    Update competition details
 * @access  Private (Organizer only - own competitions)
 */
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('organizer', 'admin'),
  updateCompetition
);

/**
 * @route   DELETE /api/competitions/:id
 * @desc    Delete competition
 * @access  Private (Organizer only - own competitions)
 */
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('organizer', 'admin'),
  deleteCompetition
);

export default router;
