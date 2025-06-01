import React from 'react';
import { Box, Typography, Container, Button } from '@mui/material';
import Link from 'next/link';

export default function TestPage() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h3" component="h1" gutterBottom>
          Test Page
        </Typography>
        <Typography variant="body1" paragraph>
          This is a test page to verify routing is working correctly.
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 300, mx: 'auto' }}>
          <Button variant="contained" component={Link} href="/">
            Go to Home
          </Button>
          
          <Button variant="contained" component={Link} href="/login">
            Go to Login
          </Button>
          
          <Button variant="contained" component={Link} href="/dashboard">
            Go to Dashboard
          </Button>
          
          <Button variant="contained" component={Link} href="/dashboard-direct">
            Go to Dashboard (Direct)
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
