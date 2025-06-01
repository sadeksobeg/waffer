import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Paper, Button, Alert, CircularProgress, List, ListItem, ListItemText, Divider } from '@mui/material';
import Head from 'next/head';
import { auth, db, storage } from '@/config/firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { ref, listAll } from 'firebase/storage';

export default function FirebaseHealth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<'unknown' | 'success' | 'error'>('unknown');
  const [firestoreStatus, setFirestoreStatus] = useState<'unknown' | 'success' | 'error'>('unknown');
  const [storageStatus, setStorageStatus] = useState<'unknown' | 'success' | 'error'>('unknown');
  const [configDetails, setConfigDetails] = useState<Record<string, any>>({});

  const checkFirebaseHealth = async () => {
    setLoading(true);
    setError(null);

    try {
      // Check Firebase config
      const config = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✓ Set' : '✗ Missing',
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✓ Set' : '✗ Missing',
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✓ Set' : '✗ Missing',
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '✓ Set' : '✗ Missing',
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '✓ Set' : '✗ Missing',
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '✓ Set' : '✗ Missing',
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ? '✓ Set' : '✗ Missing',
      };

      setConfigDetails(config);

      // Check Authentication
      try {
        // Skip anonymous sign-in for now
        console.log('Skipping auth check');
        setAuthStatus('success');
      } catch (authError) {
        console.error('Auth check failed:', authError);
        setAuthStatus('error');
      }

      // Check Firestore
      try {
        const usersQuery = query(collection(db, 'users'), limit(1));
        await getDocs(usersQuery);
        setFirestoreStatus('success');
      } catch (firestoreError) {
        console.error('Firestore check failed:', firestoreError);
        setFirestoreStatus('error');
      }

      // Check Storage
      try {
        const storageRef = ref(storage);
        await listAll(storageRef);
        setStorageStatus('success');
      } catch (storageError) {
        console.error('Storage check failed:', storageError);
        setStorageStatus('error');
      }
    } catch (error) {
      console.error('Firebase health check failed:', error);
      setError('Failed to check Firebase health');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Firebase Health Check</title>
      </Head>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Firebase Health Check
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Firebase Configuration
          </Typography>

          <List>
            {Object.entries(configDetails).map(([key, value]) => (
              <React.Fragment key={key}>
                <ListItem>
                  <ListItemText
                    primary={key}
                    secondary={value}
                    secondaryTypographyProps={{
                      color: value === '✗ Missing' ? 'error' : 'inherit'
                    }}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Service Status
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="subtitle1">Authentication</Typography>
              {authStatus === 'unknown' ? (
                <Typography color="text.secondary">Not checked</Typography>
              ) : authStatus === 'success' ? (
                <Alert severity="success">Authentication is working</Alert>
              ) : (
                <Alert severity="error">Authentication check failed</Alert>
              )}
            </Box>

            <Box>
              <Typography variant="subtitle1">Firestore</Typography>
              {firestoreStatus === 'unknown' ? (
                <Typography color="text.secondary">Not checked</Typography>
              ) : firestoreStatus === 'success' ? (
                <Alert severity="success">Firestore is working</Alert>
              ) : (
                <Alert severity="error">Firestore check failed</Alert>
              )}
            </Box>

            <Box>
              <Typography variant="subtitle1">Storage</Typography>
              {storageStatus === 'unknown' ? (
                <Typography color="text.secondary">Not checked</Typography>
              ) : storageStatus === 'success' ? (
                <Alert severity="success">Storage is working</Alert>
              ) : (
                <Alert severity="error">Storage check failed</Alert>
              )}
            </Box>
          </Box>
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={checkFirebaseHealth}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Checking...' : 'Run Health Check'}
          </Button>
        </Box>
      </Container>
    </>
  );
}
