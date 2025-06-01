import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
  Alert,
  Snackbar,
} from '@mui/material';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import Link from 'next/link';
import AdminLayout from '../../../components/layout/AdminLayout';
import CouponForm from '../../../components/coupons/CouponForm';
import withAuth from '../../../components/auth/withAuth';
import { CouponInput, createCoupon } from '../../../services/couponService';
import { useAuth } from '../../../contexts/AuthContext';

const AddCoupon: React.FC = () => {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (couponData: CouponInput) => {
    try {
      setLoading(true);
      setError(null);

      // Create the coupon in Firestore
      await createCoupon(couponData, currentUser?.uid || 'unknown');
      
      setSuccess(true);
      
      // Redirect to coupons list after a short delay
      setTimeout(() => {
        router.push('/admin/coupons');
      }, 2000);
    } catch (err: any) {
      console.error('Error creating coupon:', err);
      
      if (err.message && err.message.includes('already exists')) {
        setError('A coupon with this code already exists. Please use a different code.');
      } else {
        setError('Failed to create coupon. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Add Coupon">
      <Head>
        <title>Add Coupon - Admin Dashboard</title>
        <meta name="description" content="Create a new coupon" />
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
        <Typography color="text.primary">Add Coupon</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Coupon
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create a new coupon for your customers
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Coupon Form */}
      <CouponForm
        onSubmit={handleSubmit}
        isLoading={loading}
      />

      {/* Success Snackbar */}
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(false)} severity="success">
          Coupon created successfully! Redirecting...
        </Alert>
      </Snackbar>
    </AdminLayout>
  );
};

export default withAuth(AddCoupon);
