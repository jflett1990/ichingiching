const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profile: {
    firstName: {
      type: String,
      trim: true
    },
    lastName: {
      type: String,
      trim: true
    },
    birthDate: Date,
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  subscription: {
    type: {
      type: String,
      enum: ['free', 'premium', 'unlimited'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'canceled', 'expired'],
      default: 'active'
    },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    startDate: Date,
    endDate: Date,
    features: {
      guidedMeditation: { type: Boolean, default: false },
      premiumThemes: { type: Boolean, default: false },
      unlimitedReadings: { type: Boolean, default: false },
      conversationalAI: { type: Boolean, default: false },
      patternAnalysis: { type: Boolean, default: false },
      exportHistory: { type: Boolean, default: false }
    }
  },
  preferences: {
    theme: {
      type: String,
      default: 'liquid-glass'
    },
    audioEnabled: {
      type: Boolean,
      default: true
    },
    audioVolume: {
      type: Number,
      default: 0.7,
      min: 0,
      max: 1
    },
    notifications: {
      email: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false }
    },
    privacy: {
      shareReadings: { type: Boolean, default: false },
      analyticsOptOut: { type: Boolean, default: false }
    }
  },
  usage: {
    totalReadings: { type: Number, default: 0 },
    readingsThisMonth: { type: Number, default: 0 },
    lastReadingDate: Date,
    claudeRequestsToday: { type: Number, default: 0 },
    lastClaudeRequestDate: Date
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date
}, {
  timestamps: true
});

// Index for performance
userSchema.index({ email: 1 });
userSchema.index({ 'subscription.stripeCustomerId': 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Check if user has premium features
userSchema.methods.hasPremiumAccess = function() {
  return this.subscription.type !== 'free' && 
         this.subscription.status === 'active' &&
         (!this.subscription.endDate || this.subscription.endDate > new Date());
};

// Update usage statistics
userSchema.methods.incrementReadingCount = function() {
  this.usage.totalReadings += 1;
  this.usage.readingsThisMonth += 1;
  this.usage.lastReadingDate = new Date();
};

// Reset monthly usage (called by scheduled job)
userSchema.methods.resetMonthlyUsage = function() {
  this.usage.readingsThisMonth = 0;
  this.usage.claudeRequestsToday = 0;
};

module.exports = mongoose.model('User', userSchema);