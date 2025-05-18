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
import { mockCoupons, mockCategories, mockStores } from '@/constants/mockData';

export default function HomeScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const styles = createThemedStyles(theme);
  
  const [refreshing, setRefreshing] = useState(false);
  const [featuredCoupons, setFeaturedCoupons] = useState(mockCoupons.slice(0, 5));
  const [trendingStores, setTrendingStores] = useState(mockStores.slice(0, 4));
  const [expiringCoupons, setExpiringCoupons] = useState(
    [...mockCoupons].sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()).slice(0, 5)
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate a data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
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
    <ScrollView
      style={styles.container}
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

      {renderSectionHeader('featuredCoupons', () => {})}
      <FlatList
        data={featuredCoupons}
        renderItem={({ item }) => <CouponCard coupon={item} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={homeStyles.horizontalListContent}
      />

      {renderSectionHeader('trendingStores', () => {})}
      <FlatList
        data={trendingStores}
        renderItem={renderStoreItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={homeStyles.horizontalListContent}
      />

      {renderSectionHeader('expiringCoupons', () => {})}
      <FlatList
        data={expiringCoupons}
        renderItem={({ item }) => <CouponCard coupon={item} showExpiry />}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={homeStyles.horizontalListContent}
      />

      <View style={homeStyles.spacer} />
    </ScrollView>
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