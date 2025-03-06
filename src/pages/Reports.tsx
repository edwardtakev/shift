import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Divider,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import { 
  GetApp as DownloadIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, addDays } from 'date-fns';

import { RootState } from '../store';
import { ShiftType, ShiftStatus, SHIFT_TIMES } from '../types';

// Chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF6B6B', '#4CAF50', '#9C27B0'];

const Reports: React.FC = () => {
  const { entities: shifts } = useSelector((state: RootState) => state.shifts);
  const { entities: users } = useSelector((state: RootState) => state.users);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'custom'>('week');
  const [startDate, setStartDate] = useState<Date | null>(startOfWeek(new Date()));
  const [endDate, setEndDate] = useState<Date | null>(endOfWeek(new Date()));
  
  // Update date range based on selection
  const handleDateRangeChange = (newRange: 'week' | 'month' | 'custom') => {
    setDateRange(newRange);
    
    if (newRange === 'week') {
      setStartDate(startOfWeek(new Date()));
      setEndDate(endOfWeek(new Date()));
    } else if (newRange === 'month') {
      setStartDate(startOfMonth(new Date()));
      setEndDate(endOfMonth(new Date()));
    }
    // For custom, keep the current dates
  };
  
  // Filter shifts based on date range and current user (if not admin)
  const filteredShifts = Object.values(shifts).filter(shift => {
    const shiftDate = new Date(shift.date);
    const isInDateRange = startDate && endDate 
      ? shiftDate >= startDate && shiftDate <= endDate 
      : true;
    
    const isUserShift = user?.role === 'admin' || shift.userId === user?.id;
    
    return isInDateRange && isUserShift && shift.status === ShiftStatus.APPROVED;
  });
  
  // Calculate shifts by type for pie chart
  const shiftsByType = filteredShifts.reduce((acc, shift) => {
    acc[shift.type] = (acc[shift.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const pieChartData = Object.entries(shiftsByType).map(([type, count]) => ({
    name: type,
    value: count,
  }));
  
  // Calculate shifts by day for bar chart
  const getDayShifts = () => {
    if (!startDate || !endDate) return [];
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    return days.map(day => {
      const dayShifts = filteredShifts.filter(shift => 
        format(new Date(shift.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      );
      
      // Count shifts by type
      const typeCounts = Object.values(ShiftType).reduce((acc, type) => {
        acc[type] = dayShifts.filter(shift => shift.type === type).length;
        return acc;
      }, {} as Record<string, number>);
      
      return {
        name: format(day, 'EEE dd'),
        date: format(day, 'yyyy-MM-dd'),
        total: dayShifts.length,
        ...typeCounts,
      };
    });
  };
  
  const barChartData = getDayShifts();
  
  // Calculate total hours by type
  const calculateHours = (type: ShiftType): number => {
    const typeShifts = filteredShifts.filter(shift => shift.type === type);
    
    const times = SHIFT_TIMES[type];
    const startHour = parseInt(times.start.split(':')[0]);
    const startMinute = parseInt(times.start.split(':')[1]);
    const endHour = parseInt(times.end.split(':')[0]);
    const endMinute = parseInt(times.end.split(':')[1]);
    
    let hours = endHour - startHour;
    if (endHour < startHour) {
      hours = 24 - startHour + endHour;
    }
    
    let minutes = endMinute - startMinute;
    if (minutes < 0) {
      hours -= 1;
      minutes += 60;
    }
    
    const hoursPerShift = hours + minutes / 60;
    return typeShifts.length * hoursPerShift;
  };
  
  // Generate hours data for line chart
  const hoursData = Object.values(ShiftType).map(type => ({
    name: type,
    hours: calculateHours(type),
  })).filter(item => item.hours > 0);
  
  // Calculate summary statistics
  const totalShifts = filteredShifts.length;
  const totalHours = hoursData.reduce((sum, item) => sum + item.hours, 0);
  const avgHoursPerDay = totalHours / (barChartData.length || 1);
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Shift Reports
        </Typography>
        <Box>
          <IconButton title="Print Report" onClick={() => window.print()}>
            <PrintIcon />
          </IconButton>
          <IconButton title="Download as CSV" onClick={() => alert('CSV download functionality would be implemented here')}>
            <DownloadIcon />
          </IconButton>
          <IconButton title="Refresh Data" onClick={() => alert('Data refresh functionality would be implemented here')}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="date-range-label">Date Range</InputLabel>
              <Select
                labelId="date-range-label"
                id="date-range"
                value={dateRange}
                label="Date Range"
                onChange={(e) => handleDateRangeChange(e.target.value as 'week' | 'month' | 'custom')}
              >
                <MenuItem value="week">Current Week</MenuItem>
                <MenuItem value="month">Current Month</MenuItem>
                <MenuItem value="custom">Custom Range</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={7}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  disabled={dateRange !== 'custom'}
                />
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  disabled={dateRange !== 'custom'}
                />
              </Box>
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} md={1}>
            <Button 
              variant="contained" 
              fullWidth 
              sx={{ height: '56px' }}
              onClick={() => alert('Apply filters functionality would be implemented here')}
            >
              Apply
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Shifts
              </Typography>
              <Typography variant="h3">
                {totalShifts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Hours
              </Typography>
              <Typography variant="h3">
                {totalHours.toFixed(1)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Avg Hours/Day
              </Typography>
              <Typography variant="h3">
                {avgHoursPerDay.toFixed(1)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Shifts by Day
          </Typography>
          <Paper sx={{ p: 2, height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                {Object.values(ShiftType).map((type, index) => (
                  <Bar 
                    key={type} 
                    dataKey={type} 
                    stackId="a" 
                    fill={COLORS[index % COLORS.length]} 
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Distribution by Shift Type
          </Typography>
          <Paper sx={{ p: 2, height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Hours by Shift Type
          </Typography>
          <Paper sx={{ p: 2, height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={hoursData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="hours" fill="#8884d8">
                  {hoursData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports; 