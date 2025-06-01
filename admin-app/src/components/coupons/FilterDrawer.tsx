import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import {
  Drawer,
  Box,
  Typography,
  Divider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  CircularProgress,
  Switch,
  Radio,
  RadioGroup
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import couponService, { Merchant, Category, CouponFilters } from '@/services/couponService';

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: CouponFilters;
  onApplyFilters: (filters: CouponFilters) => void;
}

export default function FilterDrawer({ open, onClose, filters, onApplyFilters }: FilterDrawerProps) {
  const { t } = useTranslation(['common', 'coupons']);
  const [localFilters, setLocalFilters] = useState<CouponFilters>(filters);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // Reset local filters when parent filters change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Fetch merchants and categories when drawer opens
  useEffect(() => {
    if (open) {
      fetchMerchants();
      fetchCategories();
    }
  }, [open]);

  const fetchMerchants = async () => {
    try {
      setLoading(true);
      const data = await couponService.getMerchants();
      setMerchants(data);
    } catch (err) {
      console.error('Error fetching merchants:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await couponService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const isActive = value === 'active' ? true : value === 'inactive' ? false : undefined;

    setLocalFilters(prev => ({
      ...prev,
      isActive
    }));
  };

  const handleMerchantChange = (merchantId: string) => {
    setLocalFilters(prev => {
      const currentMerchantIds = prev.merchantId || [];
      const newMerchantIds = currentMerchantIds.includes(merchantId)
        ? currentMerchantIds.filter(id => id !== merchantId)
        : [...currentMerchantIds, merchantId];

      return {
        ...prev,
        merchantId: newMerchantIds
      };
    });
  };

  const handleCategoryChange = (categoryId: string) => {
    setLocalFilters(prev => {
      const currentCategories = prev.categories || [];
      const newCategories = currentCategories.includes(categoryId)
        ? currentCategories.filter(id => id !== categoryId)
        : [...currentCategories, categoryId];

      return {
        ...prev,
        categories: newCategories
      };
    });
  };

  const handleStartDateChange = (date: Date | null) => {
    setLocalFilters(prev => ({
      ...prev,
      dateRange: {
        start: date,
        end: prev.dateRange?.end || null
      }
    }));
  };

  const handleEndDateChange = (date: Date | null) => {
    setLocalFilters(prev => ({
      ...prev,
      dateRange: {
        start: prev.dateRange?.start || null,
        end: date
      }
    }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
  };

  const handleReset = () => {
    setLocalFilters({
      isActive: undefined,
      merchantId: [],
      categories: [],
      dateRange: {
        start: null,
        end: null,
      },
    });
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: 320 },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">{t('common:filters')}</Typography>
        <Typography variant="body2" color="textSecondary">
          {t('coupons:filters.description')}
        </Typography>
      </Box>

      <Divider />

      <Box sx={{ p: 2, overflowY: 'auto', flexGrow: 1 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        )}

        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{t('coupons:filters.status')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <RadioGroup
              value={localFilters.isActive === true ? 'active' : localFilters.isActive === false ? 'inactive' : 'all'}
              onChange={handleStatusChange}
            >
              <FormControlLabel
                value="all"
                control={<Radio />}
                label={t('coupons:filters.allStatuses')}
              />
              <FormControlLabel
                value="active"
                control={<Radio />}
                label={t('coupons:status.active')}
              />
              <FormControlLabel
                value="inactive"
                control={<Radio />}
                label={t('coupons:status.inactive')}
              />
            </RadioGroup>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{t('coupons:filters.merchants')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <FormGroup>
                {merchants.length === 0 ? (
                  <Typography variant="body2" color="textSecondary">
                    {t('coupons:filters.noMerchantsFound')}
                  </Typography>
                ) : (
                  merchants.map(merchant => (
                    <FormControlLabel
                      key={merchant.id}
                      control={
                        <Checkbox
                          checked={localFilters.merchantId?.includes(merchant.id) || false}
                          onChange={() => handleMerchantChange(merchant.id)}
                        />
                      }
                      label={merchant.storeName || `${merchant.firstName} ${merchant.lastName}`}
                    />
                  ))
                )}
              </FormGroup>
            )}
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{t('coupons:filters.categories')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <FormGroup>
                {categories.length === 0 ? (
                  <Typography variant="body2" color="textSecondary">
                    {t('coupons:filters.noCategoriesFound')}
                  </Typography>
                ) : (
                  categories.map(category => (
                    <FormControlLabel
                      key={category.id}
                      control={
                        <Checkbox
                          checked={localFilters.categories?.includes(category.id) || false}
                          onChange={() => handleCategoryChange(category.id)}
                        />
                      }
                      label={category.name}
                    />
                  ))
                )}
              </FormGroup>
            )}
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{t('coupons:filters.dateRange')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <DatePicker
                  label={t('coupons:filters.startDate')}
                  value={localFilters.dateRange?.start || null}
                  onChange={handleStartDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                    },
                  }}
                />
                <DatePicker
                  label={t('coupons:filters.endDate')}
                  value={localFilters.dateRange?.end || null}
                  onChange={handleEndDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                    },
                  }}
                />
              </Box>
            </LocalizationProvider>
          </AccordionDetails>
        </Accordion>
      </Box>

      <Divider />

      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={handleReset} color="inherit">
          {t('common:reset')}
        </Button>
        <Button onClick={handleApply} variant="contained">
          {t('common:apply')}
        </Button>
      </Box>
    </Drawer>
  );
}
