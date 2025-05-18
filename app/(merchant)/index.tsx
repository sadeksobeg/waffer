import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { createThemedStyles } from '@/constants/theme';
import { router } from 'expo-router';
import { 
  PlusCircle, 
  BarChart3, 
  Tag, 
  UsersRound,
  Wallet,
  TicketCheck,
  Settings
} from 'lucide-react-native';
import MerchantHeader from '@/components/merchant/MerchantHeader';
import MerchantStatsCard from '@/components/merchant/MerchantStatsCard';
import CouponListItem from '@/components/merchant/CouponListItem';
import { mockCoupons } from '@/constants/mockData';

export default function MerchantDashboardScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const styles = createThemedStyles(theme);
  
  // Filter coupons for this merchant
  const [activeCoupons, setActiveCoupons] = useState(mockCoupons.slice(0, 3));
  
  // Mock data for merchant statistics
  const stats = {
    totalCoupons: activeCoupons.length,
    totalRedemptions: 247,
    totalCustomers: 158,
    totalPoints: 1250,
  };

  const navigateToSection = (section: string) => {
    router.push(`/(merchant)/${section}`);
  };

  return (
    <View style={styles.container}>
      <MerchantHeader title={t('dashboard')} />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={merchantStyles.scrollView}
        contentContainerStyle={merchantStyles.contentContainer}
      >
        <View style={merchantStyles.statsGrid}>
          <MerchantStatsCard 
            icon={<Tag size={24} color={theme.colors.primary[500]} />}
            title={t('activeCoupons')}
            value={stats.totalCoupons.toString()}
            onPress={() => navigateToSection('coupons')}
          />
          
          <MerchantStatsCard 
            icon={<TicketCheck size={24} color={theme.colors.success[500]} />}
            title={t('totalRedemptions')}
            value={stats.totalRedemptions.toString()}
            onPress={() => navigateToSection('analytics')}
          />
          
          <MerchantStatsCard 
            icon={<UsersRound size={24} color={theme.colors.secondary[500]} />}
            title={t('customers')}
            value={stats.totalCustomers.toString()}
            onPress={() => navigateToSection('analytics')}
          />
          
          <MerchantStatsCard 
            icon={<Wallet size={24} color={theme.colors.accent[500]} />}
            title={t('points')}
            value={stats.totalPoints.toString()}
            onPress={() => navigateToSection('settings')}
          />
        </View>
        
        <View style={merchantStyles.actionsContainer}>
          <TouchableOpacity 
            style={[merchantStyles.actionButton, { backgroundColor: theme.colors.primary[500] }]}
            onPress={() => navigateToSection('create-coupon')}
          >
            <PlusCircle size={24} color={theme.colors.white} />
            <Text style={merchantStyles.actionButtonText}>{t('createCoupon')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[merchantStyles.actionButton, { backgroundColor: theme.colors.secondary[500] }]}
            onPress={() => navigateToSection('analytics')}
          >
            <BarChart3 size={24} color={theme.colors.white} />
            <Text style={merchantStyles.actionButtonText}>{t('viewStatistics')}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={merchantStyles.recentCouponsContainer}>
          <View style={merchantStyles.sectionHeader}>
            <Text style={styles.subtitle}>{t('activeCoupons')}</Text>
            <TouchableOpacity onPress={() => navigateToSection('coupons')}>
              <Text style={[styles.secondaryText, { color: theme.colors.primary[600] }]}>{t('viewAll')}</Text>
            </TouchableOpacity>
          </View>
          
          {activeCoupons.length > 0 ? (
            activeCoupons.map((coupon) => (
              <CouponListItem 
                key={coupon.id}
                coupon={coupon}
                onPress={() => {}}
              />
            ))
          ) : (
            <View style={merchantStyles.emptyCoupons}>
              <Text style={styles.text}>No active coupons</Text>
              <TouchableOpacity 
                style={[styles.button, merchantStyles.createButton]}
                onPress={() => navigateToSection('create-coupon')}
              >
                <Text style={styles.buttonText}>{t('createCoupon')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        <View style={merchantStyles.quickActions}>
          <Text style={styles.subtitle}>{t('quickActions')}</Text>
          
          <View style={merchantStyles.quickActionsGrid}>
            <TouchableOpacity 
              style={[merchantStyles.quickActionItem, { backgroundColor: theme.colors.primary[50] }]}
              onPress={() => navigateToSection('settings')}
            >
              <Settings size={24} color={theme.colors.primary[500]} />
              <Text style={[styles.text, { color: theme.colors.primary[700] }]}>{t('storeDetails')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[merchantStyles.quickActionItem, { backgroundColor: theme.colors.secondary[50] }]}
              onPress={() => navigateToSection('coupons')}
            >
              <Tag size={24} color={theme.colors.secondary[500]} />
              <Text style={[styles.text, { color: theme.colors.secondary[700] }]}>{t('myCoupons')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const merchantStyles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 0.48,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  recentCouponsContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyCoupons: {
    padding: 24,
    alignItems: 'center',
  },
  createButton: {
    marginTop: 16,
    paddingHorizontal: 24,
  },
  quickActions: {
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  quickActionItem: {
    flexBasis: '48%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
});