const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const premiumAccess = require('../middleware/premiumAccess');
const ClaudeService = require('../services/claude');
const User = require('../models/User');
const Reading = require('../models/Reading');

const router = express.Router();

// Generate interpretation for a hexagram reading
router.post('/interpret', auth, [
  body('question').trim().isLength({ min: 10, max: 500 }).withMessage('Question must be 10-500 characters'),
  body('hexagram.primary.number').isInt({ min: 1, max: 64 }),
  body('hexagram.changingLines').optional().isArray(),
  body('hexagram.secondary.number').optional().isInt({ min: 1, max: 64 }),
  body('coinResults').isArray({ min: 6, max: 6 })
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

    const { question, hexagram, coinResults, metadata } = req.body;
    const userId = req.user.userId;

    // Check Claude request limits for free users
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check daily Claude request limits for free users
    const today = new Date();
    const lastRequestDate = user.usage.lastClaudeRequestDate;
    const isNewDay = !lastRequestDate || 
      lastRequestDate.toDateString() !== today.toDateString();

    if (isNewDay) {
      user.usage.claudeRequestsToday = 0;
    }

    // Free users limited to 3 Claude interpretations per day
    if (!user.hasPremiumAccess() && user.usage.claudeRequestsToday >= 3) {
      return res.status(429).json({
        success: false,
        message: 'Daily interpretation limit reached. Upgrade to premium for unlimited interpretations.',
        code: 'DAILY_LIMIT_EXCEEDED'
      });
    }

    try {
      // Generate interpretation using Claude
      const interpretation = await ClaudeService.generateInterpretation({
        question,
        hexagram,
        userContext: {
          subscriptionType: user.subscription.type,
          totalReadings: user.usage.totalReadings,
          recentReadings: await Reading.find({ userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('question hexagram createdAt')
        }
      });

      // Update user usage statistics
      user.usage.claudeRequestsToday += 1;
      user.usage.lastClaudeRequestDate = today;
      await user.save();

      res.json({
        success: true,
        interpretation: {
          response: interpretation.response,
          presentSituation: interpretation.presentSituation,
          guidance: interpretation.guidance,
          transformation: interpretation.transformation,
          actionSteps: interpretation.actionSteps,
          generatedAt: new Date()
        },
        usage: {
          requestsToday: user.usage.claudeRequestsToday,
          dailyLimit: user.hasPremiumAccess() ? 'unlimited' : 3
        }
      });

    } catch (claudeError) {
      console.error('Claude API error:', claudeError);
      
      // Provide fallback interpretation
      const fallbackInterpretation = ClaudeService.getFallbackInterpretation(hexagram);
      
      res.json({
        success: true,
        interpretation: fallbackInterpretation,
        fallback: true,
        message: 'AI service temporarily unavailable. Here\'s a traditional interpretation.'
      });
    }

  } catch (error) {
    console.error('Interpretation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during interpretation generation'
    });
  }
});

// Follow-up conversation (Premium feature)
router.post('/follow-up', auth, premiumAccess, [
  body('readingId').isMongoId(),
  body('question').trim().isLength({ min: 5, max: 300 }).withMessage('Follow-up question must be 5-300 characters')
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

    const { readingId, question } = req.body;
    const userId = req.user.userId;

    // Find the original reading
    const reading = await Reading.findOne({ _id: readingId, userId });
    if (!reading) {
      return res.status(404).json({
        success: false,
        message: 'Reading not found'
      });
    }

    try {
      // Generate follow-up response using Claude
      const followUpResponse = await ClaudeService.generateFollowUp({
        originalQuestion: reading.question,
        originalInterpretation: reading.interpretation.claudeResponse,
        followUpQuestion: question,
        hexagram: reading.hexagram,
        conversationHistory: reading.followUpConversation
      });

      // Add to conversation history
      reading.followUpConversation.push({
        question,
        response: followUpResponse,
        timestamp: new Date()
      });

      await reading.save();

      res.json({
        success: true,
        response: followUpResponse,
        conversationLength: reading.followUpConversation.length
      });

    } catch (claudeError) {
      console.error('Claude follow-up error:', claudeError);
      res.status(503).json({
        success: false,
        message: 'AI service temporarily unavailable for follow-up conversations'
      });
    }

  } catch (error) {
    console.error('Follow-up error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during follow-up generation'
    });
  }
});

// Get Claude service status and limits
router.get('/status', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if it's a new day
    const today = new Date();
    const lastRequestDate = user.usage.lastClaudeRequestDate;
    const isNewDay = !lastRequestDate || 
      lastRequestDate.toDateString() !== today.toDateString();

    const requestsToday = isNewDay ? 0 : user.usage.claudeRequestsToday;
    const isPremium = user.hasPremiumAccess();

    res.json({
      success: true,
      status: {
        available: true,
        requestsToday,
        dailyLimit: isPremium ? 'unlimited' : 3,
        hasUnlimitedAccess: isPremium,
        canMakeRequest: isPremium || requestsToday < 3,
        nextResetTime: isNewDay ? null : new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

  } catch (error) {
    console.error('Claude status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error checking Claude service status'
    });
  }
});

// Get interpretation templates (for offline fallback)
router.get('/templates', async (req, res) => {
  try {
    const templates = ClaudeService.getInterpretationTemplates();
    
    res.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving templates'
    });
  }
});

// Validate question quality (Premium feature)
router.post('/validate-question', auth, premiumAccess, [
  body('question').trim().isLength({ min: 1, max: 500 })
], async (req, res) => {
  try {
    const { question } = req.body;

    const validation = await ClaudeService.validateQuestion(question);

    res.json({
      success: true,
      validation: {
        score: validation.score,
        suggestions: validation.suggestions,
        improvedQuestion: validation.improvedQuestion,
        clarity: validation.clarity,
        specificity: validation.specificity,
        actionability: validation.actionability
      }
    });

  } catch (error) {
    console.error('Question validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during question validation'
    });
  }
});

module.exports = router;