import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { v4 as uuidv4 } from 'uuid';

import { RootState } from '../store';
import { addShift, setSelectedDate } from '../store/slices/shiftsSlice';
import { ShiftType, SHIFT_TIMES, ShiftStatus, Shift } from '../types';

// Form validation schema
const schema = yup.object().shape({
  type: yup.string().required('Shift type is required'),
  notes: yup.string().max(200, 'Notes must be less than 200 characters'),
});

interface ShiftFormInputs {
  type: ShiftType;
  notes: string;
}

// Function to get color based on shift type
const getShiftColor = (shiftType: ShiftType): string => {
  const colors: Record<ShiftType, string> = {
    [ShiftType.MORNING]: '#4CAF50', // Green
    [ShiftType.AFTERNOON]: '#2196F3', // Blue
    [ShiftType.NIGHT]: '#673AB7', // Deep Purple
    [ShiftType.DAY]: '#FF9800', // Orange
    [ShiftType.PAID_LEAVE]: '#9E9E9E', // Grey
    [ShiftType.SICK_LEAVE]: '#F44336', // Red
    [ShiftType.COMPENSATION]: '#795548', // Brown
    [ShiftType.NATIONAL_HOLIDAY]: '#E91E63', // Pink
  };
  
  return colors[shiftType];
};

const Calendar: React.FC = () => {
  const dispatch = useDispatch();
  const { entities: shifts } = useSelector((state: RootState) => state.shifts);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setModalSelectedDate] = useState<string>('');
  
  const { control, handleSubmit, reset, formState: { errors } } = useForm<ShiftFormInputs>({
    resolver: yupResolver(schema),
    defaultValues: {
      type: ShiftType.DAY,
      notes: '',
    },
  });

  // Convert shifts to FullCalendar events
  const events = Object.values(shifts).map((shift) => ({
    id: shift.id,
    title: `${shift.type} Shift`,
    start: `${shift.date}T${SHIFT_TIMES[shift.type].start}`,
    end: `${shift.date}T${SHIFT_TIMES[shift.type].end}`,
    backgroundColor: getShiftColor(shift.type),
    borderColor: getShiftColor(shift.type),
    textColor: '#FFFFFF',
    extendedProps: {
      type: shift.type,
      status: shift.status,
      notes: shift.notes,
    },
  }));

  const handleDateClick = (info: { dateStr: string }) => {
    setModalSelectedDate(info.dateStr);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    reset();
  };

  const onSubmit = (data: ShiftFormInputs) => {
    const newShift: Shift = {
      id: uuidv4(),
      userId: user?.id || '',
      date: selectedDate,
      type: data.type,
      status: user?.role === 'admin' ? ShiftStatus.APPROVED : ShiftStatus.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: data.notes,
    };
    
    dispatch(addShift(newShift));
    handleCloseModal();
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Shift Calendar
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => {
            setModalSelectedDate(new Date().toISOString().split('T')[0]);
            setIsModalOpen(true);
          }}
        >
          Add Shift
        </Button>
      </Box>
      
      <Paper sx={{ p: 2 }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          events={events}
          height="auto"
          dateClick={handleDateClick}
          eventClick={(info) => {
            console.log('Event clicked:', info.event);
            // You can implement edit functionality here
          }}
        />
      </Paper>
      
      {/* Add/Edit Shift Modal */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          {`Add Shift for ${selectedDate}`}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.type}>
                      <InputLabel id="shift-type-label">Shift Type</InputLabel>
                      <Select
                        {...field}
                        labelId="shift-type-label"
                        id="shift-type"
                        label="Shift Type"
                      >
                        <MenuItem value={ShiftType.MORNING}>Morning Shift (06:48 - 15:00)</MenuItem>
                        <MenuItem value={ShiftType.AFTERNOON}>Afternoon Shift (14:48 - 23:00)</MenuItem>
                        <MenuItem value={ShiftType.NIGHT}>Night Shift (22:48 - 07:00)</MenuItem>
                        <MenuItem value={ShiftType.DAY}>Day Shift (09:00 - 18:00)</MenuItem>
                        <MenuItem value={ShiftType.PAID_LEAVE}>Paid Leave</MenuItem>
                        <MenuItem value={ShiftType.SICK_LEAVE}>Sick Leave</MenuItem>
                        <MenuItem value={ShiftType.COMPENSATION}>Compensation</MenuItem>
                        <MenuItem value={ShiftType.NATIONAL_HOLIDAY}>National Holiday</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Notes"
                      multiline
                      rows={4}
                      error={!!errors.notes}
                      helperText={errors.notes?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)} variant="contained">
            {user?.role === 'admin' ? 'Add Shift' : 'Request Shift'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Calendar; 