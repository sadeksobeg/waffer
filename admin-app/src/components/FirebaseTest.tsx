import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Box, Button, Typography, Paper, Alert, CircularProgress, Stack } from '@mui/material';

const FirebaseTest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<any[]>([]);

  const runFirestoreTest = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setTestResults([]);

    try {
      // Step 1: Write a test document
      const testData = {
        message: 'Test document',
        timestamp: new Date(),
      };
      
      setTestResults(prev => [...prev, { step: 'Initializing test', status: 'success' }]);
      
      // Step 2: Write to Firestore
      setTestResults(prev => [...prev, { step: 'Writing test document to Firestore', status: 'pending' }]);
      const docRef = await addDoc(collection(db, 'healthcheck'), testData);
      setTestResults(prev => {
        const newResults = [...prev];
        newResults[newResults.length - 1].status = 'success';
        newResults[newResults.length - 1].data = { docId: docRef.id };
        return newResults;
      });
      
      // Step 3: Read from Firestore
      setTestResults(prev => [...prev, { step: 'Reading documents from Firestore', status: 'pending' }]);
      const querySnapshot = await getDocs(collection(db, 'healthcheck'));
      const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTestResults(prev => {
        const newResults = [...prev];
        newResults[newResults.length - 1].status = 'success';
        newResults[newResults.length - 1].data = { count: documents.length };
        return newResults;
      });
      
      // Step 4: Delete the test document
      setTestResults(prev => [...prev, { step: 'Deleting test document from Firestore', status: 'pending' }]);
      await deleteDoc(doc(db, 'healthcheck', docRef.id));
      setTestResults(prev => {
        const newResults = [...prev];
        newResults[newResults.length - 1].status = 'success';
        return newResults;
      });
      
      setSuccess('Firebase integration test completed successfully!');
    } catch (err) {
      console.error('Firebase test error:', err);
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
        Firebase Integration Test
      </Typography>
      
      <Typography variant="body1" paragraph>
        This component tests the connection to Firebase by writing, reading, and deleting a test document in Firestore.
      </Typography>
      
      <Button 
        variant="contained" 
        color="primary" 
        onClick={runFirestoreTest} 
        disabled={loading}
        sx={{ mb: 2 }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Run Firebase Test'}
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
                  'error'
                }
              >
                <Typography variant="body2">
                  <strong>{result.step}</strong>
                  {result.status === 'pending' && ' - In progress...'}
                  {result.status === 'success' && ' - Completed successfully'}
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

export default FirebaseTest;
