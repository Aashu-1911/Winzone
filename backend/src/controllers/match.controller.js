import Match from '../models/match.model.js';
import Competition from '../models/competition.model.js';
import User from '../models/user.model.js';
import { distributeMatchRewards } from '../services/reward.service.js';

/**
 * @desc    Create a new match for a competition
 * @route   POST /api/matches/create
 * @access  Private (Organizer only)
 */
export const createMatch = async (req, res) => {
  try {
    const { competitionId, players, matchNumber, gameMode } = req.body;

    // Validation
    if (!competitionId) {
      return res.status(400).json({
        success: false,
        message: 'Competition ID is required',
      });
    }

    // Verify competition exists and user is the organizer
    const competition = await Competition.findById(competitionId);
    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Competition not found',
      });
    }

    if (competition.organizerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the organizer can create matches',
      });
    }

    // Create match
    const match = await Match.create({
      competitionId,
      organizerId: req.user._id,
      players: players || competition.participants,
      matchNumber: matchNumber || 1,
      metadata: {
        gameMode: gameMode || competition.gameType,
      },
    });

    // Populate match data
    await match.populate('players', 'name email stats');
    await match.populate('organizerId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Match created successfully',
      data: match,
    });
  } catch (error) {
    console.error('Create match error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating match',
      error: error.message,
    });
  }
};

/**
 * @desc    Get match by ID
 * @route   GET /api/matches/:id
 * @access  Public
 */
export const getMatchById = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('players', 'name email stats')
      .populate('organizerId', 'name email')
      .populate('winner', 'name email')
      .populate({
        path: 'competitionId',
        select: 'title gameType',
      });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Match fetched successfully',
      data: match,
    });
  } catch (error) {
    console.error('Get match error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching match',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all matches for a competition
 * @route   GET /api/matches/competition/:competitionId
 * @access  Public
 */
export const getMatchesByCompetition = async (req, res) => {
  try {
    const matches = await Match.find({ competitionId: req.params.competitionId })
      .populate('players', 'name email stats')
      .populate('organizerId', 'name email')
      .populate('winner', 'name email')
      .sort({ matchNumber: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Matches fetched successfully',
      count: matches.length,
      data: matches,
    });
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching matches',
      error: error.message,
    });
  }
};

/**
 * @desc    Get matches for logged-in player
 * @route   GET /api/matches/my/list
 * @access  Private
 */
export const getMyMatches = async (req, res) => {
  try {
    const matches = await Match.find({ players: req.user._id })
      .populate('players', 'name email stats')
      .populate('organizerId', 'name email')
      .populate('winner', 'name email')
      .populate({
        path: 'competitionId',
        select: 'title gameType',
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Your matches fetched successfully',
      count: matches.length,
      data: matches,
    });
  } catch (error) {
    console.error('Get my matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your matches',
      error: error.message,
    });
  }
};

/**
 * @desc    Start a match
 * @route   POST /api/matches/:id/start
 * @access  Private (Organizer only)
 */
export const startMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found',
      });
    }

    // Verify organizer
    if (match.organizerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the organizer can start the match',
      });
    }

    // Check if already started
    if (match.status === 'ongoing') {
      return res.status(400).json({
        success: false,
        message: 'Match has already started',
      });
    }

    // Start match
    await match.startMatch();

    res.status(200).json({
      success: true,
      message: 'Match started successfully',
      data: match,
    });
  } catch (error) {
    console.error('Start match error:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting match',
      error: error.message,
    });
  }
};

/**
 * @desc    End a match and finalize results
 * @route   POST /api/matches/:id/end
 * @access  Private (Organizer only)
 */
export const endMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('players', 'name email stats');

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found',
      });
    }

    // Verify organizer
    if (match.organizerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the organizer can end the match',
      });
    }

    // Check if already ended
    if (match.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Match has already ended',
      });
    }

    // End match
    await match.endMatch();

    // Update player stats
    for (const [playerId, score] of match.scores) {
      const user = await User.findById(playerId);
      if (user) {
        const isWinner = match.winner && match.winner.toString() === playerId.toString();
        await user.updateMatchStats(score, isWinner);
      }
    }

    // Distribute rewards if competition has prize pool
    let rewardDistribution = null;
    const competition = await Competition.findById(match.competitionId);
    if (competition && competition.prizePool > 0) {
      try {
        rewardDistribution = await distributeMatchRewards(match._id);
        console.log('[MatchController] Rewards distributed:', rewardDistribution);
      } catch (rewardError) {
        console.error('[MatchController] Reward distribution error:', rewardError);
        // Continue even if reward distribution fails - can be retried manually
      }
    }

    res.status(200).json({
      success: true,
      message: 'Match ended successfully',
      data: match,
      leaderboard: match.getLeaderboard(),
      rewardDistribution,
    });
  } catch (error) {
    console.error('End match error:', error);
    res.status(500).json({
      success: false,
      message: 'Error ending match',
      error: error.message,
    });
  }
};

/**
 * @desc    Update match score for a player
 * @route   PUT /api/matches/:id/score
 * @access  Private (Organizer only)
 */
export const updateMatchScore = async (req, res) => {
  try {
    const { playerId, score } = req.body;

    if (!playerId || score === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Player ID and score are required',
      });
    }

    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found',
      });
    }

    // Verify organizer
    if (match.organizerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the organizer can update scores',
      });
    }

    // Update score
    await match.updateScore(playerId, score);

    res.status(200).json({
      success: true,
      message: 'Score updated successfully',
      data: {
        matchId: match._id,
        playerId,
        score,
        leaderboard: match.getLeaderboard(),
      },
    });
  } catch (error) {
    console.error('Update score error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating score',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a match
 * @route   DELETE /api/matches/:id
 * @access  Private (Organizer only)
 */
export const deleteMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found',
      });
    }

    // Verify organizer
    if (match.organizerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the organizer can delete the match',
      });
    }

    // Don't allow deletion of completed matches
    if (match.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete completed matches',
      });
    }

    await Match.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Match deleted successfully',
    });
  } catch (error) {
    console.error('Delete match error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting match',
      error: error.message,
    });
  }
};

/**
 * @desc    Get player analytics/stats
 * @route   GET /api/matches/analytics/:userId
 * @access  Public
 */
export const getPlayerAnalytics = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Get user stats
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get match history
    const matches = await Match.find({ players: userId })
      .populate({
        path: 'competitionId',
        select: 'title gameType',
      })
      .sort({ createdAt: -1 })
      .limit(20);

    // Calculate additional stats
    const matchHistory = matches.map((match) => ({
      matchId: match._id,
      competitionTitle: match.competitionId?.title,
      gameType: match.competitionId?.gameType,
      score: match.scores.get(userId.toString()) || 0,
      isWinner: match.winner && match.winner.toString() === userId.toString(),
      status: match.status,
      playedAt: match.createdAt,
    }));

    res.status(200).json({
      success: true,
      message: 'Analytics fetched successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        stats: user.stats,
        matchHistory,
      },
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message,
    });
  }
};
