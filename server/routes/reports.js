const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/reports/weekly
// @desc    Get weekly report for a user
// @access  Private
router.get('/weekly', protect, reportController.getWeeklyReport);

// @route   GET /api/reports/monthly
// @desc    Get monthly report for a user
// @access  Private
router.get('/monthly', protect, reportController.getMonthlyReport);

// @route   GET /api/reports/all
// @desc    Get reports for all users (admin only)
// @access  Private/Admin
router.get('/all', protect, authorize('admin'), reportController.getAllReports);

module.exports = router; 