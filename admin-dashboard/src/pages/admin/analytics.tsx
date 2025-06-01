import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  CircularProgress,
  Skeleton,
  Alert,
  Snackbar,
  Tooltip,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import AdminLayout from '../../components/layout/AdminLayout';
import withAuth from '../../components/auth/withAuth';

// Mock data for charts
const generateRedemptionData = (days: number) => {
  const data = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    data.push({
      date: date.toISOString().split('T')[0],
      redemptions: Math.floor(Math.random() * 100) + 50,
      newUsers: Math.floor(Math.random() * 30) + 10,
    });
  }

  return data;
};

const couponTypeData = [
  { name: 'Percentage', value: 65 },
  { name: 'Fixed Amount', value: 35 },
];

const deviceData = [
  { name: 'Mobile', value: 68 },
  { name: 'Desktop', value: 27 },
  { name: 'Tablet', value: 5 },
];

const channelData = [
  { name: 'Direct', value: 35 },
  { name: 'Email', value: 25 },
  { name: 'Social', value: 20 },
  { name: 'Referral', value: 15 },
  { name: 'Other', value: 5 },
];

const topCouponsData = [
  { name: 'WELCOME10', redemptions: 1245 },
  { name: 'SUMMER2023', redemptions: 987 },
  { name: 'NEWUSER', redemptions: 754 },
  { name: 'HOLIDAY25', redemptions: 621 },
  { name: 'FLASH50', redemptions: 432 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redemptionData, setRedemptionData] = useState<any[]>([]);
  const [tabValue, setTabValue] = useState(0);

  // Key metrics
  const [metrics, setMetrics] = useState({
    totalCoupons: 0,
    totalRedemptions: 0,
    averageDiscount: 0,
    conversionRate: 0,
  });

  // Load data based on time range
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Generate mock data based on selected time range
        const days = parseInt(timeRange);
        const data = generateRedemptionData(days);
        setRedemptionData(data);

        // Calculate total redemptions from the data
        const totalRedemptions = data.reduce((sum, item) => sum + item.redemptions, 0);

        // Set mock metrics
        setMetrics({
          totalCoupons: 247,
          totalRedemptions,
          averageDiscount: 22,
          conversionRate: 24,
        });

        setLoading(false);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  const handleTimeRangeChange = (event: SelectChangeEvent) => {
    setTimeRange(event.target.value as string);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRefresh = () => {
    // Reload data with the current time range
    const days = parseInt(timeRange);
    const data = generateRedemptionData(days);
    setRedemptionData(data);

    // Calculate total redemptions from the data
    const totalRedemptions = data.reduce((sum, item) => sum + item.redemptions, 0);

    // Update metrics
    setMetrics({
      ...metrics,
      totalRedemptions,
    });
  };

  const handleDownload = () => {
    // In a real app, this would generate a CSV or PDF report
    alert('This would download an analytics report in a real application.');
  };

  return (
    <AdminLayout title="Analytics">
      <Head>
        <title>Analytics - Admin Dashboard</title>
        <meta name="description" content="Analytics for Coupon Platform" />
      </Head>

      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <div>
          <Typography variant="h4" component="h1" gutterBottom>
            Analytics Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View platform usage and performance metrics
          </Typography>
        </div>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel id="time-range-label">Time Range</InputLabel>
            <Select
              labelId="time-range-label"
              id="time-range-select"
              value={timeRange}
              label="Time Range"
              onChange={handleTimeRangeChange}
            >
              <MenuItem value="7">Last 7 days</MenuItem>
              <MenuItem value="30">Last 30 days</MenuItem>
              <MenuItem value="90">Last 90 days</MenuItem>
              <MenuItem value="365">Last year</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download Report">
            <IconButton onClick={handleDownload}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Coupons Created
              </Typography>
              {loading ? (
                <Skeleton variant="text" width="60%" height={40} />
              ) : (
                <Typography variant="h4">{metrics.totalCoupons.toLocaleString()}</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Redemptions
              </Typography>
              {loading ? (
                <Skeleton variant="text" width="60%" height={40} />
              ) : (
                <Typography variant="h4">{metrics.totalRedemptions.toLocaleString()}</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Average Discount
              </Typography>
              {loading ? (
                <Skeleton variant="text" width="60%" height={40} />
              ) : (
                <Typography variant="h4">{metrics.averageDiscount}%</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Conversion Rate
              </Typography>
              {loading ? (
                <Skeleton variant="text" width="60%" height={40} />
              ) : (
                <Typography variant="h4">{metrics.conversionRate}%</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Chart */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Coupon Performance Over Time
          </Typography>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Redemptions" />
            <Tab label="New Users" />
            <Tab label="Combined" />
          </Tabs>
        </Box>

        {loading ? (
          <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            {tabValue === 0 ? (
              <AreaChart data={redemptionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Area type="monotone" dataKey="redemptions" stroke="#8884d8" fill="#8884d8" name="Redemptions" />
              </AreaChart>
            ) : tabValue === 1 ? (
              <AreaChart data={redemptionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Area type="monotone" dataKey="newUsers" stroke="#82ca9d" fill="#82ca9d" name="New Users" />
              </AreaChart>
            ) : (
              <LineChart data={redemptionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <RechartsTooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="redemptions" stroke="#8884d8" name="Redemptions" />
                <Line yAxisId="right" type="monotone" dataKey="newUsers" stroke="#82ca9d" name="New Users" />
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </Paper>

      {/* Secondary Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Top Performing Coupons
            </Typography>
            {loading ? (
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress />
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topCouponsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="redemptions" fill="#8884d8">
                    {topCouponsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Redemptions by Coupon Type
            </Typography>
            {loading ? (
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress />
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={couponTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {couponTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              User Acquisition Channels
            </Typography>
            {loading ? (
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress />
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={channelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <RechartsTooltip />
                  <Bar dataKey="value" fill="#8884d8">
                    {channelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Redemption by Device
            </Typography>
            {loading ? (
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress />
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </AdminLayout>
  );
};

export default withAuth(Analytics);
