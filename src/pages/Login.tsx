import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Link as MuiLink,
  Alert,
} from '@mui/material';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice';
import { UserRole, User } from '../types';

// Form schema validation
const schema = yup.object().shape({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
});

interface LoginFormInputs {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      dispatch(loginStart());
      setError(null);
      
      // In a real app, this would be an API call
      // For demo purposes, we're simulating a successful login
      if (data.email === 'admin@example.com' && data.password === 'password') {
        // Simulate API response
        const user: User = {
          id: '1',
          email: data.email,
          firstName: 'Admin',
          lastName: 'User',
          role: UserRole.ADMIN,
        };
        
        setTimeout(() => {
          dispatch(loginSuccess({ user, token: 'mock-jwt-token' }));
          navigate('/');
        }, 1000);
      } else if (data.email === 'user@example.com' && data.password === 'password') {
        // Simulate API response for regular user
        const user: User = {
          id: '2',
          email: data.email,
          firstName: 'Regular',
          lastName: 'User',
          role: UserRole.EMPLOYEE,
        };
        
        setTimeout(() => {
          dispatch(loginSuccess({ user, token: 'mock-jwt-token' }));
          navigate('/');
        }, 1000);
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      setError((error as Error).message);
      dispatch(loginFailure((error as Error).message));
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Sign in to Shift Calendar
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1, width: '100%' }}>
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
                  autoComplete="email"
                  autoFocus
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              )}
            />
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  id="password"
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                />
              )}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
            <Grid container>
              <Grid item xs>
                <MuiLink component={Link} to="/forgot-password" variant="body2">
                  Forgot password?
                </MuiLink>
              </Grid>
              <Grid item>
                <MuiLink component={Link} to="/register" variant="body2">
                  {"Don't have an account? Sign Up"}
                </MuiLink>
              </Grid>
            </Grid>
          </Box>
        </Paper>
        
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Demo credentials:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Admin: admin@example.com / password
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Employee: user@example.com / password
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Login; 