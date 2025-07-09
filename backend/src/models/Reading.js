const mongoose = require('mongoose');

const readingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  question: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  hexagram: {
    primary: {
      number: { type: Number, required: true, min: 1, max: 64 },
      name: { type: String, required: true },
      chinese: { type: String, required: true },
      unicode: { type: String, required: true },
      lines: [{ type: Number, required: true }], // Array of 6 lines (0 or 1)
      trigrams: [{ type: String, required: true }] // Upper and lower trigrams
    },
    secondary: {
      number: { type: Number, min: 1, max: 64 },
      name: String,
      chinese: String,
      unicode: String,
      lines: [Number],
      trigrams: [String]
    },
    changingLines: [{ type: Number, min: 1, max: 6 }] // Array of changing line positions
  },
  coinResults: {
    type: [[Number]], // Array of 6 arrays, each containing 3 coin results
    required: true
  },
  interpretation: {
    claudeResponse: {
      type: String,
      required: true
    },
    presentSituation: String,
    guidance: String,
    transformation: String,
    actionSteps: String,
    generatedAt: {
      type: Date,
      default: Date.now
    }
  },
  followUpConversation: [{
    question: { type: String, required: true },
    response: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  metadata: {
    sessionId: String,
    userAgent: String,
    ipAddress: String,
    theme: String,
    audioEnabled: Boolean,
    duration: Number, // Time spent on reading in seconds
    completedSteps: [String] // Track which steps user completed
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  favorite: {
    type: Boolean,
    default: false
  },
  shared: {
    type: Boolean,
    default: false
  },
  shareId: {
    type: String,
    unique: true,
    sparse: true // Only unique if not null
  },
  notes: {
    type: String,
    maxlength: 1000
  }
}, {
  timestamps: true
});

// Indexes for performance
readingSchema.index({ userId: 1, createdAt: -1 });
readingSchema.index({ userId: 1, favorite: 1 });
readingSchema.index({ userId: 1, tags: 1 });
readingSchema.index({ 'hexagram.primary.number': 1 });
readingSchema.index({ shareId: 1 });
readingSchema.index({ createdAt: -1 });

// Text index for search functionality
readingSchema.index({
  question: 'text',
  'interpretation.claudeResponse': 'text',
  notes: 'text',
  tags: 'text'
});

// Virtual for reading summary
readingSchema.virtual('summary').get(function() {
  return {
    id: this._id,
    question: this.question.length > 100 ? 
      this.question.substring(0, 100) + '...' : this.question,
    hexagram: this.hexagram.primary,
    changingLines: this.hexagram.changingLines,
    hasSecondary: !!this.hexagram.secondary,
    favorite: this.favorite,
    tags: this.tags,
    createdAt: this.createdAt
  };
});

// Method to generate shareable link
readingSchema.methods.generateShareId = function() {
  if (!this.shareId) {
    this.shareId = require('crypto').randomBytes(16).toString('hex');
  }
  return this.shareId;
};

// Method to check if reading can be viewed by user
readingSchema.methods.canViewReading = function(userId) {
  return this.userId.toString() === userId.toString() || 
         (this.shared && this.shareId);
};

// Static method to find readings with pattern analysis
readingSchema.statics.findPatterns = async function(userId, days = 90) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const pipeline = [
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$hexagram.primary.number',
        count: { $sum: 1 },
        hexagramInfo: { $first: '$hexagram.primary' },
        lastReading: { $max: '$createdAt' },
        questions: { $push: '$question' }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 10
    }
  ];
  
  return this.aggregate(pipeline);
};

// Static method for reading statistics
readingSchema.statics.getReadingStats = async function(userId) {
  const pipeline = [
    {
      $match: { userId: mongoose.Types.ObjectId(userId) }
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        favorites: {
          $sum: { $cond: ['$favorite', 1, 0] }
        },
        withChangingLines: {
          $sum: { 
            $cond: [{ $gt: [{ $size: '$hexagram.changingLines' }, 0] }, 1, 0] 
          }
        },
        uniqueHexagrams: { $addToSet: '$hexagram.primary.number' }
      }
    },
    {
      $project: {
        _id: 0,
        total: 1,
        favorites: 1,
        withChangingLines: 1,
        uniqueHexagrams: { $size: '$uniqueHexagrams' }
      }
    }
  ];
  
  const result = await this.aggregate(pipeline);
  return result[0] || { total: 0, favorites: 0, withChangingLines: 0, uniqueHexagrams: 0 };
};

module.exports = mongoose.model('Reading', readingSchema);