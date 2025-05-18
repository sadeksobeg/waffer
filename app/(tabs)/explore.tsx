import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { createThemedStyles } from '@/constants/theme';
import { Filter, SlidersHorizontal } from 'lucide-react-native';
import SearchBar from '@/components/common/SearchBar';
import CouponCardLarge from '@/components/customer/CouponCardLarge';
import FilterModal from '@/components/customer/FilterModal';
import { mockCoupons, mockCategories } from '@/constants/mockData';

export default function ExploreScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const styles = createThemedStyles(theme);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCoupons, setFilteredCoupons] = useState(mockCoupons);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    categories: [] as string[],
    sortBy: 'newest',
    onlyActive: true,
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsLoading(true);
    
    // Simulate search delay
    setTimeout(() => {
      const filtered = mockCoupons.filter(coupon => 
        coupon.title.toLowerCase().includes(query.toLowerCase()) ||
        coupon.merchant.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCoupons(filtered);
      setIsLoading(false);
    }, 500);
  };

  const applyFilters = (filters: any) => {
    setActiveFilters(filters);
    setIsLoading(true);
    
    // Simulate filter delay
    setTimeout(() => {
      let filtered = [...mockCoupons];
      
      // Apply category filter
      if (filters.categories.length > 0) {
        filtered = filtered.filter(coupon => 
          filters.categories.includes(coupon.category)
        );
      }
      
      // Apply active coupons filter
      if (filters.onlyActive) {
        const now = new Date();
        filtered = filtered.filter(coupon => 
          new Date(coupon.expiryDate) > now
        );
      }
      
      // Apply sorting
      if (filters.sortBy === 'newest') {
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else if (filters.sortBy === 'expiringSoon') {
        filtered.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
      } else if (filters.sortBy === 'discount') {
        filtered.sort((a, b) => parseInt(b.discount) - parseInt(a.discount));
      }
      
      setFilteredCoupons(filtered);
      setIsLoading(false);
    }, 500);
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