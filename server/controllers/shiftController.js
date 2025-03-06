const Shift = require('../models/Shift');
const User = require('../models/User');
const shiftUtils = require('../utils/shiftUtils');

/**
 * Get shifts for a specific user within a date range
 * @route GET /api/shifts
 * @access Private
 */
exports.getShifts = async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;
    
    // Check if user has permission to access these shifts
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access these shifts'
      });
    }

    // Validate dates
    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);
    
    const end = endDate ? new Date(endDate) : new Date(start);
    end.setDate(end.getDate() + 7); // Default to 7 days if endDate not provided
    end.setHours(23, 59, 59, 999);

    // Find shifts for user in date range
    const shifts = await Shift.find({
      user: userId,
      date: { $gte: start, $lte: end }
    }).sort({ date: 1 });

    res.json({
      success: true,
      shifts
    });
  } catch (error) {
    console.error('Get shifts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching shifts'
    });
  }
};

/**
 * Create a new shift
 * @route POST /api/shifts
 * @access Private/Admin
 */
exports.createShift = async (req, res) => {
  try {
    const { userId, date, shiftType, notes } = req.body;

    // Only admins can assign shifts directly
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create shifts for other users'
      });
    }

    // Validate shift type
    if (!['M', 'A', 'N', 'D', 'PL', 'SL', 'C', 'NH'].includes(shiftType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid shift type'
      });
    }

    // Validate date
    const shiftDate = new Date(date);
    if (isNaN(shiftDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    // Calculate start and end times based on shift type
    let startTime, endTime;
    if (['PL', 'SL', 'C', 'NH'].includes(shiftType)) {
      // For leave days, set start and end to beginning and end of day
      startTime = new Date(shiftDate);
      startTime.setHours(0, 0, 0, 0);
      
      endTime = new Date(shiftDate);
      endTime.setHours(23, 59, 59, 999);
    } else {
      // For regular shifts, calculate based on shift type
      const times = shiftUtils.calculateShiftTimes(shiftType, shiftDate);
      startTime = times.startTime;
      endTime = times.endTime;
    }

    // Check for existing shifts in the same time slot
    const existingShift = await Shift.findOne({
      user: userId,
      date: {
        $gte: new Date(shiftDate.setHours(0, 0, 0, 0)),
        $lte: new Date(shiftDate.setHours(23, 59, 59, 999))
      },
      shiftType
    });

    if (existingShift) {
      return res.status(400).json({
        success: false,
        message: 'A shift of this type already exists for this date'
      });
    }

    // Create new shift
    const shift = new Shift({
      user: userId,
      date: shiftDate,
      shiftType,
      startTime,
      endTime,
      notes,
      status: req.user.role === 'admin' ? 'approved' : 'pending',
      isUserSuggested: req.user.role !== 'admin',
      createdBy: req.user.id
    });

    await shift.save();

    res.status(201).json({
      success: true,
      shift
    });
  } catch (error) {
    console.error('Create shift error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating shift'
    });
  }
};

/**
 * Update a shift
 * @route PUT /api/shifts/:id
 * @access Private/Admin
 */
exports.updateShift = async (req, res) => {
  try {
    const { id } = req.params;
    const { shiftType, date, notes, status } = req.body;

    // Find the shift
    const shift = await Shift.findById(id);
    if (!shift) {
      return res.status(404).json({
        success: false,
        message: 'Shift not found'
      });
    }

    // Check permissions (only admins can update shifts)
    if (req.user.role !== 'admin' && req.user.id.toString() !== shift.user.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this shift'
      });
    }

    // Update fields if provided
    if (shiftType && ['M', 'A', 'N', 'D', 'PL', 'SL', 'C', 'NH'].includes(shiftType)) {
      shift.shiftType = shiftType;
      
      // Recalculate start and end times if shift type changes
      if (['PL', 'SL', 'C', 'NH'].includes(shiftType)) {
        const shiftDate = date ? new Date(date) : new Date(shift.date);
        shift.startTime = new Date(shiftDate);
        shift.startTime.setHours(0, 0, 0, 0);
        
        shift.endTime = new Date(shiftDate);
        shift.endTime.setHours(23, 59, 59, 999);
      } else {
        const shiftDate = date ? new Date(date) : new Date(shift.date);
        const times = shiftUtils.calculateShiftTimes(shiftType, shiftDate);
        shift.startTime = times.startTime;
        shift.endTime = times.endTime;
      }
    }

    if (date) {
      const newDate = new Date(date);
      if (!isNaN(newDate.getTime())) {
        shift.date = newDate;
        
        // Recalculate start and end times if date changes
        if (!['PL', 'SL', 'C', 'NH'].includes(shift.shiftType)) {
          const times = shiftUtils.calculateShiftTimes(shift.shiftType, newDate);
          shift.startTime = times.startTime;
          shift.endTime = times.endTime;
        } else {
          shift.startTime = new Date(newDate);
          shift.startTime.setHours(0, 0, 0, 0);
          
          shift.endTime = new Date(newDate);
          shift.endTime.setHours(23, 59, 59, 999);
        }
      }
    }

    if (notes !== undefined) shift.notes = notes;
    
    // Only admins can change status
    if (status && req.user.role === 'admin') {
      shift.status = status;
      if (status === 'approved' || status === 'rejected') {
        shift.updatedBy = req.user.id;
      }
    }

    await shift.save();

    res.json({
      success: true,
      shift
    });
  } catch (error) {
    console.error('Update shift error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating shift'
    });
  }
};

/**
 * Delete a shift
 * @route DELETE /api/shifts/:id
 * @access Private/Admin
 */
exports.deleteShift = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the shift
    const shift = await Shift.findById(id);
    if (!shift) {
      return res.status(404).json({
        success: false,
        message: 'Shift not found'
      });
    }

    // Check permissions (only admins can delete shifts)
    if (req.user.role !== 'admin' && req.user.id.toString() !== shift.user.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this shift'
      });
    }

    await shift.remove();

    res.json({
      success: true,
      message: 'Shift deleted successfully'
    });
  } catch (error) {
    console.error('Delete shift error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting shift'
    });
  }
};

/**
 * Get shifts for all users on a specific date
 * @route GET /api/shifts/calendar
 * @access Private/Admin
 */
exports.getCalendar = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Only admins can view the full calendar
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access the full calendar'
      });
    }

    // Validate dates
    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);
    
    const end = endDate ? new Date(endDate) : new Date(start);
    end.setDate(end.getDate() + 7); // Default to 7 days if endDate not provided
    end.setHours(23, 59, 59, 999);

    // Find all shifts in date range
    const shifts = await Shift.find({
      date: { $gte: start, $lte: end }
    }).populate('user', 'name email').sort({ date: 1 });

    // Group shifts by date
    const calendar = {};
    
    for (const shift of shifts) {
      const dateStr = shift.date.toISOString().split('T')[0];
      
      if (!calendar[dateStr]) {
        calendar[dateStr] = {
          date: dateStr,
          shifts: [],
          isComplete: false,
          missingShifts: []
        };
      }
      
      calendar[dateStr].shifts.push(shift);
    }
    
    // Check for missing required shifts for each day
    for (const date in calendar) {
      const dayShifts = calendar[date].shifts.map(s => s.shiftType);
      const requiredCheck = shiftUtils.checkRequiredShifts(calendar[date].shifts);
      
      calendar[date].isComplete = requiredCheck.isComplete;
      calendar[date].missingShifts = requiredCheck.missingShifts;
    }

    res.json({
      success: true,
      calendar: Object.values(calendar)
    });
  } catch (error) {
    console.error('Get calendar error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching calendar'
    });
  }
}; 