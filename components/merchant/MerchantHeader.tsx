import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { createThemedStyles } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft, Settings, LogOut } from 'lucide-react-native';
import { router } from 'expo-router';

interface MerchantHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

export default function MerchantHeader({ title, showBackButton, onBackPress }: MerchantHeaderProps) {
  const { theme } = useTheme();
  const { logout } = useAuth();
  const styles = createThemedStyles(theme);
  
  const handleSettings = () => {
    router.push('/(merchant)/settings');
  };
  
  const handleLogout = async () => {
    await logout();
  };
  
  return (
    <View style={[merchantHeaderStyles.container, { backgroundColor: theme.colors.card }]}>
      <View style={merchantHeaderStyles.leftSection}>
        {showBackButton && (
          <TouchableOpacity 
            style={merchantHeaderStyles.backButton} 
            onPress={onBackPress}
          >
            <ChevronLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
        )}
        <Text 
          style={[
            styles.title, 
            merchantHeaderStyles.title,
            showBackButton && merchantHeaderStyles.titleWithBack
          ]}
        >
          {title}
        </Text>
      </View>
      
      <View style={merchantHeaderStyles.rightSection}>
        <TouchableOpacity 
          style={merchantHeaderStyles.actionButton} 
          onPress={handleSettings}
        >
          <Settings size={22} color={theme.colors.text} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={merchantHeaderStyles.actionButton} 
          onPress={handleLogout}
        >
          <LogOut size={22} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const merchantHeaderStyles = StyleSheet.create({
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
  title: {
    marginBottom: 0,
  },
  titleWithBack: {
    marginLeft: 4,
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
});