import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthLayout() {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      if (user?.role === 'admin') {
        router.replace('/(admin)');
      } else if (user?.role === 'merchant') {
        router.replace('/(merchant)');
      } else {
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, isLoading, user]);

  return (
    <Stack screenOptions={{
      headerShown: false,
      animation: 'fade'
    }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="register" />
    </Stack>
  );
}