import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  Save as SaveIcon,
  Settings as SettingsIcon,
  Email as EmailIcon,
  Palette as PaletteIcon,
  Build as BuildIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import DashboardLayout from '@/components/layout/DashboardLayout';
import SettingsLayout from '@/components/settings/SettingsLayout';
import { useAuth } from '@/contexts/AuthContext';
import settingsService, { SystemSettings } from '@/services/settingsService';

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
      id={`system-settings-tabpanel-${index}`}
      aria-labelledby={`system-settings-tab-${index}`}
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

export default function SystemSettingsPage() {
  const { t } = useTranslation(['settings', 'common']);
  const { userData } = useAuth();

  // State
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // Fetch system settings
  useEffect(() => {
    const fetchSystemSettings = async () => {
      try {
        setLoading(true);
        const settings = await settingsService.getSystemSettings();
        setSystemSettings(settings);
      } catch (err) {
        console.error('Error fetching system settings:', err);
        setError(t('settings:errors.fetchSystem'));
      } finally {
        setLoading(false);
      }
    };

    fetchSystemSettings();
  }, []);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userData?.id || !systemSettings) return;

    try {
      setSaving(true);
      setError(null);

      await settingsService.updateSystemSettings(systemSettings, userData.id);

      setSuccess(t('settings:success.systemUpdated'));
    } catch (err) {
      console.error('Error updating system settings:', err);
      setError(t('settings:errors.updateSystem'));
    } finally {
      setSaving(false);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!systemSettings) return;

    const { name, value } = e.target;

    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');

      if (parent === 'email') {
        setSystemSettings({
          ...systemSettings,
          email: {
            ...systemSettings.email,
            [child]: value,
          },
        });
      } else if (parent === 'maintenance') {
        setSystemSettings({
          ...systemSettings,
          maintenance: {
            ...systemSettings.maintenance,
            [child]: value,
          },
        });
      } else if (parent === 'features') {
        setSystemSettings({
          ...systemSettings,
          features: {
            ...systemSettings.features,
            [child]: value,
          },
        });
      }
    } else {
      setSystemSettings({
        ...systemSettings,
        [name]: value,
      });
    }
  };

  // Handle switch change
  const handleSwitchChange = (name: string) => {
    if (!systemSettings) return;

    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');

      if (parent === 'features') {
        setSystemSettings({
          ...systemSettings,
          features: {
            ...systemSettings.features,
            [child]: !systemSettings.features[child as keyof typeof systemSettings.features],
          },
        });
      } else if (parent === 'maintenance') {
        setSystemSettings({
          ...systemSettings,
          maintenance: {
            ...systemSettings.maintenance,
            [child]: !systemSettings.maintenance[child as keyof typeof systemSettings.maintenance],
          },
        });
      }
    } else {
      setSystemSettings({
        ...systemSettings,
        [name as keyof typeof systemSettings]: !systemSettings[name as keyof typeof systemSettings],
      });
    }
  };

  // Handle maintenance end date change
  const handleMaintenanceEndChange = (date: Date | null) => {
    if (!systemSettings) return;

    setSystemSettings({
      ...systemSettings,
      maintenance: {
        ...systemSettings.maintenance,
        scheduledEnd: date || undefined,
      },
    });
  };

  // Handle close error
  const handleCloseError = () => {
    setError(null);
  };

  // Handle close success
  const handleCloseSuccess = () => {
    setSuccess(null);
  };

  if (loading) {
    return (
      <DashboardLayout title={t('settings:system.title')}>
        <SettingsLayout>
          <Box display="flex" justifyContent="center" alignItems="center" height="400px">
            <CircularProgress />
          </Box>
        </SettingsLayout>
      </DashboardLayout>
    );
  }

  if (!systemSettings) {
    return (
      <DashboardLayout title={t('settings:system.title')}>
        <SettingsLayout>
          <Alert severity="error">
            {t('settings:errors.fetchSystem')}
          </Alert>
        </SettingsLayout>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t('settings:system.title')}>
      <SettingsLayout>
        <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
          <Alert onClose={handleCloseError} severity="error">
            {error}
          </Alert>
        </Snackbar>

        <Snackbar open={!!success} autoHideDuration={3000} onClose={handleCloseSuccess}>
          <Alert onClose={handleCloseSuccess} severity="success">
            {success}
          </Alert>
        </Snackbar>

        <Typography variant="h6" gutterBottom>
          {t('settings:system.title')}
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          {t('settings:system.description')}
        </Typography>

        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="system settings tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              icon={<SettingsIcon />}
              label={t('settings:system.tabs.general')}
              id="system-settings-tab-0"
              iconPosition="start"
            />
            <Tab
              icon={<PaletteIcon />}
              label={t('settings:system.tabs.appearance')}
              id="system-settings-tab-1"
              iconPosition="start"
            />
            <Tab
              icon={<EmailIcon />}
              label={t('settings:system.tabs.email')}
              id="system-settings-tab-2"
              iconPosition="start"
            />
            <Tab
              icon={<BuildIcon />}
              label={t('settings:system.tabs.maintenance')}
              id="system-settings-tab-3"
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        <form onSubmit={handleSubmit}>
          {/* General Settings */}
          <TabPanel value={tabValue} index={0}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                {t('settings:system.generalSettings')}
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    name="siteName"
                    label={t('settings:system.siteName')}
                    value={systemSettings.siteName}
                    onChange={handleInputChange}
                    fullWidth
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('settings:system.features')}
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={systemSettings.features.registration}
                            onChange={() => handleSwitchChange('features.registration')}
                          />
                        }
                        label={t('settings:system.enableRegistration')}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={systemSettings.features.socialLogin}
                            onChange={() => handleSwitchChange('features.socialLogin')}
                          />
                        }
                        label={t('settings:system.enableSocialLogin')}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={systemSettings.features.coupons}
                            onChange={() => handleSwitchChange('features.coupons')}
                          />
                        }
                        label={t('settings:system.enableCoupons')}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={systemSettings.features.rewards}
                            onChange={() => handleSwitchChange('features.rewards')}
                          />
                        }
                        label={t('settings:system.enableRewards')}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={systemSettings.features.referrals}
                            onChange={() => handleSwitchChange('features.referrals')}
                          />
                        }
                        label={t('settings:system.enableReferrals')}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
          </TabPanel>

          {/* Appearance Settings */}
          <TabPanel value={tabValue} index={1}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                {t('settings:system.appearanceSettings')}
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="logo"
                    label={t('settings:system.logoUrl')}
                    value={systemSettings.logo}
                    onChange={handleInputChange}
                    fullWidth
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton edge="end">
                            <UploadIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    name="favicon"
                    label={t('settings:system.faviconUrl')}
                    value={systemSettings.favicon}
                    onChange={handleInputChange}
                    fullWidth
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton edge="end">
                            <UploadIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    name="primaryColor"
                    label={t('settings:system.primaryColor')}
                    value={systemSettings.primaryColor}
                    onChange={handleInputChange}
                    fullWidth
                    type="color"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    name="secondaryColor"
                    label={t('settings:system.secondaryColor')}
                    value={systemSettings.secondaryColor}
                    onChange={handleInputChange}
                    fullWidth
                    type="color"
                  />
                </Grid>
              </Grid>
            </Paper>
          </TabPanel>

          {/* Email Settings */}
          <TabPanel value={tabValue} index={2}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                {t('settings:system.emailSettings')}
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="email.fromName"
                    label={t('settings:system.fromName')}
                    value={systemSettings.email.fromName}
                    onChange={handleInputChange}
                    fullWidth
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    name="email.fromEmail"
                    label={t('settings:system.fromEmail')}
                    value={systemSettings.email.fromEmail}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    type="email"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    name="email.replyTo"
                    label={t('settings:system.replyTo')}
                    value={systemSettings.email.replyTo}
                    onChange={handleInputChange}
                    fullWidth
                    type="email"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    name="email.footer"
                    label={t('settings:system.emailFooter')}
                    value={systemSettings.email.footer}
                    onChange={handleInputChange}
                    fullWidth
                    multiline
                    rows={3}
                  />
                </Grid>
              </Grid>
            </Paper>
          </TabPanel>

          {/* Maintenance Settings */}
          <TabPanel value={tabValue} index={3}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                {t('settings:system.maintenanceSettings')}
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={systemSettings.maintenance.enabled}
                        onChange={() => handleSwitchChange('maintenance.enabled')}
                        color="warning"
                      />
                    }
                    label={t('settings:system.enableMaintenance')}
                  />

                  {systemSettings.maintenance.enabled && (
                    <Alert severity="warning" sx={{ mt: 1 }}>
                      {t('settings:system.maintenanceWarning')}
                    </Alert>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    name="maintenance.message"
                    label={t('settings:system.maintenanceMessage')}
                    value={systemSettings.maintenance.message}
                    onChange={handleInputChange}
                    fullWidth
                    multiline
                    rows={3}
                    disabled={!systemSettings.maintenance.enabled}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateTimePicker
                      label={t('settings:system.scheduledEnd')}
                      value={systemSettings.maintenance.scheduledEnd || null}
                      onChange={handleMaintenanceEndChange}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          disabled: !systemSettings.maintenance.enabled,
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
              </Grid>
            </Paper>
          </TabPanel>

          <Box display="flex" justifyContent="flex-end" mt={3}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              disabled={saving}
            >
              {saving ? t('common:saving') : t('common:save')}
            </Button>
          </Box>
        </form>
      </SettingsLayout>
    </DashboardLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common', 'settings'])),
    },
  };
};
