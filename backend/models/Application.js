const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: false,
    },
    internship: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Internship',
        required: false,
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'accepted', 'rejected'],
        default: 'pending',
    },
    coverLetter: {
        type: String,
        trim: true
    },
    resume: {
        type: String,
        trim: true
    },
    submittedDate: {
        type: Date,
        default: Date.now,
    },
    ownerNotes: {
        type: String,
        default: '',
    },
}, {
    timestamps: true
});

// Indexes for efficient querying
applicationSchema.index({ applicant: 1, job: 1 }, { unique: true, sparse: true });
applicationSchema.index({ applicant: 1, internship: 1 }, { unique: true, sparse: true });
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ internship: 1, status: 1 });
applicationSchema.index({ applicant: 1, status: 1 });
applicationSchema.index({ submittedDate: -1 });

// Method to update status
applicationSchema.methods.updateStatus = function(newStatus) {
    this.status = newStatus;
    return this.save();
};

module.exports = mongoose.model('Application', applicationSchema);
