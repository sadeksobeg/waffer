import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Box,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  LocalOffer as CouponIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Analytics as AnalyticsIcon,
  Security as SecurityIcon,
  Language as LanguageIcon
} from '@mui/icons-material';
import AdminLayout from '../components/layout/AdminLayout';
import withAuth from '../components/auth/withAuth';
import { useAuth } from '../contexts/AuthContext';

// Define the admin module type
interface AdminModule {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
  requiredRole?: string;
}

const Admin: React.FC = () => {
  const router = useRouter();
  const { userRole } = useAuth();

  const adminModules: AdminModule[] = [
    {
      title: 'Dashboard',
      description: 'View platform overview and key metrics',
      icon: <DashboardIcon fontSize="large" color="primary" />,
      path: '/dashboard'
    },
    {
      title: 'User Management',
      description: 'Manage user accounts and permissions',
      icon: <PeopleIcon fontSize="large" color="primary" />,
      path: '/admin/users',
      badge: 3,
      requiredRole: 'admin'
    },
    {
      title: 'Coupon Management',
      description: 'Create and manage coupon campaigns',
      icon: <CouponIcon fontSize="large" color="primary" />,
      path: '/admin/coupons'
    },
    {
      title: 'Analytics',
      description: 'View detailed analytics and reports',
      icon: <AnalyticsIcon fontSize="large" color="primary" />,
      path: '/admin/analytics'
    },
    {
      title: 'Settings',
      description: 'Configure platform settings',
      icon: <SettingsIcon fontSize="large" color="primary" />,
      path: '/admin/settings',
      requiredRole: 'admin'
    },
    {
      title: 'Notifications',
      description: 'Manage system notifications',
      icon: <NotificationsIcon fontSize="large" color="primary" />,
      path: '/admin/notifications',
      badge: 5
    },
    {
      title: 'Security',
      description: 'Manage security settings',
      icon: <SecurityIcon fontSize="large" color="primary" />,
      path: '/admin/security',
      requiredRole: 'admin'
    },
    {
      title: 'Localization',
      description: 'Manage languages and translations',
      icon: <LanguageIcon fontSize="large" color="primary" />,
      path: '/admin/localization',
      requiredRole: 'admin'
    }
  ];

  // Filter modules based on user role
  const filteredModules = adminModules.filter(module =>
    !module.requiredRole || (userRole && module.requiredRole === userRole)
  );

  return (
    <AdminLayout title="Admin Portal">
      <Head>
        <title>Admin Portal</title>
        <meta name="description" content="Admin Portal for Coupon Platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Portal
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Main administration portal for the Coupon Platform
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {filteredModules.map((module, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
              }
            }}>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                {module.badge ? (
                  <Badge badgeContent={module.badge} color="error">
                    {module.icon}
                  </Badge>
                ) : (
                  module.icon
                )}
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  {module.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {module.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => router.push(module.path)}
                >
                  Access
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </AdminLayout>
  );
};

// Wrap the Admin component with the withAuth HOC
// Specify that this page requires admin role
export default withAuth(Admin, { requiredRole: 'admin' });
