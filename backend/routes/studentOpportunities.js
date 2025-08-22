const express = require('express');
const { body, validationResult } = require('express-validator');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const { authenticateToken, requireStudent } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// GET /api/student/jobs - Get all available jobs
router.get('/jobs', 
  authenticateToken, 
  requireStudent,
  async (req, res) => {
    try {
      const { page = 1, limit = 10, location, isRemote, status = 'active' } = req.query;
      
      const query = { 
        opportunityType: 'Job',
        status: status
      };
      
      if (location) {
        query.location = { $regex: location, $options: 'i' };
      }
      
      if (isRemote !== undefined) {
        query.isRemote = isRemote === 'true';
      }

      console.log('Fetching jobs with query:', query);
      console.log('Query parameters:', { page, limit, location, isRemote, status });

      const jobs = await Opportunity.find(query)
        .sort({ postedDate: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .select('-__v')
        .populate('ownerId', 'profile.firstName profile.lastName profile.companyName');

      const total = await Opportunity.countDocuments(query);

      console.log(`Found ${jobs.length} jobs out of ${total} total`);

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
      console.error('Error fetching jobs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch jobs',
        error: error.message
      });
    }
  }
);

// GET /api/student/internships - Get all available internships
router.get('/internships', 
  authenticateToken, 
  requireStudent,
  async (req, res) => {
    try {
      const { page = 1, limit = 10, location, isRemote, status = 'active' } = req.query;
      
      const query = { 
        opportunityType: 'Internship',
        status: status
      };
      
      if (location) {
        query.location = { $regex: location, $options: 'i' };
      }
      
      if (isRemote !== undefined) {
        query.isRemote = isRemote === 'true';
      }

      console.log('Fetching internships with query:', query);
      console.log('Query parameters:', { page, limit, location, isRemote, status });

      const internships = await Opportunity.find(query)
        .sort({ postedDate: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .select('-__v')
        .populate('ownerId', 'profile.firstName profile.lastName profile.companyName');

      const total = await Opportunity.countDocuments(query);

      console.log(`Found ${internships.length} internships out of ${total} total`);

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
      console.error('Error fetching internships:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch internships',
        error: error.message
      });
    }
  }
);

// GET /api/student/opportunities/:id - Get a specific opportunity
router.get('/opportunities/:id', 
  authenticateToken, 
  requireStudent,
  async (req, res) => {
    try {
      const opportunity = await Opportunity.findById(req.params.id)
        .populate('ownerId', 'profile.firstName profile.lastName profile.companyName profile.email profile.phone');

      if (!opportunity) {
        return res.status(404).json({
          success: false,
          message: 'Opportunity not found'
        });
      }

      // Increment view count
      await opportunity.incrementViews();

      res.json({
        success: true,
        data: opportunity
      });

    } catch (error) {
      console.error('Error fetching opportunity:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch opportunity',
        error: error.message
      });
    }
  }
);

// GET /api/student/opportunities/search - Search opportunities
router.get('/opportunities/search', 
  authenticateToken, 
  requireStudent,
  async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        q, 
        opportunityType, 
        location, 
        isRemote, 
        status = 'active' 
      } = req.query;
      
      const query = { status: status };
      
      if (opportunityType) {
        query.opportunityType = opportunityType;
      }
      
      if (location) {
        query.location = { $regex: location, $options: 'i' };
      }
      
      if (isRemote !== undefined) {
        query.isRemote = isRemote === 'true';
      }
      
      if (q) {
        query.$or = [
          { title: { $regex: q, $options: 'i' } },
          { companyName: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } }
        ];
      }

      const opportunities = await Opportunity.find(query)
        .sort({ postedDate: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .select('-__v')
        .populate('ownerId', 'profile.firstName profile.lastName profile.companyName');

      const total = await Opportunity.countDocuments(query);

      res.json({
        success: true,
        data: opportunities,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      });

    } catch (error) {
      console.error('Error searching opportunities:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search opportunities',
        error: error.message
      });
    }
  }
);

// POST /api/student/opportunities/:opportunityType/:id/apply - Submit application
router.post('/:opportunityType/:id/apply',
  authenticateToken,
  requireStudent,
  async (req, res) => {
    try {
      const { opportunityType, id } = req.params;
      const {
        coverLetter,
        portfolio,
        availability,
        salary,
        notes
      } = req.body;

      // Validate opportunity type
      if (!['jobs', 'internships'].includes(opportunityType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid opportunity type'
        });
      }

      // Check if opportunity exists
      const opportunity = await Opportunity.findById(id);
      if (!opportunity) {
        return res.status(404).json({
          success: false,
          message: 'Opportunity not found'
        });
      }

      // Check if student has already applied
      const existingApplication = await Application.findOne({
        student: req.user.id,
        opportunity: id
      });

      if (existingApplication) {
        return res.status(400).json({
          success: false,
          message: 'You have already applied for this opportunity'
        });
      }

      // Get student details from user profile
      const studentDetails = {
        fullName: `${req.user.profile?.firstName || ''} ${req.user.profile?.lastName || ''}`.trim() || req.user.username,
        email: req.user.email,
        phone: req.user.profile?.phone || '',
        education: req.user.profile?.education || 'Student',
        institution: req.user.profile?.institution || '',
        graduationYear: req.user.profile?.graduationYear,
        skills: req.user.profile?.skills || [],
        experience: {
          years: req.user.profile?.experience?.years || 0,
          description: req.user.profile?.experience?.description || ''
        }
      };

      // Create application
      const application = new Application({
        student: req.user.id,
        opportunity: id,
        opportunityType: opportunityType === 'jobs' ? 'job' : 'internship',
        studentDetails,
        coverLetter,
        portfolio,
        availability,
        salary,
        notes
      });

      // Save application
      const savedApplication = await application.save();

      // Increment application count on opportunity
      await opportunity.incrementApplications();

      // Create notification for owner
      const notification = new Notification({
        recipient: opportunity.ownerId,
        type: opportunityType === 'jobs' ? 'job_application' : 'internship_application',
        title: 'New Application Received',
        message: `${studentDetails.fullName} has applied for ${opportunity.title}`,
        data: {
          applicationId: savedApplication._id,
          opportunityId: opportunity._id,
          opportunityTitle: opportunity.title,
          studentId: req.user.id,
          studentName: studentDetails.fullName
        },
        isRead: false
      });

      await notification.save();

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: {
          id: savedApplication._id,
          status: savedApplication.status,
          submittedAt: savedApplication.createdAt
        }
      });

    } catch (error) {
      console.error('Error submitting application:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit application',
        error: error.message
      });
    }
  }
);

module.exports = router;
