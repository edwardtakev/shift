const mongoose = require('mongoose');

const ShiftSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  shiftType: {
    type: String,
    enum: ['M', 'A', 'N', 'D', 'PL', 'SL', 'C', 'NH'],
    required: true
  },
  // Calculated based on shift type
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  // For shift suggestions and holiday requests
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true
  },
  isUserSuggested: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Create index for efficient queries
ShiftSchema.index({ user: 1, date: 1 });

// Helper method to calculate hours worked
ShiftSchema.methods.calculateHours = function() {
  // Skip calculation for leave types
  if (['PL', 'SL', 'C', 'NH'].includes(this.shiftType)) {
    return 0;
  }

  const start = new Date(this.startTime);
  const end = new Date(this.endTime);
  const diffMs = end - start;
  return diffMs / (1000 * 60 * 60); // Convert to hours
};

// Static method to get shifts by date range
ShiftSchema.statics.findByDateRange = function(userId, startDate, endDate) {
  return this.find({
    user: userId,
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: 1 });
};

// Virtual field for duration in hours
ShiftSchema.virtual('durationHours').get(function() {
  return this.calculateHours();
});

const Shift = mongoose.model('Shift', ShiftSchema);

module.exports = Shift; 