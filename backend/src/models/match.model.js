import mongoose from 'mongoose';

/**
 * Match Schema for Real-Time Gaming Matches
 * Tracks live matches, scores, and results
 */
const matchSchema = new mongoose.Schema(
  {
    competitionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Competition',
      required: [true, 'Competition ID is required'],
      index: true,
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Organizer ID is required'],
    },
    players: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    scores: {
      type: Map,
      of: Number,
      default: new Map(),
      // Key: playerId (string), Value: score (number)
      // Example: { "userId1": 150, "userId2": 200 }
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
      index: true,
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    matchNumber: {
      type: Number,
      default: 1,
    },
    roomId: {
      type: String,
      unique: true,
      sparse: true, // Allows null values while maintaining uniqueness
    },
    metadata: {
      totalKills: { type: Number, default: 0 },
      duration: { type: Number, default: 0 }, // in seconds
      gameMode: { type: String, default: '' },
      notes: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Index for faster queries
 */
matchSchema.index({ competitionId: 1, status: 1 });
matchSchema.index({ roomId: 1 });

/**
 * Virtual field for match duration in minutes
 */
matchSchema.virtual('durationMinutes').get(function () {
  if (!this.startedAt || !this.endedAt) return 0;
  return Math.round((this.endedAt - this.startedAt) / 60000);
});

/**
 * Method to calculate and set winner based on highest score
 */
matchSchema.methods.calculateWinner = function () {
  if (this.scores.size === 0) return null;
  
  let highestScore = -1;
  let winnerId = null;
  
  this.scores.forEach((score, playerId) => {
    if (score > highestScore) {
      highestScore = score;
      winnerId = playerId;
    }
  });
  
  return winnerId;
};

/**
 * Method to update player score
 */
matchSchema.methods.updateScore = function (playerId, score) {
  this.scores.set(playerId.toString(), score);
  return this.save();
};

/**
 * Method to start match
 */
matchSchema.methods.startMatch = function () {
  this.status = 'ongoing';
  this.startedAt = new Date();
  return this.save();
};

/**
 * Method to end match
 */
matchSchema.methods.endMatch = async function () {
  this.status = 'completed';
  this.endedAt = new Date();
  
  // Calculate match duration
  if (this.startedAt && this.endedAt) {
    this.metadata.duration = Math.round((this.endedAt - this.startedAt) / 1000);
  }
  
  // Determine winner
  const winnerId = this.calculateWinner();
  if (winnerId) {
    this.winner = mongoose.Types.ObjectId(winnerId);
  }
  
  return this.save();
};

/**
 * Get leaderboard for current match
 */
matchSchema.methods.getLeaderboard = function () {
  const leaderboard = [];
  
  this.scores.forEach((score, playerId) => {
    leaderboard.push({
      playerId,
      score,
    });
  });
  
  // Sort by score descending
  leaderboard.sort((a, b) => b.score - a.score);
  
  return leaderboard;
};

/**
 * Pre-save hook to generate unique room ID
 */
matchSchema.pre('save', function (next) {
  if (!this.roomId && this.isNew) {
    this.roomId = `match_${this._id}_${Date.now()}`;
  }
  next();
});

/**
 * Include virtuals when converting to JSON
 */
matchSchema.set('toJSON', { virtuals: true });
matchSchema.set('toObject', { virtuals: true });

const Match = mongoose.model('Match', matchSchema);

export default Match;
