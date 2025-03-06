const express = require('express');
const router = express.Router();
const shiftController = require('../controllers/shiftController');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/shifts
// @desc    Get shifts for a user
// @access  Private
router.get('/', protect, shiftController.getShifts);

// @route   POST /api/shifts
// @desc    Create a new shift
// @access  Private
router.post('/', protect, shiftController.createShift);

// @route   PUT /api/shifts/:id
// @desc    Update a shift
// @access  Private
router.put('/:id', protect, shiftController.updateShift);

// @route   DELETE /api/shifts/:id
// @desc    Delete a shift
// @access  Private
router.delete('/:id', protect, shiftController.deleteShift);

// @route   GET /api/shifts/calendar
// @desc    Get shifts calendar (admin only)
// @access  Private/Admin
router.get('/calendar', protect, authorize('admin'), shiftController.getCalendar);

module.exports = router; 