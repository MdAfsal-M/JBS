const express = require('express');
const { body, validationResult } = require('express-validator');
const Internship = require('../models/Internship');
const Application = require('../models/Application');
const { authenticateToken, requireOwner } = require('../middleware/auth');

const router = express.Router();

// Get all internships for owner
router.get('/', authenticateToken, requireOwner, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      category, 
      duration, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;
    let query = { owner: req.user.id, isActive: true };

    // Apply filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (duration) query.duration = duration;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const internships = await Internship.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Internship.countDocuments(query);

    res.json({
      internships,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get internships error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single internship
router.get('/:id', authenticateToken, requireOwner, async (req, res) => {
  try {
    const internship = await Internship.findOne({ _id: req.params.id, owner: req.user.id });
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    res.json(internship);
  } catch (error) {
    console.error('Get internship error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new internship
router.post('/', authenticateToken, requireOwner, [
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title is required and must be less than 100 characters'),
  body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
  body('company').trim().isLength({ min: 1 }).withMessage('Company name is required'),
  body('location').trim().isLength({ min: 1 }).withMessage('Location is required'),
  body('category').trim().isLength({ min: 1 }).withMessage('Category is required'),
  body('duration').trim().isLength({ min: 1 }).withMessage('Duration is required'),
  body('stipend').trim().isLength({ min: 1 }).withMessage('Stipend is required'),
  body('stipendType').isIn(['paid', 'unpaid', 'performance-based']).withMessage('Invalid stipend type'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('applicationDeadline').isISO8601().withMessage('Valid application deadline is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const internshipData = {
      ...req.body,
      owner: req.user.id
    };

    const internship = new Internship(internshipData);
    await internship.save();

    res.status(201).json({
      message: 'Internship created successfully',
      internship
    });
  } catch (error) {
    console.error('Create internship error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update internship
router.put('/:id', authenticateToken, requireOwner, [
  body('title').optional().trim().isLength({ min: 1, max: 100 }),
  body('description').optional().trim().isLength({ min: 1 }),
  body('company').optional().trim().isLength({ min: 1 }),
  body('location').optional().trim().isLength({ min: 1 }),
  body('category').optional().trim().isLength({ min: 1 }),
  body('duration').optional().trim().isLength({ min: 1 }),
  body('stipend').optional().trim().isLength({ min: 1 }),
  body('stipendType').optional().isIn(['paid', 'unpaid', 'performance-based']),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('applicationDeadline').optional().isISO8601()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const internship = await Internship.findOne({ _id: req.params.id, owner: req.user.id });
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    Object.assign(internship, req.body);
    await internship.save();

    res.json({
      message: 'Internship updated successfully',
      internship
    });
  } catch (error) {
    console.error('Update internship error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete internship
router.delete('/:id', authenticateToken, requireOwner, async (req, res) => {
  try {
    const internship = await Internship.findOne({ _id: req.params.id, owner: req.user.id });
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    internship.isActive = false;
    await internship.save();

    res.json({ message: 'Internship deleted successfully' });
  } catch (error) {
    console.error('Delete internship error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get internship applications
router.get('/:id/applications', authenticateToken, requireOwner, async (req, res) => {
  try {
    const internship = await Internship.findOne({ _id: req.params.id, owner: req.user.id });
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    const { 
      page = 1, 
      limit = 10, 
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;
    let query = { internship: req.params.id };

    if (status) query.status = status;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const applications = await Application.find(query)
      .populate('applicant', 'profile.firstName profile.lastName email')
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
    console.error('Get internship applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update internship application status
router.put('/applications/:applicationId/status', authenticateToken, requireOwner, [
  body('status').isIn(['pending', 'reviewed', 'shortlisted', 'interviewed', 'accepted', 'rejected', 'withdrawn']).withMessage('Invalid status'),
  body('notes').optional().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const application = await Application.findById(req.params.applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify the internship belongs to the owner
    const internship = await Internship.findOne({ _id: application.internship, owner: req.user.id });
    if (!internship) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await application.updateStatus(req.body.status, req.body.notes);

    res.json({
      message: 'Application status updated successfully',
      application
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get internship analytics
router.get('/:id/analytics', authenticateToken, requireOwner, async (req, res) => {
  try {
    const internship = await Internship.findOne({ _id: req.params.id, owner: req.user.id });
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    const applications = await Application.find({ internship: req.params.id });
    const statusCounts = {};
    const totalApplications = applications.length;

    applications.forEach(app => {
      statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
    });

    const analytics = {
      totalViews: internship.views,
      totalApplications: totalApplications,
      statusBreakdown: statusCounts,
      applicationRate: totalApplications > 0 ? ((totalApplications / internship.views) * 100).toFixed(2) : 0,
      recentApplications: applications.filter(app => app.isRecent).length,
      isExpired: internship.isExpired,
      isFull: internship.isFull
    };

    res.json(analytics);
  } catch (error) {
    console.error('Get internship analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
