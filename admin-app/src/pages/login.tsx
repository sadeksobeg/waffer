import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import Link from 'next/link';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Link as MuiLink,
  InputAdornment,
  IconButton,
  Divider,
  Snackbar,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Google as GoogleIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/config/firebase';
import authService from '@/services/authService';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const { signIn, userData } = useAuth();
  const router = useRouter();
  const { t } = useTranslation('common');

  // Get the redirect URL from query params
  const { redirect } = router.query;

  useEffect(() => {
    // If user is already logged in, redirect to dashboard or the redirect URL
    if (userData) {
      if (typeof redirect === 'string' && redirect.startsWith('/')) {
        router.push(redirect);
      } else {
        router.push('/dashboard');
      }
    }
  }, [userData, router, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError(t('login.fieldsRequired'));
      return;
    }

    try {
      setError('');
      setLoading(true);
      await signIn(email, password);

      // If we get here, login was successful
      // The useEffect above will handle the redirect
    } catch (error: any) {
      console.error('Login error:', error);

      // Handle specific Firebase auth errors
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError(t('login.error'));
      } else if (error.code === 'auth/too-many-requests') {
        setError(t('login.tooManyAttempts'));
      } else if (error.code === 'auth/user-disabled') {
        setError(t('login.accountDisabled'));
      } else {
        setError(error.message || t('login.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError(t('login.emailRequired'));
      return;
    }

    try {
      setLoading(true);
      await authService.requestPasswordReset(email);
      setSuccessMessage(t('login.passwordResetSent'));
      setShowSuccessMessage(true);
      setError('');
    } catch (error: any) {
      console.error('Password reset error:', error);
      if (error.code === 'auth/user-not-found') {
        // Don't reveal that the user doesn't exist for security reasons
        setSuccessMessage(t('login.passwordResetSent'));
        setShowSuccessMessage(true);
      } else {
        setError(error.message || t('login.passwordResetError'));
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleCloseSuccessMessage = () => {
    setShowSuccessMessage(false);
  };

  return (
    <>
      <Head>
        <title>{t('login.title')} | {t('appName')}</title>
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
            <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold' }}>
              {t('login.title')}
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label={t('login.email')}
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label={t('login.password')}
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={toggleShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Button
                  variant="text"
                  size="small"
                  onClick={handleForgotPassword}
                  disabled={loading || !email}
                >
                  {t('login.forgotPassword')}
                </Button>
              </Box>

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
                  t('login.submit')
                )}
              </Button>

              <Divider sx={{ my: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {t('login.or')}
                </Typography>
              </Divider>

              <Box sx={{ mt: 1, mb: 2 }}>
                <Typography variant="body2" align="center" sx={{ mb: 2 }}>
                  {t('login.newUser')}
                </Typography>
                <Link href="/register" passHref>
                  <Button
                    fullWidth
                    variant="outlined"
                    sx={{ py: 1.5 }}
                  >
                    {t('login.createAccount')}
                  </Button>
                </Link>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>

      <Snackbar
        open={showSuccessMessage}
        autoHideDuration={6000}
        onClose={handleCloseSuccessMessage}
        message={successMessage}
      />
    </>
  );
}

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  };
}