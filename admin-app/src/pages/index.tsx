import React from 'react';
import { Box, Typography, Container, Button, Grid, Paper } from '@mui/material';
import Link from 'next/link';

export default function Home() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h3" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" paragraph>
          Welcome to the Coupon Admin Dashboard
        </Typography>
      </Box>

      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Dashboard Pages
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <Button component={Link} href="/dashboard" variant="contained">
                Dashboard (Direct File)
              </Button>
              <Button component={Link} href="/admin" variant="contained">
                Admin (Direct File)
              </Button>
              <Button component={Link} href="/simple-dashboard" variant="outlined">
                Simple Dashboard
              </Button>
              <Button component={Link} href="/firebase-health" variant="outlined">
                Firebase Health Check
              </Button>
              <Button component={Link} href="/test" variant="outlined">
                Test Page
              </Button>
              <Button component={Link} href="/minimal" variant="outlined">
                Minimal Test Page
              </Button>
              <Button component={Link} href="/dash" variant="outlined">
                Alternative Dashboard
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
