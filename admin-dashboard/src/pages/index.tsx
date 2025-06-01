import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the dashboard page
    router.push('/login');
  }, [router]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        p: 4,
      }}
    >
      <Head>
        <title>Coupon Platform Admin</title>
        <meta name="description" content="Admin Dashboard for Coupon Platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <CircularProgress size={60} sx={{ mb: 4 }} />
      <Typography variant="h4" component="h1" gutterBottom>
        Coupon Platform Admin
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Redirecting to login page...
      </Typography>
    </Box>
  );
}
