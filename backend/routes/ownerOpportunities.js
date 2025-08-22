const express = require('express');
const router = express.Router();
const Opportunity = require('../models/Opportunity');
const { authenticateToken, requireOwner } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Validation middleware for opportunity creation
const validateOpportunity = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title is required and must be between 1 and 100 characters'),
  
  body('companyName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Company name is required and must be between 1 and 100 characters'),
  
  body('location')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Location is required and must be between 1 and 100 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description is required and must be between 10 and 2000 characters'),
  
  body('opportunityType')
    .isIn(['Job', 'Internship'])
    .withMessage('Opportunity type must be either "Job" or "Internship"'),
  
  body('applicationDeadline')
    .isISO8601()
    .custom((value) => {
      const deadline = new Date(value);
      const now = new Date();
      if (deadline <= now) {
        throw new Error('Application deadline must be in the future');
      }
      return true;
    })
    .withMessage('Application deadline must be a valid future date'),
  
  // Job-specific validation
  body('jobType')
    .optional()
    .isIn(['full-time', 'part-time', 'contract', 'freelance'])
    .withMessage('Job type must be one of: full-time, part-time, contract, freelance'),
  
  body('salary')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Salary must not exceed 100 characters'),
  
  body('payType')
    .optional()
    .isIn(['hourly', 'daily', 'weekly', 'monthly', 'yearly', 'project-based'])
    .withMessage('Pay type must be one of: hourly, daily, weekly, monthly, yearly, project-based'),
  
  body('experience')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Experience description must not exceed 200 characters'),
  
  // Internship-specific validation
  body('duration')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Duration must not exceed 100 characters'),
  
  body('stipend')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Stipend must not exceed 100 characters'),
  
  body('stipendType')
    .optional()
    .isIn(['paid', 'unpaid', 'performance-based'])
    .withMessage('Stipend type must be one of: paid, unpaid, performance-based'),
  
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  body('endDate')
    .optional()
    .isISO8601()
    .custom((value, { req }) => {
      if (req.body.startDate && value) {
        const startDate = new Date(req.body.startDate);
        const endDate = new Date(value);
        if (endDate <= startDate) {
          throw new Error('End date must be after start date');
        }
      }
      return true;
    })
    .withMessage('End date must be after start date'),
  
  // Common fields validation
  body('requirements')
    .optional()
    .isArray()
    .withMessage('Requirements must be an array'),
  
  body('requirements.*')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Each requirement must not exceed 200 characters'),
  
  body('benefits')
    .optional()
    .isArray()
    .withMessage('Benefits must be an array'),
  
  body('benefits.*')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Each benefit must not exceed 200 characters'),
  
  body('isRemote')
    .optional()
    .isBoolean()
    .withMessage('isRemote must be a boolean value'),
  
  body('isUrgent')
    .optional()
    .isBoolean()
    .withMessage('isUrgent must be a boolean value'),
  
  body('maxApplicants')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maximum applicants must be a positive integer'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Each tag must not exceed 50 characters'),
  
  body('contactInfo.email')
    .optional()
    .isEmail()
    .withMessage('Contact email must be a valid email address'),
  
  body('contactInfo.phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Contact phone must not exceed 20 characters'),
  
  body('contactInfo.website')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Contact website must not exceed 200 characters'),
  
  body('applicationInstructions')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Application instructions must not exceed 1000 characters')
];

// POST /api/owner/opportunities - Create a new opportunity
router.post('/opportunities', 
  authenticateToken, 
  requireOwner, 
  validateOpportunity,
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const {
        title,
        companyName,
        location,
        description,
        opportunityType,
        applicationDeadline,
        salary,
        requirements,
        benefits,
        isRemote,
        // Job-specific fields
        jobType,
        payType,
        experience,
        // Internship-specific fields
        duration,
        stipend,
        stipendType,
        startDate,
        endDate,
        // Additional fields
        isUrgent,
        maxApplicants,
        tags,
        contactInfo,
        applicationInstructions
      } = req.body;

      console.log('Creating opportunity with data:', {
        title,
        companyName,
        location,
        description,
        opportunityType,
        applicationDeadline,
        salary,
        requirements,
        benefits,
        isRemote,
        // Job-specific fields
        jobType,
        payType,
        experience,
        // Internship-specific fields
        duration,
        stipend,
        stipendType,
        startDate,
        endDate,
        // Additional fields
        isUrgent,
        maxApplicants,
        tags,
        contactInfo,
        applicationInstructions,
        ownerId: req.user.id
      });

      // Create new opportunity with all fields
      const opportunityData = {
        title,
        companyName,
        location,
        description,
        opportunityType,
        applicationDeadline: new Date(applicationDeadline),
        ownerId: req.user.id,
        salary: salary || null,
        requirements: requirements || [],
        benefits: benefits || [],
        isRemote: isRemote || false,
        // Job-specific fields
        jobType: jobType || null,
        payType: payType || null,
        experience: experience || null,
        // Internship-specific fields
        duration: duration || null,
        stipend: stipend || null,
        stipendType: stipendType || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        // Additional fields
        isUrgent: isUrgent || false,
        maxApplicants: maxApplicants || null,
        tags: tags || [],
        contactInfo: contactInfo || {},
        applicationInstructions: applicationInstructions || null
      };

      const opportunity = new Opportunity(opportunityData);

      console.log('Opportunity object created:', opportunity);

      // Save to database
      const savedOpportunity = await opportunity.save();
      console.log('Opportunity saved successfully:', savedOpportunity);

      res.status(201).json({
        success: true,
        message: `${opportunityType} posted successfully`,
        data: {
          id: savedOpportunity._id,
          title: savedOpportunity.title,
          companyName: savedOpportunity.companyName,
          location: savedOpportunity.location,
          opportunityType: savedOpportunity.opportunityType,
          applicationDeadline: savedOpportunity.applicationDeadline,
          postedDate: savedOpportunity.postedDate,
          status: savedOpportunity.status
        }
      });

    } catch (error) {
      console.error('Error creating opportunity:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create opportunity',
        error: error.message
      });
    }
  }
);

// GET /api/owner/opportunities - Get all opportunities for the owner
router.get('/opportunities', 
  authenticateToken, 
  requireOwner,
  async (req, res) => {
    try {
      const { page = 1, limit = 10, status, opportunityType } = req.query;
      
      const query = { ownerId: req.user.id };
      
      if (status) {
        query.status = status;
      }
      
      if (opportunityType) {
        query.opportunityType = opportunityType;
      }

      const opportunities = await Opportunity.find(query)
        .sort({ postedDate: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .select('-__v');

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
      console.error('Error fetching opportunities:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch opportunities',
        error: error.message
      });
    }
  }
);

// GET /api/owner/opportunities/:id - Get a specific opportunity
router.get('/opportunities/:id', 
  authenticateToken, 
  requireOwner,
  async (req, res) => {
    try {
      const opportunity = await Opportunity.findOne({
        _id: req.params.id,
        ownerId: req.user.id
      });

      if (!opportunity) {
        return res.status(404).json({
          success: false,
          message: 'Opportunity not found'
        });
      }

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

// PUT /api/owner/opportunities/:id - Update an opportunity
router.put('/opportunities/:id', 
  authenticateToken, 
  requireOwner,
  validateOpportunity,
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

      const opportunity = await Opportunity.findOne({
        _id: req.params.id,
        ownerId: req.user.id
      });

      if (!opportunity) {
        return res.status(404).json({
          success: false,
          message: 'Opportunity not found'
        });
      }

      // Update fields
      const updateData = { ...req.body };
      if (updateData.applicationDeadline) {
        updateData.applicationDeadline = new Date(updateData.applicationDeadline);
      }

      const updatedOpportunity = await Opportunity.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        message: 'Opportunity updated successfully',
        data: updatedOpportunity
      });

    } catch (error) {
      console.error('Error updating opportunity:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update opportunity',
        error: error.message
      });
    }
  }
);

// DELETE /api/owner/opportunities/:id - Delete an opportunity
router.delete('/opportunities/:id', 
  authenticateToken, 
  requireOwner,
  async (req, res) => {
    try {
      const opportunity = await Opportunity.findOne({
        _id: req.params.id,
        ownerId: req.user.id
      });

      if (!opportunity) {
        return res.status(404).json({
          success: false,
          message: 'Opportunity not found'
        });
      }

      await Opportunity.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: 'Opportunity deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting opportunity:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete opportunity',
        error: error.message
      });
    }
  }
);

module.exports = router;
