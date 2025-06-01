import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { createThemedStyles } from '@/constants/theme';
import { Clock, Bookmark, BookmarkCheck, Tag } from 'lucide-react-native';
import { formatDistance } from 'date-fns';

interface Coupon {
  id: string;
  title: string;
  description?: string;
  discount?: string | { value: number; type: string }; // Admin dashboard uses object format
  value?: number; // Legacy field
  merchant?: {
    id: string;
    name: string;
    image: string;
  };
  storeName?: string; // Admin dashboard uses 'storeName'
  storeImage?: string; // Admin dashboard uses 'storeImage'
  category?: string;
  categories?: string[]; // Admin dashboard uses 'categories' array
  expiryDate?: string;
  endDate?: any; // Firebase timestamp or string
  validTo?: any; // Admin dashboard uses 'validTo' for expiry
  createdAt?: string;
}

interface CouponCardLargeProps {
  coupon: Coupon;
  onPress?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
}

export default function CouponCardLarge({ coupon, onPress, onSave, isSaved = false }: CouponCardLargeProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const styles = createThemedStyles(theme);

  // Handle different date formats from Firebase/Admin dashboard
  const getExpiryDate = () => {
    try {
      // Handle Firebase Timestamp objects (validTo field from admin dashboard)
      if (coupon.validTo?.seconds && typeof coupon.validTo.seconds === 'number') {
        const date = new Date(coupon.validTo.seconds * 1000);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
      // Handle other Firebase Timestamp formats
      if (coupon.endDate?.seconds && typeof coupon.endDate.seconds === 'number') {
        const date = new Date(coupon.endDate.seconds * 1000);
        if (!isNaN(date.getTime())) {
          return date;
        }
      } else if (coupon.endDate) {
        const date = new Date(coupon.endDate);
        if (!isNaN(date.getTime())) {
          return date;
        }
      } else if (coupon.expiryDate) {
        const date = new Date(coupon.expiryDate);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
      // Default to 30 days from now if no valid date found
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    } catch (error) {
      console.warn('Date parsing error:', error);
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default to 30 days from now
    }
  };

  // Handle different data structures from Firebase/Admin dashboard
  const getMerchantName = () => {
    return coupon.merchant?.name || coupon.storeName || 'Unknown Store';
  };

  const getMerchantImage = () => {
    return coupon.merchant?.image || coupon.storeImage || 'https://via.placeholder.com/60x60?text=Store';
  };

  const getDiscountValue = () => {
    try {
      // Handle Firebase admin dashboard structure: discount: {value: 5, type: "fixed"}
      if (coupon.discount && typeof coupon.discount === 'object' && coupon.discount.value !== undefined) {
        return coupon.discount.value.toString();
      }
      // Handle simple discount string/number
      if (coupon.discount && typeof coupon.discount !== 'object') {
        return coupon.discount.toString();
      }
      // Handle legacy value field
      if (coupon.value) {
        if (typeof coupon.value === 'object' && coupon.value.value !== undefined) {
          return coupon.value.value.toString();
        } else if (typeof coupon.value === 'number') {
          return coupon.value.toString();
        } else if (typeof coupon.value === 'string') {
          return coupon.value;
        }
      }
      return '0';
    } catch (error) {
      console.warn('Error parsing discount value:', error);
      return '0';
    }
  };

  const getCategory = () => {
    if (coupon.category) return coupon.category;
    if (coupon.categories && coupon.categories.length > 0) return coupon.categories[0];
    return 'General';
  };

  const getDescription = () => {
    return coupon.description || 'No description available';
  };

  const expiryDate = getExpiryDate();
  const isExpired = expiryDate < new Date();
  const expiresIn = formatDistance(expiryDate, new Date(), { addSuffix: true });

  return (
    <TouchableOpacity
      style={[
        couponCardStyles.container,
        styles.shadow,
        {
          backgroundColor: theme.colors.card,
          opacity: isExpired ? 0.7 : 1
        }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={isExpired}
    >
      <View style={couponCardStyles.contentRow}>
        <Image
          source={{ uri: getMerchantImage() }}
          style={couponCardStyles.merchantImage}
        />

        <View style={couponCardStyles.contentSection}>
          <Text style={[styles.text, couponCardStyles.merchantName]}>
            {getMerchantName()}
          </Text>
          <Text style={[styles.subtitle, couponCardStyles.title]} numberOfLines={1}>
            {coupon.title}
          </Text>
          <Text style={[styles.secondaryText, couponCardStyles.description]} numberOfLines={2}>
            {getDescription()}
          </Text>

          <View style={couponCardStyles.metaInfo}>
            <View style={couponCardStyles.expiryContainer}>
              <Clock size={14} color={isExpired ? theme.colors.error[500] : theme.colors.primary[500]} />
              <Text
                style={[
                  styles.secondaryText,
                  couponCardStyles.expiryText,
                  { color: isExpired ? theme.colors.error[500] : theme.colors.secondaryText }
                ]}
              >
                {isExpired ? 'Expired' : expiresIn}
              </Text>
            </View>

            <View style={couponCardStyles.categoryContainer}>
              <Tag size={14} color={theme.colors.primary[500]} />
              <Text style={[styles.secondaryText, couponCardStyles.categoryText]}>
                {getCategory()}
              </Text>
            </View>
          </View>
        </View>

        <View style={couponCardStyles.rightSide}>
          <View style={[couponCardStyles.discount, { backgroundColor: theme.colors.primary[500] }]}>
            <Text style={couponCardStyles.discountText}>{getDiscountValue()}%</Text>
          </View>

          <TouchableOpacity
            style={couponCardStyles.bookmarkButton}
            onPress={onSave}
          >
            {isSaved ? (
              <BookmarkCheck size={20} color={theme.colors.primary[500]} />
            ) : (
              <Bookmark size={20} color={theme.colors.primary[500]} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const couponCardStyles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
  },
  contentRow: {
    flexDirection: 'row',
  },
  merchantImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  contentSection: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  rightSide: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  merchantName: {
    fontSize: 12,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 16,
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    marginBottom: 8,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  expiryText: {
    fontSize: 12,
    marginLeft: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 12,
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  discount: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  bookmarkButton: {
    padding: 4,
  },
});