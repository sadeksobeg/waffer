import React, { useState } from 'react';
import { Box, Button, Typography, Paper, Alert, CircularProgress, Stack } from '@mui/material';
import axios from 'axios';

const FunctionsTest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<any[]>([]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/waffer-1b16d/us-central1/api';

  const runFunctionsTest = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setTestResults([]);

    try {
      // Step 1: Initialize test
      setTestResults(prev => [...prev, { 
        step: 'Initializing test', 
        status: 'success',
        data: { apiUrl: API_URL }
      }]);
      
      // Step 2: Test ping endpoint
      setTestResults(prev => [...prev, { step: 'Testing ping endpoint', status: 'pending' }]);
      const pingResponse = await axios.get(`${API_URL}/ping`);
      setTestResults(prev => {
        const newResults = [...prev];
        newResults[newResults.length - 1].status = 'success';
        newResults[newResults.length - 1].data = { 
          status: pingResponse.status,
          data: pingResponse.data
        };
        return newResults;
      });
      
      // Step 3: Test users endpoint (should require authentication)
      setTestResults(prev => [...prev, { step: 'Testing users endpoint (should require auth)', status: 'pending' }]);
      try {
        await axios.get(`${API_URL}/users`);
        // If we get here, the endpoint didn't require authentication
        setTestResults(prev => {
          const newResults = [...prev];
          newResults[newResults.length - 1].status = 'warning';
          newResults[newResults.length - 1].data = { 
            message: 'Endpoint did not require authentication as expected'
          };
          return newResults;
        });
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          // This is expected - the endpoint should require authentication
          setTestResults(prev => {
            const newResults = [...prev];
            newResults[newResults.length - 1].status = 'success';
            newResults[newResults.length - 1].data = { 
              message: 'Endpoint correctly requires authentication',
              status: err.response?.status
            };
            return newResults;
          });
        } else {
          // Unexpected error
          setTestResults(prev => {
            const newResults = [...prev];
            newResults[newResults.length - 1].status = 'error';
            newResults[newResults.length - 1].error = err instanceof Error ? err.message : 'An unknown error occurred';
            return newResults;
          });
        }
      }
      
      setSuccess('Firebase Functions test completed successfully!');
    } catch (err) {
      console.error('Firebase Functions test error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      
      // Mark the current step as failed
      setTestResults(prev => {
        const newResults = [...prev];
        if (newResults.length > 0) {
          newResults[newResults.length - 1].status = 'error';
          newResults[newResults.length - 1].error = err instanceof Error ? err.message : 'An unknown error occurred';
        }
        return newResults;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Firebase Functions Test
      </Typography>
      
      <Typography variant="body1" paragraph>
        This component tests the connection to Firebase Functions by calling the API endpoints.
      </Typography>
      
      <Button 
        variant="contained" 
        color="primary" 
        onClick={runFunctionsTest} 
        disabled={loading}
        sx={{ mb: 2 }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Run Functions Test'}
      </Button>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      
      {testResults.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Test Results
          </Typography>
          
          <Stack spacing={1}>
            {testResults.map((result, index) => (
              <Alert 
                key={index} 
                severity={
                  result.status === 'pending' ? 'info' : 
                  result.status === 'success' ? 'success' : 
                  result.status === 'warning' ? 'warning' :
                  'error'
                }
              >
                <Typography variant="body2">
                  <strong>{result.step}</strong>
                  {result.status === 'pending' && ' - In progress...'}
                  {result.status === 'success' && ' - Completed successfully'}
                  {result.status === 'warning' && ' - Completed with warnings'}
                  {result.status === 'error' && ` - Failed: ${result.error}`}
                </Typography>
                {result.data && (
                  <Typography variant="body2" sx={{ mt: 0.5, fontSize: '0.8rem' }}>
                    {JSON.stringify(result.data)}
                  </Typography>
                )}
              </Alert>
            ))}
          </Stack>
        </Box>
      )}
    </Paper>
  );
};

export default FunctionsTest;
