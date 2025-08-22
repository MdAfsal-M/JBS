const express = require('express');
const { body } = require('express-validator');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const emailService = require('../services/emailService');

const router = express.Router();

// Middleware to check if user is admin (you can implement your own admin check)
const requireAdmin = async (req, res, next) => {
  try {
    // For now, we'll allow any authenticated user to access admin routes
    // In production, you should implement proper admin role checking
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Admin access required',
        code: 'ADMIN_REQUIRED'
      });
    }
    next();
  } catch (error) {
    res.status(500).json({
      message: 'Server error during admin verification',
      code: 'SERVER_ERROR'
    });
  }
};

// Get pending business verifications
router.get('/verifications/pending', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const pendingOwners = await User.find({
      role: 'owner',
      'business.verificationStatus': 'pending'
    })
    .select('profile business email createdAt')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await User.countDocuments({
      role: 'owner',
      'business.verificationStatus': 'pending'
    });

    res.json({
      success: true,
      data: pendingOwners,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get pending verifications error:', error);
    res.status(500).json({
      message: 'Server error while fetching pending verifications',
      code: 'SERVER_ERROR'
    });
  }
});

// Get all business verifications
router.get('/verifications', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status; // pending, verified, rejected
    const skip = (page - 1) * limit;

    const query = { role: 'owner' };
    if (status) {
      query['business.verificationStatus'] = status;
    }

    const owners = await User.find(query)
      .select('profile business email createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: owners,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get verifications error:', error);
    res.status(500).json({
      message: 'Server error while fetching verifications',
      code: 'SERVER_ERROR'
    });
  }
});

// Update business verification status
router.put('/verifications/:userId', authenticateToken, requireAdmin, [
  body('status').isIn(['pending', 'verified', 'rejected'])
    .withMessage('Status must be pending, verified, or rejected'),
  body('notes').optional().isLength({ max: 500 }).trim().escape()
    .withMessage('Notes must be less than 500 characters')
], handleValidationErrors, async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, notes } = req.body;

    const owner = await User.findById(userId);
    if (!owner || owner.role !== 'owner') {
      return res.status(404).json({
        message: 'Owner not found',
        code: 'OWNER_NOT_FOUND'
      });
    }

    // Update verification status
    owner.business.verificationStatus = status;
    if (notes) {
      owner.business.verificationNotes = notes;
    }

    await owner.save();

    // Send email notification
    try {
      await emailService.sendBusinessVerificationEmail(owner, status, notes);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    res.json({
      success: true,
      message: `Business verification status updated to ${status}`,
      data: {
        id: owner._id,
        businessName: owner.business.businessName,
        status: owner.business.verificationStatus,
        notes: owner.business.verificationNotes
      }
    });

  } catch (error) {
    console.error('Update verification error:', error);
    res.status(500).json({
      message: 'Server error while updating verification status',
      code: 'SERVER_ERROR'
    });
  }
});

// Get verification statistics
router.get('/verifications/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $match: { role: 'owner' }
      },
      {
        $group: {
          _id: '$business.verificationStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalOwners = await User.countDocuments({ role: 'owner' });
    
    const statsMap = {
      pending: 0,
      verified: 0,
      rejected: 0
    };

    stats.forEach(stat => {
      statsMap[stat._id || 'pending'] = stat.count;
    });

    res.json({
      success: true,
      stats: {
        total: totalOwners,
        pending: statsMap.pending,
        verified: statsMap.verified,
        rejected: statsMap.rejected
      }
    });

  } catch (error) {
    console.error('Get verification stats error:', error);
    res.status(500).json({
      message: 'Server error while fetching verification statistics',
      code: 'SERVER_ERROR'
    });
  }
});

// Bulk update verification status
router.put('/verifications/bulk', authenticateToken, requireAdmin, [
  body('userIds').isArray({ min: 1 })
    .withMessage('User IDs array is required'),
  body('status').isIn(['pending', 'verified', 'rejected'])
    .withMessage('Status must be pending, verified, or rejected'),
  body('notes').optional().isLength({ max: 500 }).trim().escape()
    .withMessage('Notes must be less than 500 characters')
], handleValidationErrors, async (req, res) => {
  try {
    const { userIds, status, notes } = req.body;

    const updateResult = await User.updateMany(
      {
        _id: { $in: userIds },
        role: 'owner'
      },
      {
        $set: {
          'business.verificationStatus': status,
          ...(notes && { 'business.verificationNotes': notes })
        }
      }
    );

    // Send email notifications
    const owners = await User.find({ _id: { $in: userIds }, role: 'owner' });
    for (const owner of owners) {
      try {
        await emailService.sendBusinessVerificationEmail(owner, status, notes);
      } catch (emailError) {
        console.error(`Failed to send email to ${owner.email}:`, emailError);
      }
    }

    res.json({
      success: true,
      message: `Bulk update completed. ${updateResult.modifiedCount} owners updated.`,
      data: {
        updatedCount: updateResult.modifiedCount,
        status
      }
    });

  } catch (error) {
    console.error('Bulk update verification error:', error);
    res.status(500).json({
      message: 'Server error while performing bulk update',
      code: 'SERVER_ERROR'
    });
  }
});

// Get owner details for verification
router.get('/verifications/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    const owner = await User.findById(userId)
      .select('-password -loginAttempts -lockUntil -resetPasswordToken -resetPasswordExpires');

    if (!owner || owner.role !== 'owner') {
      return res.status(404).json({
        message: 'Owner not found',
        code: 'OWNER_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: owner
    });

  } catch (error) {
    console.error('Get owner details error:', error);
    res.status(500).json({
      message: 'Server error while fetching owner details',
      code: 'SERVER_ERROR'
    });
  }
});

module.exports = router;
