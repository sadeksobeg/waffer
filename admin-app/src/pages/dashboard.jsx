import React from 'react';
import { 
  Grid,
  Paper,
  Typography,
  Box,
  Container,
  Button
} from '@mui/material';
import {
  People as PeopleIcon,
  LocalOffer as CouponIcon,
  Redeem as RedeemIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard (Direct File)
        </Typography>

        <Button component={Link} href="/" variant="outlined">
          Back to Home
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 140, alignItems: 'center', justifyContent: 'center' }}>
            <PeopleIcon sx={{ fontSize: 40, mb: 1, color: 'primary.main' }} />
            <Typography variant="h6" gutterBottom align="center">
              Total Users
            </Typography>
            <Typography variant="h4">
              1,234
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 140, alignItems: 'center', justifyContent: 'center' }}>
            <CouponIcon sx={{ fontSize: 40, mb: 1, color: 'secondary.main' }} />
            <Typography variant="h6" gutterBottom align="center">
              Active Coupons
            </Typography>
            <Typography variant="h4">
              567
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 140, alignItems: 'center', justifyContent: 'center' }}>
            <RedeemIcon sx={{ fontSize: 40, mb: 1, color: 'success.main' }} />
            <Typography variant="h6" gutterBottom align="center">
              Redemptions
            </Typography>
            <Typography variant="h4">
              890
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 140, alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUpIcon sx={{ fontSize: 40, mb: 1, color: 'info.main' }} />
            <Typography variant="h6" gutterBottom align="center">
              Active Users
            </Typography>
            <Typography variant="h4">
              456
            </Typography>
          </Paper>
        </Grid>

        {/* Charts */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body1">
                Chart would go here in the full dashboard
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

// Simplified version without TypeScript and getServerSideProps
export async function getServerSideProps({ locale }) {
  // Import dynamically to avoid TypeScript errors
  const { serverSideTranslations } = require('next-i18next/serverSideTranslations');
  
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  };
}
