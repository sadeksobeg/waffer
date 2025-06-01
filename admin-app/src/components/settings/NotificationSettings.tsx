import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import {
  Box,
  Typography,
  Divider,
  FormGroup,
  FormControlLabel,
  Switch,
  Grid,
  Paper,
  Checkbox,
  Button,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import settingsService, { NotificationSettings as NotificationSettingsType } from '@/services/settingsService';

export default function NotificationSettings() {
  const { t } = useTranslation(['common', 'settings']);
  const { userData } = useAuth();

  // State
  const [settings, setSettings] = useState<NotificationSettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch notification settings
  useEffect(() => {
    const fetchNotificationSettings = async () => {
      if (!userData?.id) return;

      try {
        setLoading(true);
        const notificationSettings = await settingsService.getNotificationSettings(userData.id);
        setSettings(notificationSettings);
      } catch (err) {
        console.error('Error fetching notification settings:', err);
        setError(t('settings:errors.fetchNotifications'));
      } finally {
        setLoading(false);
      }
    };

    fetchNotificationSettings();
  }, [userData]);

  const handleToggleChange = (channel: 'email' | 'push' | 'inApp', setting: string) => {
    if (!settings) return;

    setSettings(prev => {
      if (!prev) return prev;

      return {
        ...prev,
        [channel]: {
          ...prev[channel],
          [setting]: !prev[channel][setting as keyof typeof prev[typeof channel]],
        }
      };
    });
  };

  const handleToggleAll = (channel: 'email' | 'push' | 'inApp', value: boolean) => {
    if (!settings) return;

    setSettings(prev => {
      if (!prev) return prev;

      const updatedChannel = { ...prev[channel] };

      // Update all settings in the channel
      Object.keys(updatedChannel).forEach(key => {
        if (key !== 'enabled') { // Skip the 'enabled' property
          updatedChannel[key as keyof typeof updatedChannel] = value;
        }
      });

      return {
        ...prev,
        [channel]: updatedChannel
      };
    });
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userData?.id || !settings) return;

    try {
      setSaving(true);
      setError(null);

      await settingsService.updateNotificationSettings(userData.id, settings);

      setSuccess(t('settings:success.notificationsUpdated'));
    } catch (err) {
      console.error('Error updating notification settings:', err);
      setError(t('settings:errors.updateNotifications'));
    } finally {
      setSaving(false);
    }
  };

  // Handle close error
  const handleCloseError = () => {
    setError(null);
  };

  // Handle close success
  const handleCloseSuccess = () => {
    setSuccess(null);
  };

  // Check if all notifications in a channel are enabled
  const areAllEnabled = (channel: 'email' | 'push' | 'inApp') => {
    if (!settings) return false;

    const channelSettings = { ...settings[channel] };
    const { enabled, ...rest } = channelSettings; // Exclude the 'enabled' property

    return Object.values(rest).every(value => value === true);
  };

  // Check if some (but not all) notifications in a channel are enabled
  const areSomeEnabled = (channel: 'email' | 'push' | 'inApp') => {
    if (!settings) return false;

    const channelSettings = { ...settings[channel] };
    const { enabled, ...rest } = channelSettings; // Exclude the 'enabled' property

    const values = Object.values(rest);
    return values.some(value => value === true) && !values.every(value => value === true);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!settings) {
    return (
      <Box>
        <Alert severity="error">
          {t('settings:errors.fetchNotifications')}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
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
        {t('settings:notifications.title')}
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        {t('settings:notifications.description')}
      </Typography>

      <Divider sx={{ my: 3 }} />

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Email Notifications */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  {t('settings:notifications.emailNotifications')}
                </Typography>
                <Box display="flex" alignItems="center">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.email.enabled}
                        onChange={() => handleToggleChange('email', 'enabled')}
                        color="primary"
                      />
                    }
                    label={t('settings:notifications.enabled')}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={areAllEnabled('email')}
                        indeterminate={areSomeEnabled('email')}
                        onChange={(e) => handleToggleAll('email', e.target.checked)}
                        disabled={!settings.email.enabled}
                      />
                    }
                    label={t('settings:notifications.toggleAll')}
                  />
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <FormGroup>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.email.newCoupon}
                          onChange={() => handleToggleChange('email', 'newCoupon')}
                          disabled={!settings.email.enabled}
                        />
                      }
                      label={t('settings:notifications.newCoupon')}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.email.couponExpiring}
                          onChange={() => handleToggleChange('email', 'couponExpiring')}
                          disabled={!settings.email.enabled}
                        />
                      }
                      label={t('settings:notifications.couponExpiring')}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.email.couponRedeemed}
                          onChange={() => handleToggleChange('email', 'couponRedeemed')}
                          disabled={!settings.email.enabled}
                        />
                      }
                      label={t('settings:notifications.couponRedeemed')}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.email.newUser}
                          onChange={() => handleToggleChange('email', 'newUser')}
                          disabled={!settings.email.enabled}
                        />
                      }
                      label={t('settings:notifications.newUser')}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.email.weeklyReport}
                          onChange={() => handleToggleChange('email', 'weeklyReport')}
                          disabled={!settings.email.enabled}
                        />
                      }
                      label={t('settings:notifications.weeklyReport')}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.email.monthlyReport}
                          onChange={() => handleToggleChange('email', 'monthlyReport')}
                          disabled={!settings.email.enabled}
                        />
                      }
                      label={t('settings:notifications.monthlyReport')}
                    />
                  </Grid>
                </Grid>
              </FormGroup>
            </Paper>
          </Grid>

          {/* Push Notifications */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  {t('settings:notifications.pushNotifications')}
                </Typography>
                <Box display="flex" alignItems="center">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.push.enabled}
                        onChange={() => handleToggleChange('push', 'enabled')}
                        color="primary"
                      />
                    }
                    label={t('settings:notifications.enabled')}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={areAllEnabled('push')}
                        indeterminate={areSomeEnabled('push')}
                        onChange={(e) => handleToggleAll('push', e.target.checked)}
                        disabled={!settings.push.enabled}
                      />
                    }
                    label={t('settings:notifications.toggleAll')}
                  />
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <FormGroup>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.push.newCoupon}
                          onChange={() => handleToggleChange('push', 'newCoupon')}
                          disabled={!settings.push.enabled}
                        />
                      }
                      label={t('settings:notifications.newCoupon')}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.push.couponExpiring}
                          onChange={() => handleToggleChange('push', 'couponExpiring')}
                          disabled={!settings.push.enabled}
                        />
                      }
                      label={t('settings:notifications.couponExpiring')}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.push.couponRedeemed}
                          onChange={() => handleToggleChange('push', 'couponRedeemed')}
                          disabled={!settings.push.enabled}
                        />
                      }
                      label={t('settings:notifications.couponRedeemed')}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.push.newUser}
                          onChange={() => handleToggleChange('push', 'newUser')}
                          disabled={!settings.push.enabled}
                        />
                      }
                      label={t('settings:notifications.newUser')}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.push.weeklyReport}
                          onChange={() => handleToggleChange('push', 'weeklyReport')}
                          disabled={!settings.push.enabled}
                        />
                      }
                      label={t('settings:notifications.weeklyReport')}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.push.monthlyReport}
                          onChange={() => handleToggleChange('push', 'monthlyReport')}
                          disabled={!settings.push.enabled}
                        />
                      }
                      label={t('settings:notifications.monthlyReport')}
                    />
                  </Grid>
                </Grid>
              </FormGroup>
            </Paper>
          </Grid>

          {/* In-App Notifications */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  {t('settings:notifications.inAppNotifications')}
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.inApp.enabled}
                      onChange={() => handleToggleChange('inApp', 'enabled')}
                      color="primary"
                    />
                  }
                  label={t('settings:notifications.enabled')}
                />
              </Box>

              <Divider sx={{ mb: 2 }} />

              <FormGroup>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.inApp.showBadge}
                          onChange={() => handleToggleChange('inApp', 'showBadge')}
                          disabled={!settings.inApp.enabled}
                        />
                      }
                      label={t('settings:notifications.showBadge')}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.inApp.sound}
                          onChange={() => handleToggleChange('inApp', 'sound')}
                          disabled={!settings.inApp.enabled}
                        />
                      }
                      label={t('settings:notifications.sound')}
                    />
                  </Grid>
                </Grid>
              </FormGroup>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" mt={2}>
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
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}
