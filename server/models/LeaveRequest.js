const mongoose = require('mongoose');

const LeaveRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestType: {
    type: String,
    enum: ['PL', 'SL', 'C', 'NH'], // Paid Leave, Sick Leave, Compensation, National Holiday
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  documents: [{
    name: String,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Create compound index for efficient querying
LeaveRequestSchema.index({ user: 1, startDate: 1, endDate: 1 });

// Calculate the total days requested
LeaveRequestSchema.virtual('totalDays').get(function() {
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  const timeDiff = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
  // Add 1 because the end date is inclusive
  return diffDays + 1;
});

// Static method to find overlapping leave requests
LeaveRequestSchema.statics.findOverlapping = function(userId, startDate, endDate, excludeId = null) {
  const query = {
    user: userId,
    $or: [
      // New request starts during an existing request
      { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
      // New request ends during an existing request
      { startDate: { $lte: startDate }, endDate: { $gte: startDate } },
      // New request completely contains an existing request
      { startDate: { $gte: startDate }, endDate: { $lte: endDate } }
    ],
    status: { $ne: 'rejected' } // Exclude rejected requests
  };

  // Exclude the current request if updating
  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return this.find(query);
};

const LeaveRequest = mongoose.model('LeaveRequest', LeaveRequestSchema);

module.exports = LeaveRequest; 