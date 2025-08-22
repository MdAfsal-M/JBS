const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  opportunityType: {
    type: String,
    required: [true, 'Opportunity type is required'],
    enum: {
      values: ['Job', 'Internship'],
      message: 'Opportunity type must be either "Job" or "Internship"'
    }
  },
  applicationDeadline: {
    type: Date,
    required: [true, 'Application deadline is required']
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner ID is required']
  },
  postedDate: {
    type: Date,
    default: Date.now
  },
  // Job-specific fields
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'freelance'],
    trim: true
  },
  salary: {
    type: String,
    trim: true
  },
  payType: {
    type: String,
    enum: ['hourly', 'daily', 'weekly', 'monthly', 'yearly', 'project-based'],
    trim: true
  },
  experience: {
    type: String,
    trim: true,
    maxlength: [200, 'Experience description cannot exceed 200 characters']
  },
  // Internship-specific fields
  duration: {
    type: String,
    trim: true,
    maxlength: [100, 'Duration cannot exceed 100 characters']
  },
  stipend: {
    type: String,
    trim: true,
    maxlength: [100, 'Stipend cannot exceed 100 characters']
  },
  stipendType: {
    type: String,
    enum: ['paid', 'unpaid', 'performance-based'],
    trim: true
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  // Common fields
  requirements: [{
    type: String,
    trim: true,
    maxlength: [200, 'Each requirement cannot exceed 200 characters']
  }],
  benefits: [{
    type: String,
    trim: true,
    maxlength: [200, 'Each benefit cannot exceed 200 characters']
  }],
  isRemote: {
    type: Boolean,
    default: false
  },
  isUrgent: {
    type: Boolean,
    default: false
  },
  maxApplicants: {
    type: Number,
    min: 1
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Each tag cannot exceed 50 characters']
  }],
  contactInfo: {
    email: {
      type: String,
      trim: true,
      maxlength: [100, 'Email cannot exceed 100 characters']
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, 'Phone cannot exceed 20 characters']
    },
    website: {
      type: String,
      trim: true,
      maxlength: [200, 'Website cannot exceed 200 characters']
    }
  },
  applicationInstructions: {
    type: String,
    trim: true,
    maxlength: [1000, 'Application instructions cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired'],
    default: 'active'
  },
  views: {
    type: Number,
    default: 0
  },
  applications: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
opportunitySchema.index({ ownerId: 1, status: 1 });
opportunitySchema.index({ opportunityType: 1, status: 1 });
opportunitySchema.index({ location: 1, status: 1 });
opportunitySchema.index({ applicationDeadline: 1, status: 1 });
opportunitySchema.index({ postedDate: -1 });

// Virtual for checking if opportunity is expired
opportunitySchema.virtual('isExpired').get(function() {
  return new Date() > this.applicationDeadline;
});

// Method to increment views
opportunitySchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to increment applications
opportunitySchema.methods.incrementApplications = function() {
  this.applications += 1;
  return this.save();
};

// Pre-save middleware to update status based on deadline
opportunitySchema.pre('save', function(next) {
  if (this.applicationDeadline < new Date()) {
    this.status = 'expired';
  }
  next();
});

module.exports = mongoose.model('Opportunity', opportunitySchema);
