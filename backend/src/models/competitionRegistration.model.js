import mongoose from 'mongoose';

/**
 * Competition Registration Schema
 * Tracks player registrations with verification and battle credentials
 */
const competitionRegistrationSchema = new mongoose.Schema(
  {
    competitionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Competition',
      required: true,
    },
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    inGamePlayerID: {
      type: String,
      required: [true, 'In-game player ID is required'],
      trim: true,
    },
    // Team details
    teamName: {
      type: String,
      default: '',
      trim: true,
    },
    teamMembers: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        inGameID: {
          type: String,
          required: true,
          trim: true,
        },
        role: {
          type: String,
          default: '',
          trim: true,
        },
      },
    ],
    // Verification status
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // Battle credentials (assigned after verification)
    battleRoomID: {
      type: String,
      default: '',
    },
    battleRoomPassword: {
      type: String,
      default: '',
    },
    timeSlot: {
      type: String,
      default: '',
    },
    // Payment status
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    // Registration status
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'withdrawn'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one registration per player per competition
competitionRegistrationSchema.index({ competitionId: 1, playerId: 1 }, { unique: true });

// Index for organizer queries
competitionRegistrationSchema.index({ competitionId: 1, status: 1 });

const CompetitionRegistration = mongoose.model('CompetitionRegistration', competitionRegistrationSchema);

export default CompetitionRegistration;
