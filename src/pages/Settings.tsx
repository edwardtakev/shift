import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  Grid,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  ColorLens as ThemeIcon,
  Schedule as ScheduleIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  Brightness6 as DarkModeIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const Settings: React.FC = () => {
  const dispatch = useDispatch();
  
  // Settings state
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('english');
  const [timeFormat, setTimeFormat] = useState('24h');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Handle notification toggle
  const handleNotificationsToggle = () => {
    const newValue = !notifications;
    setNotifications(newValue);
    
    // If turning off notifications, also turn off subtypes
    if (!newValue) {
      setEmailNotifications(false);
      setPushNotifications(false);
    }
    
    showSnackbar(`Notifications ${newValue ? 'enabled' : 'disabled'}`);
  };
  
  // Handle dark mode toggle
  const handleDarkModeToggle = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    showSnackbar(`Dark mode ${newValue ? 'enabled' : 'disabled'}`);
    // In a real app, this would trigger a theme change
  };
  
  // Handle language change
  const handleLanguageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLanguage(event.target.value);
    showSnackbar(`Language set to ${event.target.value}`);
  };
  
  // Handle time format change
  const handleTimeFormatChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTimeFormat(event.target.value);
    showSnackbar(`Time format set to ${event.target.value}`);
  };
  
  // Handle save settings
  const handleSaveSettings = () => {
    // In a real app, this would save settings to the server/store
    showSnackbar('Settings saved successfully');
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
  
  // Handle account deletion
  const handleDeleteAccount = () => {
    if (deleteConfirmation === 'DELETE') {
      // In a real app, this would delete the account
      showSnackbar('Account deletion initiated');
      setShowDeleteDialog(false);
      setDeleteConfirmation('');
    } else {
      showSnackbar('Please type DELETE to confirm');
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ mb: 3 }}>
            <List>
              {/* Notification Settings */}
              <ListItem>
                <ListItemIcon>
                  <NotificationsIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Notifications" 
                  secondary="Enable or disable all notifications"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={notifications}
                    onChange={handleNotificationsToggle}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              {notifications && (
                <>
                  <ListItem sx={{ pl: 4 }}>
                    <ListItemText 
                      primary="Email Notifications" 
                      secondary="Receive notifications via email"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={emailNotifications}
                        onChange={() => {
                          setEmailNotifications(!emailNotifications);
                          showSnackbar(`Email notifications ${!emailNotifications ? 'enabled' : 'disabled'}`);
                        }}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem sx={{ pl: 4 }}>
                    <ListItemText 
                      primary="Push Notifications" 
                      secondary="Receive notifications in browser"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={pushNotifications}
                        onChange={() => {
                          setPushNotifications(!pushNotifications);
                          showSnackbar(`Push notifications ${!pushNotifications ? 'enabled' : 'disabled'}`);
                        }}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </>
              )}
              
              <Divider />
              
              {/* Theme Settings */}
              <ListItem>
                <ListItemIcon>
                  <ThemeIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Theme" 
                  secondary="Customize app appearance"
                />
              </ListItem>
              
              <ListItem sx={{ pl: 4 }}>
                <ListItemIcon>
                  <DarkModeIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Dark Mode" 
                  secondary="Toggle dark theme"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={darkMode}
                    onChange={handleDarkModeToggle}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <Divider />
              
              {/* Language Settings */}
              <ListItem>
                <ListItemIcon>
                  <LanguageIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Language" 
                  secondary="Set your preferred language"
                />
                <ListItemSecondaryAction sx={{ width: '120px' }}>
                  <FormControl fullWidth size="small">
                    <Select
                      value={language}
                      onChange={handleLanguageChange as any}
                    >
                      <MenuItem value="english">English</MenuItem>
                      <MenuItem value="spanish">Spanish</MenuItem>
                      <MenuItem value="french">French</MenuItem>
                      <MenuItem value="german">German</MenuItem>
                    </Select>
                  </FormControl>
                </ListItemSecondaryAction>
              </ListItem>
              
              <Divider />
              
              {/* Time Format Settings */}
              <ListItem>
                <ListItemIcon>
                  <ScheduleIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Time Format" 
                  secondary="Set your preferred time format"
                />
                <ListItemSecondaryAction sx={{ width: '120px' }}>
                  <FormControl fullWidth size="small">
                    <Select
                      value={timeFormat}
                      onChange={handleTimeFormatChange as any}
                    >
                      <MenuItem value="12h">12-hour</MenuItem>
                      <MenuItem value="24h">24-hour</MenuItem>
                    </Select>
                  </FormControl>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
            
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" 
                onClick={handleSaveSettings}
              >
                Save Settings
              </Button>
            </Box>
          </Paper>
          
          {/* Security Settings */}
          <Paper>
            <List>
              <ListItem>
                <ListItemIcon>
                  <SecurityIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Security" 
                  secondary="Manage your account security"
                />
              </ListItem>
              
              <ListItem sx={{ pl: 4 }}>
                <ListItemText 
                  primary="Change Password" 
                  secondary="Update your password regularly for better security"
                />
                <ListItemSecondaryAction>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => showSnackbar('Change password functionality would be implemented here')}
                  >
                    Change
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem sx={{ pl: 4 }}>
                <ListItemText 
                  primary="Two-Factor Authentication" 
                  secondary="Add an extra layer of security to your account"
                />
                <ListItemSecondaryAction>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => showSnackbar('2FA functionality would be implemented here')}
                  >
                    Setup
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          {/* Account Deletion */}
          <Paper sx={{ p: 2, bgcolor: '#FFF5F5' }}>
            <Typography variant="h6" component="h2" color="error" gutterBottom>
              Danger Zone
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" paragraph>
              Deleting your account will permanently remove all your data including shift history, 
              preferences and personal information. This action cannot be undone.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button 
                variant="outlined" 
                color="error" 
                startIcon={<DeleteIcon />}
                onClick={() => setShowDeleteDialog(true)}
              >
                Delete Account
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Delete Account Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      >
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This action is permanent and cannot be undone. All your data will be permanently deleted.
            To confirm, please type <strong>DELETE</strong> in the field below.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="confirmation"
            label="Type DELETE to confirm"
            fullWidth
            variant="outlined"
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteAccount} 
            color="error"
            disabled={deleteConfirmation !== 'DELETE'}
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
      
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

export default Settings; 