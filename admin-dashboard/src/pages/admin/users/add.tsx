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
import UserForm from '../../../components/users/UserForm';
import withAuth from '../../../components/auth/withAuth';
import { UserInput } from '../../../services/userService';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../config/firebase';
import { createUser } from '../../../services/userService';

const AddUser: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (userData: UserInput & { password?: string }) => {
    try {
      setLoading(true);
      setError(null);

      // For a real implementation, you would need to handle password creation
      // This is a simplified version for demonstration
      const password = 'tempPassword123'; // In a real app, generate a random password or ask the user

      // Create the user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        password
      );

      // Create the user in Firestore
      await createUser(userCredential.user.uid, {
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role,
        status: userData.status as any,
        phoneNumber: userData.phoneNumber,
        photoURL: userData.photoURL,
      });

      setSuccess(true);

      // Redirect to users list after a short delay
      setTimeout(() => {
        router.push('/admin/users');
      }, 2000);
    } catch (err: any) {
      console.error('Error creating user:', err);
      
      // Handle specific Firebase Auth errors
      if (err.code === 'auth/email-already-in-use') {
        setError('Email is already in use. Please use a different email address.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address format.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please use a stronger password.');
      } else {
        setError('Failed to create user. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Add User">
      <Head>
        <title>Add User - Admin Dashboard</title>
        <meta name="description" content="Add a new user to the system" />
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
        <Typography color="text.primary">Add User</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Add New User
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create a new user account in the system
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* User Form */}
      <UserForm
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
          User created successfully! Redirecting...
        </Alert>
      </Snackbar>
    </AdminLayout>
  );
};

export default withAuth(AddUser, { requiredRole: 'admin' });
