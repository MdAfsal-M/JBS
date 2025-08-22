const mongoose = require('mongoose');

const loginAnalyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventType: {
    type: String,
    enum: ['login_success', 'login_failed', 'logout', 'password_reset', 'account_locked', 'suspicious_activity'],
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  location: {
    country: String,
    region: String,
    city: String,
    timezone: String
  },
  deviceInfo: {
    browser: String,
    os: String,
    device: String,
    isMobile: Boolean
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  details: {
    reason: String,
    attemptCount: Number,
    lockDuration: Number,
    sessionId: String
  },
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  isSuspicious: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
loginAnalyticsSchema.index({ userId: 1, timestamp: -1 });
loginAnalyticsSchema.index({ eventType: 1, timestamp: -1 });
loginAnalyticsSchema.index({ ipAddress: 1, timestamp: -1 });
loginAnalyticsSchema.index({ 'location.country': 1, timestamp: -1 });
loginAnalyticsSchema.index({ isSuspicious: 1, timestamp: -1 });

// Static method to log login event
loginAnalyticsSchema.statics.logEvent = async function(data) {
  try {
    const analytics = new this(data);
    await analytics.save();
    return analytics;
  } catch (error) {
    console.error('Error logging login event:', error);
    throw error;
  }
};

// Static method to get login statistics
loginAnalyticsSchema.statics.getLoginStats = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const stats = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$eventType',
        count: { $sum: 1 },
        lastEvent: { $max: '$timestamp' }
      }
    }
  ]);

  return stats;
};

// Static method to detect suspicious activity
loginAnalyticsSchema.statics.detectSuspiciousActivity = async function(userId, ipAddress, userAgent) {
  const recentEvents = await this.find({
    userId: new mongoose.Types.ObjectId(userId),
    timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
  }).sort({ timestamp: -1 });

  let riskScore = 0;
  let isSuspicious = false;
  let reasons = [];

  // Check for multiple failed attempts
  const failedAttempts = recentEvents.filter(event => event.eventType === 'login_failed');
  if (failedAttempts.length >= 5) {
    riskScore += 30;
    reasons.push('Multiple failed login attempts');
  }

  // Check for login from new IP
  const knownIPs = [...new Set(recentEvents.map(event => event.ipAddress))];
  if (!knownIPs.includes(ipAddress)) {
    riskScore += 20;
    reasons.push('Login from new IP address');
  }

  // Check for login from new device
  const knownUserAgents = [...new Set(recentEvents.map(event => event.userAgent))];
  if (!knownUserAgents.includes(userAgent)) {
    riskScore += 15;
    reasons.push('Login from new device');
  }

  // Check for rapid login attempts
  const recentLogins = recentEvents.filter(event => 
    event.eventType === 'login_success' && 
    event.timestamp > new Date(Date.now() - 60 * 60 * 1000) // Last hour
  );
  if (recentLogins.length >= 3) {
    riskScore += 25;
    reasons.push('Rapid login attempts');
  }

  // Check for unusual time patterns
  const hour = new Date().getHours();
  const userLoginHours = recentEvents
    .filter(event => event.eventType === 'login_success')
    .map(event => new Date(event.timestamp).getHours());
  
  const averageLoginHour = userLoginHours.length > 0 
    ? userLoginHours.reduce((a, b) => a + b, 0) / userLoginHours.length 
    : 12;
  
  if (Math.abs(hour - averageLoginHour) > 6) {
    riskScore += 10;
    reasons.push('Unusual login time');
  }

  isSuspicious = riskScore >= 50;

  return {
    riskScore,
    isSuspicious,
    reasons
  };
};

// Static method to get geographic login data
loginAnalyticsSchema.statics.getGeographicData = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate },
        'location.country': { $exists: true }
      }
    },
    {
      $group: {
        _id: {
          country: '$location.country',
          city: '$location.city'
        },
        count: { $sum: 1 },
        lastLogin: { $max: '$timestamp' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// Static method to get device statistics
loginAnalyticsSchema.statics.getDeviceStats = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          browser: '$deviceInfo.browser',
          os: '$deviceInfo.os',
          isMobile: '$deviceInfo.isMobile'
        },
        count: { $sum: 1 },
        lastUsed: { $max: '$timestamp' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

module.exports = mongoose.model('LoginAnalytics', loginAnalyticsSchema);
