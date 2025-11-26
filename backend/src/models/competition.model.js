import mongoose from 'mongoose';

/**
 * Competition Schema for WinZone
 * Organizers can create and manage competitions/tournaments
 */
const competitionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Competition title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Competition description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters long'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    gameType: {
      type: String,
      required: [true, 'Game type is required'],
      trim: true,
      enum: {
        values: ['BGMI', 'Free Fire', 'Call of Duty', 'Valorant', 'Chess', 'Cricket', 'Football', 'Basketball', 'Other'],
        message: '{VALUE} is not a supported game type',
      },
    },
    entryFee: {
      type: Number,
      required: [true, 'Entry fee is required'],
      min: [0, 'Entry fee cannot be negative'],
      default: 0,
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
      validate: {
        validator: function (value) {
          return value > new Date();
        },
        message: 'Start time must be in the future',
      },
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
      validate: {
        validator: function (value) {
          return value > this.startTime;
        },
        message: 'End time must be after start time',
      },
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Organizer ID is required'],
    },
    maxPlayers: {
      type: Number,
      required: [true, 'Maximum players limit is required'],
      min: [2, 'Minimum 2 players required'],
      max: [1000, 'Maximum 1000 players allowed'],
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    isCollegeRestricted: {
      type: Boolean,
      default: false,
    },
    prizePool: {
      type: Number,
      default: 0,
      min: [0, 'Prize pool cannot be negative'],
    },
    rules: {
      type: String,
      default: '',
      maxlength: [2000, 'Rules cannot exceed 2000 characters'],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

/**
 * Index for faster queries
 */
competitionSchema.index({ organizerId: 1, status: 1 });
competitionSchema.index({ startTime: 1 });

/**
 * Virtual field for participant count
 */
competitionSchema.virtual('participantCount').get(function () {
  return this.participants.length;
});

/**
 * Virtual field for available slots
 */
competitionSchema.virtual('availableSlots').get(function () {
  return this.maxPlayers - this.participants.length;
});

/**
 * Check if competition is full
 */
competitionSchema.methods.isFull = function () {
  return this.participants.length >= this.maxPlayers;
};

/**
 * Check if user is already a participant
 */
competitionSchema.methods.hasParticipant = function (userId) {
  return this.participants.some(
    (participantId) => participantId.toString() === userId.toString()
  );
};

/**
 * Automatically update status based on time
 */
competitionSchema.pre('save', function (next) {
  const now = new Date();
  
  if (this.status === 'upcoming' && this.startTime <= now && this.endTime > now) {
    this.status = 'ongoing';
  } else if (this.status !== 'cancelled' && this.endTime <= now) {
    this.status = 'completed';
  }
  
  next();
});

/**
 * Include virtuals when converting to JSON
 */
competitionSchema.set('toJSON', { virtuals: true });
competitionSchema.set('toObject', { virtuals: true });

const Competition = mongoose.model('Competition', competitionSchema);

export default Competition;
