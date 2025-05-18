import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { createThemedStyles } from '@/constants/theme';
import { Edit, Trash, Clock } from 'lucide-react-native';
import { formatDistance } from 'date-fns';

interface CouponListItemProps {
  coupon: {
    id: string;
    title: string;
    discount: string;
    expiryDate: string;
  };
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function CouponListItem({ coupon, onPress, onEdit, onDelete }: CouponListItemProps) {
  const { theme } = useTheme();
  const styles = createThemedStyles(theme);
  
  const isExpired = new Date(coupon.expiryDate) < new Date();
  const expiresIn = formatDistance(new Date(coupon.expiryDate), new Date(), { addSuffix: true });
  
  return (
    <TouchableOpacity 
      style={[
        couponListStyles.container, 
        styles.shadow, 
        { 
          backgroundColor: theme.colors.card,
          opacity: isExpired ? 0.7 : 1
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={couponListStyles.content}>
        <View style={couponListStyles.mainInfo}>
          <Text style={[styles.subtitle, couponListStyles.title]} numberOfLines={1}>
            {coupon.title}
          </Text>
          
          <View style={couponListStyles.expiryContainer}>
            <Clock size={14} color={isExpired ? theme.colors.error[500] : theme.colors.secondaryText} />
            <Text 
              style={[
                styles.secondaryText, 
                couponListStyles.expiryText,
                { color: isExpired ? theme.colors.error[500] : theme.colors.secondaryText }
              ]}
            >
              {isExpired ? 'Expired' : expiresIn}
            </Text>
          </View>
        </View>
        
        <View style={couponListStyles.rightSection}>
          <View style={[couponListStyles.discount, { backgroundColor: theme.colors.primary[500] }]}>
            <Text style={couponListStyles.discountText}>{coupon.discount}%</Text>
          </View>
          
          {onEdit && onDelete && (
            <View style={couponListStyles.actions}>
              <TouchableOpacity 
                style={couponListStyles.actionButton} 
                onPress={onEdit}
              >
                <Edit size={16} color={theme.colors.primary[600]} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={couponListStyles.actionButton} 
                onPress={onDelete}
              >
                <Trash size={16} color={theme.colors.error[600]} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const couponListStyles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mainInfo: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    marginBottom: 4,
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiryText: {
    fontSize: 12,
    marginLeft: 4,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  discount: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  discountText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
  },
});