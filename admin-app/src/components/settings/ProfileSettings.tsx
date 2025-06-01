import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Avatar,
  Button,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import settingsService, { ProfileSettings as ProfileSettingsType } from '@/services/settingsService';
import { countries } from '@/utils/countries';
import { timezones } from '@/utils/timezones';

export default function ProfileSettings() {
  const { t } = useTranslation(['common', 'settings']);
  const { userData: authUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [profileSettings, setProfileSettings] = useState<ProfileSettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [bio, setBio] = useState('');
  const [country, setCountry] = useState('');
  const [language, setLanguage] = useState('');
  const [timezone, setTimezone] = useState('');

  // Fetch profile settings
  useEffect(() => {
    const fetchProfileSettings = async () => {
      if (!authUser?.id) return;

      try {
        setLoading(true);
        const settings = await settingsService.getProfileSettings(authUser.id);
        setProfileSettings(settings);

        // Set form values
        setFirstName(settings.firstName);
        setLastName(settings.lastName);
        setEmail(settings.email || authUser.email || '');
        setPhone(settings.phone);
        setJobTitle(settings.jobTitle);
        setCompany(settings.company);
        setBio(settings.bio);
        setCountry(settings.country);
        setLanguage(settings.language);
        setTimezone(settings.timezone);
      } catch (err) {
        console.error('Error fetching profile settings:', err);
        setError(t('settings:errors.fetchProfile'));
      } finally {
        setLoading(false);
      }
    };

    fetchProfileSettings();
  }, [authUser]);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authUser?.id) return;

    try {
      setSaving(true);
      setError(null);

      await settingsService.updateProfileSettings(authUser.id, {
        firstName,
        lastName,
        email,
        phone,
        jobTitle,
        company,
        bio,
        country,
        language,
        timezone,
      });

      setSuccess(t('settings:success.profileUpdated'));
    } catch (err) {
      console.error('Error updating profile settings:', err);
      setError(t('settings:errors.updateProfile'));
    } finally {
      setSaving(false);
    }
  };

  // Handle avatar upload
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !authUser?.id) return;

    const file = event.target.files[0];

    try {
      setUploadingAvatar(true);
      setError(null);

      const { avatarUrl } = await settingsService.uploadAvatar(authUser.id, file);

      // Update profile settings
      setProfileSettings(prev => prev ? { ...prev, avatar: avatarUrl } : null);

      setSuccess(t('settings:success.avatarUpdated'));
    } catch (err) {
      console.error('Error uploading avatar:', err);
      setError(t('settings:errors.uploadAvatar'));
    } finally {
      setUploadingAvatar(false);
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
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
        {t('settings:profile.title')}
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        {t('settings:profile.description')}
      </Typography>

      <Divider sx={{ my: 3 }} />

      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box position="relative">
            <Avatar
              src={profileSettings?.avatar || undefined}
              sx={{ width: 100, height: 100, mb: 2, cursor: 'pointer' }}
              onClick={handleAvatarClick}
            />

            {uploadingAvatar && (
              <Box
                position="absolute"
                top={0}
                left={0}
                width="100%"
                height="100%"
                display="flex"
                justifyContent="center"
                alignItems="center"
                bgcolor="rgba(0, 0, 0, 0.5)"
                borderRadius="50%"
              >
                <CircularProgress size={40} />
              </Box>
            )}

            <IconButton
              color="primary"
              aria-label="upload picture"
              component="span"
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                bgcolor: 'background.paper',
              }}
              onClick={handleAvatarClick}
              disabled={uploadingAvatar}
            >
              <PhotoCameraIcon />
            </IconButton>
          </Box>

          <input
            ref={fileInputRef}
            accept="image/*"
            style={{ display: 'none' }}
            type="file"
            onChange={handleAvatarChange}
          />
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={t('settings:profile.firstName')}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={t('settings:profile.lastName')}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={t('settings:profile.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              disabled={!!authUser?.email}
              helperText={authUser?.email ? t('settings:profile.emailManaged') : ''}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={t('settings:profile.phone')}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={t('settings:profile.jobTitle')}
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={t('settings:profile.company')}
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t('settings:profile.bio')}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              multiline
              rows={4}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              {t('settings:profile.locationSettings')}
            </Typography>
            <Divider sx={{ mb: 3 }} />
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>{t('settings:profile.country')}</InputLabel>
              <Select
                value={country}
                label={t('settings:profile.country')}
                onChange={(e) => setCountry(e.target.value)}
              >
                <MenuItem value="">{t('common:none')}</MenuItem>
                {countries.map((c) => (
                  <MenuItem key={c.code} value={c.code}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>{t('settings:profile.language')}</InputLabel>
              <Select
                value={language}
                label={t('settings:profile.language')}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="fr">French</MenuItem>
                <MenuItem value="de">German</MenuItem>
                <MenuItem value="es">Spanish</MenuItem>
                <MenuItem value="ja">Japanese</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>{t('settings:profile.timezone')}</InputLabel>
              <Select
                value={timezone}
                label={t('settings:profile.timezone')}
                onChange={(e) => setTimezone(e.target.value)}
              >
                {timezones.map((tz) => (
                  <MenuItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
