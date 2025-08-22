const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');
const Job = require('../models/Job');
const Internship = require('../models/Internship');
const Application = require('../models/Application');
const Notification = require('../models/Notification');

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation failed', 
      errors: errors.array() 
    });
  }
  next();
};

// GET /api/student/dashboard - Get student dashboard data
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    // Verify user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Student privileges required.' });
    }

    // Get student's applications
    const applications = await Application.find({ applicant: req.user.id })
      .populate('job')
      .populate('internship')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get recommended jobs based on student skills
    const studentSkills = req.user.student?.skills || [];
    const recommendedJobs = await Job.find({ 
      status: 'active',
      requirements: { $in: studentSkills }
    })
    .limit(5)
    .sort({ createdAt: -1 });

    // Get all active jobs
    const activeJobs = await Job.find({ status: 'active' })
      .limit(10)
      .sort({ createdAt: -1 });

    // Get recommended internships
    const recommendedInternships = await Internship.find({ 
      status: 'active',
      requirements: { $in: studentSkills }
    })
    .limit(5)
    .sort({ createdAt: -1 });

    // Get all active internships
    const activeInternships = await Internship.find({ status: 'active' })
      .limit(10)
      .sort({ createdAt: -1 });

    // Calculate statistics
    const totalApplications = await Application.countDocuments({ applicant: req.user.id });
    const pendingApplications = await Application.countDocuments({ 
      applicant: req.user.id, 
      status: 'pending' 
    });
    const acceptedApplications = await Application.countDocuments({ 
      applicant: req.user.id, 
      status: 'accepted' 
    });

    res.json({
      success: true,
      data: {
        profile: req.user,
        applications,
        recommendedJobs,
        activeJobs,
        recommendedInternships,
        activeInternships,
        stats: {
          totalApplications,
          pendingApplications,
          acceptedApplications
        }
      }
    });
  } catch (error) {
    console.error('Error fetching student dashboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/student/profile - Get student profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Student privileges required.' });
    }

    const user = await User.findById(req.user.id)
      .select('-password -resetPasswordToken -emailVerificationToken');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/student/profile - Update student profile
router.put('/profile', [
  authenticateToken,
  body('profile.firstName').optional().isLength({ min: 2, max: 50 }).trim().escape(),
  body('profile.lastName').optional().isLength({ min: 2, max: 50 }).trim().escape(),
  body('profile.phone').optional().matches(/^[\+]?[1-9][\d]{0,15}$/),
  body('profile.city').optional().isLength({ min: 2, max: 50 }).trim().escape(),
  body('profile.address').optional().isLength({ max: 500 }).trim().escape(),
  body('student.education').optional().isLength({ min: 2, max: 100 }).trim().escape(),
  body('student.institution').optional().isLength({ min: 2, max: 100 }).trim().escape(),
  body('student.graduationYear').optional().isInt({ min: 1950, max: new Date().getFullYear() + 10 }),
  body('student.skills').optional().isArray(),
  body('student.skills.*').optional().isLength({ min: 2, max: 50 }).trim().escape(),
  body('student.currentSemester').optional().isInt({ min: 1, max: 8 }),
  body('student.cgpa').optional().isFloat({ min: 0.0, max: 10.0 })
], handleValidationErrors, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Student privileges required.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update profile fields
    if (req.body.profile) {
      user.profile = { ...user.profile, ...req.body.profile };
    }

    // Update student fields
    if (req.body.student) {
      user.student = { ...user.student, ...req.body.student };
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        profile: user.profile,
        student: user.student
      }
    });
  } catch (error) {
    console.error('Error updating student profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/student/apply/job/:jobId - Apply for a job
router.post('/apply/job/:jobId', [
  authenticateToken,
  body('coverLetter').optional().isLength({ max: 1000 }).trim().escape(),
  body('resume').optional().isURL()
], handleValidationErrors, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Student privileges required.' });
    }

    const { jobId } = req.params;
    const { coverLetter, resume } = req.body;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      applicant: req.user.id,
      job: jobId
    });

    if (existingApplication) {
      return res.status(409).json({ message: 'Already applied for this job' });
    }

    // Create application
    const application = new Application({
      applicant: req.user.id,
      job: jobId,
      coverLetter,
      resume: resume || req.user.student?.resume,
      status: 'pending'
    });

    await application.save();

    // Increment applicant count for the job
    await Job.findByIdAndUpdate(jobId, { $inc: { applicants: 1 } });

    // Create notification for the job owner
    try {
      await Notification.createNotification({
        recipient: job.owner,
        type: 'job_application',
        title: 'New Job Application Received',
        message: `${req.user.profile?.firstName || req.user.email} has applied for your job: ${job.title}`,
        data: {
          applicationId: application._id.toString(),
          jobId: jobId,
          opportunityTitle: job.title,
          studentName: req.user.profile?.firstName ? `${req.user.profile.firstName} ${req.user.profile.lastName || ''}`.trim() : req.user.email,
          url: `/owner/job-applicants/${jobId}`
        },
        priority: 'medium'
      });
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Don't fail the application if notification fails
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    console.error('Error applying for job:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/student/apply/internship/:internshipId - Apply for an internship
router.post('/apply/internship/:internshipId', [
  authenticateToken,
  body('coverLetter').optional().isLength({ max: 1000 }).trim().escape(),
  body('resume').optional().isURL()
], handleValidationErrors, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Student privileges required.' });
    }

    const { internshipId } = req.params;
    const { coverLetter, resume } = req.body;

    // Check if internship exists
    const internship = await Internship.findById(internshipId);
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      applicant: req.user.id,
      internship: internshipId
    });

    if (existingApplication) {
      return res.status(409).json({ message: 'Already applied for this internship' });
    }

    // Create application
    const application = new Application({
      applicant: req.user.id,
      internship: internshipId,
      coverLetter,
      resume: resume || req.user.student?.resume,
      status: 'pending'
    });

    await application.save();

    // Increment applicant count for the internship
    await Internship.findByIdAndUpdate(internshipId, { $inc: { applicants: 1 } });

    // Create notification for the internship owner
    try {
      await Notification.createNotification({
        recipient: internship.owner,
        type: 'internship_application',
        title: 'New Internship Application Received',
        message: `${req.user.profile?.firstName || req.user.email} has applied for your internship: ${internship.title}`,
        data: {
          applicationId: application._id.toString(),
          internshipId: internshipId,
          opportunityTitle: internship.title,
          studentName: req.user.profile?.firstName ? `${req.user.profile.firstName} ${req.user.profile.lastName || ''}`.trim() : req.user.email,
          url: `/owner/internship-applicants/${internshipId}`
        },
        priority: 'medium'
      });
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Don't fail the application if notification fails
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    console.error('Error applying for internship:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/student/applications - Get student's applications
router.get('/applications', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Student privileges required.' });
    }

    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const query = { applicant: req.user.id };
    if (status) query.status = status;

    const applications = await Application.find(query)
      .populate('job')
      .populate('internship')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Application.countDocuments(query);

    res.json({
      success: true,
      data: applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/student/jobs - Get available jobs
router.get('/jobs', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Student privileges required.' });
    }

    const { page = 1, limit = 10, search, location, type } = req.query;
    const skip = (page - 1) * limit;

    const query = { status: 'active' };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }
    if (location) query.location = { $regex: location, $options: 'i' };
    if (type) query.type = type;

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
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
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/student/internships - Get available internships
router.get('/internships', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Student privileges required.' });
    }

    const { page = 1, limit = 10, search, location, duration } = req.query;
    const skip = (page - 1) * limit;

    const query = { status: 'active' };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }
    if (location) query.location = { $regex: location, $options: 'i' };
    if (duration) query.duration = duration;

    const internships = await Internship.find(query)
      .sort({ createdAt: -1 })
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
    console.error('Error fetching internships:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
