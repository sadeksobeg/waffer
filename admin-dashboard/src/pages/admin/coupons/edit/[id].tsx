import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
  Alert,
  Snackbar,
  CircularProgress,
  Paper,
} from '@mui/material';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import Link from 'next/link';
import AdminLayout from '../../../../components/layout/AdminLayout';
import CouponForm from '../../../../components/coupons/CouponForm';
import withAuth from '../../../../components/auth/withAuth';
import { Coupon, CouponInput, getCouponById, updateCoupon } from '../../../../services/couponService';

const EditCoupon: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

  // Handle form submission
  const handleSubmit = async (couponData: CouponInput) => {
    if (!id || typeof id !== 'string') return;
    
    try {
      setSubmitting(true);
      setError(null);
      
      await updateCoupon(id, couponData);
      
      setSuccess(true);
      
      // Redirect to coupons list after a short delay
      setTimeout(() => {
        router.push('/admin/coupons');
      }, 2000);
    } catch (err) {
      console.error('Error updating coupon:', err);
      setError('Failed to update coupon. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Edit Coupon">
      <Head>
        <title>Edit Coupon - Admin Dashboard</title>
        <meta name="description" content="Edit coupon information" />
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
        <Typography color="text.primary">Edit Coupon</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Coupon
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Update coupon information
        </Typography>
      </Box>

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
        /* Coupon Form */
        <CouponForm
          initialData={coupon}
          onSubmit={handleSubmit}
          isLoading={submitting}
          isEditMode={true}
        />
      ) : (
        <Alert severity="error">Coupon not found</Alert>
      )}

      {/* Success Snackbar */}
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(false)} severity="success">
          Coupon updated successfully! Redirecting...
        </Alert>
      </Snackbar>
    </AdminLayout>
  );
};

export default withAuth(EditCoupon);
