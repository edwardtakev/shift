import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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

// Form schema validation
const schema = yup.object().shape({
  email: yup.string().email('Enter a valid email').required('Email is required'),
});

interface ForgotPasswordFormInputs {
  email: string;
}

const ForgotPassword: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState<boolean>(false);

  const { control, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormInputs>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormInputs) => {
    try {
      setError(null);
      
      // In a real app, this would be an API call to request password reset
      // For demo purposes, we're simulating a successful request
      console.log('Reset password for email:', data.email);
      
      // Simulate API delay
      setTimeout(() => {
        setResetSent(true);
      }, 1000);
    } catch (err) {
      setError((err as Error).message);
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
            Reset Your Password
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {resetSent ? (
            <Box sx={{ width: '100%' }}>
              <Alert severity="success" sx={{ mb: 2 }}>
                Password reset instructions have been sent to your email.
              </Alert>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Please check your email inbox for instructions on how to reset your password.
                If you don't receive an email within a few minutes, please check your spam folder.
              </Typography>
              <Button
                component={Link}
                to="/login"
                fullWidth
                variant="contained"
                sx={{ mt: 2 }}
              >
                Return to Login
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1, width: '100%' }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Enter your email address below and we'll send you instructions to reset your password.
              </Typography>
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
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Reset Password
              </Button>
              <Grid container>
                <Grid item xs>
                  <MuiLink component={Link} to="/login" variant="body2">
                    Back to login
                  </MuiLink>
                </Grid>
                <Grid item>
                  <MuiLink component={Link} to="/register" variant="body2">
                    {"Don't have an account? Sign Up"}
                  </MuiLink>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPassword; 