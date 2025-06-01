import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Box, Typography, Container, Paper, Grid, Button } from '@mui/material';
import { Dashboard as DashboardIcon, People as PeopleIcon, LocalOffer as CouponIcon, Settings as SettingsIcon } from '@mui/icons-material';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  // Auto-login in development mode
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && !user && !loading) {
      console.log('Auto-logging in for development mode');
      // This will trigger the mock authentication in development mode
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4">Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h3" component="h1" gutterBottom>
          Admin Dashboard (Direct File)
        </Typography>
        <Typography variant="body1" paragraph>
          Welcome to the Admin Dashboard. Use the links below to navigate to different sections.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 6,
              }
            }}
          >
            <DashboardIcon sx={{ fontSize: 60, mb: 2, color: 'primary.main' }} />
            <Typography variant="h5" gutterBottom>Dashboard</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
              View analytics, recent activity, and key metrics
            </Typography>
            <Button
              component={Link}
              href="/dashboard"
              variant="contained"
              fullWidth
            >
              Go to Dashboard
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 6,
              }
            }}
          >
            <PeopleIcon sx={{ fontSize: 60, mb: 2, color: 'secondary.main' }} />
            <Typography variant="h5" gutterBottom>Users</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
              Manage users, roles, and permissions
            </Typography>
            <Button
              component={Link}
              href="/dashboard/users"
              variant="contained"
              color="secondary"
              fullWidth
            >
              Manage Users
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 6,
              }
            }}
          >
            <CouponIcon sx={{ fontSize: 60, mb: 2, color: 'success.main' }} />
            <Typography variant="h5" gutterBottom>Coupons</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
              Create and manage coupons and promotions
            </Typography>
            <Button
              component={Link}
              href="/dashboard/coupons"
              variant="contained"
              color="success"
              fullWidth
            >
              Manage Coupons
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 6,
              }
            }}
          >
            <SettingsIcon sx={{ fontSize: 60, mb: 2, color: 'info.main' }} />
            <Typography variant="h5" gutterBottom>Settings</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
              Configure system settings and preferences
            </Typography>
            <Button
              component={Link}
              href="/dashboard/settings"
              variant="contained"
              color="info"
              fullWidth
            >
              Manage Settings
            </Button>
          </Paper>
        </Grid>
      </Grid>

      <Box mt={6} textAlign="center">
        <Button
          component={Link}
          href="/firebase-health"
          variant="outlined"
          sx={{ mr: 2 }}
        >
          Firebase Health Check
        </Button>
        <Button
          component={Link}
          href="/simple-dashboard"
          variant="outlined"
        >
          Simple Dashboard
        </Button>
      </Box>
    </Container>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  };
};
