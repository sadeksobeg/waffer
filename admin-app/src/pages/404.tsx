import React from 'react';
import { Box, Typography, Container, Button } from '@mui/material';
import Link from 'next/link';

export default function Custom404() {
  return (
    <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h1" component="h1" gutterBottom>
        404
      </Typography>
      <Typography variant="h4" component="h2" gutterBottom>
        Custom 404 Page - Page Not Found
      </Typography>
      <Typography variant="body1" paragraph>
        The page you are looking for does not exist or has been moved.
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Button component={Link} href="/" variant="contained">
          Go to Home
        </Button>
      </Box>
    </Container>
  );
}
