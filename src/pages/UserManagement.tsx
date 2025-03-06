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
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Block as BlockIcon,
  PersonAdd as InviteIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { v4 as uuidv4 } from 'uuid';

import { RootState } from '../store';
import { addUser, updateUser, removeUser } from '../store/slices/usersSlice';
import { User, UserRole } from '../types';

// Form schema validation
const schema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  role: yup.string().required('Role is required'),
  department: yup.string().required('Department is required'),
  position: yup.string().required('Position is required'),
});

interface UserFormInputs {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  department: string;
  position: string;
}

const UserManagement: React.FC = () => {
  const dispatch = useDispatch();
  const { entities: users } = useSelector((state: RootState) => state.users);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  
  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<UserFormInputs>({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: UserRole.EMPLOYEE,
      department: '',
      position: '',
    },
  });
  
  // Open dialog to add new user
  const handleAddUser = () => {
    reset({
      firstName: '',
      lastName: '',
      email: '',
      role: UserRole.EMPLOYEE,
      department: '',
      position: '',
    });
    setDialogMode('add');
    setSelectedUser(null);
    setDialogOpen(true);
  };
  
  // Open dialog to edit existing user
  const handleEditUser = (user: User) => {
    setValue('firstName', user.firstName);
    setValue('lastName', user.lastName);
    setValue('email', user.email);
    setValue('role', user.role);
    setValue('department', user.department || '');
    setValue('position', user.position || '');
    
    setDialogMode('edit');
    setSelectedUser(user);
    setDialogOpen(true);
  };
  
  // Open confirm dialog to delete user
  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setConfirmDialogOpen(true);
  };
  
  // Confirm user deletion
  const handleConfirmDelete = () => {
    if (selectedUser) {
      dispatch(removeUser(selectedUser.id));
    }
    setConfirmDialogOpen(false);
    setSelectedUser(null);
  };
  
  // Close dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  
  // Submit form
  const onSubmit = (data: UserFormInputs) => {
    if (dialogMode === 'add') {
      // Create new user
      const newUser: User = {
        id: uuidv4(),
        ...data,
      };
      dispatch(addUser(newUser));
    } else if (dialogMode === 'edit' && selectedUser) {
      // Update existing user
      const updatedUser: User = {
        ...selectedUser,
        ...data,
      };
      dispatch(updateUser(updatedUser));
    }
    handleCloseDialog();
  };
  
  const departments = [
    'Engineering',
    'Marketing',
    'Sales',
    'Customer Support',
    'Human Resources',
    'Finance',
    'Operations',
  ];

  const positions = [
    'Manager',
    'Team Lead',
    'Senior Employee',
    'Employee',
    'Intern',
    'Contractor',
  ];

  // Render users table
  const userList = Object.values(users);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          User Management
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<InviteIcon />}
            sx={{ mr: 2 }}
            onClick={() => alert('Invite functionality would be implemented here')}
          >
            Invite Users
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddUser}
          >
            Add User
          </Button>
        </Box>
      </Box>
      
      <TableContainer component={Paper}>
        <Table aria-label="users table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Position</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {userList.length > 0 ? (
              userList.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.role === UserRole.ADMIN ? 'Admin' : 'Employee'} 
                      color={user.role === UserRole.ADMIN ? 'primary' : 'default'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{user.department || 'N/A'}</TableCell>
                  <TableCell>{user.position || 'N/A'}</TableCell>
                  <TableCell align="center">
                    <Chip 
                      icon={<CheckIcon />} 
                      label="Active" 
                      color="success" 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Tooltip title="Edit">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleEditUser(user)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteUser(user)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Add/Edit User Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New User' : 'Edit User'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="firstName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      margin="normal"
                      required
                      fullWidth
                      id="firstName"
                      label="First Name"
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
                      margin="normal"
                      required
                      fullWidth
                      id="lastName"
                      label="Last Name"
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
                      margin="normal"
                      required
                      fullWidth
                      id="email"
                      label="Email Address"
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="role-label">Role</InputLabel>
                      <Select
                        {...field}
                        labelId="role-label"
                        id="role"
                        label="Role"
                      >
                        <MenuItem value={UserRole.EMPLOYEE}>Employee</MenuItem>
                        <MenuItem value={UserRole.ADMIN}>Administrator</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller
                  name="department"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="department-label">Department</InputLabel>
                      <Select
                        {...field}
                        labelId="department-label"
                        id="department"
                        label="Department"
                      >
                        {departments.map((dept) => (
                          <MenuItem key={dept} value={dept}>
                            {dept}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller
                  name="position"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="position-label">Position</InputLabel>
                      <Select
                        {...field}
                        labelId="position-label"
                        id="position"
                        label="Position"
                      >
                        {positions.map((pos) => (
                          <MenuItem key={pos} value={pos}>
                            {pos}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)} variant="contained">
            {dialogMode === 'add' ? 'Add User' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Confirm Delete Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete user{' '}
            <strong>{selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : ''}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement; 