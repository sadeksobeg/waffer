import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { createThemedStyles } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft, Settings, Bell, Menu } from 'lucide-react-native';
import { router } from 'expo-router';

interface AdminHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

export default function AdminHeader({ title, showBackButton, onBackPress }: AdminHeaderProps) {
  const { theme } = useTheme();
  const styles = createThemedStyles(theme);
  
  const handleSettings = () => {
    router.push('/(admin)/settings');
  };
  
  const handleNotifications = () => {
    // Handle notifications
  };
  
  const handleMenu = () => {
    // Handle menu
  };
  
  return (
    <View style={[adminHeaderStyles.container, { backgroundColor: theme.colors.card }]}>
      <View style={adminHeaderStyles.leftSection}>
        {showBackButton ? (
          <TouchableOpacity 
            style={adminHeaderStyles.backButton} 
            onPress={onBackPress}
          >
            <ChevronLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={adminHeaderStyles.menuButton} 
            onPress={handleMenu}
          >
            <Menu size={24} color={theme.colors.text} />
          </TouchableOpacity>
        )}
        <Text 
          style={[
            styles.title, 
            adminHeaderStyles.title
          ]}
        >
          {title}
        </Text>
      </View>
      
      <View style={adminHeaderStyles.rightSection}>
        <TouchableOpacity 
          style={adminHeaderStyles.actionButton} 
          onPress={handleNotifications}
        >
          <Bell size={22} color={theme.colors.text} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={adminHeaderStyles.actionButton} 
          onPress={handleSettings}
        >
          <Settings size={22} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const adminHeaderStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    ...Platform.select({
      web: {
        paddingTop: 20,
      },
      default: {
        paddingTop: 50, // Adjust for status bar on native
      },
    }),
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  menuButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    marginBottom: 0,
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
});