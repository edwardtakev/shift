/**
 * Utility functions for shift-related operations
 */

// Shift time definitions in hours and minutes
const SHIFT_TIMES = {
  M: { start: { hours: 6, minutes: 48 }, end: { hours: 15, minutes: 0 } },  // 06:48 AM to 03:00 PM
  A: { start: { hours: 14, minutes: 48 }, end: { hours: 23, minutes: 0 } }, // 02:48 PM to 11:00 PM
  N: { start: { hours: 22, minutes: 48 }, end: { hours: 7, minutes: 0 } },  // 10:48 PM to 07:00 AM (next day)
  D: { start: { hours: 9, minutes: 0 }, end: { hours: 18, minutes: 0 } }    // 09:00 AM to 06:00 PM
};

/**
 * Calculate start and end time for a given shift type and date
 * @param {String} shiftType - One of 'M', 'A', 'N', 'D'
 * @param {Date} date - The date of the shift
 * @returns {Object} - { startTime, endTime }
 */
function calculateShiftTimes(shiftType, date) {
  if (!SHIFT_TIMES[shiftType]) {
    throw new Error(`Invalid shift type: ${shiftType}`);
  }

  const shiftDate = new Date(date);
  const startTime = new Date(shiftDate);
  const endTime = new Date(shiftDate);

  // Set hours and minutes according to shift type
  startTime.setHours(SHIFT_TIMES[shiftType].start.hours, SHIFT_TIMES[shiftType].start.minutes, 0, 0);
  endTime.setHours(SHIFT_TIMES[shiftType].end.hours, SHIFT_TIMES[shiftType].end.minutes, 0, 0);

  // Handle night shift that spans over two days
  if (shiftType === 'N' && endTime < startTime) {
    endTime.setDate(endTime.getDate() + 1);
  }

  return { startTime, endTime };
}

/**
 * Calculate hours worked for a given shift
 * @param {String} shiftType - The type of shift
 * @param {Date} date - The date of the shift
 * @returns {Number} - Hours worked
 */
function calculateHoursWorked(shiftType, date) {
  if (['PL', 'SL', 'C', 'NH'].includes(shiftType)) {
    return 0; // No hours worked for leave days
  }

  const { startTime, endTime } = calculateShiftTimes(shiftType, date);
  const diffMs = endTime - startTime;
  return diffMs / (1000 * 60 * 60); // Convert milliseconds to hours
}

/**
 * Get shift name for display purposes
 * @param {String} shiftType - The shift type code
 * @returns {String} - The shift name
 */
function getShiftName(shiftType) {
  const shiftNames = {
    M: 'Morning Shift',
    A: 'Afternoon Shift',
    N: 'Night Shift',
    D: 'Day Shift',
    PL: 'Paid Leave',
    SL: 'Sick Leave',
    C: 'Compensation',
    NH: 'National Holiday'
  };
  
  return shiftNames[shiftType] || 'Unknown Shift';
}

/**
 * Check if a date has at least one of each required shift (M, A, N)
 * @param {Array} shifts - Array of shifts for a specific date
 * @returns {Object} - { isComplete, missingShifts }
 */
function checkRequiredShifts(shifts) {
  const requiredShifts = ['M', 'A', 'N'];
  const shiftTypes = shifts.map(shift => shift.shiftType);
  
  const missingShifts = requiredShifts.filter(type => !shiftTypes.includes(type));
  
  return {
    isComplete: missingShifts.length === 0,
    missingShifts
  };
}

/**
 * Generate a weekly report for a user
 * @param {Array} shifts - Array of shifts
 * @returns {Object} - Weekly report with total hours
 */
function generateWeeklyReport(shifts) {
  const report = {
    totalHours: 0,
    regularHours: 0,
    totalDays: 0,
    totalLeaves: 0,
    shiftBreakdown: {
      M: 0,
      A: 0,
      N: 0,
      D: 0,
      PL: 0,
      SL: 0,
      C: 0,
      NH: 0
    }
  };

  shifts.forEach(shift => {
    // Count each shift type
    report.shiftBreakdown[shift.shiftType]++;
    
    // Calculate hours for non-leave shifts
    if (!['PL', 'SL', 'C', 'NH'].includes(shift.shiftType)) {
      const hours = calculateHoursWorked(shift.shiftType, shift.date);
      report.totalHours += hours;
      report.regularHours += hours;
      report.totalDays++;
    } else {
      // Count leaves
      report.totalLeaves++;
    }
  });

  return report;
}

module.exports = {
  calculateShiftTimes,
  calculateHoursWorked,
  getShiftName,
  checkRequiredShifts,
  generateWeeklyReport
}; 