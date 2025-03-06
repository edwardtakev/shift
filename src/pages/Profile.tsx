import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  Divider,
  Grid,
  TextField,
  Card,
  CardContent,
  Chip,
  IconButton,
  Alert,
  Snackbar,
  Badge,
} from '@mui/material';
import {
  Edit as EditIcon,
  CameraAlt as CameraIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { RootState } from '../store';
import { updateUser } from '../store/slices/authSlice';
import { UserRole } from '../types';

// Form schema validation
const schema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  department: yup.string().nullable(),
  position: yup.string().nullable(),
  bio: yup.string().max(200, 'Bio must be less than 200 characters'),
});

interface ProfileFormInputs {
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  bio: string;
}

const Profile: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [editMode, setEditMode] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const { control, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormInputs>({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      department: user?.department || '',
      position: user?.position || '',
      bio: user?.bio || '',
    },
  });
  
  // Handle edit mode toggle
  const handleEditModeToggle = () => {
    if (editMode) {
      // Cancel edit mode, reset form
      reset({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        department: user?.department || '',
        position: user?.position || '',
        bio: user?.bio || '',
      });
    }
    setEditMode(!editMode);
  };
  
  // Handle form submission
  const onSubmit = (data: ProfileFormInputs) => {
    if (!user) return;
    
    // Update user data
    const updatedUser = {
      ...user,
      ...data,
    };
    
    dispatch(updateUser(updatedUser));
    setEditMode(false);
    showSnackbar('Profile updated successfully');
  };
  
  // Show snackbar notification
  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  
  // Handle avatar upload
  const handleAvatarUpload = () => {
    // In a real app, this would open a file selector dialog
    showSnackbar('Avatar upload functionality would be implemented here');
  };
  
  if (!user) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity="error">You must be logged in to view this page.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        User Profile
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <IconButton
                  size="small"
                  sx={{ bgcolor: 'primary.main', color: 'white' }}
                  onClick={handleAvatarUpload}
                >
                  <CameraIcon fontSize="small" />
                </IconButton>
              }
            >
              <Avatar
                sx={{
                  width: 128,
                  height: 128,
                  fontSize: 48,
                  mx: 'auto',
                  bgcolor: 'primary.main',
                }}
                src={user.avatar}
                alt={`${user.firstName} ${user.lastName}`}
              >
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </Avatar>
            </Badge>
            
            <Typography variant="h5" sx={{ mt: 2 }}>
              {user.firstName} {user.lastName}
            </Typography>
            
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {user.email}
            </Typography>
            
            <Chip 
              label={user.role === UserRole.ADMIN ? 'Administrator' : 'Employee'} 
              color={user.role === UserRole.ADMIN ? 'primary' : 'default'} 
              size="small" 
              sx={{ mt: 1 }}
            />
            
            <Divider sx={{ my: 2 }} />
            
            <Button
              variant={editMode ? 'outlined' : 'contained'}
              startIcon={editMode ? <CancelIcon /> : <EditIcon />}
              color={editMode ? 'inherit' : 'primary'}
              onClick={handleEditModeToggle}
              fullWidth
              sx={{ mb: 1 }}
            >
              {editMode ? 'Cancel Editing' : 'Edit Profile'}
            </Button>
            
            {editMode && (
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                color="primary"
                onClick={handleSubmit(onSubmit)}
                fullWidth
              >
                Save Changes
              </Button>
            )}
          </Paper>
          
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Work Information
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Department:</strong> {user.department || 'Not specified'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Position:</strong> {user.position || 'Not specified'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            {editMode ? (
              <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <Typography variant="h6" gutterBottom>
                  Edit Your Profile
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="firstName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="First Name"
                          fullWidth
                          variant="outlined"
                          margin="normal"
                          error={!!errors.firstName}
                          helperText={errors.firstName?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="lastName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Last Name"
                          fullWidth
                          variant="outlined"
                          margin="normal"
                          error={!!errors.lastName}
                          helperText={errors.lastName?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Email"
                          fullWidth
                          variant="outlined"
                          margin="normal"
                          error={!!errors.email}
                          helperText={errors.email?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="department"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Department"
                          fullWidth
                          variant="outlined"
                          margin="normal"
                          error={!!errors.department}
                          helperText={errors.department?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="position"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Position"
                          fullWidth
                          variant="outlined"
                          margin="normal"
                          error={!!errors.position}
                          helperText={errors.position?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name="bio"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Bio"
                          fullWidth
                          variant="outlined"
                          margin="normal"
                          multiline
                          rows={4}
                          error={!!errors.bio}
                          helperText={errors.bio?.message || 'Tell us about yourself (max 200 characters)'}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Box>
            ) : (
              <>
                <Typography variant="h6" gutterBottom>
                  Profile Information
                </Typography>
                
                <Box sx={{ my: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        First Name
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {user.firstName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Last Name
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {user.lastName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Email
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {user.email}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Department
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {user.department || 'Not specified'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Position
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {user.position || 'Not specified'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" gutterBottom>
                  Bio
                </Typography>
                <Typography variant="body1" paragraph>
                  {user.bio || 'No bio provided yet.'}
                </Typography>
              </>
            )}
          </Paper>
          
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Information
              </Typography>
              <Typography variant="body2">
                <strong>Account Created:</strong> {new Date().toLocaleDateString()} {/* This would normally come from user data */}
              </Typography>
              <Typography variant="body2">
                <strong>Last Login:</strong> {new Date().toLocaleDateString()} {/* This would normally come from user data */}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default Profile; 