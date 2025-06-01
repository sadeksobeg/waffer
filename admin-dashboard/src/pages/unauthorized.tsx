import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  SvgIcon,
} from '@mui/material';
import { LockOutlined as LockIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Unauthorized: React.FC = () => {
  const router = useRouter();
  const { currentUser, signOut } = useAuth();

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Failed to sign out', error);
    }
  };

  return (
    <>
      <Head>
        <title>Unauthorized - Admin Dashboard</title>
        <meta name="description" content="Unauthorized Access" />
      </Head>
      <Container component="main" maxWidth="md">
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
            <Box
              sx={{
                backgroundColor: 'error.light',
                borderRadius: '50%',
                p: 2,
                mb: 3,
                color: 'white',
              }}
            >
              <LockIcon fontSize="large" />
            </Box>

            <Typography component="h1" variant="h4" gutterBottom>
              Access Denied
            </Typography>

            <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
              You don't have permission to access this page. Please contact your administrator
              if you believe this is an error.
            </Typography>

            {currentUser && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Signed in as: {currentUser.email}
              </Typography>
            )}

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Button variant="outlined" onClick={handleGoBack}>
                Go Back
              </Button>
              <Button variant="outlined" onClick={handleGoHome}>
                Go to Home
              </Button>
              {currentUser && (
                <Button variant="contained" color="primary" onClick={handleSignOut}>
                  Sign Out
                </Button>
              )}
            </Box>
          </Paper>
        </Box>
      </Container>
    </>
  );
};

export default Unauthorized;
