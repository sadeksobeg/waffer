import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { createThemedStyles } from '@/constants/theme';
import { Clock, Bookmark, BookmarkCheck } from 'lucide-react-native';
import { formatDistance } from 'date-fns';
import { saveCoupon, unsaveCoupon, isCouponSaved } from '@/app/services/couponService';

interface Coupon {
  id: string;
  title: string;
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

interface CouponCardProps {
  coupon: Coupon;
  showExpiry?: boolean;
  inWallet?: boolean;
  used?: boolean;
  onPress?: () => void;
}

export default function CouponCard({ coupon, showExpiry = false, inWallet = false, used = false, onPress }: CouponCardProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const styles = createThemedStyles(theme);

  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if coupon is saved when component mounts
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (user?.uid && coupon.id) {
        try {
          const saved = await isCouponSaved(user.uid, coupon.id);
          setIsSaved(saved);
        } catch (error) {
          console.error('Error checking saved status:', error);
        }
      }
    };

    checkSavedStatus();
  }, [user?.uid, coupon.id]);

  const handleSaveToggle = async () => {
    if (!user?.uid || isLoading) return;

    setIsLoading(true);
    try {
      if (isSaved) {
        await unsaveCoupon(user.uid, coupon.id);
        setIsSaved(false);
      } else {
        await saveCoupon(user.uid, coupon.id);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error toggling save status:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const expiryDate = getExpiryDate();
  const isExpired = expiryDate < new Date();
  const expiresIn = formatDistance(expiryDate, new Date(), { addSuffix: true });

  // Handle different data structures from Firebase/Admin dashboard
  const getMerchantName = () => {
    return coupon.merchant?.name || coupon.storeName || 'Unknown Store';
  };

  const getMerchantImage = () => {
    return coupon.merchant?.image || coupon.storeImage || 'https://via.placeholder.com/200x100?text=Store';
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
      // Handle value field (should be a primitive now after service mapping)
      if (coupon.value !== undefined && coupon.value !== null) {
        if (typeof coupon.value === 'number') {
          return coupon.value.toString();
        } else if (typeof coupon.value === 'string') {
          return coupon.value;
        }
      }
      return '5'; // Default fallback
    } catch (error) {
      console.warn('Error parsing discount value:', error);
      return '5';
    }
  };

  return (
    <TouchableOpacity
      style={[
        couponCardStyles.container,
        styles.shadow,
        {
          backgroundColor: theme.colors.card,
          opacity: (isExpired || used) ? 0.7 : 1
        }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={isExpired || used}
    >
      <View style={couponCardStyles.topSection}>
        <Image
          source={{ uri: getMerchantImage() }}
          style={couponCardStyles.merchantImage}
        />
        <View style={couponCardStyles.discount}>
          <Text style={couponCardStyles.discountText}>{getDiscountValue()}%</Text>
        </View>
      </View>

      <View style={couponCardStyles.contentSection}>
        <Text style={[styles.text, couponCardStyles.merchantName]} numberOfLines={1}>
          {getMerchantName()}
        </Text>
        <Text style={[styles.subtitle, couponCardStyles.title]} numberOfLines={2}>
          {coupon.title}
        </Text>

        {showExpiry && (
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
        )}

        {inWallet && (
          <View style={[
            couponCardStyles.statusBadge,
            {
              backgroundColor: used
                ? theme.colors.neutral[200]
                : isExpired
                  ? theme.colors.error[100]
                  : theme.colors.success[100]
            }
          ]}>
            <Text style={[
              couponCardStyles.statusText,
              {
                color: used
                  ? theme.colors.neutral[700]
                  : isExpired
                    ? theme.colors.error[700]
                    : theme.colors.success[700]
              }
            ]}>
              {used ? t('used') : isExpired ? t('expired') : t('active')}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={couponCardStyles.bookmarkButton}
        onPress={handleSaveToggle}
        disabled={isLoading}
      >
        {isSaved || inWallet ? (
          <BookmarkCheck size={20} color={theme.colors.primary[500]} />
        ) : (
          <Bookmark size={20} color={theme.colors.primary[500]} />
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const couponCardStyles = StyleSheet.create({
  container: {
    width: 200,
    borderRadius: 12,
    marginHorizontal: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  topSection: {
    height: 100,
    position: 'relative',
  },
  merchantImage: {
    width: '100%',
    height: '100%',
  },
  discount: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  contentSection: {
    padding: 12,
  },
  merchantName: {
    fontSize: 12,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    marginBottom: 8,
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiryText: {
    fontSize: 12,
    marginLeft: 4,
  },
  bookmarkButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    padding: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});