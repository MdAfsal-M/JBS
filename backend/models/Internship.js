const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
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
  duration: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  stipend: {
    type: String,
    required: true,
    trim: true
  },
  stipendType: {
    type: String,
    enum: ['paid', 'unpaid', 'performance-based'],
    default: 'paid'
  },
  requirements: [{
    type: String,
    trim: true
  }],
  responsibilities: [{
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
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  applicationDeadline: {
    type: Date,
    required: true
  },
  maxApplicants: {
    type: Number,
    default: null
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
internshipSchema.index({ owner: 1, status: 1 });
internshipSchema.index({ category: 1, status: 1 });
internshipSchema.index({ location: 1, status: 1 });
internshipSchema.index({ startDate: 1, status: 1 });
internshipSchema.index({ createdAt: -1 });

// Virtual for application deadline
internshipSchema.virtual('isExpired').get(function() {
  return new Date() > this.applicationDeadline;
});

// Virtual for application deadline
internshipSchema.virtual('isFull').get(function() {
  if (!this.maxApplicants) return false;
  return this.applicants >= this.maxApplicants;
});

// Method to increment views
internshipSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to increment applicants
internshipSchema.methods.incrementApplicants = function() {
  this.applicants += 1;
  return this.save();
};

module.exports = mongoose.model('Internship', internshipSchema);
