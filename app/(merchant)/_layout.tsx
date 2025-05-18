import React from 'react';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function MerchantLayout() {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect if not authenticated or not a merchant
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/(auth)');
      } else if (user?.role !== 'merchant') {
        if (user?.role === 'admin') {
          router.replace('/(admin)');
        } else {
          router.replace('/(tabs)');
        }
      }
    }
  }, [isAuthenticated, isLoading, user]);

  if (isLoading || !isAuthenticated || user?.role !== 'merchant') {
    return null;
  }

  return (
    <Stack screenOptions={{
      headerShown: false,
      animation: 'fade'
    }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="coupons" />
      <Stack.Screen name="create-coupon" />
      <Stack.Screen name="analytics" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}