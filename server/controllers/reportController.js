const Shift = require('../models/Shift');
const User = require('../models/User');
const shiftUtils = require('../utils/shiftUtils');

/**
 * Generate a weekly report for a user
 * @route GET /api/reports/weekly
 * @access Private
 */
exports.getWeeklyReport = async (req, res) => {
  try {
    const { userId, week, year } = req.query;
    
    // Check if user has permission to access these reports
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access these reports'
      });
    }

    // Validate week and year
    const currentDate = new Date();
    const reportYear = year ? parseInt(year) : currentDate.getFullYear();
    const reportWeek = week ? parseInt(week) : getWeekNumber(currentDate);

    // Calculate start and end dates for the week
    const { startDate, endDate } = getStartAndEndDatesOfWeek(reportWeek, reportYear);

    // Find shifts for user in date range
    const shifts = await Shift.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
      status: 'approved' // Only include approved shifts in reports
    }).sort({ date: 1 });

    // Get user details
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate report
    const report = generateWeeklyReport(shifts, startDate, endDate, user);

    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Weekly report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating weekly report'
    });
  }
};

/**
 * Generate a monthly report for a user
 * @route GET /api/reports/monthly
 * @access Private
 */
exports.getMonthlyReport = async (req, res) => {
  try {
    const { userId, month, year } = req.query;
    
    // Check if user has permission to access these reports
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access these reports'
      });
    }

    // Validate month and year
    const currentDate = new Date();
    const reportYear = year ? parseInt(year) : currentDate.getFullYear();
    const reportMonth = month ? parseInt(month) - 1 : currentDate.getMonth(); // JS months are 0-indexed

    // Calculate start and end dates for the month
    const startDate = new Date(reportYear, reportMonth, 1);
    const endDate = new Date(reportYear, reportMonth + 1, 0, 23, 59, 59, 999);

    // Find shifts for user in date range
    const shifts = await Shift.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
      status: 'approved' // Only include approved shifts in reports
    }).sort({ date: 1 });

    // Get user details
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate report
    const report = generateMonthlyReport(shifts, startDate, endDate, user);

    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Monthly report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating monthly report'
    });
  }
};

/**
 * Generate reports for all users (admin only)
 * @route GET /api/reports/all
 * @access Private/Admin
 */
exports.getAllReports = async (req, res) => {
  try {
    const { month, year, type } = req.query;
    
    // Only admins can access all reports
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access all reports'
      });
    }

    // Validate parameters
    const reportType = type || 'monthly';
    const currentDate = new Date();
    const reportYear = year ? parseInt(year) : currentDate.getFullYear();
    
    let startDate, endDate;
    
    if (reportType === 'monthly') {
      const reportMonth = month ? parseInt(month) - 1 : currentDate.getMonth();
      startDate = new Date(reportYear, reportMonth, 1);
      endDate = new Date(reportYear, reportMonth + 1, 0, 23, 59, 59, 999);
    } else if (reportType === 'weekly') {
      const reportWeek = week ? parseInt(week) : getWeekNumber(currentDate);
      const weekDates = getStartAndEndDatesOfWeek(reportWeek, reportYear);
      startDate = weekDates.startDate;
      endDate = weekDates.endDate;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid report type. Must be "weekly" or "monthly"'
      });
    }

    // Get all users
    const users = await User.find().select('-password');

    // Get all shifts in the date range
    const shifts = await Shift.find({
      date: { $gte: startDate, $lte: endDate },
      status: 'approved'
    }).sort({ date: 1 });

    // Generate reports for each user
    const reports = [];
    
    for (const user of users) {
      const userShifts = shifts.filter(shift => 
        shift.user.toString() === user._id.toString()
      );
      
      const report = reportType === 'weekly' 
        ? generateWeeklyReport(userShifts, startDate, endDate, user)
        : generateMonthlyReport(userShifts, startDate, endDate, user);
        
      reports.push(report);
    }

    res.json({
      success: true,
      reportType,
      period: {
        startDate,
        endDate,
        year: reportYear,
        [reportType === 'monthly' ? 'month' : 'week']: 
          reportType === 'monthly' ? month || currentDate.getMonth() + 1 : week || getWeekNumber(currentDate)
      },
      reports
    });
  } catch (error) {
    console.error('All reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating reports'
    });
  }
};

// Helper functions

/**
 * Generate a weekly report
 * @param {Array} shifts - Array of shifts
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {Object} user - User object
 * @returns {Object} - Weekly report
 */
function generateWeeklyReport(shifts, startDate, endDate, user) {
  // Initialize report object
  const report = {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      department: user.department,
      position: user.position
    },
    period: {
      startDate,
      endDate,
      week: getWeekNumber(startDate),
      year: startDate.getFullYear()
    },
    summary: {
      totalHours: 0,
      totalDays: 0,
      totalLeaves: 0,
      shiftCounts: {
        M: 0, A: 0, N: 0, D: 0, PL: 0, SL: 0, C: 0, NH: 0
      }
    },
    dailyBreakdown: []
  };

  // Create daily breakdown structure for each day in the week
  let currentDay = new Date(startDate);
  while (currentDay <= endDate) {
    report.dailyBreakdown.push({
      date: new Date(currentDay),
      shifts: [],
      totalHours: 0
    });
    currentDay.setDate(currentDay.getDate() + 1);
  }

  // Process each shift
  for (const shift of shifts) {
    // Increment shift type count
    report.summary.shiftCounts[shift.shiftType]++;
    
    // Calculate hours for this shift
    const hours = shiftUtils.calculateHoursWorked(shift.shiftType, shift.date);
    
    // Update summary statistics
    if (['PL', 'SL', 'C', 'NH'].includes(shift.shiftType)) {
      report.summary.totalLeaves++;
    } else {
      report.summary.totalHours += hours;
      report.summary.totalDays++;
    }
    
    // Find the correct day in the daily breakdown
    const shiftDate = new Date(shift.date);
    const dayIndex = Math.floor((shiftDate - startDate) / (24 * 60 * 60 * 1000));
    
    if (dayIndex >= 0 && dayIndex < report.dailyBreakdown.length) {
      report.dailyBreakdown[dayIndex].shifts.push({
        id: shift._id,
        type: shift.shiftType,
        name: shiftUtils.getShiftName(shift.shiftType),
        startTime: shift.startTime,
        endTime: shift.endTime,
        hours
      });
      
      report.dailyBreakdown[dayIndex].totalHours += hours;
    }
  }

  return report;
}

/**
 * Generate a monthly report
 * @param {Array} shifts - Array of shifts
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {Object} user - User object
 * @returns {Object} - Monthly report
 */
function generateMonthlyReport(shifts, startDate, endDate, user) {
  // Initialize report object
  const report = {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      department: user.department,
      position: user.position
    },
    period: {
      startDate,
      endDate,
      month: startDate.getMonth() + 1,
      year: startDate.getFullYear()
    },
    summary: {
      totalHours: 0,
      totalDays: 0,
      totalLeaves: 0,
      shiftCounts: {
        M: 0, A: 0, N: 0, D: 0, PL: 0, SL: 0, C: 0, NH: 0
      }
    },
    weeklyBreakdown: [],
    dailyBreakdown: []
  };

  // Create daily breakdown structure for each day in the month
  let currentDay = new Date(startDate);
  while (currentDay <= endDate) {
    report.dailyBreakdown.push({
      date: new Date(currentDay),
      shifts: [],
      totalHours: 0
    });
    currentDay.setDate(currentDay.getDate() + 1);
  }

  // Process each shift
  for (const shift of shifts) {
    // Increment shift type count
    report.summary.shiftCounts[shift.shiftType]++;
    
    // Calculate hours for this shift
    const hours = shiftUtils.calculateHoursWorked(shift.shiftType, shift.date);
    
    // Update summary statistics
    if (['PL', 'SL', 'C', 'NH'].includes(shift.shiftType)) {
      report.summary.totalLeaves++;
    } else {
      report.summary.totalHours += hours;
      report.summary.totalDays++;
    }
    
    // Find the correct day in the daily breakdown
    const shiftDate = new Date(shift.date);
    const dayIndex = Math.floor((shiftDate - startDate) / (24 * 60 * 60 * 1000));
    
    if (dayIndex >= 0 && dayIndex < report.dailyBreakdown.length) {
      report.dailyBreakdown[dayIndex].shifts.push({
        id: shift._id,
        type: shift.shiftType,
        name: shiftUtils.getShiftName(shift.shiftType),
        startTime: shift.startTime,
        endTime: shift.endTime,
        hours
      });
      
      report.dailyBreakdown[dayIndex].totalHours += hours;
    }
  }

  // Create weekly breakdown by grouping days
  const weeks = {};
  
  for (const day of report.dailyBreakdown) {
    const weekNumber = getWeekNumber(day.date);
    const weekYear = day.date.getFullYear();
    const weekKey = `${weekYear}-${weekNumber}`;
    
    if (!weeks[weekKey]) {
      const weekDates = getStartAndEndDatesOfWeek(weekNumber, weekYear);
      weeks[weekKey] = {
        week: weekNumber,
        year: weekYear,
        startDate: weekDates.startDate,
        endDate: weekDates.endDate,
        totalHours: 0,
        totalDays: 0,
        totalLeaves: 0,
        shiftCounts: { M: 0, A: 0, N: 0, D: 0, PL: 0, SL: 0, C: 0, NH: 0 }
      };
    }
    
    // Add day totals to week
    weeks[weekKey].totalHours += day.totalHours;
    
    // Count shifts by type
    for (const shift of day.shifts) {
      weeks[weekKey].shiftCounts[shift.type]++;
      
      if (['PL', 'SL', 'C', 'NH'].includes(shift.type)) {
        weeks[weekKey].totalLeaves++;
      } else {
        weeks[weekKey].totalDays++;
      }
    }
  }
  
  // Convert weeks object to array and sort by week number
  report.weeklyBreakdown = Object.values(weeks).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.week - b.week;
  });

  return report;
}

/**
 * Get week number for a date
 * @param {Date} date - Date to get week number for
 * @returns {Number} - Week number (1-53)
 */
function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7)); // Set to nearest Thursday
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/**
 * Get start and end dates for a week
 * @param {Number} week - Week number (1-53)
 * @param {Number} year - Year
 * @returns {Object} - { startDate, endDate }
 */
function getStartAndEndDatesOfWeek(week, year) {
  const januaryFirst = new Date(year, 0, 1);
  const dayOfWeek = januaryFirst.getDay() || 7; // Convert Sunday (0) to 7
  
  // Calculate the date of the first day of the first week
  const firstWeekStart = new Date(year, 0, 1 + (1 - dayOfWeek));
  
  // Calculate start date: firstWeekStart + (week - 1) weeks
  const startDate = new Date(firstWeekStart);
  startDate.setDate(firstWeekStart.getDate() + (week - 1) * 7);
  startDate.setHours(0, 0, 0, 0);
  
  // Calculate end date: startDate + 6 days
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);
  
  return { startDate, endDate };
}

module.exports = {
  getWeeklyReport,
  getMonthlyReport,
  getAllReports
}; 