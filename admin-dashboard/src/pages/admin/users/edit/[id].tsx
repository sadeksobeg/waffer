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
import UserForm from '../../../../components/users/UserForm';
import withAuth from '../../../../components/auth/withAuth';
import { User, UserInput, getUserById, updateUser } from '../../../../services/userService';

const EditUser: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      if (!id || typeof id !== 'string') return;
      
      try {
        setLoading(true);
        setError(null);
        
        const userData = await getUserById(id);
        
        if (!userData) {
          setError('User not found');
          return;
        }
        
        setUser(userData);
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Failed to load user data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [id]);

  // Handle form submission
  const handleSubmit = async (userData: UserInput) => {
    if (!id || typeof id !== 'string') return;
    
    try {
      setSubmitting(true);
      setError(null);
      
      await updateUser(id, userData);
      
      setSuccess(true);
      
      // Redirect to users list after a short delay
      setTimeout(() => {
        router.push('/admin/users');
      }, 2000);
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Edit User">
      <Head>
        <title>Edit User - Admin Dashboard</title>
        <meta name="description" content="Edit user information" />
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
        <Link href="/admin/users" passHref legacyBehavior>
          <MuiLink color="inherit">Users</MuiLink>
        </Link>
        <Typography color="text.primary">Edit User</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit User
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Update user information
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
      ) : user ? (
        /* User Form */
        <UserForm
          initialData={user}
          onSubmit={handleSubmit}
          isLoading={submitting}
          isEditMode={true}
        />
      ) : (
        <Alert severity="error">User not found</Alert>
      )}

      {/* Success Snackbar */}
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(false)} severity="success">
          User updated successfully! Redirecting...
        </Alert>
      </Snackbar>
    </AdminLayout>
  );
};

export default withAuth(EditUser, { requiredRole: 'admin' });
