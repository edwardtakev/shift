import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

import { RootState } from '../store';
import { ShiftStatus, ShiftType, SHIFT_TIMES } from '../types';

const Dashboard: React.FC = () => {
  const { entities: shifts } = useSelector((state: RootState) => state.shifts);
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'admin';
  
  // Get all shifts for the current user or all shifts for admin
  const userShifts = Object.values(shifts).filter(
    (shift) => isAdmin || shift.userId === user?.id
  );
  
  // Get pending shifts that need approval (for admin)
  const pendingShifts = Object.values(shifts).filter(
    (shift) => shift.status === ShiftStatus.PENDING
  );
  
  // Count shifts by type for the current user
  const shiftsByType = userShifts.reduce((acc, shift) => {
    acc[shift.type] = (acc[shift.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Prepare data for the bar chart
  const chartData = Object.entries(shiftsByType).map(([type, count]) => ({
    type,
    count,
  }));
  
  // Get upcoming shifts (next 7 days)
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  
  const upcomingShifts = userShifts.filter((shift) => {
    const shiftDate = new Date(shift.date);
    return shiftDate >= today && shiftDate <= nextWeek;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get status chip based on shift status
  const getStatusChip = (status: ShiftStatus) => {
    switch (status) {
      case ShiftStatus.APPROVED:
        return <Chip 
          icon={<CheckCircleIcon />} 
          label="Approved" 
          color="success" 
          size="small" 
        />;
      case ShiftStatus.PENDING:
        return <Chip 
          icon={<ScheduleIcon />} 
          label="Pending" 
          color="warning" 
          size="small" 
        />;
      case ShiftStatus.REJECTED:
        return <Chip 
          icon={<CancelIcon />} 
          label="Rejected" 
          color="error" 
          size="small" 
        />;
      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Shifts
              </Typography>
              <Typography variant="h3">
                {userShifts.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Approved Shifts
              </Typography>
              <Typography variant="h3">
                {userShifts.filter(s => s.status === ShiftStatus.APPROVED).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending Shifts
              </Typography>
              <Typography variant="h3">
                {userShifts.filter(s => s.status === ShiftStatus.PENDING).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Shift Distribution Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 300 }}>
            <Typography variant="h6" gutterBottom>
              Shift Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={chartData}>
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3f51b5" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Pending Approvals Card (Admin only) */}
        {isAdmin && (
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: 300, overflow: 'auto' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Pending Approvals
                </Typography>
                <Button 
                  component={Link} 
                  to="/requests" 
                  endIcon={<ArrowForwardIcon />}
                  size="small"
                >
                  View All
                </Button>
              </Box>
              
              {pendingShifts.length > 0 ? (
                <List>
                  {pendingShifts.slice(0, 5).map((shift) => (
                    <React.Fragment key={shift.id}>
                      <ListItem>
                        <ListItemText
                          primary={`${shift.type} Shift on ${formatDate(shift.date)}`}
                          secondary={`Requested by User ID: ${shift.userId}`}
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No pending approval requests.
                </Typography>
              )}
            </Paper>
          </Grid>
        )}
        
        {/* Upcoming Shifts */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Upcoming Shifts
              </Typography>
              <Button 
                component={Link} 
                to="/calendar" 
                variant="outlined" 
                endIcon={<CalendarIcon />}
              >
                View Calendar
              </Button>
            </Box>
            
            {upcomingShifts.length > 0 ? (
              <List>
                {upcomingShifts.slice(0, 5).map((shift) => (
                  <React.Fragment key={shift.id}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography>{`${shift.type} Shift on ${formatDate(shift.date)}`}</Typography>
                            {getStatusChip(shift.status)}
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" color="textSecondary">
                            {`${SHIFT_TIMES[shift.type as ShiftType].start} - ${SHIFT_TIMES[shift.type as ShiftType].end}`}
                            {shift.notes && ` • ${shift.notes}`}
                          </Typography>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No upcoming shifts in the next 7 days.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 