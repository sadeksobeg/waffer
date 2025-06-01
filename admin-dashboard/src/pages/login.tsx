import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { isFirebaseConfigured } from '../config/firebase';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [configWarning, setConfigWarning] = useState(false);

  const router = useRouter();
  const { signIn, authError, clearError, resetPassword } = useAuth();

  // Check if Firebase is properly configured
  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setConfigWarning(true);
    }
  }, []);

  // Update local error state when auth context error changes
  useEffect(() => {
    if (authError) {
      setFormError(authError);
    }
  }, [authError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Form validation
    if (!email) {
      setFormError('Email is required');
      return;
    }

    if (!password) {
      setFormError('Password is required');
      return;
    }

    try {
      setFormError('');
      setLoading(true);
      await signIn(email, password);
      router.push('/dashboard');
    } catch (err) {
      // Error is already set in auth context and will be displayed via the useEffect
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      setFormError('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(resetEmail);
      setResetSuccess(true);
      setResetDialogOpen(false);
    } catch (err) {
      // Error is already set in auth context
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseResetDialog = () => {
    setResetDialogOpen(false);
    setResetEmail('');
    clearError();
  };

  const handleCloseSnackbar = () => {
    setResetSuccess(false);
  };

  // For development/testing - bypass authentication
  const handleDevBypass = () => {
    if (process.env.NODE_ENV === 'development') {
      router.push('/dashboard');
    }
  };

  return (
    <>
      <Head>
        <title>Login - Admin Dashboard</title>
        <meta name="description" content="Login to the Admin Dashboard" />
      </Head>
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
            <Typography component="h1" variant="h5" gutterBottom>
              Admin Login
            </Typography>

            {configWarning && (
              <Alert severity="warning" sx={{ width: '100%', mt: 2, mb: 2 }}>
                Firebase is not properly configured. Please update your .env.local file with valid credentials.
              </Alert>
            )}

            {formError && (
              <Alert
                severity="error"
                sx={{ width: '100%', mt: 2 }}
                onClose={() => {
                  setFormError('');
                  clearError();
                }}
              >
                {formError}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3, width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, py: 1.5 }}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Sign In'
                )}
              </Button>

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                <Button
                  variant="text"
                  color="primary"
                  onClick={() => setResetDialogOpen(true)}
                  disabled={loading}
                >
                  Forgot password?
                </Button>
              </Box>

              {process.env.NODE_ENV === 'development' && (
                <>
                  <Divider sx={{ my: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Development Only
                    </Typography>
                  </Divider>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="secondary"
                    onClick={handleDevBypass}
                    sx={{ mb: 1 }}
                  >
                    Bypass Authentication (Dev Mode)
                  </Button>
                </>
              )}
            </Box>
          </Paper>
        </Box>
      </Container>

      {/* Password Reset Dialog */}
      <Dialog open={resetDialogOpen} onClose={handleCloseResetDialog}>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter your email address and we'll send you a link to reset your password.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="reset-email"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            sx={{ mt: 2 }}
          />
          {authError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {authError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseResetDialog} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handlePasswordReset}
            variant="contained"
            disabled={loading || !resetEmail}
          >
            {loading ? <CircularProgress size={24} /> : 'Send Reset Link'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={resetSuccess}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message="Password reset email sent"
      />
    </>
  );
};

export default Login;
