import React from 'react';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLayout() {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect if not authenticated or not an admin
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/(auth)');
      } else if (user?.role !== 'admin') {
        if (user?.role === 'merchant') {
          router.replace('/(merchant)');
        } else {
          router.replace('/(tabs)');
        }
      }
    }
  }, [isAuthenticated, isLoading, user]);

  if (isLoading || !isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <Stack screenOptions={{
      headerShown: false,
      animation: 'fade'
    }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="users" />
      <Stack.Screen name="merchants" />
      <Stack.Screen name="coupons" />
      <Stack.Screen name="reports" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}