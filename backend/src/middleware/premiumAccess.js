const User = require('../models/User');

const premiumAccess = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Get user with subscription details
    const user = await User.findById(userId).select('subscription');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check if user has premium access
    if (!user.hasPremiumAccess()) {
      return res.status(403).json({
        success: false,
        message: 'Premium subscription required to access this feature',
        code: 'PREMIUM_REQUIRED',
        subscription: {
          current: user.subscription.type,
          status: user.subscription.status,
          upgradeUrl: `${process.env.FRONTEND_URL}/settings/subscription`
        }
      });
    }

    // Add subscription info to request for use in route handlers
    req.subscription = user.subscription;
    next();

  } catch (error) {
    console.error('Premium access middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error checking premium access',
      code: 'PREMIUM_CHECK_ERROR'
    });
  }
};

module.exports = premiumAccess;