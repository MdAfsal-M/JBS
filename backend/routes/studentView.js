const express = require('express');
const Job = require('../models/Job');
const Internship = require('../models/Internship');
const { authenticateToken, requireStudent } = require('../middleware/auth');

const router = express.Router();

// GET /api/student-view/jobs - Get all available jobs for students
router.get('/jobs', authenticateToken, requireStudent, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      location, 
      category, 
      jobType, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;
    let query = { status: 'active', isActive: true };

    // Apply filters
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }
    if (jobType) {
      query.jobType = jobType;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const jobs = await Job.find(query)
      .populate('owner', 'profile.firstName profile.lastName business.businessName')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(query);

    res.json({
      success: true,
      data: jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get jobs for students error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// GET /api/student-view/internships - Get all available internships for students
router.get('/internships', authenticateToken, requireStudent, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      location, 
      category, 
      duration, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;
    let query = { status: 'active', isActive: true };

    // Apply filters
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }
    if (duration) {
      query.duration = { $regex: duration, $options: 'i' };
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const internships = await Internship.find(query)
      .populate('owner', 'profile.firstName profile.lastName business.businessName')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Internship.countDocuments(query);

    res.json({
      success: true,
      data: internships,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get internships for students error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// GET /api/student-view/jobs/:id - Get single job details
router.get('/jobs/:id', authenticateToken, requireStudent, async (req, res) => {
  try {
    const job = await Job.findOne({ 
      _id: req.params.id, 
      status: 'active', 
      isActive: true 
    }).populate('owner', 'profile.firstName profile.lastName business.businessName');

    if (!job) {
      return res.status(404).json({ 
        success: false,
        message: 'Job not found' 
      });
    }

    // Increment views
    await job.incrementViews();

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Get job details error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// GET /api/student-view/internships/:id - Get single internship details
router.get('/internships/:id', authenticateToken, requireStudent, async (req, res) => {
  try {
    const internship = await Internship.findOne({ 
      _id: req.params.id, 
      status: 'active', 
      isActive: true 
    }).populate('owner', 'profile.firstName profile.lastName business.businessName');

    if (!internship) {
      return res.status(404).json({ 
        success: false,
        message: 'Internship not found' 
      });
    }

    // Increment views
    await internship.incrementViews();

    res.json({
      success: true,
      data: internship
    });
  } catch (error) {
    console.error('Get internship details error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// GET /api/student-view/categories - Get available categories
router.get('/categories', authenticateToken, requireStudent, async (req, res) => {
  try {
    const jobCategories = await Job.distinct('category', { status: 'active', isActive: true });
    const internshipCategories = await Internship.distinct('category', { status: 'active', isActive: true });
    
    // Combine and remove duplicates
    const allCategories = [...new Set([...jobCategories, ...internshipCategories])];

    res.json({
      success: true,
      data: {
        jobCategories,
        internshipCategories,
        allCategories
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// GET /api/student-view/locations - Get available locations
router.get('/locations', authenticateToken, requireStudent, async (req, res) => {
  try {
    const jobLocations = await Job.distinct('location', { status: 'active', isActive: true });
    const internshipLocations = await Internship.distinct('location', { status: 'active', isActive: true });
    
    // Combine and remove duplicates
    const allLocations = [...new Set([...jobLocations, ...internshipLocations])];

    res.json({
      success: true,
      data: {
        jobLocations,
        internshipLocations,
        allLocations
      }
    });
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

module.exports = router;
