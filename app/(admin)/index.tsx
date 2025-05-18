import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { createThemedStyles } from '@/constants/theme';
import { router } from 'expo-router';
import {
  Users,
  Store,
  Tag,
  FileText,
  Settings,
  LogOut,
  BarChart3,
  Bell
} from 'lucide-react-native';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminStatsCard from '@/components/admin/AdminStatsCard';
import LineChartView from '@/components/admin/LineChartView';
import UserListItem from '@/components/admin/UserListItem';
import { mockAdminStats, mockChartData, mockUsers } from '@/constants/mockData';

export default function AdminDashboardScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { logout } = useAuth();
  const styles = createThemedStyles(theme);
  
  const navigateToSection = (section: string) => {
    router.push(`/(admin)/${section}`);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View style={styles.container}>
      <AdminHeader title={t('adminDashboard')} />
      
      <ScrollView
        style={adminStyles.scrollView}
        contentContainerStyle={adminStyles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={adminStyles.statsContainer}>
          <View style={adminStyles.statsRow}>
            <AdminStatsCard
              icon={<Users size={24} color={theme.colors.primary[500]} />}
              title={t('users')}
              value={mockAdminStats.totalUsers.toString()}
              change={"+12%"}
              isPositive={true}
              onPress={() => navigateToSection('users')}
            />
            
            <AdminStatsCard
              icon={<Store size={24} color={theme.colors.secondary[500]} />}
              title={t('merchants')}
              value={mockAdminStats.totalMerchants.toString()}
              change={"+8%"}
              isPositive={true}
              onPress={() => navigateToSection('merchants')}
            />
          </View>
          
          <View style={adminStyles.statsRow}>
            <AdminStatsCard
              icon={<Tag size={24} color={theme.colors.accent[500]} />}
              title={t('coupons')}
              value={mockAdminStats.totalCoupons.toString()}
              change={"+24%"}
              isPositive={true}
              onPress={() => navigateToSection('coupons')}
            />
            
            <AdminStatsCard
              icon={<BarChart3 size={24} color={theme.colors.success[500]} />}
              title={t('redemptions')}
              value={mockAdminStats.totalRedemptions.toString()}
              change={"+15%"}
              isPositive={true}
              onPress={() => navigateToSection('reports')}
            />
          </View>
        </View>
        
        <View style={adminStyles.chartContainer}>
          <View style={adminStyles.chartHeader}>
            <Text style={styles.subtitle}>{t('analytics')}</Text>
            <TouchableOpacity onPress={() => navigateToSection('reports')}>
              <Text style={[styles.secondaryText, { color: theme.colors.primary[600] }]}>{t('seeMore')}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={[adminStyles.chartCard, styles.shadow, { backgroundColor: theme.colors.card }]}>
            <LineChartView 
              data={mockChartData}
              width={300}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartColors={[theme.colors.primary[500]]}
            />
          </View>
        </View>
        
        <View style={adminStyles.recentUsersContainer}>
          <View style={adminStyles.sectionHeader}>
            <Text style={styles.subtitle}>{t('recentUsers')}</Text>
            <TouchableOpacity onPress={() => navigateToSection('users')}>
              <Text style={[styles.secondaryText, { color: theme.colors.primary[600] }]}>{t('viewAll')}</Text>
            </TouchableOpacity>
          </View>
          
          {mockUsers.slice(0, 3).map((user) => (
            <UserListItem 
              key={user.id}
              user={user}
              onPress={() => {}}
            />
          ))}
        </View>
        
        <View style={adminStyles.quickActions}>
          <Text style={styles.subtitle}>{t('quickActions')}</Text>
          
          <View style={adminStyles.actionsGrid}>
            <TouchableOpacity 
              style={[adminStyles.actionCard, styles.shadow, { backgroundColor: theme.colors.card }]}
              onPress={() => navigateToSection('merchants')}
            >
              <Store size={32} color={theme.colors.secondary[500]} />
              <Text style={[styles.text, adminStyles.actionText]}>{t('merchantManagement')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[adminStyles.actionCard, styles.shadow, { backgroundColor: theme.colors.card }]}
              onPress={() => navigateToSection('reports')}
            >
              <FileText size={32} color={theme.colors.accent[500]} />
              <Text style={[styles.text, adminStyles.actionText]}>{t('reports')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[adminStyles.actionCard, styles.shadow, { backgroundColor: theme.colors.card }]}
              onPress={() => {}}
            >
              <Bell size={32} color={theme.colors.success[500]} />
              <Text style={[styles.text, adminStyles.actionText]}>{t('sendAnnouncement')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[adminStyles.actionCard, styles.shadow, { backgroundColor: theme.colors.card }]}
              onPress={() => navigateToSection('settings')}
            >
              <Settings size={32} color={theme.colors.primary[500]} />
              <Text style={[styles.text, adminStyles.actionText]}>{t('systemSettings')}</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[adminStyles.logoutButton, { backgroundColor: theme.colors.error[50] }]}
          onPress={handleLogout}
        >
          <LogOut size={20} color={theme.colors.error[600]} />
          <Text style={[adminStyles.logoutText, { color: theme.colors.error[600] }]}>{t('logout')}</Text>
        </TouchableOpacity>
        
        <View style={adminStyles.footerSpace} />
      </ScrollView>
    </View>
  );
}

const adminStyles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  chartContainer: {
    marginBottom: 24,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartCard: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  recentUsersContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActions: {
    marginBottom: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  actionCard: {
    width: '48%',
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  actionText: {
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 16,
  },
  footerSpace: {
    height: 40,
  },
});