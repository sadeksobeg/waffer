import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Alert,
  Snackbar,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import {
  ContentCopy as ContentCopyIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Language as LanguageIcon,
  Api as ApiIcon,
  Settings as SettingsIcon,
  ColorLens as ColorLensIcon,
} from '@mui/icons-material';
import AdminLayout from '../../components/layout/AdminLayout';
import withAuth from '../../components/auth/withAuth';
import { useAuth } from '../../contexts/AuthContext';

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
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Settings: React.FC = () => {
  const { currentUser } = useAuth();

  // Tab state
  const [tabValue, setTabValue] = useState(0);

  // General settings state
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Coupon Platform',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    emailNotifications: true,
  });

  // API settings state
  const [apiKey, setApiKey] = useState('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
  const [showApiKey, setShowApiKey] = useState(false);
  const [regenerateKeyDialogOpen, setRegenerateKeyDialogOpen] = useState(false);

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    newUserRegistration: true,
    couponRedemption: true,
    couponExpiry: true,
    systemUpdates: false,
    securityAlerts: true,
    marketingCampaigns: false,
  });

  // Appearance settings state
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light',
    primaryColor: '#1976d2',
    secondaryColor: '#dc004e',
    sidebarCollapsed: false,
    denseMode: false,
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle general settings change
  const handleGeneralSettingChange = (event: React.ChangeEvent<HTMLInputElement> | SelectChangeEvent) => {
    const { name, value } = event.target;
    setGeneralSettings({
      ...generalSettings,
      [name]: value,
    });
  };

  // Handle switch change
  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>, settingsType: 'general' | 'notification' | 'appearance') => {
    const { name, checked } = event.target;

    if (settingsType === 'general') {
      setGeneralSettings({
        ...generalSettings,
        [name]: checked,
      });
    } else if (settingsType === 'notification') {
      setNotificationSettings({
        ...notificationSettings,
        [name]: checked,
      });
    } else if (settingsType === 'appearance') {
      setAppearanceSettings({
        ...appearanceSettings,
        [name]: checked,
      });
    }
  };

  // Handle appearance settings change
  const handleAppearanceSettingChange = (event: React.ChangeEvent<HTMLInputElement> | SelectChangeEvent) => {
    const { name, value } = event.target;
    setAppearanceSettings({
      ...appearanceSettings,
      [name]: value,
    });
  };

  // Handle save settings
  const handleSaveSettings = (settingsType: 'general' | 'notification' | 'appearance') => {
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccessMessage(`${settingsType.charAt(0).toUpperCase() + settingsType.slice(1)} settings saved successfully!`);
    }, 1000);
  };

  // Handle copy API key
  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setSuccessMessage('API key copied to clipboard!');
  };

  // Handle regenerate API key
  const handleRegenerateApiKey = () => {
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Generate a random API key
      const newApiKey = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'.replace(/[x]/g, () => {
        return Math.floor(Math.random() * 16).toString(16);
      });

      setApiKey(newApiKey);
      setShowApiKey(true);
      setLoading(false);
      setRegenerateKeyDialogOpen(false);
      setSuccessMessage('API key regenerated successfully!');
    }, 1000);
  };

  return (
    <AdminLayout title="Settings">
      <Head>
        <title>Settings - Admin Dashboard</title>
        <meta name="description" content="Settings for Coupon Platform" />
      </Head>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure platform settings and preferences
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="settings tabs"
        >
          <Tab icon={<SettingsIcon />} label="General" {...a11yProps(0)} />
          <Tab icon={<ApiIcon />} label="API" {...a11yProps(1)} />
          <Tab icon={<NotificationsIcon />} label="Notifications" {...a11yProps(2)} />
          <Tab icon={<ColorLensIcon />} label="Appearance" {...a11yProps(3)} />
          <Tab icon={<SecurityIcon />} label="Security" {...a11yProps(4)} />
        </Tabs>

        {/* General Settings */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Site Name"
                name="siteName"
                value={generalSettings.siteName}
                onChange={handleGeneralSettingChange}
                sx={{ mb: 3 }}
              />

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="language-label">Language</InputLabel>
                <Select
                  labelId="language-label"
                  id="language-select"
                  name="language"
                  value={generalSettings.language}
                  label="Language"
                  onChange={handleGeneralSettingChange}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                  <MenuItem value="de">German</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="timezone-label">Timezone</InputLabel>
                <Select
                  labelId="timezone-label"
                  id="timezone-select"
                  name="timezone"
                  value={generalSettings.timezone}
                  label="Timezone"
                  onChange={handleGeneralSettingChange}
                >
                  <MenuItem value="UTC">UTC</MenuItem>
                  <MenuItem value="EST">Eastern Time (EST)</MenuItem>
                  <MenuItem value="CST">Central Time (CST)</MenuItem>
                  <MenuItem value="MST">Mountain Time (MST)</MenuItem>
                  <MenuItem value="PST">Pacific Time (PST)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="date-format-label">Date Format</InputLabel>
                <Select
                  labelId="date-format-label"
                  id="date-format-select"
                  name="dateFormat"
                  value={generalSettings.dateFormat}
                  label="Date Format"
                  onChange={handleGeneralSettingChange}
                >
                  <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                  <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                  <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    name="emailNotifications"
                    checked={generalSettings.emailNotifications}
                    onChange={(e) => handleSwitchChange(e, 'general')}
                    color="primary"
                  />
                }
                label="Email Notifications"
                sx={{ mb: 3, display: 'block' }}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                onClick={() => handleSaveSettings('general')}
                disabled={loading}
              >
                Save General Settings
              </Button>
            </Grid>
          </Grid>
        </TabPanel>

        {/* API Settings */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                API Key
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Use this API key to authenticate requests to the Coupon Platform API.
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 3 }}>
                <TextField
                  fullWidth
                  label="API Key"
                  value={showApiKey ? apiKey : '•'.repeat(apiKey.length)}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <Tooltip title="Copy API Key">
                        <IconButton onClick={handleCopyApiKey} edge="end">
                          <ContentCopyIcon />
                        </IconButton>
                      </Tooltip>
                    ),
                  }}
                  sx={{ mr: 2 }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={showApiKey}
                      onChange={(e) => setShowApiKey(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Show"
                />
              </Box>

              <Button
                variant="outlined"
                color="primary"
                startIcon={<RefreshIcon />}
                onClick={() => setRegenerateKeyDialogOpen(true)}
                sx={{ mr: 2 }}
              >
                Regenerate Key
              </Button>

              <Typography variant="subtitle1" sx={{ mt: 4, mb: 2 }}>
                API Documentation
              </Typography>
              <Typography variant="body2" paragraph>
                Access our API documentation to learn how to integrate with the Coupon Platform.
              </Typography>
              <Button variant="outlined">
                View API Documentation
              </Button>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Notification Settings */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" gutterBottom>
                Email Notifications
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    name="newUserRegistration"
                    checked={notificationSettings.newUserRegistration}
                    onChange={(e) => handleSwitchChange(e, 'notification')}
                    color="primary"
                  />
                }
                label="New User Registration"
                sx={{ mb: 1, display: 'block' }}
              />
              <FormControlLabel
                control={
                  <Switch
                    name="couponRedemption"
                    checked={notificationSettings.couponRedemption}
                    onChange={(e) => handleSwitchChange(e, 'notification')}
                    color="primary"
                  />
                }
                label="Coupon Redemption"
                sx={{ mb: 1, display: 'block' }}
              />
              <FormControlLabel
                control={
                  <Switch
                    name="couponExpiry"
                    checked={notificationSettings.couponExpiry}
                    onChange={(e) => handleSwitchChange(e, 'notification')}
                    color="primary"
                  />
                }
                label="Coupon Expiry"
                sx={{ mb: 1, display: 'block' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" gutterBottom>
                System Notifications
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    name="systemUpdates"
                    checked={notificationSettings.systemUpdates}
                    onChange={(e) => handleSwitchChange(e, 'notification')}
                    color="primary"
                  />
                }
                label="System Updates"
                sx={{ mb: 1, display: 'block' }}
              />
              <FormControlLabel
                control={
                  <Switch
                    name="securityAlerts"
                    checked={notificationSettings.securityAlerts}
                    onChange={(e) => handleSwitchChange(e, 'notification')}
                    color="primary"
                  />
                }
                label="Security Alerts"
                sx={{ mb: 1, display: 'block' }}
              />
              <FormControlLabel
                control={
                  <Switch
                    name="marketingCampaigns"
                    checked={notificationSettings.marketingCampaigns}
                    onChange={(e) => handleSwitchChange(e, 'notification')}
                    color="primary"
                  />
                }
                label="Marketing Campaigns"
                sx={{ mb: 1, display: 'block' }}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                onClick={() => handleSaveSettings('notification')}
                disabled={loading}
              >
                Save Notification Settings
              </Button>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Appearance Settings */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="theme-label">Theme</InputLabel>
                <Select
                  labelId="theme-label"
                  id="theme-select"
                  name="theme"
                  value={appearanceSettings.theme}
                  label="Theme"
                  onChange={handleAppearanceSettingChange}
                >
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="system">System Default</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Primary Color"
                name="primaryColor"
                value={appearanceSettings.primaryColor}
                onChange={handleAppearanceSettingChange}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        backgroundColor: appearanceSettings.primaryColor,
                        mr: 1,
                      }}
                    />
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Secondary Color"
                name="secondaryColor"
                value={appearanceSettings.secondaryColor}
                onChange={handleAppearanceSettingChange}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        backgroundColor: appearanceSettings.secondaryColor,
                        mr: 1,
                      }}
                    />
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" gutterBottom>
                Layout Options
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    name="sidebarCollapsed"
                    checked={appearanceSettings.sidebarCollapsed}
                    onChange={(e) => handleSwitchChange(e, 'appearance')}
                    color="primary"
                  />
                }
                label="Collapsed Sidebar by Default"
                sx={{ mb: 1, display: 'block' }}
              />
              <FormControlLabel
                control={
                  <Switch
                    name="denseMode"
                    checked={appearanceSettings.denseMode}
                    onChange={(e) => handleSwitchChange(e, 'appearance')}
                    color="primary"
                  />
                }
                label="Dense Mode (Compact UI)"
                sx={{ mb: 1, display: 'block' }}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                onClick={() => handleSaveSettings('appearance')}
                disabled={loading}
              >
                Save Appearance Settings
              </Button>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Security Settings */}
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Password Settings
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                sx={{ mr: 2, mb: 3 }}
              >
                Change Password
              </Button>

              <Typography variant="subtitle1" gutterBottom>
                Two-Factor Authentication
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Enable two-factor authentication to add an extra layer of security to your account.
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                sx={{ mr: 2, mb: 3 }}
              >
                Setup Two-Factor Authentication
              </Button>

              <Typography variant="subtitle1" gutterBottom>
                Session Management
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                View and manage your active sessions.
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                sx={{ mr: 2 }}
              >
                Manage Sessions
              </Button>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Regenerate API Key Dialog */}
      <Dialog
        open={regenerateKeyDialogOpen}
        onClose={() => setRegenerateKeyDialogOpen(false)}
      >
        <DialogTitle>Regenerate API Key</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to regenerate your API key? This will invalidate your current key and any applications using it will stop working until updated with the new key.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegenerateKeyDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleRegenerateApiKey}
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Regenerate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessMessage(null)} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>
    </AdminLayout>
  );
};

export default withAuth(Settings, { requiredRole: 'admin' });
