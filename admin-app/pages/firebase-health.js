import React from 'react';
import { Container, Typography, Box, Paper, Grid } from '@mui/material';
import FirebaseTest from '../src/components/FirebaseTest';
import FunctionsTest from '../src/components/FunctionsTest';

const FirebaseHealthPage = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Firebase Health Check
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Firebase Configuration
        </Typography>
        
        <Typography variant="body1" paragraph>
          This page allows you to verify the Firebase integration for your admin dashboard.
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Environment Variables:
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Project ID
                </Typography>
                <Typography variant="body2">
                  {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'Not set'}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Auth Domain
                </Typography>
                <Typography variant="body2">
                  {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'Not set'}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  API URL
                </Typography>
                <Typography variant="body2">
                  {process.env.NEXT_PUBLIC_API_URL || 'Not set'}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Storage Bucket
                </Typography>
                <Typography variant="body2">
                  {process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'Not set'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      <FirebaseTest />
      
      <FunctionsTest />
    </Container>
  );
};

export default FirebaseHealthPage;
