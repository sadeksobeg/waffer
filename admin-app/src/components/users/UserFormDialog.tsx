import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
  Avatar,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import userService, { User, UserFormData } from '@/services/userService';

interface UserFormDialogProps {
  open: boolean;
  onClose: () => void;
  userType: 'customer' | 'merchant' | 'admin' | 'support';
  user?: User | null; // For editing existing user
  onSave?: () => void; // Callback after successful save
}

export default function UserFormDialog({ open, onClose, userType, user, onSave }: UserFormDialogProps) {
  const { t } = useTranslation(['common', 'users']);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Define validation schema based on user type
  const userSchema = z.object({
    firstName: z.string().min(1, t('users:validation.firstNameRequired')),
    lastName: z.string().min(1, t('users:validation.lastNameRequired')),
    email: z.string().email(t('users:validation.emailInvalid')),
    password: user ? z.string().optional() : z.string().min(6, t('users:validation.passwordLength')),
    isActive: z.boolean(),
    phoneNumber: z.string().optional(),
    ...(userType === 'merchant' ? {
      storeName: z.string().min(1, t('users:validation.storeNameRequired')),
    } : {})
  });

  type UserFormValues = z.infer<typeof userSchema>;

  const { control, handleSubmit, reset, formState: { errors } } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      password: '',
      isActive: user?.isActive !== undefined ? user.isActive : true,
      phoneNumber: user?.phoneNumber || '',
      ...(userType === 'merchant' ? {
        storeName: user?.storeName || '',
      } : {})
    }
  });

  useEffect(() => {
    if (open) {
      reset({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        password: '',
        isActive: user?.isActive !== undefined ? user.isActive : true,
        phoneNumber: user?.phoneNumber || '',
        ...(userType === 'merchant' ? {
          storeName: user?.storeName || '',
        } : {})
      });
      setAvatar(user?.avatar || null);
      setAvatarFile(null);
      setError(null);
      setSuccess(null);
    }
  }, [open, user, reset, userType]);

  const onSubmit = async (data: UserFormValues) => {
    try {
      setLoading(true);
      setError(null);

      // Prepare user data
      const userData: UserFormData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        isActive: data.isActive,
        role: userType,
        password: data.password,
        phoneNumber: data.phoneNumber,
        storeName: userType === 'merchant' && 'storeName' in data ? data.storeName as string : undefined,
      };

      // Upload avatar if changed
      if (avatarFile && user) {
        const result = await userService.uploadAvatar(user.id, avatarFile);
        userData.avatar = result.avatarUrl;
      }

      if (user) {
        // Update existing user
        await userService.updateUser(user.id, userData);
        setSuccess(t('users:messages.userUpdated'));
      } else {
        // Create new user
        if (!data.password) {
          throw new Error(t('users:validation.passwordRequired'));
        }
        await userService.createUser(userData);
        setSuccess(t('users:messages.userCreated'));
      }

      // Call onSave callback if provided
      if (onSave) {
        onSave();
      }

      // Close dialog after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Error saving user:', err);
      setError(err.message || t('users:messages.errorSaving'));
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Save the file for later upload
      setAvatarFile(file);

      // Show preview
      const reader = new FileReader();
      reader.onload = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  const handleCloseSuccess = () => {
    setSuccess(null);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {user ? t('users:form.editTitle', { type: t(`users:userTypes.${userType}`) }) :
               t('users:form.addTitle', { type: t(`users:userTypes.${userType}`) })}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={handleCloseError}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={handleCloseSuccess}>
              {success}
            </Alert>
          )}

          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={avatar || undefined}
                sx={{ width: 80, height: 80 }}
              />
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="avatar-upload"
                type="file"
                onChange={handleAvatarChange}
                disabled={loading}
              />
              <label htmlFor="avatar-upload">
                <IconButton
                  aria-label="upload picture"
                  component="span"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'background.paper',
                  }}
                  disabled={loading}
                >
                  <PhotoCameraIcon />
                </IconButton>
              </label>
            </Box>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('users:form.firstName')}
                    fullWidth
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('users:form.lastName')}
                    fullWidth
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('users:form.email')}
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="password"
                    label={user ? t('users:form.newPassword') : t('users:form.password')}
                    fullWidth
                    error={!!errors.password}
                    helperText={errors.password?.message || (user ? t('users:form.passwordHint') : '')}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('users:form.phoneNumber')}
                    fullWidth
                    error={!!errors.phoneNumber}
                    helperText={errors.phoneNumber?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.isActive} disabled={loading}>
                    <InputLabel>{t('users:form.status')}</InputLabel>
                    <Select
                      value={field.value ? 'active' : 'inactive'}
                      onChange={(e) => field.onChange(e.target.value === 'active')}
                      label={t('users:form.status')}
                    >
                      <MenuItem value="active">{t('users:status.active')}</MenuItem>
                      <MenuItem value="inactive">{t('users:status.inactive')}</MenuItem>
                    </Select>
                    {errors.isActive && <FormHelperText>{errors.isActive.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            {userType === 'merchant' && (
              <Grid item xs={12}>
                <Controller
                  name="storeName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('users:form.storeName')}
                      fullWidth
                      error={!!errors.storeName}
                      helperText={errors.storeName?.message}
                      disabled={loading}
                    />
                  )}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>{t('common:cancel')}</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? t('common:saving') : t('common:save')}
          </Button>
        </DialogActions>
      </form>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        message={error}
      />

      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={handleCloseSuccess}
        message={success}
      />
    </Dialog>
  );
}
