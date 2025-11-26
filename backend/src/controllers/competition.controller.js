import Competition from '../models/competition.model.js';
import User from '../models/user.model.js';

/**
 * @desc    Create a new competition
 * @route   POST /api/competitions/create
 * @access  Private (Organizer only)
 */
export const createCompetition = async (req, res) => {
  try {
    const {
      title,
      description,
      gameType,
      entryFee,
      startTime,
      endTime,
      maxPlayers,
      isCollegeRestricted,
      prizePool,
      rules,
    } = req.body;

    // Validation
    if (!title || !description || !gameType || !startTime || !endTime || !maxPlayers) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, gameType, startTime, endTime, maxPlayers',
      });
    }

    // Validate dates
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    if (start <= now) {
      return res.status(400).json({
        success: false,
        message: 'Start time must be in the future',
      });
    }

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time',
      });
    }

    // Create competition
    const competition = await Competition.create({
      title,
      description,
      gameType,
      entryFee: entryFee || 0,
      startTime: start,
      endTime: end,
      organizerId: req.user._id,
      maxPlayers,
      isCollegeRestricted: isCollegeRestricted || false,
      prizePool: prizePool || 0,
      rules: rules || '',
    });

    // Populate organizer details
    await competition.populate('organizerId', 'name email collegeName');

    res.status(201).json({
      success: true,
      message: 'Competition created successfully',
      data: competition,
    });
  } catch (error) {
    console.error('Create competition error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating competition',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all competitions created by the organizer
 * @route   GET /api/competitions/my
 * @access  Private (Organizer only)
 */
export const getMyCompetitions = async (req, res) => {
  try {
    const competitions = await Competition.find({ organizerId: req.user._id })
      .populate('organizerId', 'name email collegeName')
      .populate('participants', 'name email collegeName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Competitions fetched successfully',
      count: competitions.length,
      data: competitions,
    });
  } catch (error) {
    console.error('Get my competitions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching competitions',
      error: error.message,
    });
  }
};

/**
 * @desc    Get a single competition by ID
 * @route   GET /api/competitions/:id
 * @access  Public
 */
export const getCompetitionById = async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id)
      .populate('organizerId', 'name email collegeName')
      .populate('participants', 'name email collegeName');

    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Competition not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Competition fetched successfully',
      data: competition,
    });
  } catch (error) {
    console.error('Get competition error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching competition',
      error: error.message,
    });
  }
};

/**
 * @desc    Update competition details
 * @route   PUT /api/competitions/:id
 * @access  Private (Organizer only - own competitions)
 */
export const updateCompetition = async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);

    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Competition not found',
      });
    }

    // Check if user is the organizer of this competition
    if (competition.organizerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this competition',
      });
    }

    // Don't allow updates if competition has already started
    if (competition.status === 'ongoing' || competition.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update competition that has already started or completed',
      });
    }

    // Update allowed fields
    const {
      title,
      description,
      gameType,
      entryFee,
      startTime,
      endTime,
      maxPlayers,
      isCollegeRestricted,
      prizePool,
      rules,
      status,
    } = req.body;

    // Validate dates if provided
    if (startTime || endTime) {
      const start = startTime ? new Date(startTime) : competition.startTime;
      const end = endTime ? new Date(endTime) : competition.endTime;
      const now = new Date();

      if (start <= now) {
        return res.status(400).json({
          success: false,
          message: 'Start time must be in the future',
        });
      }

      if (end <= start) {
        return res.status(400).json({
          success: false,
          message: 'End time must be after start time',
        });
      }

      competition.startTime = start;
      competition.endTime = end;
    }

    // Update fields
    if (title) competition.title = title;
    if (description) competition.description = description;
    if (gameType) competition.gameType = gameType;
    if (entryFee !== undefined) competition.entryFee = entryFee;
    if (maxPlayers) {
      // Don't allow reducing max players below current participant count
      if (maxPlayers < competition.participants.length) {
        return res.status(400).json({
          success: false,
          message: `Cannot reduce max players below current participant count (${competition.participants.length})`,
        });
      }
      competition.maxPlayers = maxPlayers;
    }
    if (isCollegeRestricted !== undefined) competition.isCollegeRestricted = isCollegeRestricted;
    if (prizePool !== undefined) competition.prizePool = prizePool;
    if (rules !== undefined) competition.rules = rules;
    if (status && ['upcoming', 'cancelled'].includes(status)) competition.status = status;

    await competition.save();
    await competition.populate('organizerId', 'name email collegeName');

    res.status(200).json({
      success: true,
      message: 'Competition updated successfully',
      data: competition,
    });
  } catch (error) {
    console.error('Update competition error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating competition',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete competition
 * @route   DELETE /api/competitions/:id
 * @access  Private (Organizer only - own competitions)
 */
export const deleteCompetition = async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);

    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Competition not found',
      });
    }

    // Check if user is the organizer of this competition
    if (competition.organizerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this competition',
      });
    }

    // Don't allow deletion if competition has participants
    if (competition.participants.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete competition with registered participants. Please cancel it instead.',
      });
    }

    await Competition.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Competition deleted successfully',
    });
  } catch (error) {
    console.error('Delete competition error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting competition',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all competitions (for players to browse)
 * @route   GET /api/competitions
 * @access  Public
 */
export const getAllCompetitions = async (req, res) => {
  try {
    const { status, gameType, search } = req.query;
    const query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by game type
    if (gameType) {
      query.gameType = gameType;
    }

    // Search in title and description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const competitions = await Competition.find(query)
      .populate('organizerId', 'name email collegeName')
      .sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      message: 'Competitions fetched successfully',
      count: competitions.length,
      data: competitions,
    });
  } catch (error) {
    console.error('Get all competitions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching competitions',
      error: error.message,
    });
  }
};

/**
 * @desc    Register player for a competition
 * @route   POST /api/competitions/:id/register
 * @access  Private (Player only)
 */
export const registerForCompetition = async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);

    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Competition not found',
      });
    }

    // Check if competition is upcoming
    if (competition.status !== 'upcoming') {
      return res.status(400).json({
        success: false,
        message: 'Can only register for upcoming competitions',
      });
    }

    // Check if competition is full
    if (competition.isFull()) {
      return res.status(400).json({
        success: false,
        message: 'Competition is full',
      });
    }

    // Check if user is already registered
    if (competition.hasParticipant(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this competition',
      });
    }

    // Check if user has enough balance for entry fee
    const user = await User.findById(req.user._id);
    if (user.walletBalance < competition.entryFee) {
      return res.status(400).json({
        success: false,
        message: `Insufficient wallet balance. Required: ₹${competition.entryFee}, Available: ₹${user.walletBalance}`,
      });
    }

    // Deduct entry fee from user's wallet
    user.walletBalance -= competition.entryFee;
    await user.save();

    // Add user to participants
    competition.participants.push(req.user._id);
    await competition.save();

    // Populate for response
    await competition.populate('organizerId', 'name email collegeName');
    await competition.populate('participants', 'name email collegeName');

    res.status(200).json({
      success: true,
      message: 'Successfully registered for competition',
      data: {
        competition,
        newWalletBalance: user.walletBalance,
      },
    });
  } catch (error) {
    console.error('Register for competition error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering for competition',
      error: error.message,
    });
  }
};

/**
 * @desc    Unregister player from a competition
 * @route   POST /api/competitions/:id/unregister
 * @access  Private (Player only)
 */
export const unregisterFromCompetition = async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);

    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Competition not found',
      });
    }

    // Check if competition is upcoming
    if (competition.status !== 'upcoming') {
      return res.status(400).json({
        success: false,
        message: 'Can only unregister from upcoming competitions',
      });
    }

    // Check if user is registered
    if (!competition.hasParticipant(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are not registered for this competition',
      });
    }

    // Refund entry fee to user's wallet
    const user = await User.findById(req.user._id);
    user.walletBalance += competition.entryFee;
    await user.save();

    // Remove user from participants
    competition.participants = competition.participants.filter(
      (participantId) => participantId.toString() !== req.user._id.toString()
    );
    await competition.save();

    res.status(200).json({
      success: true,
      message: 'Successfully unregistered from competition. Entry fee refunded.',
      data: {
        newWalletBalance: user.walletBalance,
      },
    });
  } catch (error) {
    console.error('Unregister from competition error:', error);
    res.status(500).json({
      success: false,
      message: 'Error unregistering from competition',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all registered players for a competition
 * @route   GET /api/competitions/:id/participants
 * @access  Private (Organizer only - own competitions)
 */
export const getCompetitionParticipants = async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id)
      .populate('participants', 'name email collegeName stats role');

    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Competition not found',
      });
    }

    // Check if user is the organizer of this competition
    if (competition.organizerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view participants of this competition',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Participants fetched successfully',
      data: {
        competitionId: competition._id,
        competitionTitle: competition.title,
        totalParticipants: competition.participants.length,
        maxPlayers: competition.maxPlayers,
        availableSlots: competition.availableSlots,
        participants: competition.participants,
      },
    });
  } catch (error) {
    console.error('Get competition participants error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching participants',
      error: error.message,
    });
  }
};

/**
 * @desc    Get competitions that the logged-in player has registered for
 * @route   GET /api/competitions/my-registrations
 * @access  Private (Player only)
 */
export const getMyRegistrations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all competitions where the user is a participant
    const competitions = await Competition.find({
      participants: userId,
    })
      .populate('organizerId', 'name email collegeName')
      .sort({ startTime: 1 }); // Sort by start time (earliest first)

    res.status(200).json({
      success: true,
      message: 'Registered competitions fetched successfully',
      data: competitions,
      count: competitions.length,
    });
  } catch (error) {
    console.error('Get my registrations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching registered competitions',
      error: error.message,
    });
  }
};

