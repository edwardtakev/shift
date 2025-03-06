import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

import { RootState } from '../store';
import { updateShift } from '../store/slices/shiftsSlice';
import { addNotification } from '../store/slices/uiSlice';
import { Shift, ShiftStatus, ShiftType, SHIFT_TIMES, NotificationType } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`shift-tabpanel-${index}`}
      aria-labelledby={`shift-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ShiftRequests: React.FC = () => {
  const dispatch = useDispatch();
  const { entities: shifts } = useSelector((state: RootState) => state.shifts);
  const { entities: users } = useSelector((state: RootState) => state.users);
  
  const [tabValue, setTabValue] = useState(0);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  
  // Filter shifts by status
  const pendingShifts = Object.values(shifts).filter(shift => shift.status === ShiftStatus.PENDING);
  const approvedShifts = Object.values(shifts).filter(shift => shift.status === ShiftStatus.APPROVED);
  const rejectedShifts = Object.values(shifts).filter(shift => shift.status === ShiftStatus.REJECTED);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Open approval dialog
  const handleApprove = (shift: Shift) => {
    setSelectedShift(shift);
    setActionType('approve');
    setDialogOpen(true);
  };
  
  // Open rejection dialog
  const handleReject = (shift: Shift) => {
    setSelectedShift(shift);
    setActionType('reject');
    setRejectReason('');
    setDialogOpen(true);
  };
  
  // Show shift details
  const handleShowDetails = (shift: Shift) => {
    setSelectedShift(shift);
    setActionType(null);
    setDialogOpen(true);
  };
  
  // Close dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedShift(null);
    setActionType(null);
    setRejectReason('');
  };
  
  // Confirm action (approve/reject)
  const handleConfirmAction = () => {
    if (!selectedShift) return;
    
    const updatedShift = {
      ...selectedShift,
      status: actionType === 'approve' ? ShiftStatus.APPROVED : ShiftStatus.REJECTED,
      updatedAt: new Date().toISOString(),
    };
    
    dispatch(updateShift(updatedShift));
    
    // Create notification
    const notificationType = actionType === 'approve' 
      ? NotificationType.SHIFT_APPROVED 
      : NotificationType.SHIFT_REJECTED;
    
    const notificationMessage = actionType === 'approve'
      ? `Your ${selectedShift.type} shift on ${formatDate(selectedShift.date)} has been approved.`
      : `Your ${selectedShift.type} shift on ${formatDate(selectedShift.date)} has been rejected. Reason: ${rejectReason}`;
    
    dispatch(
      addNotification({
        id: uuidv4(),
        userId: selectedShift.userId,
        type: notificationType,
        message: notificationMessage,
        read: false,
        createdAt: new Date().toISOString(),
        relatedId: selectedShift.id,
      })
    );
    
    handleCloseDialog();
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'EEEE, MMMM d, yyyy');
  };
  
  // Get user name by ID
  const getUserName = (userId: string) => {
    const user = users[userId];
    return user ? `${user.firstName} ${user.lastName}` : `User (${userId})`;
  };
  
  // Render shift table
  const renderShiftTable = (shiftsToRender: Shift[]) => {
    return (
      <TableContainer component={Paper}>
        <Table aria-label="shift requests table">
          <TableHead>
            <TableRow>
              <TableCell>Employee</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Shift Type</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Requested On</TableCell>
              {tabValue === 0 && <TableCell>Actions</TableCell>}
              {tabValue !== 0 && <TableCell>Status</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {shiftsToRender.length > 0 ? (
              shiftsToRender.map((shift) => (
                <TableRow key={shift.id} hover>
                  <TableCell>{getUserName(shift.userId)}</TableCell>
                  <TableCell>{formatDate(shift.date)}</TableCell>
                  <TableCell>{shift.type}</TableCell>
                  <TableCell>
                    {SHIFT_TIMES[shift.type as ShiftType].start} - {SHIFT_TIMES[shift.type as ShiftType].end}
                  </TableCell>
                  <TableCell>{format(new Date(shift.createdAt), 'MMM d, yyyy')}</TableCell>
                  {tabValue === 0 ? (
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Approve">
                          <IconButton 
                            color="success" 
                            size="small"
                            onClick={() => handleApprove(shift)}
                          >
                            <ApproveIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <IconButton 
                            color="error" 
                            size="small"
                            onClick={() => handleReject(shift)}
                          >
                            <RejectIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View Details">
                          <IconButton 
                            color="primary" 
                            size="small"
                            onClick={() => handleShowDetails(shift)}
                          >
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  ) : (
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={shift.status} 
                          color={shift.status === ShiftStatus.APPROVED ? 'success' : 'error'}
                          size="small"
                        />
                        <Tooltip title="View Details">
                          <IconButton 
                            color="primary" 
                            size="small" 
                            onClick={() => handleShowDetails(shift)}
                          >
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No shifts found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Shift Requests
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="shift requests tabs"
        >
          <Tab label={`Pending (${pendingShifts.length})`} />
          <Tab label={`Approved (${approvedShifts.length})`} />
          <Tab label={`Rejected (${rejectedShifts.length})`} />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        {renderShiftTable(pendingShifts)}
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        {renderShiftTable(approvedShifts)}
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        {renderShiftTable(rejectedShifts)}
      </TabPanel>
      
      {/* Dialog for Approval/Rejection/Details */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>
          {actionType === 'approve' && 'Approve Shift Request'}
          {actionType === 'reject' && 'Reject Shift Request'}
          {actionType === null && 'Shift Request Details'}
        </DialogTitle>
        <DialogContent>
          {selectedShift && (
            <>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1">
                  <strong>Employee:</strong> {getUserName(selectedShift.userId)}
                </Typography>
                <Typography variant="body1">
                  <strong>Date:</strong> {formatDate(selectedShift.date)}
                </Typography>
                <Typography variant="body1">
                  <strong>Shift Type:</strong> {selectedShift.type}
                </Typography>
                <Typography variant="body1">
                  <strong>Time:</strong> {SHIFT_TIMES[selectedShift.type as ShiftType].start} - {SHIFT_TIMES[selectedShift.type as ShiftType].end}
                </Typography>
                <Typography variant="body1">
                  <strong>Requested On:</strong> {format(new Date(selectedShift.createdAt), 'MMMM d, yyyy')}
                </Typography>
                {selectedShift.notes && (
                  <Typography variant="body1">
                    <strong>Notes:</strong> {selectedShift.notes}
                  </Typography>
                )}
              </Box>
              
              {actionType === 'reject' && (
                <>
                  <DialogContentText sx={{ mb: 2 }}>
                    Please provide a reason for rejecting this shift request.
                  </DialogContentText>
                  <TextField
                    autoFocus
                    margin="dense"
                    id="reason"
                    label="Rejection Reason"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                </>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {actionType ? 'Cancel' : 'Close'}
          </Button>
          {actionType && (
            <Button 
              onClick={handleConfirmAction} 
              variant="contained" 
              color={actionType === 'approve' ? 'success' : 'error'}
              disabled={actionType === 'reject' && !rejectReason.trim()}
            >
              {actionType === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ShiftRequests; 