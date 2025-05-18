import React from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Home, Search, QrCode, Wallet, User } from 'lucide-react-native';

export default function TabLayout() {
  const { theme } = useTheme();
  const { t, isRTL } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
        },
        tabBarActiveTintColor: theme.colors.primary[500],
        tabBarInactiveTintColor: theme.colors.secondaryText,
        tabBarLabelStyle: {
          fontFamily: theme.fontFamily.medium,
          fontSize: 12,
        },
        headerStyle: {
          backgroundColor: theme.colors.card,
          borderBottomColor: theme.colors.border,
          borderBottomWidth: 1,
          shadowColor: 'transparent',
        },
        headerTitleStyle: {
          fontFamily: theme.fontFamily.medium,
          color: theme.colors.text,
        },
        tabBarHideOnKeyboard: true,
      }}
      sceneContainerStyle={{
        backgroundColor: theme.colors.background,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          headerTitle: 'CouponHub',
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: t('explore'),
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: t('scanQR'),
          tabBarIcon: ({ color, size }) => <QrCode size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: t('wallet'),
          tabBarIcon: ({ color, size }) => <Wallet size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile'),
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}