const express = require('express');
const router = express.Router();
const leaveRequestController = require('../controllers/leaveRequestController');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/leave-requests
// @desc    Get leave requests for a user
// @access  Private
router.get('/', protect, leaveRequestController.getLeaveRequests);

// @route   POST /api/leave-requests
// @desc    Create a new leave request
// @access  Private
router.post('/', protect, leaveRequestController.createLeaveRequest);

// @route   PUT /api/leave-requests/:id
// @desc    Update a leave request
// @access  Private
router.put('/:id', protect, leaveRequestController.updateLeaveRequest);

// @route   DELETE /api/leave-requests/:id
// @desc    Delete a leave request
// @access  Private
router.delete('/:id', protect, leaveRequestController.deleteLeaveRequest);

// @route   GET /api/leave-requests/pending
// @desc    Get all pending leave requests (admin only)
// @access  Private/Admin
router.get('/pending', protect, authorize('admin'), leaveRequestController.getPendingLeaveRequests);

module.exports = router; 