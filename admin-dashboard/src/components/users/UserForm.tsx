import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Divider,
  Avatar,
  IconButton,
} from '@mui/material';
import { PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';
import { User, UserInput } from '../../services/userService';

interface UserFormProps {
  initialData?: Partial<User>;
  onSubmit: (data: UserInput) => Promise<void>;
  isLoading: boolean;
  isEditMode?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({
  initialData = {},
  onSubmit,
  isLoading,
  isEditMode = false,
}) => {
  // Form state
  const [formData, setFormData] = useState<UserInput>({
    email: initialData.email || '',
    displayName: initialData.displayName || '',
    role: initialData.role || 'user',
    status: (initialData.status as any) || 'active',
    phoneNumber: initialData.phoneNumber || '',
    photoURL: initialData.photoURL || '',
  });

  // Form validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        email: initialData.email || '',
        displayName: initialData.displayName || '',
        role: initialData.role || 'user',
        status: (initialData.status as any) || 'active',
        phoneNumber: initialData.phoneNumber || '',
        photoURL: initialData.photoURL || '',
      });
    }
  }, [initialData]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (!name) return;

    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when field is changed
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Display name validation
    if (!formData.displayName) {
      newErrors.displayName = 'Name is required';
    } else if (formData.displayName.length < 2) {
      newErrors.displayName = 'Name must be at least 2 characters';
    }

    // Phone number validation (optional)
    if (formData.phoneNumber && !/^\+?[0-9\s-()]{7,}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number is invalid';
    }

    // Photo URL validation (optional)
    if (formData.photoURL && !/^(https?:\/\/)/.test(formData.photoURL)) {
      newErrors.photoURL = 'Photo URL must start with http:// or https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3}>
          {/* User Avatar */}
          <Grid item xs={12} display="flex" justifyContent="center">
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={formData.photoURL || undefined}
                alt={formData.displayName}
                sx={{ width: 100, height: 100, mb: 2 }}
              />
              <IconButton
                color="primary"
                aria-label="upload picture"
                component="label"
                sx={{
                  position: 'absolute',
                  bottom: 10,
                  right: -10,
                  backgroundColor: 'background.paper',
                  '&:hover': { backgroundColor: 'background.default' },
                }}
              >
                <input hidden accept="image/*" type="file" />
                <PhotoCameraIcon />
              </IconButton>
            </Box>
          </Grid>

          {/* Photo URL */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Photo URL"
              name="photoURL"
              value={formData.photoURL}
              onChange={handleChange}
              error={!!errors.photoURL}
              helperText={errors.photoURL}
              placeholder="https://example.com/photo.jpg"
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle1" gutterBottom>
              User Information
            </Typography>
          </Grid>

          {/* Email */}
          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              disabled={isEditMode} // Email cannot be changed in edit mode
            />
          </Grid>

          {/* Display Name */}
          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              label="Display Name"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              error={!!errors.displayName}
              helperText={errors.displayName}
            />
          </Grid>

          {/* Phone Number */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              error={!!errors.phoneNumber}
              helperText={errors.phoneNumber}
              placeholder="+1 (123) 456-7890"
            />
          </Grid>

          {/* Role */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.role}>
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                name="role"
                value={formData.role}
                label="Role"
                onChange={handleChange}
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="editor">Editor</MenuItem>
                <MenuItem value="user">User</MenuItem>
              </Select>
              {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
            </FormControl>
          </Grid>

          {/* Status */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.status}>
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                name="status"
                value={formData.status}
                label="Status"
                onChange={handleChange}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
              </Select>
              {errors.status && <FormHelperText>{errors.status}</FormHelperText>}
            </FormControl>
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={isLoading}
              sx={{ py: 1.5 }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                isEditMode ? 'Update User' : 'Create User'
              )}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default UserForm;
