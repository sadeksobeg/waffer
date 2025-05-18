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
  description: string;
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
  
  const isExpired = new Date(coupon.expiryDate) < new Date();
  const expiresIn = formatDistance(new Date(coupon.expiryDate), new Date(), { addSuffix: true });
  
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
          source={{ uri: coupon.merchant.image }} 
          style={couponCardStyles.merchantImage} 
        />
        
        <View style={couponCardStyles.contentSection}>
          <Text style={[styles.text, couponCardStyles.merchantName]}>
            {coupon.merchant.name}
          </Text>
          <Text style={[styles.subtitle, couponCardStyles.title]} numberOfLines={1}>
            {coupon.title}
          </Text>
          <Text style={[styles.secondaryText, couponCardStyles.description]} numberOfLines={2}>
            {coupon.description}
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
                {coupon.category}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={couponCardStyles.rightSide}>
          <View style={[couponCardStyles.discount, { backgroundColor: theme.colors.primary[500] }]}>
            <Text style={couponCardStyles.discountText}>{coupon.discount}%</Text>
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