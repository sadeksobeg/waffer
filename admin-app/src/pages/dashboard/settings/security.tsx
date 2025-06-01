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
  Slider,
  Chip,
  IconButton
} from '@mui/material';
import {
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import SettingsLayout from '@/components/settings/SettingsLayout';
import { useAuth } from '@/contexts/AuthContext';
import settingsService, { SecuritySettings } from '@/services/settingsService';

export default function SecuritySettingsPage() {
  const { t } = useTranslation(['settings', 'common']);
  const { userData } = useAuth();

  // State
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newIpRestriction, setNewIpRestriction] = useState('');

  // Fetch security settings
  useEffect(() => {
    const fetchSecuritySettings = async () => {
      if (!userData?.id) return;

      try {
        setLoading(true);
        const settings = await settingsService.getSecuritySettings();
        setSecuritySettings(settings);
      } catch (err) {
        console.error('Error fetching security settings:', err);
        setError(t('settings:errors.fetchSecurity'));
      } finally {
        setLoading(false);
      }
    };

    fetchSecuritySettings();
  }, [userData]);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userData?.id || !securitySettings) return;

    try {
      setSaving(true);
      setError(null);

      await settingsService.updateSecuritySettings(securitySettings, userData.id);

      setSuccess(t('settings:success.securityUpdated'));
    } catch (err) {
      console.error('Error updating security settings:', err);
      setError(t('settings:errors.updateSecurity'));
    } finally {
      setSaving(false);
    }
  };

  // Handle switch change
  const handleSwitchChange = (name: string) => {
    if (!securitySettings) return;

    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      const parentKey = parent as keyof SecuritySettings;

      if (parentKey === 'passwordPolicy') {
        setSecuritySettings({
          ...securitySettings,
          passwordPolicy: {
            ...securitySettings.passwordPolicy,
            [child]: !securitySettings.passwordPolicy[child as keyof typeof securitySettings.passwordPolicy],
          },
        });
      }
    } else {
      setSecuritySettings({
        ...securitySettings,
        [name as keyof SecuritySettings]: !securitySettings[name as keyof SecuritySettings],
      });
    }
  };

  // Handle session timeout change
  const handleSessionTimeoutChange = (event: Event, newValue: number | number[]) => {
    if (!securitySettings) return;

    setSecuritySettings({
      ...securitySettings,
      sessionTimeout: newValue as number,
    });
  };

  // Handle password expiry change
  const handlePasswordExpiryChange = (event: Event, newValue: number | number[]) => {
    if (!securitySettings) return;

    setSecuritySettings({
      ...securitySettings,
      passwordPolicy: {
        ...securitySettings.passwordPolicy,
        expiryDays: newValue as number,
      },
    });
  };

  // Handle min length change
  const handleMinLengthChange = (event: Event, newValue: number | number[]) => {
    if (!securitySettings) return;

    setSecuritySettings({
      ...securitySettings,
      passwordPolicy: {
        ...securitySettings.passwordPolicy,
        minLength: newValue as number,
      },
    });
  };

  // Handle add IP restriction
  const handleAddIpRestriction = () => {
    if (!securitySettings || !newIpRestriction) return;

    // Simple IP validation
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
    if (!ipRegex.test(newIpRestriction)) {
      setError(t('settings:errors.invalidIp'));
      return;
    }

    setSecuritySettings({
      ...securitySettings,
      ipRestrictions: [...securitySettings.ipRestrictions, newIpRestriction],
    });

    setNewIpRestriction('');
  };

  // Handle remove IP restriction
  const handleRemoveIpRestriction = (ip: string) => {
    if (!securitySettings) return;

    setSecuritySettings({
      ...securitySettings,
      ipRestrictions: securitySettings.ipRestrictions.filter(item => item !== ip),
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
      <DashboardLayout title={t('settings:security.title')}>
        <SettingsLayout>
          <Box display="flex" justifyContent="center" alignItems="center" height="400px">
            <CircularProgress />
          </Box>
        </SettingsLayout>
      </DashboardLayout>
    );
  }

  if (!securitySettings) {
    return (
      <DashboardLayout title={t('settings:security.title')}>
        <SettingsLayout>
          <Alert severity="error">
            {t('settings:errors.fetchSecurity')}
          </Alert>
        </SettingsLayout>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t('settings:security.title')}>
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
          {t('settings:security.title')}
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          {t('settings:security.description')}
        </Typography>

        <Divider sx={{ my: 3 }} />

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Authentication Settings */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {t('settings:security.authenticationSettings')}
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={securitySettings.twoFactorAuth}
                          onChange={() => handleSwitchChange('twoFactorAuth')}
                          color="primary"
                        />
                      }
                      label={t('settings:security.requireTwoFactor')}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography id="session-timeout-slider" gutterBottom>
                      {t('settings:security.sessionTimeout')}: {securitySettings.sessionTimeout} {t('settings:security.minutes')}
                    </Typography>
                    <Slider
                      value={securitySettings.sessionTimeout}
                      onChange={handleSessionTimeoutChange}
                      aria-labelledby="session-timeout-slider"
                      valueLabelDisplay="auto"
                      step={5}
                      marks
                      min={5}
                      max={120}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Password Policy */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {t('settings:security.passwordPolicy')}
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography id="min-length-slider" gutterBottom>
                      {t('settings:security.minLength')}: {securitySettings.passwordPolicy.minLength} {t('settings:security.characters')}
                    </Typography>
                    <Slider
                      value={securitySettings.passwordPolicy.minLength}
                      onChange={handleMinLengthChange}
                      aria-labelledby="min-length-slider"
                      valueLabelDisplay="auto"
                      step={1}
                      marks
                      min={6}
                      max={16}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={securitySettings.passwordPolicy.requireUppercase}
                          onChange={() => handleSwitchChange('passwordPolicy.requireUppercase')}
                        />
                      }
                      label={t('settings:security.requireUppercase')}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={securitySettings.passwordPolicy.requireLowercase}
                          onChange={() => handleSwitchChange('passwordPolicy.requireLowercase')}
                        />
                      }
                      label={t('settings:security.requireLowercase')}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={securitySettings.passwordPolicy.requireNumbers}
                          onChange={() => handleSwitchChange('passwordPolicy.requireNumbers')}
                        />
                      }
                      label={t('settings:security.requireNumbers')}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={securitySettings.passwordPolicy.requireSymbols}
                          onChange={() => handleSwitchChange('passwordPolicy.requireSymbols')}
                        />
                      }
                      label={t('settings:security.requireSymbols')}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography id="password-expiry-slider" gutterBottom>
                      {t('settings:security.passwordExpiry')}: {
                        securitySettings.passwordPolicy.expiryDays === 0
                          ? t('settings:security.never')
                          : `${securitySettings.passwordPolicy.expiryDays} ${t('settings:security.days')}`
                      }
                    </Typography>
                    <Slider
                      value={securitySettings.passwordPolicy.expiryDays}
                      onChange={handlePasswordExpiryChange}
                      aria-labelledby="password-expiry-slider"
                      valueLabelDisplay="auto"
                      step={30}
                      marks
                      min={0}
                      max={365}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* IP Restrictions */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {t('settings:security.ipRestrictions')}
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      {t('settings:security.ipRestrictionsDescription')}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={8}>
                    <TextField
                      label={t('settings:security.addIpRestriction')}
                      value={newIpRestriction}
                      onChange={(e) => setNewIpRestriction(e.target.value)}
                      fullWidth
                      placeholder="192.168.1.1/24"
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={handleAddIpRestriction}
                      fullWidth
                      sx={{ height: '100%' }}
                    >
                      {t('settings:security.addIp')}
                    </Button>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {securitySettings.ipRestrictions.length === 0 ? (
                        <Typography color="textSecondary">
                          {t('settings:security.noIpRestrictions')}
                        </Typography>
                      ) : (
                        securitySettings.ipRestrictions.map((ip) => (
                          <Chip
                            key={ip}
                            label={ip}
                            onDelete={() => handleRemoveIpRestriction(ip)}
                            color="primary"
                            variant="outlined"
                          />
                        ))
                      )}
                    </Box>
                  </Grid>
                </Grid>
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
