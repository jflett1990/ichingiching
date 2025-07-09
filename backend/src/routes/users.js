const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Reading = require('../models/Reading');

const router = express.Router();

// Update user profile
router.patch('/profile', auth, [
  body('firstName').optional().trim().isLength({ max: 50 }),
  body('lastName').optional().trim().isLength({ max: 50 }),
  body('birthDate').optional().isISO8601(),
  body('timezone').optional().isString()
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
    const updates = {};
    
    if (req.body.firstName !== undefined) {
      updates['profile.firstName'] = req.body.firstName;
    }
    if (req.body.lastName !== undefined) {
      updates['profile.lastName'] = req.body.lastName;
    }
    if (req.body.birthDate !== undefined) {
      updates['profile.birthDate'] = new Date(req.body.birthDate);
    }
    if (req.body.timezone !== undefined) {
      updates['profile.timezone'] = req.body.timezone;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, select: 'profile' }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: user.profile
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
});

// Update user preferences
router.patch('/preferences', auth, [
  body('theme').optional().isIn(['liquid-glass', 'art-nouveau', 'cyberpunk', 'pop-art', 'traditional-zen']),
  body('audioEnabled').optional().isBoolean(),
  body('audioVolume').optional().isFloat({ min: 0, max: 1 }),
  body('notifications.email').optional().isBoolean(),
  body('notifications.marketing').optional().isBoolean(),
  body('privacy.shareReadings').optional().isBoolean(),
  body('privacy.analyticsOptOut').optional().isBoolean()
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
    const updates = {};

    if (req.body.theme !== undefined) {
      updates['preferences.theme'] = req.body.theme;
    }
    if (req.body.audioEnabled !== undefined) {
      updates['preferences.audioEnabled'] = req.body.audioEnabled;
    }
    if (req.body.audioVolume !== undefined) {
      updates['preferences.audioVolume'] = req.body.audioVolume;
    }
    if (req.body.notifications?.email !== undefined) {
      updates['preferences.notifications.email'] = req.body.notifications.email;
    }
    if (req.body.notifications?.marketing !== undefined) {
      updates['preferences.notifications.marketing'] = req.body.notifications.marketing;
    }
    if (req.body.privacy?.shareReadings !== undefined) {
      updates['preferences.privacy.shareReadings'] = req.body.privacy.shareReadings;
    }
    if (req.body.privacy?.analyticsOptOut !== undefined) {
      updates['preferences.privacy.analyticsOptOut'] = req.body.privacy.analyticsOptOut;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, select: 'preferences' }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating preferences'
    });
  }
});

// Change password
router.patch('/password', auth, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
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
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error changing password'
    });
  }
});

// Get user dashboard data
router.get('/dashboard', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user data
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get reading statistics
    const stats = await Reading.getReadingStats(userId);

    // Get recent readings
    const recentReadings = await Reading.find({ userId })
      .select('question hexagram.primary createdAt favorite')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Get favorite readings count
    const favoriteCount = await Reading.countDocuments({ userId, favorite: true });

    // Calculate usage for free users
    const today = new Date();
    const claudeRequestsToday = user.usage.lastClaudeRequestDate?.toDateString() === today.toDateString() 
      ? user.usage.claudeRequestsToday : 0;

    res.json({
      success: true,
      dashboard: {
        user: {
          id: user._id,
          email: user.email,
          profile: user.profile,
          subscription: user.subscription,
          preferences: user.preferences,
          emailVerified: user.emailVerified,
          memberSince: user.createdAt
        },
        usage: {
          totalReadings: stats.total,
          readingsThisMonth: user.usage.readingsThisMonth,
          claudeRequestsToday,
          favoriteReadings: favoriteCount,
          uniqueHexagrams: stats.uniqueHexagrams,
          lastReadingDate: user.usage.lastReadingDate
        },
        limits: {
          claudeDailyLimit: user.hasPremiumAccess() ? 'unlimited' : 3,
          claudeRemaining: user.hasPremiumAccess() ? 'unlimited' : Math.max(0, 3 - claudeRequestsToday)
        },
        recentReadings: recentReadings.map(reading => ({
          id: reading._id,
          question: reading.question.length > 60 ? 
            reading.question.substring(0, 60) + '...' : reading.question,
          hexagram: reading.hexagram.primary,
          favorite: reading.favorite,
          createdAt: reading.createdAt
        }))
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error loading dashboard'
    });
  }
});

// Delete user account
router.delete('/account', auth, [
  body('password').notEmpty().withMessage('Password confirmation is required'),
  body('confirmEmail').isEmail().normalizeEmail().withMessage('Email confirmation is required')
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
    const { password, confirmEmail } = req.body;

    // Get user with password
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify email matches
    if (user.email !== confirmEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email confirmation does not match account email'
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Password is incorrect'
      });
    }

    // Delete all user readings
    await Reading.deleteMany({ userId });

    // Delete user account
    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting account'
    });
  }
});

// Export user data (GDPR compliance)
router.get('/export', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user data
    const user = await User.findById(userId).select('-password').lean();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get all readings
    const readings = await Reading.find({ userId }).select('-userId').lean();

    const exportData = {
      exportDate: new Date(),
      user: {
        id: user._id,
        email: user.email,
        profile: user.profile,
        preferences: user.preferences,
        usage: user.usage,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      readings: readings,
      summary: {
        totalReadings: readings.length,
        favoriteReadings: readings.filter(r => r.favorite).length,
        uniqueHexagrams: [...new Set(readings.map(r => r.hexagram.primary.number))].length
      }
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=wisdom-oracle-user-data.json');
    res.json(exportData);

  } catch (error) {
    console.error('Export user data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error exporting user data'
    });
  }
});

// Update email address
router.patch('/email', auth, [
  body('newEmail').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password confirmation is required')
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
    const { newEmail, password } = req.body;

    // Get user with password
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Password is incorrect'
      });
    }

    // Check if new email already exists
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // Update email and require re-verification
    user.email = newEmail;
    user.emailVerified = false;
    user.emailVerificationToken = require('crypto').randomBytes(32).toString('hex');
    await user.save();

    // TODO: Send verification email to new address

    res.json({
      success: true,
      message: 'Email updated successfully. Please check your new email for verification.',
      emailVerified: false
    });

  } catch (error) {
    console.error('Update email error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating email'
    });
  }
});

module.exports = router;