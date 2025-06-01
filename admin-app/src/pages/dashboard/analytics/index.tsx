import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import {
  Download as DownloadIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Timeline as TimelineIcon,
  People as PeopleIcon,
  LocalOffer as CouponIcon,
  Redeem as RedeemIcon
} from '@mui/icons-material';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import StatsCard from '../../../components/analytics/StatsCard';
import LineChart from '../../../components/analytics/LineChart';
import BarChart from '../../../components/analytics/BarChart';
import PieChart from '../../../components/analytics/PieChart';
import DataTable from '../../../components/analytics/DataTable';
import PeriodSelector, { Period } from '../../../components/analytics/PeriodSelector';
import analyticsService, {
  UserStats,
  CouponStats,
  RedemptionStats
} from '@/services/analyticsService';

// Tab panel component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  const { t } = useTranslation(['analytics', 'common']);

  // State for analytics data
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [tabValue, setTabValue] = useState(0);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [couponStats, setCouponStats] = useState<CouponStats | null>(null);
  const [redemptionStats, setRedemptionStats] = useState<RedemptionStats | null>(null);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState(false);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch analytics data based on current tab
      if (tabValue === 0) {
        // User analytics
        const data = await analyticsService.getUserStats(period);
        setUserStats(data);
      } else if (tabValue === 1) {
        // Coupon analytics
        const data = await analyticsService.getCouponStats(period);
        setCouponStats(data);
      } else if (tabValue === 2) {
        // Redemption analytics
        const data = await analyticsService.getRedemptionStats(period);
        setRedemptionStats(data);
      }
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [period, tabValue]);

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  const handlePeriodChange = (newPeriod: Period) => {
    if (newPeriod === 'week' || newPeriod === 'month' || newPeriod === 'year') {
      setPeriod(newPeriod);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleExportAnalytics = async () => {
    try {
      setExportLoading(true);

      // Export analytics data as CSV
      const blob = await analyticsService.exportAnalytics('csv', period);

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-export-${period}.csv`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess(t('analytics:exportSuccess'));
    } catch (err) {
      console.error('Error exporting analytics:', err);
      setError(t('analytics:exportError'));
    } finally {
      setExportLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCloseError = () => {
    setError(null);
  };

  const handleCloseSuccess = () => {
    setSuccess(null);
  };

  return (
    <DashboardLayout title={t('analytics:title')}>
      {error && (
        <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
          <Alert onClose={handleCloseError} severity="error">
            {error}
          </Alert>
        </Snackbar>
      )}

      {success && (
        <Snackbar open={!!success} autoHideDuration={3000} onClose={handleCloseSuccess}>
          <Alert onClose={handleCloseSuccess} severity="success">
            {success}
          </Alert>
        </Snackbar>
      )}

      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {t('analytics:title')}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {t('analytics:description')}
          </Typography>
        </Box>

        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <PeriodSelector
            value={period}
            onChange={handlePeriodChange}
            showToday={false}
            showYesterday={false}
          />

          <Button
            startIcon={exportLoading ? <CircularProgress size={20} /> : <DownloadIcon />}
            onClick={handleExportAnalytics}
            disabled={loading || exportLoading}
            variant="outlined"
            size="small"
          >
            {exportLoading ? t('common:exporting') : t('analytics:export')}
          </Button>

          <Button
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            disabled={loading}
            variant="outlined"
            size="small"
          >
            {t('common:print')}
          </Button>

          <Button
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
            variant="outlined"
            size="small"
          >
            {t('analytics:refresh')}
          </Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="analytics tabs"
          variant="fullWidth"
        >
          <Tab
            icon={<PeopleIcon />}
            label={t('analytics:tabs.users')}
            id="analytics-tab-0"
            iconPosition="start"
          />
          <Tab
            icon={<CouponIcon />}
            label={t('analytics:tabs.coupons')}
            id="analytics-tab-1"
            iconPosition="start"
          />
          <Tab
            icon={<RedeemIcon />}
            label={t('analytics:tabs.redemptions')}
            id="analytics-tab-2"
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      <Box className="analytics-content" sx={{ '@media print': { margin: 0 } }}>
        {/* User Analytics */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* User Stats Cards */}
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title={t('analytics:users.totalUsers')}
                value={userStats?.totalUsers?.toLocaleString() || '0'}
                icon={<PeopleIcon />}
                loading={loading}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title={t('analytics:users.activeUsers')}
                value={userStats?.activeUsers?.toLocaleString() || '0'}
                icon={<PeopleIcon />}
                change={userStats?.activeUsers && userStats?.totalUsers
                  ? Math.round((userStats.activeUsers / userStats.totalUsers) * 100)
                  : 0}
                changeLabel={t('analytics:users.ofTotalUsers')}
                loading={loading}
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title={t('analytics:users.newUsers')}
                value={userStats?.newUsers?.toLocaleString() || '0'}
                icon={<PeopleIcon />}
                loading={loading}
                color="info"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title={t('analytics:users.inactiveUsers')}
                value={userStats?.usersByStatus?.inactive?.toLocaleString() || '0'}
                icon={<PeopleIcon />}
                loading={loading}
                color="warning"
              />
            </Grid>

            {/* User Growth Chart */}
            <Grid item xs={12} md={8}>
              <LineChart
                title={t('analytics:users.userGrowth')}
                data={userStats?.userGrowth || []}
                xAxisKey="date"
                series={[
                  { name: t('analytics:users.newUsers'), dataKey: 'count' }
                ]}
                loading={loading}
                height={350}
                subtitle={t('analytics:users.userGrowthSubtitle')}
              />
            </Grid>

            {/* User by Role Chart */}
            <Grid item xs={12} md={4}>
              <PieChart
                title={t('analytics:users.usersByRole')}
                data={userStats ? [
                  { name: t('analytics:users.roles.customer'), value: userStats.usersByRole.customer || 0 },
                  { name: t('analytics:users.roles.merchant'), value: userStats.usersByRole.merchant || 0 },
                  { name: t('analytics:users.roles.admin'), value: userStats.usersByRole.admin || 0 },
                  { name: t('analytics:users.roles.support'), value: userStats.usersByRole.support || 0 }
                ] : []}
                loading={loading}
                height={350}
                subtitle={t('analytics:users.usersByRoleSubtitle')}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Coupon Analytics */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            {/* Coupon Stats Cards */}
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title={t('analytics:coupons.totalCoupons')}
                value={couponStats?.totalCoupons?.toLocaleString() || '0'}
                icon={<CouponIcon />}
                loading={loading}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title={t('analytics:coupons.activeCoupons')}
                value={couponStats?.activeCoupons?.toLocaleString() || '0'}
                icon={<CouponIcon />}
                change={couponStats?.activeCoupons && couponStats?.totalCoupons
                  ? Math.round((couponStats.activeCoupons / couponStats.totalCoupons) * 100)
                  : 0}
                changeLabel={t('analytics:coupons.ofTotalCoupons')}
                loading={loading}
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title={t('analytics:coupons.newCoupons')}
                value={couponStats?.newCoupons?.toLocaleString() || '0'}
                icon={<CouponIcon />}
                loading={loading}
                color="info"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title={t('analytics:coupons.expiredCoupons')}
                value={couponStats?.expiredCoupons?.toLocaleString() || '0'}
                icon={<CouponIcon />}
                loading={loading}
                color="warning"
              />
            </Grid>

            {/* Coupon Growth Chart */}
            <Grid item xs={12} md={8}>
              <LineChart
                title={t('analytics:coupons.couponGrowth')}
                data={couponStats?.couponGrowth || []}
                xAxisKey="date"
                series={[
                  { name: t('analytics:coupons.newCoupons'), dataKey: 'count' }
                ]}
                loading={loading}
                height={350}
                subtitle={t('analytics:coupons.couponGrowthSubtitle')}
              />
            </Grid>

            {/* Coupons by Category Chart */}
            <Grid item xs={12} md={4}>
              <PieChart
                title={t('analytics:coupons.couponsByCategory')}
                data={couponStats ? Object.entries(couponStats.couponsByCategory || {}).map(([name, value]) => ({
                  name,
                  value
                })) : []}
                loading={loading}
                height={350}
                subtitle={t('analytics:coupons.couponsByCategorySubtitle')}
              />
            </Grid>

            {/* Coupons by Merchant */}
            <Grid item xs={12}>
              <BarChart
                title={t('analytics:coupons.couponsByMerchant')}
                data={couponStats?.couponsByMerchant || []}
                xAxisKey="merchantName"
                series={[
                  { name: t('analytics:coupons.count'), dataKey: 'count' }
                ]}
                loading={loading}
                height={400}
                subtitle={t('analytics:coupons.couponsByMerchantSubtitle')}
                layout="vertical"
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Redemption Analytics */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            {/* Redemption Stats Cards */}
            <Grid item xs={12} sm={6} md={6}>
              <StatsCard
                title={t('analytics:redemptions.totalRedemptions')}
                value={redemptionStats?.totalRedemptions?.toLocaleString() || '0'}
                icon={<RedeemIcon />}
                loading={loading}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <StatsCard
                title={t('analytics:redemptions.newRedemptions')}
                value={redemptionStats?.newRedemptions?.toLocaleString() || '0'}
                icon={<RedeemIcon />}
                loading={loading}
                color="success"
              />
            </Grid>

            {/* Redemption Growth Chart */}
            <Grid item xs={12} md={8}>
              <LineChart
                title={t('analytics:redemptions.redemptionGrowth')}
                data={redemptionStats?.redemptionGrowth || []}
                xAxisKey="date"
                series={[
                  { name: t('analytics:redemptions.count'), dataKey: 'count' }
                ]}
                loading={loading}
                height={350}
                subtitle={t('analytics:redemptions.redemptionGrowthSubtitle')}
              />
            </Grid>

            {/* Redemptions by Category Chart */}
            <Grid item xs={12} md={4}>
              <PieChart
                title={t('analytics:redemptions.redemptionsByCategory')}
                data={redemptionStats ? Object.entries(redemptionStats.redemptionsByCategory || {}).map(([name, value]) => ({
                  name,
                  value
                })) : []}
                loading={loading}
                height={350}
                subtitle={t('analytics:redemptions.redemptionsByCategorySubtitle')}
              />
            </Grid>

            {/* Top Coupons */}
            <Grid item xs={12} md={6}>
              <DataTable
                title={t('analytics:redemptions.topCoupons')}
                columns={[
                  { id: 'couponTitle', label: t('analytics:redemptions.couponTitle'), minWidth: 200 },
                  { id: 'count', label: t('analytics:redemptions.redemptions'), align: 'right' }
                ]}
                data={redemptionStats?.topCoupons || []}
                loading={loading}
                subtitle={t('analytics:redemptions.topCouponsSubtitle')}
                maxHeight={400}
              />
            </Grid>

            {/* Redemptions by Merchant */}
            <Grid item xs={12} md={6}>
              <BarChart
                title={t('analytics:redemptions.redemptionsByMerchant')}
                data={redemptionStats?.redemptionsByMerchant || []}
                xAxisKey="merchantName"
                series={[
                  { name: t('analytics:redemptions.count'), dataKey: 'count' }
                ]}
                loading={loading}
                height={400}
                subtitle={t('analytics:redemptions.redemptionsByMerchantSubtitle')}
                layout="vertical"
              />
            </Grid>
          </Grid>
        </TabPanel>
      </Box>
    </DashboardLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common', 'analytics'])),
    },
  };
};
