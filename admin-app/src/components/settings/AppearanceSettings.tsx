import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import {
  Box,
  Typography,
  Divider,
  Grid,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  FormControlLabel,
  Switch,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  SettingsBrightness as SystemModeIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import settingsService, { AppearanceSettings as AppearanceSettingsType } from '@/services/settingsService';

export default function AppearanceSettings() {
  const { t } = useTranslation(['common', 'settings']);
  const { userData } = useAuth();

  // State
  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch appearance settings
  useEffect(() => {
    const fetchAppearanceSettings = async () => {
      if (!userData?.id) return;

      try {
        setLoading(true);
        const settings = await settingsService.getAppearanceSettings(userData.id);
        setAppearanceSettings(settings);
      } catch (err) {
        console.error('Error fetching appearance settings:', err);
        setError(t('settings:errors.fetchAppearance'));
      } finally {
        setLoading(false);
      }
    };

    fetchAppearanceSettings();
  }, [userData]);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userData?.id || !appearanceSettings) return;

    try {
      setSaving(true);
      setError(null);

      await settingsService.updateAppearanceSettings(userData.id, appearanceSettings);

      setSuccess(t('settings:success.appearanceUpdated'));
    } catch (err) {
      console.error('Error updating appearance settings:', err);
      setError(t('settings:errors.updateAppearance'));
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = (event: React.MouseEvent<HTMLElement>, newTheme: string | null) => {
    if (newTheme !== null && appearanceSettings) {
      setAppearanceSettings(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          theme: newTheme as 'light' | 'dark' | 'system'
        };
      });
    }
  };

  const handleFontSizeChange = (event: Event, newValue: number | number[]) => {
    if (!appearanceSettings) return;

    setAppearanceSettings(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        fontSize: newValue as number
      };
    });
  };

  const handleSwitchChange = (setting: keyof AppearanceSettingsType) => {
    if (!appearanceSettings) return;

    setAppearanceSettings(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [setting]: !prev[setting]
      };
    });
  };

  const handleColorSchemeChange = (event: any) => {
    if (!appearanceSettings) return;

    setAppearanceSettings(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        colorScheme: event.target.value
      };
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
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!appearanceSettings) {
    return (
      <Box>
        <Alert severity="error">
          {t('settings:errors.fetchAppearance')}
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
        {t('settings:appearance.title')}
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        {t('settings:appearance.description')}
      </Typography>

      <Divider sx={{ my: 3 }} />

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Theme Selection */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                {t('settings:appearance.theme')}
              </Typography>

              <ToggleButtonGroup
                value={appearanceSettings.theme}
                exclusive
                onChange={handleThemeChange}
                aria-label="theme selection"
                sx={{ mb: 2 }}
              >
                <ToggleButton value="light" aria-label="light theme">
                  <LightModeIcon sx={{ mr: 1 }} />
                  {t('settings:appearance.lightTheme')}
                </ToggleButton>
                <ToggleButton value="dark" aria-label="dark theme">
                  <DarkModeIcon sx={{ mr: 1 }} />
                  {t('settings:appearance.darkTheme')}
                </ToggleButton>
                <ToggleButton value="system" aria-label="system theme">
                  <SystemModeIcon sx={{ mr: 1 }} />
                  {t('settings:appearance.systemTheme')}
                </ToggleButton>
              </ToggleButtonGroup>

              <Typography variant="body2" color="textSecondary">
                {t('settings:appearance.themeDescription')}
              </Typography>
            </Paper>
          </Grid>

          {/* Color Scheme */}
          <Grid item xs={12} sm={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="subtitle1" gutterBottom>
                {t('settings:appearance.colorScheme')}
              </Typography>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>{t('settings:appearance.primaryColor')}</InputLabel>
                <Select
                  value={appearanceSettings.colorScheme}
                  label={t('settings:appearance.primaryColor')}
                  onChange={handleColorSchemeChange}
                >
                  <MenuItem value="blue">{t('settings:appearance.colors.blue')}</MenuItem>
                  <MenuItem value="purple">{t('settings:appearance.colors.purple')}</MenuItem>
                  <MenuItem value="green">{t('settings:appearance.colors.green')}</MenuItem>
                  <MenuItem value="orange">{t('settings:appearance.colors.orange')}</MenuItem>
                  <MenuItem value="red">{t('settings:appearance.colors.red')}</MenuItem>
                </Select>
              </FormControl>

              <Typography variant="body2" color="textSecondary">
                {t('settings:appearance.colorDescription')}
              </Typography>
            </Paper>
          </Grid>

          {/* Font Size */}
          <Grid item xs={12} sm={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="subtitle1" gutterBottom>
                {t('settings:appearance.fontSize')}
              </Typography>

              <Box sx={{ px: 2, mb: 2 }}>
                <Slider
                  value={appearanceSettings.fontSize}
                  onChange={handleFontSizeChange}
                  aria-label="Font size"
                  valueLabelDisplay="auto"
                  step={1}
                  marks
                  min={12}
                  max={20}
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">
                  {t('settings:appearance.small')}
                </Typography>
                <Typography variant="body2">
                  {t('settings:appearance.large')}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Layout Options */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                {t('settings:appearance.layoutOptions')}
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={appearanceSettings.denseMode}
                        onChange={() => handleSwitchChange('denseMode')}
                      />
                    }
                    label={t('settings:appearance.denseMode')}
                  />
                  <Typography variant="body2" color="textSecondary" sx={{ ml: 4 }}>
                    {t('settings:appearance.denseModeDescription')}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={appearanceSettings.sidebarCollapsed}
                        onChange={() => handleSwitchChange('sidebarCollapsed')}
                      />
                    }
                    label={t('settings:appearance.sidebarCollapsed')}
                  />
                  <Typography variant="body2" color="textSecondary" sx={{ ml: 4 }}>
                    {t('settings:appearance.sidebarDescription')}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={appearanceSettings.animationsEnabled}
                        onChange={() => handleSwitchChange('animationsEnabled')}
                      />
                    }
                    label={t('settings:appearance.animations')}
                  />
                  <Typography variant="body2" color="textSecondary" sx={{ ml: 4 }}>
                    {t('settings:appearance.animationsDescription')}
                  </Typography>
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
    </Box>
  );
}
