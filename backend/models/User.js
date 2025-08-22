const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['student', 'owner', 'admin'],
    default: 'student'
  },
  profile: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    avatar: {
      type: String,
      default: null
    },
    dateOfBirth: {
      type: Date
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say']
    },
    city: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    }
  },
  business: {
    businessName: {
      type: String,
      trim: true
    },
    businessType: {
      type: String,
      enum: ['restaurant', 'retail', 'service', 'other']
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    taxId: String,
    licenseNumber: String,
    companySize: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '200+']
    },
    foundedYear: {
      type: Number,
      min: 1900,
      max: new Date().getFullYear()
    },
    website: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    gstNumber: {
      type: String,
      trim: true
    },
    panNumber: {
      type: String,
      trim: true
    },
    businessLicense: {
      type: String // URL to uploaded file
    },
    productCategories: [{
      type: String,
      trim: true
    }],
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    },
    verificationNotes: {
      type: String,
      trim: true
    }
  },
  student: {
    education: {
      type: String,
      trim: true
    },
    institution: {
      type: String,
      trim: true
    },
    graduationYear: {
      type: Number,
      min: 1950,
      max: new Date().getFullYear() + 10
    },
    skills: [{
      type: String,
      trim: true
    }],
    currentSemester: {
      type: Number,
      min: 1,
      max: 8,
      default: 1
    },
    cgpa: {
      type: Number,
      min: 0.0,
      max: 10.0,
      default: 0.0
    },
    resume: {
      type: String // URL to uploaded file
    },
    applications: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application'
    }]
  },
  settings: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    language: {
      type: String,
      enum: ['en', 'hi', 'ta'],
      default: 'en'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  // Password reset fields
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },
  // Email verification fields
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String
  },
  emailVerificationExpires: {
    type: Date
  },
  // Account security
  passwordChangedAt: {
    type: Date
  },
  passwordHistory: [{
    password: String,
    changedAt: Date
  }],
  // Session management
  activeSessions: [{
    token: String,
    device: String,
    ip: String,
    createdAt: Date,
    lastActivity: Date
  }]
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ resetPasswordToken: 1 });
userSchema.index({ emailVerificationToken: 1 });
userSchema.index({ 'business.verificationStatus': 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    
    // Update password change timestamp
    this.passwordChangedAt = Date.now();
    
    // Add to password history (keep last 5)
    this.passwordHistory.push({
      password: this.password,
      changedAt: this.passwordChangedAt
    });
    
    // Keep only last 5 passwords
    if (this.passwordHistory.length > 5) {
      this.passwordHistory = this.passwordHistory.slice(-5);
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get full name
userSchema.virtual('fullName').get(function() {
  return `${this.profile.firstName} ${this.profile.lastName}`;
});

// Check if account is locked
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Check if password reset token is valid
userSchema.methods.isResetTokenValid = function() {
  return !!(this.resetPasswordToken && this.resetPasswordExpires > Date.now());
};

// Check if email verification token is valid
userSchema.methods.isEmailVerificationTokenValid = function() {
  return !!(this.emailVerificationToken && this.emailVerificationExpires > Date.now());
};

// Get business profile completion percentage
userSchema.methods.getBusinessProfileCompletion = function() {
  if (this.role !== 'owner') return 0;
  
  const businessFields = [
    'business.businessName',
    'business.businessType',
    'business.address.city',
    'business.companySize',
    'business.description',
    'business.productCategories'
  ];
  
  let completedFields = 0;
  businessFields.forEach(field => {
    const value = field.split('.').reduce((obj, key) => obj?.[key], this);
    if (value && (Array.isArray(value) ? value.length > 0 : true)) {
      completedFields++;
    }
  });
  
  return Math.round((completedFields / businessFields.length) * 100);
};

// Get user profile completion percentage
userSchema.methods.getProfileCompletion = function() {
  const profileFields = [
    'profile.firstName',
    'profile.lastName',
    'profile.phone',
    'profile.city',
    'profile.address'
  ];
  
  let completedFields = 0;
  profileFields.forEach(field => {
    const value = field.split('.').reduce((obj, key) => obj?.[key], this);
    if (value) completedFields++;
  });
  
  return Math.round((completedFields / profileFields.length) * 100);
};

module.exports = mongoose.model('User', userSchema);
