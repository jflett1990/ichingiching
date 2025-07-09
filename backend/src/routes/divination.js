const express = require('express');
const { body, validationResult, query } = require('express-validator');
const auth = require('../middleware/auth');
const premiumAccess = require('../middleware/premiumAccess');
const Reading = require('../models/Reading');
const User = require('../models/User');
const HexagramData = require('../data/hexagrams');

const router = express.Router();

// Save a complete reading
router.post('/readings', auth, [
  body('question').trim().isLength({ min: 10, max: 500 }),
  body('hexagram.primary.number').isInt({ min: 1, max: 64 }),
  body('hexagram.changingLines').optional().isArray(),
  body('coinResults').isArray({ min: 6, max: 6 }),
  body('interpretation.claudeResponse').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.userId;
    const { question, hexagram, coinResults, interpretation, metadata, tags } = req.body;

    // Get hexagram data for storage
    const primaryHexagramData = HexagramData.getHexagram(hexagram.primary.number);
    const secondaryHexagramData = hexagram.secondary ? 
      HexagramData.getHexagram(hexagram.secondary.number) : null;

    // Create reading
    const reading = new Reading({
      userId,
      question,
      hexagram: {
        primary: {
          number: hexagram.primary.number,
          name: primaryHexagramData.name,
          chinese: primaryHexagramData.chinese,
          unicode: primaryHexagramData.unicode,
          lines: hexagram.primary.lines,
          trigrams: primaryHexagramData.trigrams
        },
        secondary: secondaryHexagramData ? {
          number: hexagram.secondary.number,
          name: secondaryHexagramData.name,
          chinese: secondaryHexagramData.chinese,
          unicode: secondaryHexagramData.unicode,
          lines: hexagram.secondary.lines,
          trigrams: secondaryHexagramData.trigrams
        } : undefined,
        changingLines: hexagram.changingLines || []
      },
      coinResults,
      interpretation: {
        claudeResponse: interpretation.claudeResponse,
        presentSituation: interpretation.presentSituation,
        guidance: interpretation.guidance,
        transformation: interpretation.transformation,
        actionSteps: interpretation.actionSteps,
        generatedAt: new Date()
      },
      metadata: {
        sessionId: metadata?.sessionId,
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        theme: metadata?.theme,
        audioEnabled: metadata?.audioEnabled,
        duration: metadata?.duration,
        completedSteps: metadata?.completedSteps || []
      },
      tags: tags || []
    });

    await reading.save();

    // Update user reading count
    const user = await User.findById(userId);
    user.incrementReadingCount();
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Reading saved successfully',
      reading: {
        id: reading._id,
        question: reading.question,
        hexagram: reading.hexagram,
        interpretation: reading.interpretation,
        createdAt: reading.createdAt
      }
    });

  } catch (error) {
    console.error('Save reading error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error saving reading'
    });
  }
});

// Get user's reading history with pagination and filtering
router.get('/readings', auth, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('search').optional().trim(),
  query('tags').optional(),
  query('favorite').optional().isBoolean(),
  query('hexagram').optional().isInt({ min: 1, max: 64 }),
  query('dateFrom').optional().isISO8601(),
  query('dateTo').optional().isISO8601()
], async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter query
    let filter = { userId };

    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    if (req.query.tags) {
      const tags = req.query.tags.split(',').map(tag => tag.trim().toLowerCase());
      filter.tags = { $in: tags };
    }

    if (req.query.favorite !== undefined) {
      filter.favorite = req.query.favorite === 'true';
    }

    if (req.query.hexagram) {
      filter['hexagram.primary.number'] = parseInt(req.query.hexagram);
    }

    if (req.query.dateFrom || req.query.dateTo) {
      filter.createdAt = {};
      if (req.query.dateFrom) {
        filter.createdAt.$gte = new Date(req.query.dateFrom);
      }
      if (req.query.dateTo) {
        filter.createdAt.$lte = new Date(req.query.dateTo);
      }
    }

    // Execute query
    const [readings, total] = await Promise.all([
      Reading.find(filter)
        .select('question hexagram interpretation.presentSituation tags favorite createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Reading.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        readings: readings.map(reading => ({
          id: reading._id,
          question: reading.question.length > 100 ? 
            reading.question.substring(0, 100) + '...' : reading.question,
          hexagram: reading.hexagram.primary,
          changingLines: reading.hexagram.changingLines,
          hasSecondary: !!reading.hexagram.secondary,
          summary: reading.interpretation.presentSituation?.substring(0, 150) + '...',
          tags: reading.tags,
          favorite: reading.favorite,
          createdAt: reading.createdAt
        })),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get readings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving readings'
    });
  }
});

// Get a specific reading by ID
router.get('/readings/:id', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const readingId = req.params.id;

    const reading = await Reading.findOne({ _id: readingId, userId });
    if (!reading) {
      return res.status(404).json({
        success: false,
        message: 'Reading not found'
      });
    }

    res.json({
      success: true,
      reading: reading
    });

  } catch (error) {
    console.error('Get reading error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving reading'
    });
  }
});

// Update reading (toggle favorite, add tags, add notes)
router.patch('/readings/:id', auth, [
  body('favorite').optional().isBoolean(),
  body('tags').optional().isArray(),
  body('notes').optional().isLength({ max: 1000 })
], async (req, res) => {
  try {
    const userId = req.user.userId;
    const readingId = req.params.id;
    const updates = {};

    if (req.body.favorite !== undefined) {
      updates.favorite = req.body.favorite;
    }

    if (req.body.tags) {
      updates.tags = req.body.tags.map(tag => tag.trim().toLowerCase());
    }

    if (req.body.notes !== undefined) {
      updates.notes = req.body.notes;
    }

    const reading = await Reading.findOneAndUpdate(
      { _id: readingId, userId },
      updates,
      { new: true, select: 'favorite tags notes' }
    );

    if (!reading) {
      return res.status(404).json({
        success: false,
        message: 'Reading not found'
      });
    }

    res.json({
      success: true,
      message: 'Reading updated successfully',
      reading: {
        id: reading._id,
        favorite: reading.favorite,
        tags: reading.tags,
        notes: reading.notes
      }
    });

  } catch (error) {
    console.error('Update reading error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating reading'
    });
  }
});

// Delete a reading
router.delete('/readings/:id', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const readingId = req.params.id;

    const reading = await Reading.findOneAndDelete({ _id: readingId, userId });
    if (!reading) {
      return res.status(404).json({
        success: false,
        message: 'Reading not found'
      });
    }

    res.json({
      success: true,
      message: 'Reading deleted successfully'
    });

  } catch (error) {
    console.error('Delete reading error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting reading'
    });
  }
});

// Get reading statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const stats = await Reading.getReadingStats(userId);

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivity = await Reading.countDocuments({
      userId,
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      success: true,
      stats: {
        ...stats,
        recentActivity: recentActivity
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving statistics'
    });
  }
});

// Get pattern analysis (Premium feature)
router.get('/patterns', auth, premiumAccess, [
  query('days').optional().isInt({ min: 7, max: 365 })
], async (req, res) => {
  try {
    const userId = req.user.userId;
    const days = parseInt(req.query.days) || 90;

    const patterns = await Reading.findPatterns(userId, days);

    // Get monthly reading trends
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const monthlyTrends = await Reading.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          favoriteCount: {
            $sum: { $cond: ['$favorite', 1, 0] }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Get most common tags
    const tagFrequency = await Reading.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          createdAt: { $gte: startDate }
        }
      },
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      patterns: {
        frequentHexagrams: patterns,
        monthlyTrends: monthlyTrends,
        topTags: tagFrequency,
        analysisDate: new Date(),
        daysCovered: days
      }
    });

  } catch (error) {
    console.error('Pattern analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating pattern analysis'
    });
  }
});

// Share reading (create shareable link)
router.post('/readings/:id/share', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const readingId = req.params.id;

    const reading = await Reading.findOne({ _id: readingId, userId });
    if (!reading) {
      return res.status(404).json({
        success: false,
        message: 'Reading not found'
      });
    }

    // Generate share ID and mark as shared
    const shareId = reading.generateShareId();
    reading.shared = true;
    await reading.save();

    res.json({
      success: true,
      shareUrl: `${process.env.FRONTEND_URL}/shared/${shareId}`,
      shareId: shareId
    });

  } catch (error) {
    console.error('Share reading error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sharing reading'
    });
  }
});

// Get shared reading (public endpoint)
router.get('/shared/:shareId', async (req, res) => {
  try {
    const shareId = req.params.shareId;

    const reading = await Reading.findOne({ shareId, shared: true })
      .select('question hexagram interpretation createdAt -userId')
      .lean();

    if (!reading) {
      return res.status(404).json({
        success: false,
        message: 'Shared reading not found'
      });
    }

    res.json({
      success: true,
      reading: {
        question: reading.question,
        hexagram: reading.hexagram,
        interpretation: {
          presentSituation: reading.interpretation.presentSituation,
          guidance: reading.interpretation.guidance,
          transformation: reading.interpretation.transformation,
          actionSteps: reading.interpretation.actionSteps
        },
        createdAt: reading.createdAt,
        isShared: true
      }
    });

  } catch (error) {
    console.error('Get shared reading error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving shared reading'
    });
  }
});

// Export readings (Premium feature)
router.get('/export', auth, premiumAccess, [
  query('format').optional().isIn(['json', 'csv']),
  query('dateFrom').optional().isISO8601(),
  query('dateTo').optional().isISO8601()
], async (req, res) => {
  try {
    const userId = req.user.userId;
    const format = req.query.format || 'json';

    let filter = { userId };
    if (req.query.dateFrom || req.query.dateTo) {
      filter.createdAt = {};
      if (req.query.dateFrom) {
        filter.createdAt.$gte = new Date(req.query.dateFrom);
      }
      if (req.query.dateTo) {
        filter.createdAt.$lte = new Date(req.query.dateTo);
      }
    }

    const readings = await Reading.find(filter)
      .select('-userId -__v')
      .sort({ createdAt: -1 })
      .lean();

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = readings.map(reading => ({
        date: reading.createdAt.toISOString(),
        question: reading.question,
        hexagram: reading.hexagram.primary.name,
        hexagramNumber: reading.hexagram.primary.number,
        changingLines: reading.hexagram.changingLines.join(','),
        presentSituation: reading.interpretation.presentSituation,
        guidance: reading.interpretation.guidance,
        tags: reading.tags.join(','),
        favorite: reading.favorite
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=wisdom-oracle-readings.csv');
      
      // Simple CSV conversion (in production, use a proper CSV library)
      const csv = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
      ].join('\n');

      res.send(csv);
    } else {
      // JSON format
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=wisdom-oracle-readings.json');
      res.json({
        exportDate: new Date(),
        totalReadings: readings.length,
        readings: readings
      });
    }

  } catch (error) {
    console.error('Export readings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error exporting readings'
    });
  }
});

module.exports = router;