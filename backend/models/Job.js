const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
    default: 'full-time'
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  pay: {
    type: String,
    required: true,
    trim: true
  },
  payType: {
    type: String,
    enum: ['hourly', 'daily', 'weekly', 'monthly', 'yearly', 'project-based'],
    default: 'monthly'
  },
  experience: {
    type: String,
    required: true,
    trim: true
  },
  requirements: [{
    type: String,
    trim: true
  }],
  benefits: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft', 'expired'],
    default: 'active'
  },
  views: {
    type: Number,
    default: 0
  },
  applicants: {
    type: Number,
    default: 0
  },
  isRemote: {
    type: Boolean,
    default: false
  },
  isUrgent: {
    type: Boolean,
    default: false
  },
  deadline: {
    type: Date
  },
  tags: [{
    type: String,
    trim: true
  }],
  contactInfo: {
    email: String,
    phone: String,
    website: String
  },
  applicationInstructions: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
jobSchema.index({ owner: 1, status: 1 });
jobSchema.index({ category: 1, status: 1 });
jobSchema.index({ location: 1, status: 1 });
jobSchema.index({ jobType: 1, status: 1 });
jobSchema.index({ createdAt: -1 });

// Virtual for application deadline
jobSchema.virtual('isExpired').get(function() {
  if (!this.deadline) return false;
  return new Date() > this.deadline;
});

// Method to increment views
jobSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to increment applicants
jobSchema.methods.incrementApplicants = function() {
  this.applicants += 1;
  return this.save();
};

module.exports = mongoose.model('Job', jobSchema);
