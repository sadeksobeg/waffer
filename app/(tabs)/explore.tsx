import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { createThemedStyles } from '@/constants/theme';
import { Filter, SlidersHorizontal } from 'lucide-react-native';
import SearchBar from '@/components/common/SearchBar';
import CouponCardLarge from '@/components/customer/CouponCardLarge';
import FilterModal from '@/components/customer/FilterModal';
import { mockCoupons, mockCategories } from '@/constants/mockData';
import { getCoupons } from '../services/couponService';

export default function ExploreScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const styles = createThemedStyles(theme);

  const [searchQuery, setSearchQuery] = useState('');
  const [allCoupons, setAllCoupons] = useState([]);
  const [filteredCoupons, setFilteredCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    categories: [] as string[],
    sortBy: 'newest',
    onlyActive: true,
  });

  // Load real coupons from Firebase
  const loadCoupons = async () => {
    try {
      console.log('🔄 Loading all coupons for explore...');
      const result = await getCoupons(null, 50, { status: 'active' });
      const coupons = result.coupons;

      console.log(`✅ Loaded ${coupons.length} coupons for explore`);
      setAllCoupons(coupons);
      setFilteredCoupons(coupons);

    } catch (error) {
      console.error('❌ Error loading coupons for explore:', error);
      // Fallback to mock data
      console.log('📦 Using mock data as fallback for explore');
      setAllCoupons(mockCoupons);
      setFilteredCoupons(mockCoupons);
    } finally {
      setIsLoading(false);
    }
  };

  // Load coupons on component mount
  useEffect(() => {
    loadCoupons();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsLoading(true);

    // Search in real data
    setTimeout(() => {
      const filtered = allCoupons.filter(coupon =>
        coupon.title?.toLowerCase().includes(query.toLowerCase()) ||
        coupon.storeName?.toLowerCase().includes(query.toLowerCase()) ||
        coupon.description?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCoupons(filtered);
      setIsLoading(false);
    }, 300);
  };

  const applyFilters = (filters: any) => {
    setActiveFilters(filters);
    setIsLoading(true);

    // Apply filters to real data
    setTimeout(() => {
      let filtered = [...allCoupons];

      // Apply category filter
      if (filters.categories.length > 0) {
        filtered = filtered.filter(coupon =>
          coupon.categories && filters.categories.some(cat => coupon.categories.includes(cat))
        );
      }

      // Apply active coupons filter
      if (filters.onlyActive) {
        const now = new Date();
        filtered = filtered.filter(coupon => {
          const endDate = coupon.endDate?.seconds ? new Date(coupon.endDate.seconds * 1000) : new Date(coupon.endDate);
          return endDate > now;
        });
      }

      // Apply sorting
      if (filters.sortBy === 'newest') {
        filtered.sort((a, b) => {
          const aDate = a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000) : new Date(a.createdAt);
          const bDate = b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000) : new Date(b.createdAt);
          return bDate.getTime() - aDate.getTime();
        });
      } else if (filters.sortBy === 'expiringSoon') {
        filtered.sort((a, b) => {
          const aDate = a.endDate?.seconds ? new Date(a.endDate.seconds * 1000) : new Date(a.endDate || a.expiryDate);
          const bDate = b.endDate?.seconds ? new Date(b.endDate.seconds * 1000) : new Date(b.endDate || b.expiryDate);
          return aDate.getTime() - bDate.getTime();
        });
      } else if (filters.sortBy === 'discount') {
        filtered.sort((a, b) => (b.value || 0) - (a.value || 0));
      }

      setFilteredCoupons(filtered);
      setIsLoading(false);
    }, 300);
  };

  return (
    <View style={styles.container}>
      <View style={exploreStyles.header}>
        <Text style={styles.title}>{t('explore')}</Text>
        <SearchBar
          placeholder={t('search')}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <View style={exploreStyles.filterBar}>
          <View style={exploreStyles.activeFiltersContainer}>
            {activeFilters.categories.length > 0 && (
              <View style={[exploreStyles.filterChip, { backgroundColor: theme.colors.primary[100] }]}>
                <Text style={[exploreStyles.filterChipText, { color: theme.colors.primary[700] }]}>
                  {activeFilters.categories.length} {t('categories')}
                </Text>
              </View>
            )}

            {activeFilters.sortBy !== 'newest' && (
              <View style={[exploreStyles.filterChip, { backgroundColor: theme.colors.primary[100] }]}>
                <Text style={[exploreStyles.filterChipText, { color: theme.colors.primary[700] }]}>
                  {activeFilters.sortBy === 'expiringSoon' ? 'Expiring Soon' : 'Highest Discount'}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[
              exploreStyles.filterButton,
              {
                backgroundColor: theme.colors.primary[500],
                shadowColor: theme.colors.primary[500],
              }
            ]}
            onPress={() => setShowFilters(true)}
          >
            <SlidersHorizontal size={16} color={theme.colors.white} />
            <Text style={exploreStyles.filterButtonText}>{t('filter')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        </View>
      ) : (
        <>
          {filteredCoupons.length > 0 ? (
            <FlatList
              data={filteredCoupons}
              renderItem={({ item }) => <CouponCardLarge coupon={item} />}
              keyExtractor={(item) => item.id}
              contentContainerStyle={exploreStyles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.centerContainer}>
              <Text style={styles.text}>No coupons found.</Text>
            </View>
          )}
        </>
      )}

      <FilterModal
        isVisible={showFilters}
        onClose={() => setShowFilters(false)}
        categories={mockCategories}
        currentFilters={activeFilters}
        onApply={applyFilters}
      />
    </View>
  );
}

const exploreStyles = StyleSheet.create({
  header: {
    padding: 16,
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  activeFiltersContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
});