const express = require('express');
const { body, validationResult } = require('express-validator');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { authenticateToken, requireOwner } = require('../middleware/auth');

const router = express.Router();

// Get all jobs for owner
router.get('/', authenticateToken, requireOwner, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      category, 
      jobType, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;
    let query = { owner: req.user.id, isActive: true };

    // Apply filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (jobType) query.jobType = jobType;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const jobs = await Job.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single job
router.get('/:id', authenticateToken, requireOwner, async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, owner: req.user.id });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new job
router.post('/', authenticateToken, requireOwner, [
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title is required and must be less than 100 characters'),
  body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
  body('company').trim().isLength({ min: 1 }).withMessage('Company name is required'),
  body('location').trim().isLength({ min: 1 }).withMessage('Location is required'),
  body('category').trim().isLength({ min: 1 }).withMessage('Category is required'),
  body('pay').trim().isLength({ min: 1 }).withMessage('Pay is required'),
  body('experience').trim().isLength({ min: 1 }).withMessage('Experience is required'),
  body('jobType').isIn(['full-time', 'part-time', 'contract', 'internship', 'freelance']).withMessage('Invalid job type'),
  body('payType').isIn(['hourly', 'daily', 'weekly', 'monthly', 'yearly', 'project-based']).withMessage('Invalid pay type')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const jobData = {
      ...req.body,
      owner: req.user.id
    };

    const job = new Job(jobData);
    await job.save();

    res.status(201).json({
      message: 'Job created successfully',
      job
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update job
router.put('/:id', authenticateToken, requireOwner, [
  body('title').optional().trim().isLength({ min: 1, max: 100 }),
  body('description').optional().trim().isLength({ min: 1 }),
  body('company').optional().trim().isLength({ min: 1 }),
  body('location').optional().trim().isLength({ min: 1 }),
  body('category').optional().trim().isLength({ min: 1 }),
  body('pay').optional().trim().isLength({ min: 1 }),
  body('experience').optional().trim().isLength({ min: 1 }),
  body('jobType').optional().isIn(['full-time', 'part-time', 'contract', 'internship', 'freelance']),
  body('payType').optional().isIn(['hourly', 'daily', 'weekly', 'monthly', 'yearly', 'project-based'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const job = await Job.findOne({ _id: req.params.id, owner: req.user.id });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    Object.assign(job, req.body);
    await job.save();

    res.json({
      message: 'Job updated successfully',
      job
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete job
router.delete('/:id', authenticateToken, requireOwner, async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, owner: req.user.id });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    job.isActive = false;
    await job.save();

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get job applications
router.get('/:id/applications', authenticateToken, requireOwner, async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, owner: req.user.id });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const { 
      page = 1, 
      limit = 10, 
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;
    let query = { job: req.params.id };

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
    console.error('Get job applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update application status
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

    // Verify the job belongs to the owner
    const job = await Job.findOne({ _id: application.job, owner: req.user.id });
    if (!job) {
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

// Get job analytics
router.get('/:id/analytics', authenticateToken, requireOwner, async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, owner: req.user.id });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const applications = await Application.find({ job: req.params.id });
    const statusCounts = {};
    const totalApplications = applications.length;

    applications.forEach(app => {
      statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
    });

    const analytics = {
      totalViews: job.views,
      totalApplications: totalApplications,
      statusBreakdown: statusCounts,
      applicationRate: totalApplications > 0 ? ((totalApplications / job.views) * 100).toFixed(2) : 0,
      recentApplications: applications.filter(app => app.isRecent).length
    };

    res.json(analytics);
  } catch (error) {
    console.error('Get job analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
