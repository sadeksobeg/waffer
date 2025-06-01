import React from 'react';
import { useTranslation } from 'next-i18next';
import { Grid, Paper, Box, Typography, Avatar } from '@mui/material';
import { 
  LocalOffer as CouponIcon,
  Redeem as RedemptionIcon,
  People as UserIcon,
  Savings as SavingsIcon,
  TrendingUp as UpIcon,
  TrendingDown as DownIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

// Mock data for analytics
const mockAnalyticsData = {
  totalCoupons: 342,
  totalCouponsChange: 8.7,
  totalRedemptions: 2567,
  totalRedemptionsChange: 15.3,
  activeUsers: 1245,
  activeUsersChange: 12.5,
  totalSavings: 12450,
  totalSavingsChange: 9.2,
};

interface OverviewStatsProps {
  startDate: Date | null;
  endDate: Date | null;
}

export default function OverviewStats({ startDate, endDate }: OverviewStatsProps) {
  const { t } = useTranslation(['common', 'analytics']);
  const theme = useTheme();
  
  // In a real app, you would fetch data based on the date range
  // For now, we'll just use the mock data
  
  const stats = [
    {
      title: t('analytics:stats.totalCoupons'),
      value: mockAnalyticsData.totalCoupons,
      change: mockAnalyticsData.totalCouponsChange,
      icon: <CouponIcon />,
      color: theme.palette.primary.main,
    },
    {
      title: t('analytics:stats.totalRedemptions'),
      value: mockAnalyticsData.totalRedemptions,
      change: mockAnalyticsData.totalRedemptionsChange,
      icon: <RedemptionIcon />,
      color: theme.palette.secondary.main,
    },
    {
      title: t('analytics:stats.activeUsers'),
      value: mockAnalyticsData.activeUsers,
      change: mockAnalyticsData.activeUsersChange,
      icon: <UserIcon />,
      color: theme.palette.info.main,
    },
    {
      title: t('analytics:stats.totalSavings'),
      value: `$${mockAnalyticsData.totalSavings.toLocaleString()}`,
      change: mockAnalyticsData.totalSavingsChange,
      icon: <SavingsIcon />,
      color: theme.palette.success.main,
    },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {stats.map((stat) => (
        <Grid item xs={12} sm={6} md={3} key={stat.title}>
          <Paper 
            sx={{ 
              p: 2, 
              height: '100%',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
              },
            }}
          >
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar
                sx={{
                  bgcolor: `${stat.color}20`,
                  color: stat.color,
                  mr: 2,
                }}
              >
                {stat.icon}
              </Avatar>
              <Typography variant="h6" component="div">
                {stat.title}
              </Typography>
            </Box>
            
            <Typography variant="h4" component="div" gutterBottom>
              {stat.value}
            </Typography>
            
            <Box display="flex" alignItems="center">
              {stat.change >= 0 ? (
                <UpIcon fontSize="small" sx={{ color: 'success.main', mr: 0.5 }} />
              ) : (
                <DownIcon fontSize="small" sx={{ color: 'error.main', mr: 0.5 }} />
              )}
              <Typography 
                variant="body2" 
                color={stat.change >= 0 ? 'success.main' : 'error.main'}
              >
                {Math.abs(stat.change)}% from previous period
              </Typography>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
