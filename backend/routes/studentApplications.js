const express = require('express');
const { body, validationResult } = require('express-validator');
const Application = require('../models/Application');
const Job = require('../models/Job');
const Internship = require('../models/Internship');
const User = require('../models/User');
const { authenticateToken, requireStudent } = require('../middleware/auth');

const router = express.Router();

// Validation middleware for application submission
const validateApplication = [
  body('coverLetter').optional().isString().trim(),
  body('portfolio').optional().isString().trim(),
  body('availability.startDate').optional().isISO8601().toDate(),
  body('availability.hoursPerWeek').optional().isInt({ min: 1, max: 168 }),
  body('expectedSalary').optional().isNumeric(),
  body('additionalNotes').optional().isString().trim()
];

// POST /api/student/apply/:opportunityId - Submit application
router.post('/apply/:opportunityId', 
  authenticateToken, 
  requireStudent,
  validateApplication,
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { opportunityId } = req.params;
      const studentId = req.user.id;

      // Check if opportunity exists in either Job or Internship models
      let opportunity = await Job.findById(opportunityId);
      let opportunityType = 'Job';
      
      if (!opportunity) {
        opportunity = await Internship.findById(opportunityId);
        opportunityType = 'Internship';
      }

      if (!opportunity) {
        return res.status(404).json({
          success: false,
          message: 'Opportunity not found'
        });
      }

      // Check if student has already applied
      const existingApplication = await Application.findOne({
        studentId: studentId,
        opportunityId: opportunityId
      });

      if (existingApplication) {
        return res.status(400).json({
          success: false,
          message: 'You have already applied for this opportunity'
        });
      }

      // Get student profile information
      const studentProfile = await User.findById(studentId);
      if (!studentProfile) {
        return res.status(404).json({
          success: false,
          message: 'Student profile not found'
        });
      }

      // Extract application details from request body
      const {
        coverLetter,
        portfolio,
        availability,
        expectedSalary,
        additionalNotes
      } = req.body;

      // Create application details object
      const applicationDetails = {
        name: `${studentProfile.profile?.firstName || ''} ${studentProfile.profile?.lastName || ''}`.trim() || studentProfile.username,
        email: studentProfile.email,
        phone: studentProfile.profile?.phone || '',
        resumeLink: '', // Can be added later for file upload
        coverLetter: coverLetter || '',
        portfolio: portfolio || '',
        availability: availability || {},
        expectedSalary: expectedSalary || null,
        additionalNotes: additionalNotes || '',
        // Include education details from student profile
        education: {
          level: studentProfile.student?.education || '',
          institution: studentProfile.student?.institution || '',
          graduationYear: studentProfile.student?.graduationYear || null,
          currentSemester: studentProfile.student?.currentSemester || null,
          cgpa: studentProfile.student?.cgpa || null
        },
        skills: studentProfile.student?.skills || []
      };

      // Create new application
      const application = new Application({
        studentId: studentId,
        opportunityId: opportunityId,
        opportunityType: opportunityType,
        applicationDetails: applicationDetails
      });

      // Save application to database
      const savedApplication = await application.save();

      // Increment applicant count on the opportunity (Job or Internship)
      if (opportunityType === 'Job') {
        await Job.findByIdAndUpdate(opportunityId, {
          $inc: { applicants: 1 }
        });
      } else {
        await Internship.findByIdAndUpdate(opportunityId, {
          $inc: { applicants: 1 }
        });
      }

      // Create notification for the owner
      const Notification = require('../models/Notification');
      const notificationData = {
        recipient: opportunity.owner,
        type: opportunityType === 'Job' ? 'job_application' : 'internship_application',
        title: 'New Application Received',
        message: `A new application has been submitted for ${opportunity.title}`,
        data: {
          applicationId: savedApplication._id.toString(),
          opportunityId: opportunityId,
          opportunityTitle: opportunity.title,
          studentName: applicationDetails.name
        },
        priority: 'medium'
      };

      await Notification.createNotification(notificationData);

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: {
          id: savedApplication._id,
          status: savedApplication.status,
          submittedDate: savedApplication.submittedDate,
          opportunityTitle: opportunity.title,
          companyName: opportunity.company
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

// GET /api/student/applications - Get all applications for the student
router.get('/applications', 
  authenticateToken, 
  requireStudent,
  async (req, res) => {
    try {
      const studentId = req.user.id;
      const { page = 1, limit = 10, status } = req.query;

      const query = { studentId: studentId };
      if (status) {
        query.status = status;
      }

      const applications = await Application.find(query)
        .sort({ submittedDate: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      // Populate opportunity details from the correct model
      const populatedApplications = await Promise.all(
        applications.map(async (application) => {
          let opportunity;
          let opportunityType = application.opportunityType;
          
          // If opportunityType is not set, try to determine it from the opportunity data
          if (!opportunityType) {
            // Try to find the opportunity in both models
            const job = await Job.findById(application.opportunityId);
            if (job) {
              opportunityType = 'Job';
              opportunity = job;
            } else {
              const internship = await Internship.findById(application.opportunityId);
              if (internship) {
                opportunityType = 'Internship';
                opportunity = internship;
              }
            }
          } else {
            // Use the stored opportunityType
            if (opportunityType === 'Job') {
              opportunity = await Job.findById(application.opportunityId).select('title company location opportunityType');
            } else {
              opportunity = await Internship.findById(application.opportunityId).select('title company location opportunityType');
            }
          }
          
          return {
            ...application.toObject(),
            opportunity: opportunity || { title: 'Opportunity not found', company: 'N/A', location: 'N/A' }
          };
        })
      );

      const total = await Application.countDocuments(query);

      res.json({
        success: true,
        data: populatedApplications,
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
  }
);

// GET /api/student/applications/:id - Get specific application
router.get('/applications/:id', 
  authenticateToken, 
  requireStudent,
  async (req, res) => {
    try {
      const { id } = req.params;
      const studentId = req.user.id;

      const application = await Application.findOne({
        _id: id,
        studentId: studentId
      });

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      // Populate opportunity details from the correct model
      let opportunity;
      let opportunityType = application.opportunityType;
      
      // If opportunityType is not set, try to determine it from the opportunity data
      if (!opportunityType) {
        // Try to find the opportunity in both models
        const job = await Job.findById(application.opportunityId);
        if (job) {
          opportunityType = 'Job';
          opportunity = job;
        } else {
          const internship = await Internship.findById(application.opportunityId);
          if (internship) {
            opportunityType = 'Internship';
            opportunity = internship;
          }
        }
      } else {
        // Use the stored opportunityType
        if (opportunityType === 'Job') {
          opportunity = await Job.findById(application.opportunityId).select('title company location opportunityType description');
        } else {
          opportunity = await Internship.findById(application.opportunityId).select('title company location opportunityType description');
        }
      }

      const populatedApplication = {
        ...application.toObject(),
        opportunity: opportunity || { title: 'Opportunity not found', company: 'N/A', location: 'N/A', description: 'N/A' }
      };

      res.json({
        success: true,
        data: populatedApplication
      });

    } catch (error) {
      console.error('Error fetching application:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch application',
        error: error.message
      });
    }
  }
);

module.exports = router;
