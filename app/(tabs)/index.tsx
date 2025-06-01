import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, StyleSheet, RefreshControl, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { createThemedStyles } from '@/constants/theme';
import { ChevronRight, Search, TrendingUp, Clock, MapPin, Tag, Store } from 'lucide-react-native';
import CategoryList from '@/components/customer/CategoryList';
import CouponCard from '@/components/customer/CouponCard';
import SearchBar from '@/components/common/SearchBar';
import AppHeader from '@/components/ui/AppHeader';
import { mockCoupons, mockCategories, mockStores } from '@/constants/mockData';
import { getCoupons } from '../services/couponService';
import { router } from 'expo-router';

export default function HomeScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const styles = createThemedStyles(theme);

  const [refreshing, setRefreshing] = useState(false);
  const [featuredCoupons, setFeaturedCoupons] = useState([]);
  const [trendingStores, setTrendingStores] = useState(mockStores.slice(0, 4));
  const [expiringCoupons, setExpiringCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load real coupons from Firebase
  const loadCoupons = async () => {
    try {
      console.log('🔄 Loading coupons from Firebase...');

      // Add a small delay to ensure Firebase is fully initialized
      await new Promise(resolve => setTimeout(resolve, 1000));

      const result = await getCoupons(null, 20, { status: 'active' });
      const coupons = result.coupons;

      console.log(`✅ Loaded ${coupons.length} coupons from Firebase`);

      if (coupons.length === 0) {
        console.log('📦 No coupons found in Firebase, using mock data');
        setFeaturedCoupons(mockCoupons.slice(0, 5));
        setExpiringCoupons(mockCoupons.slice(0, 5));
        return;
      }

      // Set featured coupons (first 5)
      setFeaturedCoupons(coupons.slice(0, 5));

      // Set expiring coupons (sorted by expiry date) - handle different date formats
      const sortedByExpiry = [...coupons].sort((a, b) => {
        try {
          let aDate, bDate;

          // Handle different date formats from Firebase/Admin dashboard
          if (a.validTo?.seconds && typeof a.validTo.seconds === 'number') {
            const date = new Date(a.validTo.seconds * 1000);
            aDate = !isNaN(date.getTime()) ? date : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          } else if (a.endDate?.seconds && typeof a.endDate.seconds === 'number') {
            const date = new Date(a.endDate.seconds * 1000);
            aDate = !isNaN(date.getTime()) ? date : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          } else if (a.endDate) {
            const date = new Date(a.endDate);
            aDate = !isNaN(date.getTime()) ? date : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          } else if (a.expiryDate) {
            const date = new Date(a.expiryDate);
            aDate = !isNaN(date.getTime()) ? date : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          } else {
            aDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default to 30 days from now
          }

          if (b.validTo?.seconds && typeof b.validTo.seconds === 'number') {
            const date = new Date(b.validTo.seconds * 1000);
            bDate = !isNaN(date.getTime()) ? date : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          } else if (b.endDate?.seconds && typeof b.endDate.seconds === 'number') {
            const date = new Date(b.endDate.seconds * 1000);
            bDate = !isNaN(date.getTime()) ? date : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          } else if (b.endDate) {
            const date = new Date(b.endDate);
            bDate = !isNaN(date.getTime()) ? date : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          } else if (b.expiryDate) {
            const date = new Date(b.expiryDate);
            bDate = !isNaN(date.getTime()) ? date : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          } else {
            bDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default to 30 days from now
          }

          return aDate.getTime() - bDate.getTime();
        } catch (error) {
          console.warn('Date parsing error:', error);
          return 0;
        }
      });
      setExpiringCoupons(sortedByExpiry.slice(0, 5));

    } catch (error) {
      console.error('❌ Error loading coupons:', error);
      // Fallback to mock data if Firebase fails
      console.log('📦 Using mock data as fallback');
      setFeaturedCoupons(mockCoupons.slice(0, 5));
      setExpiringCoupons(mockCoupons.slice(0, 5));
    } finally {
      setLoading(false);
    }
  };

  // Load coupons on component mount
  useEffect(() => {
    loadCoupons();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadCoupons().finally(() => {
      setRefreshing(false);
    });
  }, []);

  const renderSectionHeader = (title: string, onPress?: () => void) => (
    <View style={homeStyles.sectionHeader}>
      <Text style={[styles.subtitle, homeStyles.sectionTitle]}>{t(title)}</Text>
      {onPress && (
        <TouchableOpacity style={homeStyles.viewAllButton} onPress={onPress}>
          <Text style={[styles.secondaryText, { color: theme.colors.primary[600] }]}>{t('viewAll')}</Text>
          <ChevronRight size={16} color={theme.colors.primary[600]} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderStoreItem = ({ item }: any) => (
    <TouchableOpacity
      style={[homeStyles.storeCard, styles.shadow, { backgroundColor: theme.colors.card }]}
      activeOpacity={0.7}
      onPress={() => {
        // Navigate to explore page with store filter
        router.push('/(tabs)/explore');
      }}
    >
      <Image source={{ uri: item.image }} style={homeStyles.storeImage} />
      <Text style={[styles.text, homeStyles.storeName]} numberOfLines={1}>{item.name}</Text>
      <View style={homeStyles.storeStats}>
        <Tag size={12} color={theme.colors.accent[500]} />
        <Text style={[styles.secondaryText, homeStyles.statsText]}>{item.couponCount} coupons</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header with Waffer Logo */}
      <AppHeader
        showLogo={true}
        showNotifications={true}
        showProfile={true}
        onNotificationPress={() => {}}
        onProfilePress={() => {}}
      />

      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={homeStyles.header}>
          <View style={homeStyles.greeting}>
            <Text style={styles.text}>
              {t('hello')}, {user?.name?.split(' ')[0] || 'Guest'}
            </Text>
            {user?.role === 'customer' && user?.points !== undefined && (
              <View style={homeStyles.pointsBadge}>
                <Text style={homeStyles.pointsText}>{user.points} {t('points')}</Text>
              </View>
            )}
          </View>
          <SearchBar placeholder={t('search')} />
        </View>

      <CategoryList
        categories={mockCategories}
        containerStyle={homeStyles.categoriesContainer}
      />

      {renderSectionHeader('featuredCoupons', () => router.push('/(tabs)/explore'))}
      <FlatList
        data={featuredCoupons}
        renderItem={({ item }) => <CouponCard coupon={item} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={homeStyles.horizontalListContent}
      />

      {renderSectionHeader('trendingStores', () => router.push('/(tabs)/explore'))}
      <FlatList
        data={trendingStores}
        renderItem={renderStoreItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={homeStyles.horizontalListContent}
      />

      {renderSectionHeader('expiringCoupons', () => router.push('/(tabs)/explore'))}
      <FlatList
        data={expiringCoupons}
        renderItem={({ item }) => <CouponCard coupon={item} showExpiry />}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={homeStyles.horizontalListContent}
      />

        <View style={homeStyles.spacer} />
      </ScrollView>
    </View>
  );
}

const homeStyles = StyleSheet.create({
  header: {
    padding: 16,
  },
  greeting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pointsBadge: {
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  pointsText: {
    color: '#0284c7',
    fontWeight: '600',
    fontSize: 14,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    marginBottom: 0,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  horizontalListContent: {
    paddingHorizontal: 12,
  },
  storeCard: {
    width: 140,
    borderRadius: 12,
    marginHorizontal: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  storeImage: {
    width: '100%',
    height: 100,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  storeName: {
    padding: 12,
    paddingBottom: 4,
    fontWeight: '600',
  },
  storeStats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  statsText: {
    marginLeft: 4,
    fontSize: 12,
  },
  spacer: {
    height: 80,
  },
});