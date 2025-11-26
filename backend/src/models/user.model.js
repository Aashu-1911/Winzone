import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Schema for WinZone
 * Supports three roles: organizer, player, admin
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: ['player', 'organizer', 'admin'],
      default: 'player',
      required: true,
    },
    collegeName: {
      type: String,
      trim: true,
      default: '',
    },
    profileImage: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    gamingHandle: {
      type: String,
      trim: true,
      default: '',
    },
    // Email verification + admin approval flags
    emailVerified: {
      type: Boolean,
      default: false,
    },
    isApprovedByAdmin: {
      type: Boolean,
      default: false,
    },
    isEligible: {
      type: Boolean,
      default: false,
    },
    paymentCompleted: {
      type: Boolean,
      default: false,
    },
    walletBalance: {
      type: Number,
      default: 0,
      min: [0, 'Wallet balance cannot be negative'],
    },
    // Wallet system (Phase 7)
    wallet: {
      balance: {
        type: Number,
        default: 0,
        min: [0, 'Wallet balance cannot be negative'],
      },
      currency: {
        type: String,
        default: 'INR',
        enum: ['INR', 'USD'],
      },
      transactions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
      }],
    },
    // Analytics fields for player performance tracking
    stats: {
      matchesPlayed: {
        type: Number,
        default: 0,
      },
      wins: {
        type: Number,
        default: 0,
      },
      losses: {
        type: Number,
        default: 0,
      },
      totalScore: {
        type: Number,
        default: 0,
      },
      highestScore: {
        type: Number,
        default: 0,
      },
      averageScore: {
        type: Number,
        default: 0,
      },
      totalEarnings: {
        type: Number,
        default: 0,
      },
      winRate: {
        type: Number,
        default: 0,
      },
    },
    // Secure join fields (assigned after successful payment)
    gameName: {
      type: String,
      default: '',
    },
    entryCode: {
      type: String,
      default: '',
      index: true,
    },
    // Email verification token
    emailVerificationToken: {
      type: String,
    },
    emailVerificationTokenExpires: {
      type: Date,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

/**
 * Hash password before saving to database
 * Uses bcrypt with salt rounds of 10
 */
userSchema.pre('save', async function (next) {
  // Only hash password if it's modified or new
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Compare entered password with hashed password in database
 * @param {string} enteredPassword - Plain text password from user
 * @returns {Promise<boolean>} - True if passwords match
 */
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Update player stats after match completion
 * @param {number} score - Score achieved in the match
 * @param {boolean} isWinner - Whether the player won the match
 */
userSchema.methods.updateMatchStats = function (score, isWinner = false) {
  this.stats.matchesPlayed += 1;
  this.stats.totalScore += score;
  
  if (isWinner) {
    this.stats.wins += 1;
  } else {
    this.stats.losses += 1;
  }
  
  // Update highest score
  if (score > this.stats.highestScore) {
    this.stats.highestScore = score;
  }
  
  // Calculate average score
  this.stats.averageScore = Math.round(this.stats.totalScore / this.stats.matchesPlayed);
  
  // Calculate win rate (percentage)
  this.stats.winRate = Math.round((this.stats.wins / this.stats.matchesPlayed) * 100);
  
  return this.save();
};

/**
 * Remove password from JSON response
 */
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model('User', userSchema);

export default User;
