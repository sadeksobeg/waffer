import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { createThemedStyles } from '@/constants/theme';
import { Clock, Bookmark, BookmarkCheck } from 'lucide-react-native';
import { formatDistance } from 'date-fns';

interface Coupon {
  id: string;
  title: string;
  discount: string;
  merchant: {
    id: string;
    name: string;
    image: string;
  };
  category: string;
  expiryDate: string;
  createdAt: string;
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
  const styles = createThemedStyles(theme);
  
  const isExpired = new Date(coupon.expiryDate) < new Date();
  const expiresIn = formatDistance(new Date(coupon.expiryDate), new Date(), { addSuffix: true });
  
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
          source={{ uri: coupon.merchant.image }} 
          style={couponCardStyles.merchantImage} 
        />
        <View style={couponCardStyles.discount}>
          <Text style={couponCardStyles.discountText}>{coupon.discount}%</Text>
        </View>
      </View>
      
      <View style={couponCardStyles.contentSection}>
        <Text style={[styles.text, couponCardStyles.merchantName]} numberOfLines={1}>
          {coupon.merchant.name}
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
        onPress={() => {}}
      >
        {inWallet ? (
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