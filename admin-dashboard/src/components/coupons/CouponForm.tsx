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
  Switch,
  FormControlLabel,
  InputAdornment,
  Chip,
  Autocomplete,
  Avatar,
  IconButton,
  Card,
  CardMedia,
  CardActions,
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Coupon, CouponInput } from '../../services/couponService';

interface CouponFormProps {
  initialData?: Partial<Coupon>;
  onSubmit: (data: CouponInput) => Promise<void>;
  isLoading: boolean;
  isEditMode?: boolean;
}

const CouponForm: React.FC<CouponFormProps> = ({
  initialData = {},
  onSubmit,
  isLoading,
  isEditMode = false,
}) => {
  // Form state
  const [formData, setFormData] = useState<CouponInput>({
    code: initialData.code || '',
    storeName: initialData.storeName || '',
    storeImage: initialData.storeImage || '',
    discount: initialData.discount || { type: 'percentage', value: 10 },
    validFrom: initialData.validFrom ? initialData.validFrom.toDate() : new Date(),
    validTo: initialData.validTo ? initialData.validTo.toDate() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    status: initialData.status || 'active',
    usageLimit: initialData.usageLimit || 0,
    description: initialData.description || '',
    minPurchase: initialData.minPurchase || 0,
    maxDiscount: initialData.maxDiscount || 0,
    applicableProducts: initialData.applicableProducts || [],
    applicableCategories: initialData.applicableCategories || [],
    exclusions: initialData.exclusions || [],
  });

  // Form validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(initialData.storeImage || '');
  const [imageUploading, setImageUploading] = useState(false);

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        code: initialData.code || '',
        storeName: initialData.storeName || '',
        storeImage: initialData.storeImage || '',
        discount: initialData.discount || { type: 'percentage', value: 10 },
        validFrom: initialData.validFrom ? initialData.validFrom.toDate() : new Date(),
        validTo: initialData.validTo ? initialData.validTo.toDate() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: initialData.status || 'active',
        usageLimit: initialData.usageLimit || 0,
        description: initialData.description || '',
        minPurchase: initialData.minPurchase || 0,
        maxDiscount: initialData.maxDiscount || 0,
        applicableProducts: initialData.applicableProducts || [],
        applicableCategories: initialData.applicableCategories || [],
        exclusions: initialData.exclusions || [],
      });
      setImagePreview(initialData.storeImage || '');
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

  // Handle discount type change
  const handleDiscountTypeChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const value = e.target.value as 'percentage' | 'fixed';

    setFormData({
      ...formData,
      discount: {
        ...formData.discount,
        type: value,
        // Reset value to a sensible default when switching types
        value: value === 'percentage' ? 10 : 5,
      },
    });
  };

  // Handle discount value change
  const handleDiscountValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);

    if (isNaN(value)) return;

    setFormData({
      ...formData,
      discount: {
        ...formData.discount,
        value,
      },
    });
  };

  // Handle date changes
  const handleDateChange = (name: string, date: Date | null) => {
    if (!date) return;

    setFormData({
      ...formData,
      [name]: date,
    });
  };

  // Handle array field changes (products, categories, exclusions)
  const handleArrayFieldChange = (name: string, values: string[]) => {
    setFormData({
      ...formData,
      [name]: values,
    });
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Code validation
    if (!formData.code) {
      newErrors.code = 'Coupon code is required';
    } else if (!/^[A-Z0-9_-]{3,20}$/.test(formData.code)) {
      newErrors.code = 'Code must be 3-20 uppercase letters, numbers, underscores or hyphens';
    }

    // Store name validation
    if (!formData.storeName) {
      newErrors.storeName = 'Store name is required';
    } else if (formData.storeName.length < 2) {
      newErrors.storeName = 'Store name must be at least 2 characters';
    } else if (formData.storeName.length > 50) {
      newErrors.storeName = 'Store name must be less than 50 characters';
    }

    // Discount validation
    if (!formData.discount.value || formData.discount.value <= 0) {
      newErrors.discountValue = 'Discount value must be greater than 0';
    } else if (formData.discount.type === 'percentage' && formData.discount.value > 100) {
      newErrors.discountValue = 'Percentage discount cannot exceed 100%';
    }

    // Date validation
    if (!formData.validFrom) {
      newErrors.validFrom = 'Valid from date is required';
    }

    if (!formData.validTo) {
      newErrors.validTo = 'Valid to date is required';
    } else if (formData.validFrom && formData.validTo && formData.validFrom > formData.validTo) {
      newErrors.validTo = 'Valid to date must be after valid from date';
    }

    // Usage limit validation
    if (formData.usageLimit < 0) {
      newErrors.usageLimit = 'Usage limit cannot be negative';
    }

    // Min purchase validation
    if (formData.minPurchase && formData.minPurchase < 0) {
      newErrors.minPurchase = 'Minimum purchase cannot be negative';
    }

    // Max discount validation
    if (formData.maxDiscount && formData.maxDiscount < 0) {
      newErrors.maxDiscount = 'Maximum discount cannot be negative';
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

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      setImageFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setFormData({
          ...formData,
          storeImage: result, // Temporarily store preview URL
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData({
      ...formData,
      storeImage: '',
    });
  };

  // Mock data for dropdowns
  const mockStores = [
    'McDonald\'s', 'Burger King', 'KFC', 'Pizza Hut', 'Domino\'s',
    'Starbucks', 'Dunkin\'', 'Subway', 'Taco Bell', 'Chipotle',
    'Nike', 'Adidas', 'Zara', 'H&M', 'Uniqlo',
    'Amazon', 'Target', 'Walmart', 'Best Buy', 'Apple Store',
    'Sephora', 'Ulta Beauty', 'Bath & Body Works', 'Victoria\'s Secret',
    'Home Depot', 'Lowe\'s', 'IKEA', 'Bed Bath & Beyond',
    'CVS Pharmacy', 'Walgreens', 'Rite Aid',
    'GameStop', 'Barnes & Noble', 'Petco', 'PetSmart',
  ];

  const mockProducts = [
    'Product 1', 'Product 2', 'Product 3', 'Product 4', 'Product 5',
  ];

  const mockCategories = [
    'Category 1', 'Category 2', 'Category 3', 'Category 4', 'Category 5',
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Grid>

            {/* Coupon Code */}
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Coupon Code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                error={!!errors.code}
                helperText={errors.code || 'Use uppercase letters, numbers, underscores or hyphens'}
                disabled={isEditMode} // Code cannot be changed in edit mode
                InputProps={{
                  style: { textTransform: 'uppercase' },
                }}
              />
            </Grid>

            {/* Store Name */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                freeSolo
                options={mockStores}
                value={formData.storeName}
                onChange={(_, value) => {
                  setFormData({
                    ...formData,
                    storeName: value || '',
                  });
                  // Clear error when field is changed
                  if (errors.storeName) {
                    setErrors({
                      ...errors,
                      storeName: '',
                    });
                  }
                }}
                onInputChange={(_, value) => {
                  setFormData({
                    ...formData,
                    storeName: value || '',
                  });
                  // Clear error when field is changed
                  if (errors.storeName) {
                    setErrors({
                      ...errors,
                      storeName: '',
                    });
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    label="Store Name"
                    name="storeName"
                    error={!!errors.storeName}
                    helperText={errors.storeName || 'Enter the store or merchant name'}
                    placeholder="e.g., McDonald's, Nike, Amazon"
                  />
                )}
              />
            </Grid>

            {/* Store Image Upload */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Store/Coupon Image
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {imagePreview ? (
                  <Card sx={{ width: 120, height: 120 }}>
                    <CardMedia
                      component="img"
                      height="120"
                      image={imagePreview}
                      alt="Store image preview"
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardActions sx={{ p: 1, justifyContent: 'center' }}>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={handleRemoveImage}
                        disabled={imageUploading}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </CardActions>
                  </Card>
                ) : (
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      border: '2px dashed #ccc',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: 'action.hover',
                      },
                    }}
                    component="label"
                  >
                    <input
                      hidden
                      accept="image/*"
                      type="file"
                      onChange={handleImageChange}
                      disabled={imageUploading}
                    />
                    <Box sx={{ textAlign: 'center' }}>
                      <PhotoCameraIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                      <Typography variant="caption" color="text.secondary">
                        Upload Image
                      </Typography>
                    </Box>
                  </Box>
                )}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Upload a store logo or coupon image to make it more attractive.
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Recommended: 400x400px, max 5MB, JPG/PNG format
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Description */}
            <Grid item xs={12} md={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of the coupon"
              />
            </Grid>

            {/* Discount Type */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel id="discount-type-label">Discount Type</InputLabel>
                <Select
                  labelId="discount-type-label"
                  name="discountType"
                  value={formData.discount.type}
                  label="Discount Type"
                  onChange={handleDiscountTypeChange}
                >
                  <MenuItem value="percentage">Percentage (%)</MenuItem>
                  <MenuItem value="fixed">Fixed Amount ($)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Discount Value */}
            <Grid item xs={12} md={3}>
              <TextField
                required
                fullWidth
                label="Discount Value"
                name="discountValue"
                type="number"
                value={formData.discount.value}
                onChange={handleDiscountValueChange}
                error={!!errors.discountValue}
                helperText={errors.discountValue}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {formData.discount.type === 'percentage' ? '%' : '$'}
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Status */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  name="status"
                  value={formData.status}
                  label="Status"
                  onChange={handleChange}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="disabled">Disabled</MenuItem>
                  <MenuItem value="expired">Expired</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Usage Limit */}
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Usage Limit"
                name="usageLimit"
                type="number"
                value={formData.usageLimit}
                onChange={handleChange}
                error={!!errors.usageLimit}
                helperText={errors.usageLimit || '0 for unlimited'}
              />
            </Grid>

            {/* Valid From */}
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Valid From"
                value={formData.validFrom}
                onChange={(date) => handleDateChange('validFrom', date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.validFrom,
                    helperText: errors.validFrom,
                  },
                }}
              />
            </Grid>

            {/* Valid To */}
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Valid To"
                value={formData.validTo}
                onChange={(date) => handleDateChange('validTo', date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.validTo,
                    helperText: errors.validTo,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6" gutterBottom>
                Advanced Settings
              </Typography>
            </Grid>

            {/* Min Purchase */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Minimum Purchase"
                name="minPurchase"
                type="number"
                value={formData.minPurchase}
                onChange={handleChange}
                error={!!errors.minPurchase}
                helperText={errors.minPurchase || 'Minimum purchase amount required (0 for none)'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      $
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Max Discount */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Maximum Discount"
                name="maxDiscount"
                type="number"
                value={formData.maxDiscount}
                onChange={handleChange}
                error={!!errors.maxDiscount}
                helperText={errors.maxDiscount || 'Maximum discount amount (0 for no limit)'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      $
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Applicable Products */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                multiple
                options={mockProducts}
                value={formData.applicableProducts}
                onChange={(_, value) => handleArrayFieldChange('applicableProducts', value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Applicable Products"
                    placeholder="Select products"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option}
                      {...getTagProps({ index })}
                      size="small"
                    />
                  ))
                }
              />
            </Grid>

            {/* Applicable Categories */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                multiple
                options={mockCategories}
                value={formData.applicableCategories}
                onChange={(_, value) => handleArrayFieldChange('applicableCategories', value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Applicable Categories"
                    placeholder="Select categories"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option}
                      {...getTagProps({ index })}
                      size="small"
                    />
                  ))
                }
              />
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
                  isEditMode ? 'Update Coupon' : 'Create Coupon'
                )}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </LocalizationProvider>
  );
};

export default CouponForm;
