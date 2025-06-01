import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
  Alert,
  Paper,
  CircularProgress,
  Grid,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
} from '@mui/material';
import {
  NavigateNext as NavigateNextIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  ArrowBack as ArrowBackIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import AdminLayout from '../../../../components/layout/AdminLayout';
import withAuth from '../../../../components/auth/withAuth';
import { Coupon, getCouponById, deleteCoupon } from '../../../../services/couponService';

const CouponDetails: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch coupon data
  useEffect(() => {
    const fetchCoupon = async () => {
      if (!id || typeof id !== 'string') return;
      
      try {
        setLoading(true);
        setError(null);
        
        const couponData = await getCouponById(id);
        
        if (!couponData) {
          setError('Coupon not found');
          return;
        }
        
        setCoupon(couponData);
      } catch (err) {
        console.error('Error fetching coupon:', err);
        setError('Failed to load coupon data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCoupon();
  }, [id]);

  // Handle delete coupon
  const handleDeleteCoupon = async () => {
    if (!id || typeof id !== 'string') return;
    
    try {
      setDeleting(true);
      await deleteCoupon(id);
      setDeleteDialogOpen(false);
      setSuccessMessage('Coupon deleted successfully');
      
      // Redirect to coupons list after a short delay
      setTimeout(() => {
        router.push('/admin/coupons');
      }, 2000);
    } catch (err) {
      console.error('Error deleting coupon:', err);
      setError('Failed to delete coupon. Please try again.');
      setDeleting(false);
    }
  };

  // Handle copy code
  const handleCopyCode = () => {
    if (!coupon) return;
    
    navigator.clipboard.writeText(coupon.code);
    setSuccessMessage('Coupon code copied to clipboard');
  };

  // Format date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    try {
      const date = timestamp.toDate();
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch (err) {
      return 'Invalid date';
    }
  };

  // Format discount
  const formatDiscount = (discount: { type: 'percentage' | 'fixed'; value: number }) => {
    if (!discount) return 'N/A';
    
    return discount.type === 'percentage'
      ? `${discount.value}%`
      : `$${discount.value.toFixed(2)}`;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'expired':
        return 'default';
      case 'scheduled':
        return 'info';
      case 'disabled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <AdminLayout title="Coupon Details">
      <Head>
        <title>Coupon Details - Admin Dashboard</title>
        <meta name="description" content="View coupon details" />
      </Head>

      {/* Breadcrumbs */}
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <Link href="/dashboard" passHref legacyBehavior>
          <MuiLink color="inherit">Dashboard</MuiLink>
        </Link>
        <Link href="/admin/coupons" passHref legacyBehavior>
          <MuiLink color="inherit">Coupons</MuiLink>
        </Link>
        <Typography color="text.primary">Coupon Details</Typography>
      </Breadcrumbs>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <Paper sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Paper>
      ) : coupon ? (
        <>
          {/* Coupon Header */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                  {coupon.code}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {coupon.description || 'No description provided'}
                </Typography>
              </Box>
              <Box>
                <Chip
                  label={coupon.status}
                  color={getStatusColor(coupon.status)}
                  sx={{ mr: 1 }}
                />
                <IconButton onClick={handleCopyCode} title="Copy Code">
                  <CopyIcon />
                </IconButton>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => router.push('/admin/coupons')}
              >
                Back to Coupons
              </Button>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => router.push(`/admin/coupons/edit/${coupon.id}`)}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                startIcon={<BarChartIcon />}
                onClick={() => router.push(`/admin/coupons/stats/${coupon.id}`)}
              >
                View Stats
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete
              </Button>
            </Box>
          </Paper>

          {/* Coupon Details */}
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Discount
                    </Typography>
                    <Typography variant="body1">
                      {formatDiscount(coupon.discount)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Usage
                    </Typography>
                    <Typography variant="body1">
                      {coupon.usageCount} / {coupon.usageLimit === 0 ? '∞' : coupon.usageLimit}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Valid From
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(coupon.validFrom)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Valid To
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(coupon.validTo)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Created At
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(coupon.createdAt)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Created By
                    </Typography>
                    <Typography variant="body1">
                      {coupon.createdBy || 'Unknown'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Advanced Settings */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Advanced Settings
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Minimum Purchase
                    </Typography>
                    <Typography variant="body1">
                      {coupon.minPurchase ? `$${coupon.minPurchase.toFixed(2)}` : 'None'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Maximum Discount
                    </Typography>
                    <Typography variant="body1">
                      {coupon.maxDiscount ? `$${coupon.maxDiscount.toFixed(2)}` : 'None'}
                    </Typography>
                  </Grid>
                </Grid>
                
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 3, mb: 1 }}>
                  Applicable Products
                </Typography>
                {coupon.applicableProducts && coupon.applicableProducts.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {coupon.applicableProducts.map((product, index) => (
                      <Chip key={index} label={product} size="small" />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    All products
                  </Typography>
                )}
                
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 3, mb: 1 }}>
                  Applicable Categories
                </Typography>
                {coupon.applicableCategories && coupon.applicableCategories.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {coupon.applicableCategories.map((category, index) => (
                      <Chip key={index} label={category} size="small" />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    All categories
                  </Typography>
                )}
                
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 3, mb: 1 }}>
                  Exclusions
                </Typography>
                {coupon.exclusions && coupon.exclusions.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {coupon.exclusions.map((exclusion, index) => (
                      <Chip key={index} label={exclusion} size="small" />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No exclusions
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
          >
            <DialogTitle>Delete Coupon</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete the coupon <strong>{coupon.code}</strong>? This action cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
                Cancel
              </Button>
              <Button 
                onClick={handleDeleteCoupon} 
                color="error" 
                disabled={deleting}
                startIcon={deleting ? <CircularProgress size={20} /> : null}
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </>
      ) : (
        <Alert severity="error">Coupon not found</Alert>
      )}

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessMessage(null)} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>
    </AdminLayout>
  );
};

export default withAuth(CouponDetails);
