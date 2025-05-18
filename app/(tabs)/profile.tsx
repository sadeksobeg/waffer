import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Switch, Platform } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { createThemedStyles } from '@/constants/theme';
import { 
  User, 
  Settings, 
  Bell, 
  Moon, 
  Globe, 
  LogOut, 
  ChevronRight, 
  Shield, 
  HelpCircle, 
  FileText
} from 'lucide-react-native';

export default function ProfileScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { t, locale, changeLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const styles = createThemedStyles(theme);
  
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const toggleLanguage = () => {
    changeLanguage(locale === 'en' ? 'ar' : 'en');
  };

  const renderSettingItem = (icon: React.ReactNode, title: string, value?: string, action?: () => void, toggle?: boolean, isToggled?: boolean) => (
    <TouchableOpacity 
      style={[profileStyles.settingItem, { borderBottomColor: theme.colors.border }]} 
      onPress={action}
      disabled={!action && !toggle}
    >
      <View style={profileStyles.settingIconContainer}>
        {icon}
      </View>
      <View style={profileStyles.settingContent}>
        <Text style={[styles.text, profileStyles.settingTitle]}>{title}</Text>
        {value && <Text style={styles.secondaryText}>{value}</Text>}
      </View>
      {toggle ? (
        <Switch
          value={isToggled}
          onValueChange={action}
          trackColor={{ false: theme.colors.neutral[300], true: theme.colors.primary[300] }}
          thumbColor={isToggled ? theme.colors.primary[500] : theme.colors.neutral[100]}
        />
      ) : action && (
        <ChevronRight size={20} color={theme.colors.secondaryText} />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={profileStyles.content}
    >
      <View style={profileStyles.header}>
        <View style={[profileStyles.avatarContainer, { backgroundColor: theme.colors.primary[100] }]}>
          <User size={40} color={theme.colors.primary[500]} />
        </View>
        <Text style={[styles.title, profileStyles.userName]}>{user?.name}</Text>
        <Text style={styles.text}>{user?.email}</Text>
        <Text style={[styles.secondaryText, profileStyles.userRole]}>
          {user?.role === 'customer' ? t('customer') : user?.role === 'merchant' ? t('merchant') : t('admin')}
        </Text>
      </View>

      <View style={profileStyles.settingsSection}>
        <Text style={[styles.subtitle, profileStyles.sectionTitle]}>{t('settings')}</Text>
        
        {renderSettingItem(
          <Bell size={22} color={theme.colors.secondary[600]} />,
          t('notifications'),
          Platform.OS === 'web' ? 'Not available on web' : undefined,
          Platform.OS !== 'web' ? () => {} : undefined
        )}
        
        {renderSettingItem(
          <Globe size={22} color={theme.colors.accent[600]} />,
          t('language'),
          locale === 'en' ? 'English' : 'العربية',
          toggleLanguage
        )}
        
        {renderSettingItem(
          <Moon size={22} color={theme.colors.primary[600]} />,
          isDark ? t('lightMode') : t('darkMode'),
          undefined,
          toggleTheme,
          true,
          isDark
        )}
      </View>

      <View style={profileStyles.settingsSection}>
        <Text style={[styles.subtitle, profileStyles.sectionTitle]}>{t('support')}</Text>
        
        {renderSettingItem(
          <HelpCircle size={22} color={theme.colors.success[600]} />,
          'Help Center',
          undefined,
          () => {}
        )}
        
        {renderSettingItem(
          <FileText size={22} color={theme.colors.warning[600]} />,
          'Terms & Conditions',
          undefined,
          () => {}
        )}
        
        {renderSettingItem(
          <Shield size={22} color={theme.colors.error[600]} />,
          'Privacy Policy',
          undefined,
          () => {}
        )}
      </View>
      
      <TouchableOpacity 
        style={[profileStyles.logoutButton, { backgroundColor: theme.colors.error[50] }]} 
        onPress={handleLogout}
        disabled={isLoggingOut}
      >
        <LogOut size={20} color={theme.colors.error[600]} />
        <Text style={[profileStyles.logoutText, { color: theme.colors.error[600] }]}>
          {isLoggingOut ? t('loading') : t('logout')}
        </Text>
      </TouchableOpacity>
      
      <View style={profileStyles.versionContainer}>
        <Text style={[styles.secondaryText, profileStyles.versionText]}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const profileStyles = StyleSheet.create({
  content: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginVertical: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    marginBottom: 4,
  },
  userRole: {
    marginTop: 8,
    textTransform: 'capitalize',
  },
  settingsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginVertical: 16,
    borderRadius: 8,
  },
  logoutText: {
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 16,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 40,
  },
  versionText: {
    fontSize: 12,
  },
});