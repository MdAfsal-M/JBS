const express = require('express');
const Application = require('../models/Application');
const Opportunity = require('../models/Opportunity');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { authenticateToken, requireOwner } = require('../middleware/auth');

const router = express.Router();

// GET /api/owner/applications - Get all applications for owner's opportunities
router.get('/applications', authenticateToken, requireOwner, async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { page = 1, limit = 10, status, opportunityType } = req.query;

    // Find all opportunities owned by this owner
    const opportunitiesQuery = { owner: ownerId };
    if (opportunityType) {
      opportunitiesQuery.opportunityType = opportunityType;
    }

    const opportunities = await Opportunity.find(opportunitiesQuery).select('_id');
    const opportunityIds = opportunities.map(opp => opp._id);

    // Find applications for these opportunities
    const query = { opportunityId: { $in: opportunityIds } };
    if (status) {
      query.status = status;
    }

    const applications = await Application.find(query)
      .populate('opportunityId', 'title companyName location opportunityType description')
      .populate('studentId', 'profile.firstName profile.lastName email profile.phone')
      .sort({ submittedDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Application.countDocuments(query);

    res.json({
      success: true,
      data: applications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
});

// GET /api/owner/applications/:id - Get specific application details
router.get('/applications/:id', authenticateToken, requireOwner, async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;

    // Find the application and verify ownership
    const application = await Application.findById(id)
      .populate('opportunityId', 'title companyName location opportunityType description owner')
      .populate('studentId', 'profile.firstName profile.lastName email profile.phone profile.bio profile.skills profile.education');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Verify that the opportunity belongs to this owner
    if (application.opportunityId.owner.toString() !== ownerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This application does not belong to your opportunities.'
      });
    }

    res.json({
      success: true,
      data: application
    });

  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application',
      error: error.message
    });
  }
});

// PUT /api/owner/applications/:id/status - Update application status
router.put('/applications/:id/status', authenticateToken, requireOwner, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const ownerId = req.user.id;

    // Validate status
    const validStatuses = ['Pending', 'Reviewed', 'Accepted', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    // Find the application and verify ownership
    const application = await Application.findById(id)
      .populate('opportunityId', 'title companyName owner')
      .populate('studentId', 'email profile.firstName profile.lastName');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Verify that the opportunity belongs to this owner
    if (application.opportunityId.owner.toString() !== ownerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This application does not belong to your opportunities.'
      });
    }

    // Update application status
    application.status = status;
    if (notes) {
      application.ownerNotes = notes;
    }
    
    const updatedApplication = await application.save();

    // Create notification for the student
    const notificationData = {
      recipient: application.studentId._id,
      type: 'application',
      title: `Application Status Updated`,
      message: `Your application for ${application.opportunityId.title} at ${application.opportunityId.companyName} has been ${status.toLowerCase()}.`,
      data: {
        applicationId: application._id.toString(),
        jobId: application.opportunityId._id.toString(),
        status: status
      },
      priority: status === 'Accepted' ? 'high' : 'medium'
    };

    await Notification.createNotification(notificationData);

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: updatedApplication
    });

  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application status',
      error: error.message
    });
  }
});

// GET /api/owner/applications/stats - Get application statistics
router.get('/applications/stats', authenticateToken, requireOwner, async (req, res) => {
  try {
    const ownerId = req.user.id;

    // Find all opportunities owned by this owner
    const opportunities = await Opportunity.find({ owner: ownerId }).select('_id');
    const opportunityIds = opportunities.map(opp => opp._id);

    // Get application counts by status
    const stats = await Application.aggregate([
      { $match: { opportunityId: { $in: opportunityIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get total applications
    const totalApplications = await Application.countDocuments({
      opportunityId: { $in: opportunityIds }
    });

    // Get recent applications (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentApplications = await Application.countDocuments({
      opportunityId: { $in: opportunityIds },
      submittedDate: { $gte: sevenDaysAgo }
    });

    // Format stats
    const statusStats = {};
    stats.forEach(stat => {
      statusStats[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: {
        totalApplications,
        recentApplications,
        byStatus: {
          pending: statusStats['Pending'] || 0,
          reviewed: statusStats['Reviewed'] || 0,
          accepted: statusStats['Accepted'] || 0,
          rejected: statusStats['Rejected'] || 0
        }
      }
    });

  } catch (error) {
    console.error('Error fetching application stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application statistics',
      error: error.message
    });
  }
});

module.exports = router;
