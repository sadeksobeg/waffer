import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function IndexScreen() {
  const { isAuthenticated, user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        // Redirect based on user role
        if (user.role === 'admin') {
          router.replace('/(admin)');
        } else if (user.role === 'merchant') {
          router.replace('/(merchant)');
        } else {
          router.replace('/(tabs)');
        }
      } else {
        // Not authenticated, go to auth screen
        router.replace('/(auth)');
      }
    }
  }, [isAuthenticated, user, isLoading]);

  // Show loading spinner while checking authentication
  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#ffffff'
    }}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}
