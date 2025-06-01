import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  InputAdornment,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
  CalendarMonth as CalendarIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import CouponsTable from '../../../components/coupons/CouponsTable';
import CouponsGrid from '../../../components/coupons/CouponsGrid';
import CouponsCalendar from '../../../components/coupons/CouponsCalendar';
import CouponFormDialog from '../../../components/coupons/CouponFormDialog';
import FilterDrawer from '../../../components/coupons/FilterDrawer';
import couponService, { CouponFilters } from '@/services/couponService';

type ViewMode = 'list' | 'grid' | 'calendar';

export default function CouponsManagement() {
  const { t } = useTranslation(['common', 'coupons']);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [openCouponForm, setOpenCouponForm] = useState(false);
  const [openFilterDrawer, setOpenFilterDrawer] = useState(false);
  const [filters, setFilters] = useState<CouponFilters>({
    isActive: undefined,
    merchantId: [],
    categories: [],
    dateRange: {
      start: null,
      end: null,
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [refreshTable, setRefreshTable] = useState(0);

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: ViewMode | null,
  ) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleFilterChange = (newFilters: CouponFilters) => {
    setFilters(newFilters);
    setOpenFilterDrawer(false);
  };

  const handleClearFilters = () => {
    setFilters({
      isActive: undefined,
      merchantId: [],
      categories: [],
      dateRange: {
        start: null,
        end: null,
      },
    });
  };

  const handleCouponSaved = () => {
    setRefreshTable(prev => prev + 1);
    setSuccess(t('coupons:messages.couponSaved'));
  };

  const handleExportCoupons = async () => {
    try {
      setLoading(true);
      setError(null);

      // Export coupons to CSV
      const blob = await couponService.exportCoupons('csv', {
        ...filters,
        search: searchQuery,
      });

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `coupons-export.csv`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess(t('coupons:messages.exportSuccess'));
    } catch (err) {
      console.error('Error exporting coupons:', err);
      setError(t('coupons:messages.exportError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  const handleCloseSuccess = () => {
    setSuccess(null);
  };

  const activeFiltersCount =
    (filters.isActive !== undefined ? 1 : 0) +
    (filters.merchantId?.length || 0) +
    (filters.categories?.length || 0) +
    (filters.dateRange?.start !== null ? 1 : 0);

  return (
    <DashboardLayout title={t('coupons:title')}>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          {t('coupons:title')}
        </Typography>
        <Typography variant="body1" color="textSecondary">
          {t('coupons:description')}
        </Typography>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              placeholder={t('common:search')}
              variant="outlined"
              size="small"
              fullWidth
              value={searchQuery}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={() => setOpenFilterDrawer(true)}
                startIcon={<FilterIcon />}
                endIcon={
                  activeFiltersCount > 0 ? (
                    <Chip
                      label={activeFiltersCount}
                      size="small"
                      color="primary"
                    />
                  ) : null
                }
              >
                {t('common:filters')}
              </Button>

              {activeFiltersCount > 0 && (
                <Button
                  variant="text"
                  onClick={handleClearFilters}
                >
                  {t('common:clearAll')}
                </Button>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Button
              variant="outlined"
              startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
              fullWidth
              onClick={handleExportCoupons}
              disabled={loading}
            >
              {loading ? t('common:exporting') : t('coupons:actions.export')}
            </Button>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              aria-label="view mode"
              size="small"
              fullWidth
            >
              <ToggleButton value="list" aria-label="list view">
                <ListViewIcon />
              </ToggleButton>
              <ToggleButton value="grid" aria-label="grid view">
                <GridViewIcon />
              </ToggleButton>
              <ToggleButton value="calendar" aria-label="calendar view">
                <CalendarIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              fullWidth
              onClick={() => setOpenCouponForm(true)}
              disabled={loading}
            >
              {t('coupons:actions.addCoupon')}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {viewMode === 'list' && (
        <CouponsTable
          searchQuery={searchQuery}
          filters={filters}
          onCouponUpdated={handleCouponSaved}
          key={`list-${refreshTable}`}
        />
      )}

      {viewMode === 'grid' && (
        <CouponsGrid
          searchQuery={searchQuery}
          filters={filters}
          key={`grid-${refreshTable}`}
        />
      )}

      {viewMode === 'calendar' && (
        <CouponsCalendar
          searchQuery={searchQuery}
          filters={filters}
          key={`calendar-${refreshTable}`}
        />
      )}

      <CouponFormDialog
        open={openCouponForm}
        onClose={() => setOpenCouponForm(false)}
        onSave={handleCouponSaved}
      />

      <FilterDrawer
        open={openFilterDrawer}
        onClose={() => setOpenFilterDrawer(false)}
        filters={filters}
        onApplyFilters={handleFilterChange}
      />

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
      >
        <Alert onClose={handleCloseError} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={handleCloseSuccess}
      >
        <Alert onClose={handleCloseSuccess} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common', 'coupons'])),
    },
  };
};
