const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');
const Shift = require('../models/Shift');
const shiftUtils = require('../utils/shiftUtils');

/**
 * Get leave requests for a user
 * @route GET /api/leave-requests
 * @access Private
 */
exports.getLeaveRequests = async (req, res) => {
  try {
    const { userId, status } = req.query;
    
    // Check if user has permission to access these leave requests
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access these leave requests'
      });
    }

    // Set up query
    const query = { user: userId };
    
    // Filter by status if provided
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query.status = status;
    }

    // Find leave requests for user
    const leaveRequests = await LeaveRequest.find(query)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: leaveRequests.length,
      leaveRequests
    });
  } catch (error) {
    console.error('Get leave requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching leave requests'
    });
  }
};

/**
 * Create a new leave request
 * @route POST /api/leave-requests
 * @access Private
 */
exports.createLeaveRequest = async (req, res) => {
  try {
    const { requestType, startDate, endDate, reason } = req.body;
    
    // Validate request type
    if (!['PL', 'SL', 'C', 'NH'].includes(requestType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request type'
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }
    
    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    // Check for overlapping leave requests
    const overlappingRequests = await LeaveRequest.findOverlapping(req.user.id, start, end);
    if (overlappingRequests.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending or approved leave request for this period'
      });
    }

    // Create new leave request
    const leaveRequest = new LeaveRequest({
      user: req.user.id,
      requestType,
      startDate: start,
      endDate: end,
      reason
    });

    await leaveRequest.save();

    res.status(201).json({
      success: true,
      leaveRequest
    });
  } catch (error) {
    console.error('Create leave request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating leave request'
    });
  }
};

/**
 * Update a leave request
 * @route PUT /api/leave-requests/:id
 * @access Private
 */
exports.updateLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { requestType, startDate, endDate, reason, status } = req.body;

    // Find the leave request
    const leaveRequest = await LeaveRequest.findById(id);
    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && req.user.id.toString() !== leaveRequest.user.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this leave request'
      });
    }

    // Regular users cannot update approved requests
    if (req.user.role !== 'admin' && leaveRequest.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update an approved leave request'
      });
    }

    // Update fields if provided
    let updateData = {};
    
    // Only unprocessed requests can have their details modified
    if (leaveRequest.status === 'pending') {
      if (requestType && ['PL', 'SL', 'C', 'NH'].includes(requestType)) {
        updateData.requestType = requestType;
      }
      
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Invalid date format'
          });
        }
        
        if (end < start) {
          return res.status(400).json({
            success: false,
            message: 'End date must be after start date'
          });
        }
        
        // Check for overlapping leave requests
        const overlappingRequests = await LeaveRequest.findOverlapping(
          leaveRequest.user, 
          start, 
          end, 
          id
        );
        
        if (overlappingRequests.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'You already have a pending or approved leave request for this period'
          });
        }
        
        updateData.startDate = start;
        updateData.endDate = end;
      }
      
      if (reason) {
        updateData.reason = reason;
      }
    }
    
    // Only admins can change status
    if (status && req.user.role === 'admin') {
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }
      
      updateData.status = status;
      
      if (status === 'approved') {
        updateData.approvedBy = req.user.id;
        
        // When approving, create Shift entries for each day in the leave period
        if (leaveRequest.status !== 'approved') {
          // Create shift entries for each day in the leave period
          await createShiftsForLeave(leaveRequest);
        }
      } else if (status === 'rejected') {
        updateData.rejectionReason = req.body.rejectionReason;
        
        // When rejecting, remove any previously created shift entries
        if (leaveRequest.status === 'approved') {
          await removeShiftsForLeave(leaveRequest);
        }
      }
    }
    
    // Update the leave request
    const updatedLeaveRequest = await LeaveRequest.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      leaveRequest: updatedLeaveRequest
    });
  } catch (error) {
    console.error('Update leave request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating leave request'
    });
  }
};

/**
 * Delete a leave request
 * @route DELETE /api/leave-requests/:id
 * @access Private
 */
exports.deleteLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the leave request
    const leaveRequest = await LeaveRequest.findById(id);
    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && req.user.id.toString() !== leaveRequest.user.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this leave request'
      });
    }

    // Users cannot delete approved requests
    if (req.user.role !== 'admin' && leaveRequest.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete an approved leave request'
      });
    }

    // If the request was approved, remove the shift entries
    if (leaveRequest.status === 'approved') {
      await removeShiftsForLeave(leaveRequest);
    }

    await leaveRequest.remove();

    res.json({
      success: true,
      message: 'Leave request deleted successfully'
    });
  } catch (error) {
    console.error('Delete leave request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting leave request'
    });
  }
};

/**
 * Get all pending leave requests (admin only)
 * @route GET /api/leave-requests/pending
 * @access Private/Admin
 */
exports.getPendingLeaveRequests = async (req, res) => {
  try {
    // Only admins can access all pending requests
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access all pending leave requests'
      });
    }

    // Find all pending leave requests
    const pendingRequests = await LeaveRequest.find({ status: 'pending' })
      .populate('user', 'name email')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      count: pendingRequests.length,
      leaveRequests: pendingRequests
    });
  } catch (error) {
    console.error('Get pending leave requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching pending leave requests'
    });
  }
};

// Helper functions

/**
 * Create shift entries for each day in a leave period
 * @param {Object} leaveRequest - Leave request object
 */
async function createShiftsForLeave(leaveRequest) {
  try {
    const { user, requestType, startDate, endDate } = leaveRequest;
    
    // Calculate number of days in the leave period
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Include end date
    
    // Create a shift for each day
    const shiftsToCreate = [];
    
    for (let i = 0; i < diffDays; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      
      // Check if a shift already exists for this day
      const existingShift = await Shift.findOne({
        user,
        date: {
          $gte: new Date(date.setHours(0, 0, 0, 0)),
          $lte: new Date(date.setHours(23, 59, 59, 999))
        },
        shiftType: requestType
      });
      
      if (!existingShift) {
        // Set start and end times for the full day
        const shiftStart = new Date(date);
        shiftStart.setHours(0, 0, 0, 0);
        
        const shiftEnd = new Date(date);
        shiftEnd.setHours(23, 59, 59, 999);
        
        shiftsToCreate.push({
          user,
          date,
          shiftType: requestType,
          startTime: shiftStart,
          endTime: shiftEnd,
          status: 'approved',
          notes: `Automatically created from ${requestType} request`,
          isUserSuggested: false,
          createdBy: leaveRequest.approvedBy || user
        });
      }
    }
    
    // Create all shifts at once
    if (shiftsToCreate.length > 0) {
      await Shift.insertMany(shiftsToCreate);
    }
  } catch (error) {
    console.error('Create shifts for leave error:', error);
    throw error;
  }
}

/**
 * Remove shift entries for a leave period
 * @param {Object} leaveRequest - Leave request object
 */
async function removeShiftsForLeave(leaveRequest) {
  try {
    const { user, requestType, startDate, endDate } = leaveRequest;
    
    // Find and remove all shifts for this leave period
    await Shift.deleteMany({
      user,
      shiftType: requestType,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      },
      notes: { $regex: `Automatically created from ${requestType} request` }
    });
  } catch (error) {
    console.error('Remove shifts for leave error:', error);
    throw error;
  }
}

module.exports = {
  getLeaveRequests,
  createLeaveRequest,
  updateLeaveRequest,
  deleteLeaveRequest,
  getPendingLeaveRequests
}; 