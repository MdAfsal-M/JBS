const express = require('express');
const { body, validationResult } = require('express-validator');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const { authenticateToken, requireOwner } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Get all opportunities for owner
router.get('/', authenticateToken, requireOwner, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      opportunityType,
      status, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;
    let query = { owner: req.user.id, isActive: true };

    // Apply filters
    if (opportunityType) query.opportunityType = opportunityType;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const opportunities = await Opportunity.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Opportunity.countDocuments(query);

    res.json({
      opportunities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get opportunities error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single opportunity
router.get('/:id', authenticateToken, requireOwner, async (req, res) => {
  try {
    const opportunity = await Opportunity.findOne({ 
      _id: req.params.id, 
      owner: req.user.id 
    });
    
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    res.json(opportunity);
  } catch (error) {
    console.error('Get opportunity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new opportunity
router.post('/', authenticateToken, requireOwner, [
  body('opportunityType').isIn(['job', 'internship']).withMessage('Opportunity type must be job or internship'),
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title is required and must be less than 100 characters'),
  body('company').trim().isLength({ min: 1 }).withMessage('Company name is required'),
  body('location').trim().isLength({ min: 1 }).withMessage('Location is required'),
  body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
  body('applicationDeadline').isISO8601().toDate().withMessage('Valid application deadline is required'),
  body('jobType').optional().isIn(['full-time', 'part-time', 'contract', 'freelance']),
  body('pay').optional().trim(),
  body('payType').optional().isIn(['hourly', 'daily', 'weekly', 'monthly', 'yearly', 'project-based']),
  body('experience').optional().trim(),
  body('duration').optional().trim(),
  body('stipend').optional().trim(),
  body('stipendType').optional().isIn(['paid', 'unpaid', 'performance-based']),
  body('startDate').optional().isISO8601().toDate(),
  body('endDate').optional().isISO8601().toDate(),
  body('requirements').optional().isArray(),
  body('benefits').optional().isArray(),
  body('isRemote').optional().isBoolean(),
  body('isUrgent').optional().isBoolean(),
  body('maxApplicants').optional().isInt({ min: 1 }),
  body('tags').optional().isArray(),
  body('contactInfo.email').optional().isEmail(),
  body('contactInfo.phone').optional().trim(),
  body('contactInfo.website').optional().isURL(),
  body('applicationInstructions').optional().trim()
], handleValidationErrors, async (req, res) => {
  try {
    const opportunityData = {
      ...req.body,
      owner: req.user.id
    };

    const opportunity = new Opportunity(opportunityData);
    await opportunity.save();

    res.status(201).json({
      success: true,
      message: `${opportunity.opportunityType === 'job' ? 'Job' : 'Internship'} created successfully`,
      opportunity
    });
  } catch (error) {
    console.error('Create opportunity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update opportunity
router.put('/:id', authenticateToken, requireOwner, [
  body('title').optional().trim().isLength({ min: 1, max: 100 }),
  body('company').optional().trim().isLength({ min: 1 }),
  body('location').optional().trim().isLength({ min: 1 }),
  body('description').optional().trim().isLength({ min: 1 }),
  body('applicationDeadline').optional().isISO8601().toDate(),
  body('status').optional().isIn(['active', 'inactive', 'draft', 'expired'])
], handleValidationErrors, async (req, res) => {
  try {
    const opportunity = await Opportunity.findOne({ 
      _id: req.params.id, 
      owner: req.user.id 
    });

    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    Object.assign(opportunity, req.body);
    await opportunity.save();

    res.json({
      success: true,
      message: 'Opportunity updated successfully',
      opportunity
    });
  } catch (error) {
    console.error('Update opportunity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete opportunity
router.delete('/:id', authenticateToken, requireOwner, async (req, res) => {
  try {
    const opportunity = await Opportunity.findOne({ 
      _id: req.params.id, 
      owner: req.user.id 
    });

    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    // Check if there are any applications
    const applicationCount = await Application.countDocuments({ 
      opportunity: req.params.id 
    });

    if (applicationCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete opportunity with ${applicationCount} application(s). Please close applications first.` 
      });
    }

    opportunity.isActive = false;
    await opportunity.save();

    res.json({
      success: true,
      message: 'Opportunity deleted successfully'
    });
  } catch (error) {
    console.error('Delete opportunity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get opportunity statistics
router.get('/stats/overview', authenticateToken, requireOwner, async (req, res) => {
  try {
    const stats = await Opportunity.aggregate([
      { $match: { owner: req.user._id, isActive: true } },
      {
        $group: {
          _id: '$opportunityType',
          count: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          totalViews: { $sum: '$views' },
          totalApplicants: { $sum: '$applicants' }
        }
      }
    ]);

    const totalOpportunities = await Opportunity.countDocuments({ 
      owner: req.user._id, 
      isActive: true 
    });

    const recentApplications = await Application.countDocuments({
      opportunity: { $in: await Opportunity.distinct('_id', { owner: req.user._id }) },
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    });

    res.json({
      success: true,
      stats: {
        totalOpportunities,
        byType: stats,
        recentApplications
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get applications for an opportunity
router.get('/:id/applications', authenticateToken, requireOwner, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;
    let query = { opportunity: req.params.id };

    if (status) query.status = status;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const applications = await Application.find(query)
      .populate('student', 'profile.firstName profile.lastName email')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Application.countDocuments(query);

    res.json({
      applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
