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
  InputAdornment,
  Tabs,
  Tab,
  Box,
  Typography,
  Autocomplete,
  Chip,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import couponService, { Coupon, Merchant, Category } from '@/services/couponService';

interface CouponFormDialogProps {
  open: boolean;
  onClose: () => void;
  coupon?: Coupon | null; // For editing existing coupon
  onSave?: () => void;
}

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
      id={`coupon-tabpanel-${index}`}
      aria-labelledby={`coupon-tab-${index}`}
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

export default function CouponFormDialog({ open, onClose, coupon, onSave }: CouponFormDialogProps) {
  const { t } = useTranslation(['common', 'coupons']);
  const [tabValue, setTabValue] = useState(0);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatingCode, setGeneratingCode] = useState(false);

  // Define validation schema
  const couponSchema = z.object({
    title: z.string().min(1, t('coupons:validation.titleRequired')),
    description: z.string().min(1, t('coupons:validation.descriptionRequired')),
    code: z.string().min(1, t('coupons:validation.codeRequired')),
    discountValue: z.number().min(0, t('coupons:validation.discountRequired')),
    discountType: z.enum(['percentage', 'fixed']),
    merchantId: z.string().min(1, t('coupons:validation.merchantRequired')),
    category: z.string().min(1, t('coupons:validation.categoryRequired')),
    startDate: z.date(),
    endDate: z.date(),
    isActive: z.boolean(),
    usageLimit: z.number().int().min(0),
    minPurchaseAmount: z.number().optional().nullable(),
    maxDiscountAmount: z.number().optional().nullable(),
    termsAndConditions: z.string().optional(),
  });

  type CouponFormValues = z.infer<typeof couponSchema>;

  const { control, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      title: '',
      description: '',
      code: '',
      discountValue: 0,
      discountType: 'percentage',
      merchantId: '',
      category: '',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      isActive: true,
      usageLimit: 1,
      minPurchaseAmount: null,
      maxDiscountAmount: null,
      termsAndConditions: '',
    }
  });

  // Fetch merchants and categories
  useEffect(() => {
    if (open) {
      fetchMerchants();
      fetchCategories();
    }
  }, [open]);

  const fetchMerchants = async () => {
    try {
      const data = await couponService.getMerchants();
      setMerchants(data);
    } catch (err) {
      console.error('Error fetching merchants:', err);
      setError(t('coupons:errors.fetchMerchants'));
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await couponService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(t('coupons:errors.fetchCategories'));
    }
  };

  // Reset form when dialog opens/closes or coupon changes
  useEffect(() => {
    if (open && coupon) {
      reset({
        title: coupon.title,
        description: coupon.description,
        code: coupon.code,
        discountValue: coupon.discountValue,
        discountType: coupon.discountType,
        merchantId: coupon.merchantId,
        category: coupon.category,
        startDate: new Date(coupon.startDate),
        endDate: new Date(coupon.endDate),
        isActive: coupon.isActive,
        usageLimit: coupon.usageLimit,
        minPurchaseAmount: coupon.minPurchaseAmount || null,
        maxDiscountAmount: coupon.maxDiscountAmount || null,
        termsAndConditions: coupon.termsAndConditions || '',
      });
    } else if (open) {
      reset({
        title: '',
        description: '',
        code: '',
        discountValue: 0,
        discountType: 'percentage',
        merchantId: '',
        category: '',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
        usageLimit: 1,
        minPurchaseAmount: null,
        maxDiscountAmount: null,
        termsAndConditions: '',
      });
    }
  }, [open, coupon, reset]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const onSubmit = async (data: CouponFormValues) => {
    try {
      setLoading(true);
      setError(null);

      // Convert null values to undefined for API compatibility
      const apiData = {
        ...data,
        minPurchaseAmount: data.minPurchaseAmount === null ? undefined : data.minPurchaseAmount,
        maxDiscountAmount: data.maxDiscountAmount === null ? undefined : data.maxDiscountAmount
      };

      if (coupon) {
        // Update existing coupon
        await couponService.updateCoupon(coupon.id, apiData);
      } else {
        // Create new coupon
        await couponService.createCoupon(apiData);
      }

      if (onSave) {
        onSave();
      }

      onClose();
    } catch (err: any) {
      console.error('Error saving coupon:', err);
      setError(err.message || t('coupons:errors.saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  const generateRandomCode = async () => {
    try {
      setGeneratingCode(true);
      const { code } = await couponService.generateCouponCode();
      setValue('code', code);
    } catch (err) {
      console.error('Error generating code:', err);
      setError(t('coupons:errors.generateCodeFailed'));
    } finally {
      setGeneratingCode(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {coupon ? t('coupons:form.editTitle') : t('coupons:form.addTitle')}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="coupon form tabs">
              <Tab label={t('coupons:form.tabs.basic')} id="coupon-tab-0" />
              <Tab label={t('coupons:form.tabs.restrictions')} id="coupon-tab-1" />
              <Tab label={t('coupons:form.tabs.terms')} id="coupon-tab-2" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('coupons:form.title')}
                      fullWidth
                      error={!!errors.title}
                      helperText={errors.title?.message}
                      disabled={loading}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('coupons:form.description')}
                      fullWidth
                      multiline
                      rows={3}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                      disabled={loading}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="code"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('coupons:form.code')}
                      fullWidth
                      error={!!errors.code}
                      helperText={errors.code?.message}
                      disabled={loading}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Button
                              size="small"
                              onClick={generateRandomCode}
                              disabled={loading || generatingCode}
                              startIcon={generatingCode ? <CircularProgress size={16} /> : null}
                            >
                              {generatingCode ? t('common:generating') : t('coupons:form.generate')}
                            </Button>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={field.onChange}
                          disabled={loading}
                        />
                      }
                      label={t('coupons:form.isActive')}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="merchantId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.merchantId} disabled={loading}>
                      <InputLabel>{t('coupons:form.merchant')}</InputLabel>
                      <Select {...field} label={t('coupons:form.merchant')}>
                        {merchants.map(merchant => (
                          <MenuItem key={merchant.id} value={merchant.id}>
                            {merchant.storeName || `${merchant.firstName} ${merchant.lastName}`}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.merchantId && <FormHelperText>{errors.merchantId.message}</FormHelperText>}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.category} disabled={loading}>
                      <InputLabel>{t('coupons:form.category')}</InputLabel>
                      <Select {...field} label={t('coupons:form.category')}>
                        {categories.map(category => (
                          <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>
                        ))}
                      </Select>
                      {errors.category && <FormHelperText>{errors.category.message}</FormHelperText>}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="discountType"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.discountType} disabled={loading}>
                      <InputLabel>{t('coupons:form.discountType')}</InputLabel>
                      <Select {...field} label={t('coupons:form.discountType')}>
                        <MenuItem value="percentage">{t('coupons:discountTypes.percentage')}</MenuItem>
                        <MenuItem value="fixed">{t('coupons:discountTypes.fixed')}</MenuItem>
                      </Select>
                      {errors.discountType && <FormHelperText>{errors.discountType.message}</FormHelperText>}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="discountValue"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('coupons:form.discount')}
                      fullWidth
                      type="number"
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            {field.value && control._formValues.discountType === 'fixed' ? '$' : ''}
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            {field.value && control._formValues.discountType === 'percentage' ? '%' : ''}
                          </InputAdornment>
                        ),
                      }}
                      error={!!errors.discountValue}
                      helperText={errors.discountValue?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Controller
                    name="startDate"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        label={t('coupons:form.startDate')}
                        value={field.value}
                        onChange={(newValue) => {
                          field.onChange(newValue);
                        }}
                        disabled={loading}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!errors.startDate,
                            helperText: errors.startDate?.message,
                          },
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Controller
                    name="endDate"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        label={t('coupons:form.endDate')}
                        value={field.value}
                        onChange={(newValue) => {
                          field.onChange(newValue);
                        }}
                        disabled={loading}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!errors.endDate,
                            helperText: errors.endDate?.message,
                          },
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="usageLimit"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('coupons:form.usageLimit')}
                      fullWidth
                      type="number"
                      disabled={loading}
                      InputProps={{
                        inputProps: { min: 0 }
                      }}
                      error={!!errors.usageLimit}
                      helperText={errors.usageLimit?.message || t('coupons:form.usageLimitHint')}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="minPurchaseAmount"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('coupons:form.minPurchase')}
                      fullWidth
                      type="number"
                      disabled={loading}
                      value={field.value === null ? '' : field.value}
                      onChange={(e) => {
                        const value = e.target.value === '' ? null : Number(e.target.value);
                        field.onChange(value);
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">$</InputAdornment>
                        ),
                      }}
                      error={!!errors.minPurchaseAmount}
                      helperText={errors.minPurchaseAmount?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="maxDiscountAmount"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('coupons:form.maxDiscount')}
                      fullWidth
                      type="number"
                      disabled={loading}
                      value={field.value === null ? '' : field.value}
                      onChange={(e) => {
                        const value = e.target.value === '' ? null : Number(e.target.value);
                        field.onChange(value);
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">$</InputAdornment>
                        ),
                      }}
                      error={!!errors.maxDiscountAmount}
                      helperText={errors.maxDiscountAmount?.message || t('coupons:form.maxDiscountHint')}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="termsAndConditions"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('coupons:form.termsAndConditions')}
                      fullWidth
                      multiline
                      rows={6}
                      disabled={loading}
                      error={!!errors.termsAndConditions}
                      helperText={errors.termsAndConditions?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </TabPanel>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading || isSubmitting}>
            {t('common:cancel')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting ? t('common:saving') : t('common:save')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
