import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import {
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Skeleton,
  Alert,
  Snackbar
} from '@mui/material';
import {
  People as PeopleIcon,
  LocalOffer as CouponIcon,
  BarChart as AnalyticsIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import AdminLayout from '../components/layout/AdminLayout';
import withAuth from '../components/auth/withAuth';
import { collection, getDocs, query, limit, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';

// Define types for our data
interface StatData {
  title: string;
  value: string;
  icon: React.ReactNode;
  isLoading: boolean;
}

interface RecentActivity {
  id: string;
  action: string;
  user: string;
  timestamp: Date;
}

interface TopCoupon {
  id: string;
  code: string;
  redemptions: number;
  discount: string;
}

const Dashboard: React.FC = () => {
  // State for dashboard data
  const [stats, setStats] = useState<StatData[]>([
    { title: 'Total Users', value: '0', icon: <PeopleIcon color="primary" fontSize="large" />, isLoading: true },
    { title: 'Active Coupons', value: '0', icon: <CouponIcon color="secondary" fontSize="large" />, isLoading: true },
    { title: 'Redemptions', value: '0', icon: <AnalyticsIcon color="success" fontSize="large" />, isLoading: true },
    { title: 'Conversion Rate', value: '0%', icon: <TrendingUpIcon color="info" fontSize="large" />, isLoading: true },
  ]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [topCoupons, setTopCoupons] = useState<TopCoupon[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch stats
        const newStats = [...stats];

        // Simulate API delay for demonstration
        setTimeout(() => {
          newStats[0].value = '1,245';
          newStats[0].isLoading = false;
          setStats([...newStats]);
        }, 1000);

        setTimeout(() => {
          newStats[1].value = '42';
          newStats[1].isLoading = false;
          setStats([...newStats]);
        }, 1500);

        setTimeout(() => {
          newStats[2].value = '8,753';
          newStats[2].isLoading = false;
          setStats([...newStats]);
        }, 2000);

        setTimeout(() => {
          newStats[3].value = '24%';
          newStats[3].isLoading = false;
          setStats([...newStats]);
        }, 2500);

        // In a real implementation, you would fetch data from Firestore
        // Example:
        // const usersSnapshot = await getDocs(collection(db, 'users'));
        // newStats[0].value = usersSnapshot.size.toLocaleString();
        // newStats[0].isLoading = false;

        // Fetch recent activities
        setTimeout(() => {
          const mockActivities: RecentActivity[] = [
            { id: '1', action: 'Created coupon SUMMER2023', user: 'admin@example.com', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
            { id: '2', action: 'Updated user permissions', user: 'admin@example.com', timestamp: new Date(Date.now() - 1000 * 60 * 30) },
            { id: '3', action: 'Deleted expired coupons', user: 'manager@example.com', timestamp: new Date(Date.now() - 1000 * 60 * 60) },
            { id: '4', action: 'Added new user', user: 'admin@example.com', timestamp: new Date(Date.now() - 1000 * 60 * 120) },
          ];
          setRecentActivities(mockActivities);
          setIsLoadingActivities(false);
        }, 1800);

        // Fetch top coupons
        setTimeout(() => {
          const mockTopCoupons: TopCoupon[] = [
            { id: '1', code: 'WELCOME10', redemptions: 342, discount: '10%' },
            { id: '2', code: 'SUMMER2023', redemptions: 256, discount: '20%' },
            { id: '3', code: 'NEWUSER', redemptions: 187, discount: '15%' },
          ];
          setTopCoupons(mockTopCoupons);
          setIsLoadingCoupons(false);
        }, 2200);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');

        // Set loading to false for all items
        setStats(stats.map(stat => ({ ...stat, isLoading: false })));
        setIsLoadingActivities(false);
        setIsLoadingCoupons(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleCloseError = () => {
    setError(null);
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <AdminLayout title="Dashboard">
      <Head>
        <title>Admin Dashboard</title>
        <meta name="description" content="Admin Dashboard for Coupon Platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard Overview
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome to the Coupon Platform Admin Dashboard
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: 140,
              }}
            >
              {stat.icon}
              {stat.isLoading ? (
                <Skeleton variant="text" width="60%" height={40} sx={{ mt: 2 }} />
              ) : (
                <Typography variant="h5" component="div" sx={{ mt: 2 }}>
                  {stat.value}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                {stat.title}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: 300 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            {isLoadingActivities ? (
              <Box sx={{ p: 2 }}>
                {[...Array(4)].map((_, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Skeleton variant="text" width="70%" height={24} />
                    <Skeleton variant="text" width="40%" height={20} />
                  </Box>
                ))}
              </Box>
            ) : recentActivities.length > 0 ? (
              <Box sx={{ maxHeight: 230, overflow: 'auto' }}>
                {recentActivities.map((activity) => (
                  <Box key={activity.id} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #eee' }}>
                    <Typography variant="body1">{activity.action}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      By {activity.user} • {formatDate(activity.timestamp)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ height: '90%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No recent activity found
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 300 }}>
            <Typography variant="h6" gutterBottom>
              Top Performing Coupons
            </Typography>
            {isLoadingCoupons ? (
              <Box sx={{ p: 2 }}>
                {[...Array(3)].map((_, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Skeleton variant="text" width="60%" height={24} />
                    <Skeleton variant="text" width="30%" height={20} />
                  </Box>
                ))}
              </Box>
            ) : topCoupons.length > 0 ? (
              <Box sx={{ maxHeight: 230, overflow: 'auto' }}>
                {topCoupons.map((coupon) => (
                  <Box key={coupon.id} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #eee' }}>
                    <Typography variant="body1" fontWeight="bold">
                      {coupon.code} ({coupon.discount})
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {coupon.redemptions.toLocaleString()} redemptions
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ height: '90%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No coupons found
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </AdminLayout>
  );
};

// Wrap the Dashboard component with the withAuth HOC
export default withAuth(Dashboard);
