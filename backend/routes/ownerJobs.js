const express = require('express');
const Job = require('../models/Job');
const Internship = require('../models/Internship');
const { authenticateToken, requireOwner } = require('../middleware/auth');
const mongoose = require('mongoose'); // Added for database connection status

const router = express.Router();

// Test endpoint to verify authentication
router.get('/test-auth', authenticateToken, requireOwner, async (req, res) => {
  try {
    console.log('Test auth endpoint - User:', req.user);
    res.json({
      success: true,
      message: 'Authentication working',
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Test auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Test auth failed',
      error: error.message
    });
  }
});

// Debug endpoint to check all jobs in database
router.get('/debug-jobs', authenticateToken, requireOwner, async (req, res) => {
  try {
    console.log('Debug jobs endpoint - User:', req.user);
    
    // Get all jobs in database
    const allJobs = await Job.find({}).select('title company owner status createdAt');
    console.log('All jobs in database:', allJobs);
    
    // Get jobs for this specific owner
    const ownerJobs = await Job.find({ owner: req.user.id }).select('title company owner status createdAt');
    console.log('Jobs for this owner:', ownerJobs);
    
    // Check database connection
    const dbStatus = mongoose.connection.readyState;
    const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    console.log('Database connection status:', dbStates[dbStatus]);
    
    // Check if Job model is working
    const jobCount = await Job.countDocuments({});
    console.log('Total job count:', jobCount);
    
    // Check if we can perform basic operations
    try {
      const testCount = await Job.countDocuments({});
      console.log('Test count operation successful:', testCount);
    } catch (error) {
      console.error('Test count operation failed:', error);
    }
    
    res.json({
      success: true,
      message: 'Debug info',
      totalJobsInDB: allJobs.length,
      ownerJobsCount: ownerJobs.length,
      allJobs: allJobs,
      ownerJobs: ownerJobs,
      currentUserId: req.user.id,
      databaseStatus: dbStates[dbStatus],
      totalJobCount: jobCount
    });
  } catch (error) {
    console.error('Debug jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug failed',
      error: error.message
    });
  }
});

// GET /api/owner/jobs - Get all jobs posted by the authenticated owner
router.get('/jobs', authenticateToken, requireOwner, async (req, res) => {
  try {
    console.log('=== OWNER JOBS DEBUG START ===');
    const ownerId = req.user.id;
    console.log('Owner jobs request - ownerId:', ownerId);
    console.log('Owner ID type:', typeof ownerId);
    console.log('Full user object:', JSON.stringify(req.user, null, 2));
    console.log('User ID from user object:', req.user._id);
    console.log('User ID type from user object:', typeof req.user._id);
    
    const { page = 1, limit = 1000, status, search } = req.query;
    console.log('Query params:', req.query);
    
    console.log('Authenticated user:', req.user);
    
    // Build query
    let query = { owner: ownerId };
    console.log('Final query:', query);
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get total count (light logging only)
    const total = await Job.countDocuments(query);
    
    // Execute query
    const jobs = await Job.find(query)
      .select('_id title company location description status jobType pay payType experience category requirements benefits isRemote isUrgent views applicants deadline createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    console.log('Found', jobs.length, 'jobs out of', total, 'total for owner', ownerId);
    console.log('=== OWNER JOBS DEBUG END ===');
    
    // Set cache control headers to prevent caching
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    res.json({
      success: true,
      data: jobs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching owner jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs'
    });
  }
});

// GET /api/owner/internships - Get all internships posted by the authenticated owner
router.get('/internships', authenticateToken, requireOwner, async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { page = 1, limit = 10, status, search } = req.query;

    let query = { owner: ownerId };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Internship.countDocuments(query);
    const internships = await Internship.find(query)
      .select('_id title company location description status duration stipend stipendType requirements benefits isRemote isUrgent views applicants startDate endDate applicationDeadline createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Set cache control headers to prevent caching
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.json({
      success: true,
      data: internships,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching owner internships:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch internships'
    });
  }
});

// GET /api/owner/jobs/:id - Get specific job details
router.get('/jobs/:id', authenticateToken, requireOwner, async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;

    const job = await Job.findOne({
      _id: id,
      owner: ownerId
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or you do not have permission to view it'
      });
    }

    res.json({
      success: true,
      data: job
    });

  } catch (error) {
    console.error('Error fetching job details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job details',
      error: error.message
    });
  }
});

// GET /api/owner/internships/:id - Get specific internship details
router.get('/internships/:id', authenticateToken, requireOwner, async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;

    const internship = await Internship.findOne({
      _id: id,
      owner: ownerId
    });

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: 'Internship not found or you do not have permission to view it'
      });
    }

    res.json({
      success: true,
      data: internship
    });

  } catch (error) {
    console.error('Error fetching internship details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch internship details',
      error: error.message
    });
  }
});

// GET /api/owner/jobs/:id/applicants - Get applicants for a specific job
router.get('/jobs/:id/applicants', authenticateToken, requireOwner, async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;

    // First verify the job belongs to the owner
    const job = await Job.findOne({
      _id: id,
      owner: ownerId
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or you do not have permission to view it'
      });
    }

    // Get applications for this job
    const Application = require('../models/Application');
    const applications = await Application.find({
      job: id
    }).populate('applicant', 'profile.firstName profile.lastName email');

    res.json({
      success: true,
      data: applications
    });

  } catch (error) {
    console.error('Error fetching job applicants:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job applicants',
      error: error.message
    });
  }
});

// GET /api/owner/internships/:id/applicants - Get applicants for a specific internship
router.get('/internships/:id/applicants', authenticateToken, requireOwner, async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;

    // First verify the internship belongs to the owner
    const internship = await Internship.findOne({
      _id: id,
      owner: ownerId
    });

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: 'Internship not found or you do not have permission to view it'
      });
    }

    // Get applications for this internship
    const Application = require('../models/Application');
    const applications = await Application.find({
      internship: id
    }).populate('applicant', 'profile.firstName profile.lastName email');

    res.json({
      success: true,
      data: applications
    });

  } catch (error) {
    console.error('Error fetching internship applicants:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch internship applicants',
      error: error.message
    });
  }
});

module.exports = router;
