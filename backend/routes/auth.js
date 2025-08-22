const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { loginLimiter } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Route-specific logger for owner registration to inspect incoming payloads
const logOwnerRegisterRequest = (req, _res, next) => {
  try {
    console.log('[Owner Register] content-type:', req.headers['content-type']);
    console.log('[Owner Register] raw body:', JSON.stringify(req.body, null, 2));
  } catch (stringifyError) {
    console.warn('[Owner Register] Failed to stringify req.body:', stringifyError);
  }
  next();
};

// Register new user
router.post('/register', [
  body('username').isLength({ min: 3 }).trim().escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').optional().isIn(['owner', 'user'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password, role } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    user = new User({ username, email, password, role: role || 'user' });
    await user.save();

    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

    res.status(201).json({ 
      token, 
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Enhanced Owner Registration
router.post('/owner/register', logOwnerRegisterRequest, [
  // Personal Information Validation
  body('ownerName').isLength({ min: 2, max: 50 }).trim().escape()
    .withMessage('Owner name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('dob').isISO8601().toDate()
    .withMessage('Please enter a valid date of birth'),
  body('gender').isIn(['male', 'female', 'other', 'prefer-not-to-say'])
    .withMessage('Please select a valid gender'),
  body('city').isLength({ min: 2, max: 50 }).trim().escape()
    .withMessage('City must be between 2 and 50 characters'),
  body('phone').custom((value) => {
    if (typeof value !== 'string') return false;
    const digitsOnly = value.replace(/\D/g, '');
    return digitsOnly.length >= 10 && digitsOnly.length <= 15;
  }).withMessage('Please enter a valid phone number'),
  body('address').optional({ checkFalsy: true, nullable: true }).isLength({ max: 500 }).trim().escape()
    .withMessage('Address must be less than 500 characters'),
  
  // Business Information Validation
  body('companyName').isLength({ min: 2, max: 100 }).trim().escape()
    .withMessage('Company name must be between 2 and 100 characters'),
  body('companyLocation').isLength({ min: 2, max: 100 }).trim().escape()
    .withMessage('Company location must be between 2 and 100 characters'),
  body('businessType').isLength({ min: 2, max: 50 }).trim()
    .withMessage('Business type must be between 2 and 50 characters'),
  body('companySize').optional({ checkFalsy: true, nullable: true }).isIn(['1-10', '11-50', '51-200', '200+'])
    .withMessage('Please select a valid company size'),
  body('foundedYear').optional({ checkFalsy: true, nullable: true }).isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage('Founded year must be between 1900 and current year'),
  body('website').optional({ checkFalsy: true, nullable: true }).isURL()
    .withMessage('Please enter a valid website URL'),
  body('description').optional({ checkFalsy: true, nullable: true }).isLength({ max: 1000 }).trim().escape()
    .withMessage('Description must be less than 1000 characters'),
  
  // Product Categories Validation
  body('productCategories').custom((value) => {
    if (Array.isArray(value)) return value.length >= 1;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) && parsed.length >= 1;
      } catch (_) {
        return false;
      }
    }
    return false;
  })
    .withMessage('Please select at least one product category'),
  body('productCategories.*').optional({ nullable: true }).isLength({ min: 2, max: 50 }).trim().escape()
    .withMessage('Product category must be between 2 and 50 characters'),
  
  // Legal Information Validation
  body('gstNumber')
    .optional({ checkFalsy: true, nullable: true })
    .customSanitizer(v => (v == null ? v : String(v).trim().toUpperCase()))
    .isLength({ min: 1 }) // allow any non-empty after trim when provided
    .withMessage('GST number cannot be only whitespace'),
  body('panNumber')
    .optional({ checkFalsy: true, nullable: true })
    .customSanitizer(v => (v == null ? v : String(v).trim().toUpperCase()))
    .isLength({ min: 1 }) // allow any non-empty after trim when provided
    .withMessage('PAN number cannot be only whitespace')
], handleValidationErrors, async (req, res) => {
  try {
    const {
      ownerName,
      dob,
      email,
      gender,
      city,
      phone,
      address,
      companyName,
      companyLocation,
      businessType,
      productCategories,
      companySize,
      foundedYear,
      website,
      description,
      gstNumber,
      panNumber
    } = req.body;

    // Coerce optional fields to safe values
    const coercedCompanySize = companySize && String(companySize).trim().length > 0 ? String(companySize).trim() : undefined;
    const coercedWebsite = website && String(website).trim().length > 0 ? String(website).trim() : undefined;
    const coercedDescription = typeof description === 'string' && description.trim().length > 0 ? description.trim() : undefined;
    const coercedProductCategories = Array.isArray(productCategories)
      ? productCategories.map((c) => (typeof c === 'string' ? c.trim() : c)).filter((c) => typeof c === 'string' && c.length > 0)
      : (typeof productCategories === 'string'
          ? (() => { try { const parsed = JSON.parse(productCategories); return Array.isArray(parsed) ? parsed : []; } catch { return []; } })()
          : []);

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: 'Email already registered',
        code: 'EMAIL_EXISTS'
      });
    }

    // Check if business name already exists (for owners)
    const existingBusiness = await User.findOne({
      'business.businessName': companyName,
      role: 'owner'
    });
    if (existingBusiness) {
      return res.status(409).json({
        message: 'Business name already registered',
        code: 'BUSINESS_EXISTS'
      });
    }

    // Normalize business type to match schema enum
    const normalizeBusinessType = (rawType) => {
      if (!rawType || typeof rawType !== 'string') return 'other';
      const t = rawType.toLowerCase();
      if (t.includes('restaurant') || t.includes('food')) return 'restaurant';
      if (t.includes('retail') || t.includes('shop') || t.includes('store')) return 'retail';
      if (t.includes('service')) return 'service';
      return 'other';
    };
    const normalizedBusinessType = normalizeBusinessType(businessType);

    // Generate username from email
    const username = email.split('@')[0] + '_' + Date.now().toString().slice(-4);

    // Use the password provided by the user
    const userPassword = req.body.password;

    // Create user with owner role
    const user = new User({
      username,
      email,
      password: userPassword,
      role: 'owner',
      profile: {
        firstName: ownerName.split(' ')[0] || ownerName,
        lastName: ownerName.split(' ').slice(1).join(' ') || '-',
        phone,
        dateOfBirth: new Date(dob),
        gender,
        city,
        address
      },
      business: {
        businessName: companyName,
        businessType: normalizedBusinessType,
        address: {
          city: companyLocation
        },
        companySize: coercedCompanySize,
        foundedYear: foundedYear ? parseInt(foundedYear) : undefined,
        website: coercedWebsite,
        description: coercedDescription,
        gstNumber,
        panNumber,
        productCategories: coercedProductCategories,
        verificationStatus: 'pending'
      },
      settings: {
        notifications: {
          email: true,
          sms: false,
          push: true
        },
        theme: 'light',
        language: 'en'
      }
    });

    // Attempt save with granular error logging for diagnostics
    try {
      await user.save();
    } catch (saveError) {
      // Handle duplicate key errors (e.g., email uniqueness)
      if (saveError && (saveError.code === 11000 || saveError.name === 'MongoServerError')) {
        console.error('[Owner Register] Duplicate key error during save:', saveError);
        return res.status(409).json({
          message: 'Duplicate key error',
          code: 'DUPLICATE_KEY',
          details: saveError.keyValue || null
        });
      }

      // Handle Mongoose validation errors explicitly
      if (saveError && saveError.name === 'ValidationError') {
        const validationEntries = Object.entries(saveError.errors || {});
        // Log each field-specific error for clarity
        validationEntries.forEach(([field, fieldError]) => {
          const fieldMessage = fieldError?.message || 'Unknown validation error';
          const fieldKind = fieldError?.kind;
          const fieldValue = fieldError?.value;
          console.error(`[Owner Register] ValidationError - field: ${field}`, {
            message: fieldMessage,
            kind: fieldKind,
            value: fieldValue
          });
        });

        const validationDetails = validationEntries.map(([field, fieldError]) => ({
          path: fieldError?.path || field,
          message: fieldError?.message,
          kind: fieldError?.kind,
          value: fieldError?.value
        }));

        return res.status(400).json({
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          errors: validationDetails
        });
      }

      // Fallback for any other DB/save errors
      console.error('[Owner Register] Database save error:', saveError);
      return res.status(500).json({
        message: 'Database error during owner registration',
        code: 'DB_ERROR'
      });
    }

    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error('[Owner Register] JWT_SECRET is not configured');
      return res.status(500).json({
        message: 'Server configuration error. Please contact administrator.',
        code: 'JWT_CONFIG_ERROR'
      });
    }

    // Generate JWT token
    const payload = { 
      id: user._id, 
      role: user.role,
      email: user.email
    };
    
    let token;
    try {
      token = jwt.sign(payload, process.env.JWT_SECRET, { 
        expiresIn: process.env.JWT_EXPIRE || '24h' 
      });
      console.log('[Owner Register] JWT token generated successfully');
    } catch (jwtError) {
      console.error('[Owner Register] JWT token generation failed:', jwtError);
      return res.status(500).json({
        message: 'Authentication service error. Please try again later.',
        code: 'JWT_GENERATION_ERROR'
      });
    }

    // Log registration event
    try {
      const LoginAnalytics = require('../models/LoginAnalytics');
      await LoginAnalytics.logEvent({
        userId: user._id,
        eventType: 'login_success',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'] || 'Unknown',
        details: {
          reason: 'Owner registration completed'
        }
      });
    } catch (analyticsError) {
      console.error('Error logging registration:', analyticsError);
    }

    // Email sending disabled by request; skipping any email operations
    console.log('[Owner Register] Email sending skipped (disabled)');
    
    // Include credentials in response for development
    const welcomeData = {
      email: user.email,
      password: 'Password provided during registration',
      businessName: companyName
    };

    console.log('[Owner Register] sending 201 for user:', user.email);
    res.status(201).json({
      success: true,
      message: 'Owner registration successful! Welcome to JBS Platform.',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile,
        business: user.business,
        settings: user.settings
      },
      credentials: process.env.NODE_ENV === 'development' ? welcomeData : undefined,
      redirectTo: '/owner-dashboard'
    });

  } catch (error) {
    console.error('Owner registration error:', error);
    res.status(500).json({
      message: 'Server error during owner registration',
      code: 'SERVER_ERROR'
    });
  }
});

// Student Registration Endpoint
router.post('/student/register', [
  // Personal Information Validation
  body('fullName').isLength({ min: 2, max: 100 }).trim().escape()
    .withMessage('Full name must be between 2 and 100 characters'),
  body('email').isEmail().normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&].*$/)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, number and special character'),
  body('dob').isISO8601().toDate()
    .withMessage('Please enter a valid date of birth'),
  body('gender').isIn(['male', 'female', 'other', 'prefer-not-to-say'])
    .withMessage('Please select a valid gender'),
  body('phone').custom((value) => {
    if (value == null || value === '') return false;
    const digitsOnly = String(value).replace(/\D/g, '');
    return digitsOnly.length >= 10 && digitsOnly.length <= 15;
  }).withMessage('Please enter a valid phone number'),
  body('city').isLength({ min: 2, max: 50 }).trim().escape()
    .withMessage('City must be between 2 and 50 characters'),
  body('address').optional().isLength({ max: 500 }).trim().escape()
    .withMessage('Address must be less than 500 characters'),
  
  // Education Information Validation
  body('education').isLength({ min: 2, max: 100 }).trim().escape()
    .withMessage('Education must be between 2 and 100 characters'),
  body('institution').isLength({ min: 2, max: 100 }).trim().escape()
    .withMessage('Institution must be between 2 and 100 characters'),
  body('graduationYear').optional().isInt({ min: 1950, max: new Date().getFullYear() + 10 })
    .withMessage('Graduation year must be valid'),
  body('skills').isArray({ min: 1 })
    .withMessage('Please select at least one skill'),
  body('skills.*').isLength({ min: 2, max: 50 }).trim().escape()
    .withMessage('Skill must be between 2 and 50 characters')
], handleValidationErrors, async (req, res) => {
  try {
    const {
      fullName, email, password, dob, gender, phone, city, address,
      education, institution, graduationYear, skills
    } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered', code: 'EMAIL_EXISTS' });
    }

    // Generate username from email
    const username = email.split('@')[0] + '_' + Date.now().toString().slice(-4);

    // Create user with student role
    const user = new User({
      username, email, password, role: 'student',
      profile: {
        firstName: fullName.split(' ')[0] || fullName,
        lastName: fullName.split(' ').slice(1).join(' ') || '',
        phone, dateOfBirth: new Date(dob), gender, city, address
      },
      student: {
        education, institution, graduationYear: graduationYear ? parseInt(graduationYear) : undefined,
        skills, currentSemester: 1, cgpa: 0.0
      },
      settings: { 
        notifications: { email: true, sms: false, push: true }, 
        theme: 'light', 
        language: 'en' 
      }
    });

    await user.save();

    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error('[Student Register] JWT_SECRET is not configured');
      return res.status(500).json({
        message: 'Server configuration error. Please contact administrator.',
        code: 'JWT_CONFIG_ERROR'
      });
    }

    // Generate JWT token
    const payload = { id: user._id, role: user.role, email: user.email };
    
    let token;
    try {
      token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '24h' });
      console.log('[Student Register] JWT token generated successfully');
    } catch (jwtError) {
      console.error('[Student Register] JWT token generation failed:', jwtError);
      return res.status(500).json({
        message: 'Authentication service error. Please try again later.',
        code: 'JWT_GENERATION_ERROR'
      });
    }

    // Log registration event
    try {
      const LoginAnalytics = require('../models/LoginAnalytics');
      await LoginAnalytics.logEvent({
        userId: user._id, eventType: 'login_success',
        ipAddress: req.ip || req.connection.remoteAddress, 
        userAgent: req.headers['user-agent'] || 'Unknown',
        details: { reason: 'Student registration completed' }
      });
    } catch (analyticsError) { 
      console.error('Error logging registration:', analyticsError); 
    }

    // Email sending disabled by request; skipping any email operations
    console.log('[Student Register] Email sending skipped (disabled)');

    console.log('[Student Register] sending 201 for user:', user.email);
    res.status(201).json({
      success: true, 
      message: 'Student registration successful! Welcome to JBS Platform.',
      token, 
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email, 
        role: user.role, 
        profile: user.profile, 
        student: user.student, 
        settings: user.settings 
      },
      redirectTo: '/student-dashboard'
    });
  } catch (error) {
    console.error('Student registration error:', error);
    res.status(500).json({ message: 'Server error during student registration', code: 'SERVER_ERROR' });
  }
});

// Enhanced Login user with user type validation
router.post('/login', loginLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email address'),
  body('password').exists().withMessage('Password is required'),
  body('userType').optional().isIn(['student', 'owner']).withMessage('User type must be either student or owner'),
  body('rememberMe').optional().isBoolean().withMessage('Remember me must be a boolean value')
], handleValidationErrors, async (req, res) => {
  const { email, password, userType, rememberMe } = req.body;

  // Debug logging
  console.log('[LOGIN] Attempting login for email:', email);
  console.log('[LOGIN] User type requested:', userType);
  console.log('[LOGIN] JWT_SECRET exists:', !!process.env.JWT_SECRET);

  try {
    // Find user by email
    const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');
    
    if (!user) {
      console.log('[LOGIN] User not found for email:', email);
      return res.status(401).json({ 
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      const lockTime = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
      return res.status(423).json({
        message: `Account is temporarily locked. Please try again in ${lockTime} minutes.`,
        code: 'ACCOUNT_LOCKED',
        lockTime: lockTime
      });
    }

    // Verify password
    console.log('[LOGIN] User found, role:', user.role);
    console.log('[LOGIN] Attempting password comparison...');
    
    const isMatch = await user.comparePassword(password);
    console.log('[LOGIN] Password match result:', isMatch);
    
    if (!isMatch) {
      console.log('[LOGIN] Password mismatch for user:', user._id);
      // Increment failed login attempts
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      
      // Lock account after 5 failed attempts for 15 minutes
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + (15 * 60 * 1000); // 15 minutes
      }
      
      await user.save();
      
      // Log failed login attempt
      try {
        const LoginAnalytics = require('../models/LoginAnalytics');
        await LoginAnalytics.logEvent({
          userId: user._id,
          eventType: 'login_failed',
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'] || 'Unknown',
          details: {
            reason: 'Invalid password',
            attemptCount: user.loginAttempts
          }
        });
      } catch (analyticsError) {
        console.error('Error logging failed login:', analyticsError);
      }
      
      return res.status(401).json({ 
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS',
        remainingAttempts: Math.max(0, 5 - user.loginAttempts)
      });
    }

    // Validate user type if provided
    if (userType && user.role !== userType) {
      return res.status(403).json({
        message: `Invalid user type. This account is registered as ${user.role}.`,
        code: 'INVALID_USER_TYPE',
        actualRole: user.role
      });
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = Date.now();
    
    // Track session
    const deviceInfo = req.headers['user-agent'] || 'Unknown Device';
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    // Add new session
    user.activeSessions.push({
      token: '', // Will be set after token generation
      device: deviceInfo,
      ip: ipAddress,
      createdAt: Date.now(),
      lastActivity: Date.now()
    });
    
    // Keep only last 10 sessions
    if (user.activeSessions.length > 10) {
      user.activeSessions = user.activeSessions.slice(-10);
    }
    
    await user.save();

    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error('[LOGIN] JWT_SECRET is not configured');
      return res.status(500).json({
        message: 'Server configuration error. Please contact administrator.',
        code: 'JWT_CONFIG_ERROR'
      });
    }

    // Generate JWT token with appropriate expiration
    console.log('[LOGIN] Password verified successfully, generating JWT token...');
    
    const payload = { 
      id: user._id, 
      role: user.role,
      email: user.email
    };
    
    const tokenExpiry = rememberMe ? '30d' : process.env.JWT_EXPIRE || '24h';
    console.log('[LOGIN] Token expiry:', tokenExpiry);
    console.log('[LOGIN] JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 'NOT SET');
    
    let token;
    try {
      token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: tokenExpiry });
      console.log('[LOGIN] JWT token generated successfully');
    } catch (jwtError) {
      console.error('[LOGIN] JWT token generation failed:', jwtError);
      return res.status(500).json({
        message: 'Authentication service error. Please try again later.',
        code: 'JWT_GENERATION_ERROR'
      });
    }
    
    // Update the session token
    const sessionIndex = user.activeSessions.length - 1;
    user.activeSessions[sessionIndex].token = token;
    await user.save();

    // Log successful login
    try {
      const LoginAnalytics = require('../models/LoginAnalytics');
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'] || 'Unknown';
      
      // Detect suspicious activity
      const suspiciousActivity = await LoginAnalytics.detectSuspiciousActivity(
        user._id, 
        ipAddress, 
        userAgent
      );
      
      await LoginAnalytics.logEvent({
        userId: user._id,
        eventType: 'login_success',
        ipAddress: ipAddress,
        userAgent: userAgent,
        riskScore: suspiciousActivity.riskScore,
        isSuspicious: suspiciousActivity.isSuspicious,
        details: {
          sessionId: sessionIndex,
          reason: suspiciousActivity.reasons.join(', ')
        }
      });
    } catch (analyticsError) {
      console.error('Error logging successful login:', analyticsError);
    }

    // Prepare user data for response
    const userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profile: user.profile,
      business: user.business,
      settings: user.settings,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    };

    // Add role-specific redirect information
    const redirectInfo = {
      student: '/student-dashboard',
      owner: '/owner-dashboard'
    };

    console.log('[LOGIN] Sending successful response for user:', user._id);
    console.log('[LOGIN] User role:', user.role);
    console.log('[LOGIN] Redirect to:', redirectInfo[user.role]);
    
    res.json({ 
      success: true,
      message: 'Login successful',
      token,
      user: userData,
      redirectTo: redirectInfo[user.role] || '/dashboard',
      expiresIn: tokenExpiry,
      rememberMe: !!rememberMe
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error during login',
      code: 'SERVER_ERROR'
    });
  }
});

// Logout user (optional - for session management)
router.post('/logout', async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // This endpoint can be used for logging logout events
    res.json({ 
      success: true,
      message: 'Logout successful' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
});

// Get current user profile
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile,
        business: user.business,
        settings: user.settings,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate new token
    const payload = { 
      id: user._id, 
      role: user.role,
      email: user.email
    };
    
    const newToken = jwt.sign(payload, process.env.JWT_SECRET, { 
      expiresIn: process.env.JWT_EXPIRE || '24h' 
    });

    res.json({ 
      success: true,
      token: newToken,
      expiresIn: process.env.JWT_EXPIRE || '24h'
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Request password reset
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email address')
], handleValidationErrors, async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ 
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user._id, type: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Store reset token in user document
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // TODO: Send email with reset link
    // For now, we'll just return the token (in production, send via email)
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    res.json({
      success: true,
      message: 'Password reset link sent to your email',
      resetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      message: 'Server error during password reset request',
      code: 'SERVER_ERROR'
    });
  }
});

// Verify reset token
router.post('/verify-reset-token', [
  body('token').exists().withMessage('Reset token is required')
], handleValidationErrors, async (req, res) => {
  try {
    const { token } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'password_reset') {
      return res.status(400).json({ 
        message: 'Invalid reset token',
        code: 'INVALID_TOKEN'
      });
    }

    const user = await User.findOne({
      _id: decoded.id,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Reset token is invalid or has expired',
        code: 'INVALID_TOKEN'
      });
    }

    res.json({
      success: true,
      message: 'Reset token is valid',
      email: user.email
    });

  } catch (error) {
    console.error('Verify reset token error:', error);
    res.status(400).json({ 
      message: 'Invalid or expired reset token',
      code: 'INVALID_TOKEN'
    });
  }
});

// Reset password
router.post('/reset-password', [
  body('token').exists().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], handleValidationErrors, async (req, res) => {
  try {
    const { token, password } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'password_reset') {
      return res.status(400).json({ 
        message: 'Invalid reset token',
        code: 'INVALID_TOKEN'
      });
    }

    const user = await User.findOne({
      _id: decoded.id,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Reset token is invalid or has expired',
        code: 'INVALID_TOKEN'
      });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password has been reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      message: 'Server error during password reset',
      code: 'SERVER_ERROR'
    });
  }
});

// Change password (for logged-in users)
router.post('/change-password', [
  body('currentPassword').exists().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
], handleValidationErrors, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Get user from token
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ 
        message: 'Current password is incorrect',
        code: 'INVALID_PASSWORD'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      message: 'Server error during password change',
      code: 'SERVER_ERROR'
    });
  }
});

// Get active sessions
router.get('/sessions', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Filter out expired sessions
    const activeSessions = user.activeSessions.filter(session => 
      session.lastActivity > Date.now() - (24 * 60 * 60 * 1000) // 24 hours
    );

    res.json({
      success: true,
      sessions: activeSessions.map(session => ({
        id: session._id,
        device: session.device,
        ip: session.ip,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
        isCurrent: session.token === token
      }))
    });

  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching sessions',
      code: 'SERVER_ERROR'
    });
  }
});

// Revoke session
router.delete('/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove the specified session
    user.activeSessions = user.activeSessions.filter(session => 
      session._id.toString() !== sessionId
    );

    await user.save();

    res.json({
      success: true,
      message: 'Session revoked successfully'
    });

  } catch (error) {
    console.error('Revoke session error:', error);
    res.status(500).json({ 
      message: 'Server error while revoking session',
      code: 'SERVER_ERROR'
    });
  }
});

// Revoke all other sessions (keep current)
router.delete('/sessions', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Keep only the current session
    user.activeSessions = user.activeSessions.filter(session => 
      session.token === token
    );

    await user.save();

    res.json({
      success: true,
      message: 'All other sessions revoked successfully'
    });

  } catch (error) {
    console.error('Revoke all sessions error:', error);
    res.status(500).json({ 
      message: 'Server error while revoking sessions',
      code: 'SERVER_ERROR'
    });
  }
});

// Update session activity
router.put('/sessions/activity', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update last activity for current session
    const session = user.activeSessions.find(s => s.token === token);
    if (session) {
      session.lastActivity = Date.now();
      await user.save();
    }

    res.json({
      success: true,
      message: 'Session activity updated'
    });

  } catch (error) {
    console.error('Update session activity error:', error);
    res.status(500).json({ 
      message: 'Server error while updating session activity',
      code: 'SERVER_ERROR'
    });
  }
});

// Get login analytics
router.get('/analytics', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const LoginAnalytics = require('../models/LoginAnalytics');
    const days = parseInt(req.query.days) || 30;

    // Get login statistics
    const loginStats = await LoginAnalytics.getLoginStats(user._id, days);
    
    // Get geographic data
    const geographicData = await LoginAnalytics.getGeographicData(user._id, days);
    
    // Get device statistics
    const deviceStats = await LoginAnalytics.getDeviceStats(user._id, days);

    // Get recent suspicious activities
    const suspiciousActivities = await LoginAnalytics.find({
      userId: user._id,
      isSuspicious: true,
      timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    }).sort({ timestamp: -1 }).limit(10);

    res.json({
      success: true,
      analytics: {
        loginStats,
        geographicData,
        deviceStats,
        suspiciousActivities: suspiciousActivities.map(activity => ({
          eventType: activity.eventType,
          timestamp: activity.timestamp,
          ipAddress: activity.ipAddress,
          riskScore: activity.riskScore,
          details: activity.details
        }))
      }
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching analytics',
      code: 'SERVER_ERROR'
    });
  }
});

// Get security insights
router.get('/security-insights', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const LoginAnalytics = require('../models/LoginAnalytics');

    // Get recent login events for analysis
    const recentEvents = await LoginAnalytics.find({
      userId: user._id,
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    }).sort({ timestamp: -1 });

    // Analyze security patterns
    const failedAttempts = recentEvents.filter(event => event.eventType === 'login_failed').length;
    const successfulLogins = recentEvents.filter(event => event.eventType === 'login_success').length;
    const uniqueIPs = [...new Set(recentEvents.map(event => event.ipAddress))].length;
    const uniqueDevices = [...new Set(recentEvents.map(event => event.userAgent))].length;

    // Calculate security score
    let securityScore = 100;
    if (failedAttempts > 0) securityScore -= failedAttempts * 10;
    if (uniqueIPs > 3) securityScore -= 20;
    if (uniqueDevices > 2) securityScore -= 15;
    securityScore = Math.max(0, securityScore);

    // Generate security recommendations
    const recommendations = [];
    if (failedAttempts > 0) {
      recommendations.push('Consider enabling two-factor authentication');
    }
    if (uniqueIPs > 3) {
      recommendations.push('Multiple IP addresses detected - review recent logins');
    }
    if (uniqueDevices > 2) {
      recommendations.push('Multiple devices detected - consider reviewing active sessions');
    }
    if (securityScore < 70) {
      recommendations.push('Security score is low - review account security settings');
    }

    res.json({
      success: true,
      securityInsights: {
        securityScore,
        failedAttempts,
        successfulLogins,
        uniqueIPs,
        uniqueDevices,
        recommendations,
        lastLogin: user.lastLogin,
        accountAge: Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24)) // days
      }
    });

  } catch (error) {
    console.error('Get security insights error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching security insights',
      code: 'SERVER_ERROR'
    });
  }
});

module.exports = router;
