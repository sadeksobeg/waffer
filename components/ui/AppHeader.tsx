import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Bell, User, Menu } from 'lucide-react-native';
import WafferLogo from './WafferLogo';

interface AppHeaderProps {
  title?: string;
  showLogo?: boolean;
  showNotifications?: boolean;
  showProfile?: boolean;
  showMenu?: boolean;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  onMenuPress?: () => void;
  style?: any;
}

export default function AppHeader({
  title,
  showLogo = true,
  showNotifications = true,
  showProfile = true,
  showMenu = false,
  onNotificationPress,
  onProfilePress,
  onMenuPress,
  style,
}: AppHeaderProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }, style]}>
      {/* Left side */}
      <View style={styles.leftSection}>
        {showMenu && (
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.colors.primary[50] }]}
            onPress={onMenuPress}
          >
            <Menu size={20} color={theme.colors.primary[600]} />
          </TouchableOpacity>
        )}
        
        {showLogo && (
          <View style={styles.logoContainer}>
            <WafferLogo 
              size={40} 
              animated={false} 
              showAnimation={false}
              style={{ marginRight: 8 }}
            />
            <Text style={[styles.brandText, { color: theme.colors.text }]}>
              Waffer
            </Text>
          </View>
        )}
        
        {title && !showLogo && (
          <Text style={[styles.titleText, { color: theme.colors.text }]}>
            {title}
          </Text>
        )}
      </View>

      {/* Right side */}
      <View style={styles.rightSection}>
        {showNotifications && (
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.colors.primary[50] }]}
            onPress={onNotificationPress}
          >
            <Bell size={20} color={theme.colors.primary[600]} />
            {/* Notification badge */}
            <View style={[styles.badge, { backgroundColor: theme.colors.error }]}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
        )}
        
        {showProfile && (
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.colors.primary[50] }]}
            onPress={onProfilePress}
          >
            <User size={20} color={theme.colors.primary[600]} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandText: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '600',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
