import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { createThemedStyles } from '@/constants/theme';
import { User, Store, ChevronRight } from 'lucide-react-native';
import { format } from 'date-fns';

interface UserListItemProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    joinDate: string;
    points?: number;
    couponsRedeemed?: number;
    storeName?: string;
    couponsCreated?: number;
  };
  onPress: () => void;
}

export default function UserListItem({ user, onPress }: UserListItemProps) {
  const { theme } = useTheme();
  const styles = createThemedStyles(theme);
  
  const isCustomer = user.role === 'customer';
  const isMerchant = user.role === 'merchant';
  const formattedDate = format(new Date(user.joinDate), 'MMM d, yyyy');
  
  return (
    <TouchableOpacity 
      style={[
        userListStyles.container, 
        styles.shadow, 
        { backgroundColor: theme.colors.card }
      ]}
      onPress={onPress}
    >
      <View style={[
        userListStyles.avatarContainer, 
        { 
          backgroundColor: isCustomer 
            ? theme.colors.primary[100] 
            : theme.colors.secondary[100] 
        }
      ]}>
        {isCustomer ? (
          <User size={20} color={theme.colors.primary[700]} />
        ) : (
          <Store size={20} color={theme.colors.secondary[700]} />
        )}
      </View>
      
      <View style={userListStyles.content}>
        <Text style={[styles.text, userListStyles.name]}>{user.name}</Text>
        <Text style={styles.secondaryText}>{user.email}</Text>
        
        <View style={userListStyles.details}>
          <View style={[userListStyles.roleBadge, { 
            backgroundColor: isCustomer 
              ? theme.colors.primary[100] 
              : theme.colors.secondary[100] 
          }]}>
            <Text style={[userListStyles.roleText, { 
              color: isCustomer 
                ? theme.colors.primary[700] 
                : theme.colors.secondary[700] 
            }]}>
              {user.role}
            </Text>
          </View>
          
          <Text style={[styles.secondaryText, userListStyles.date]}>
            Joined: {formattedDate}
          </Text>
        </View>
        
        {isCustomer && user.points !== undefined && (
          <View style={userListStyles.statsRow}>
            <Text style={[styles.text, userListStyles.stats]}>
              {user.points} points
            </Text>
            {user.couponsRedeemed !== undefined && (
              <Text style={[styles.text, userListStyles.stats]}>
                {user.couponsRedeemed} coupons redeemed
              </Text>
            )}
          </View>
        )}
        
        {isMerchant && user.storeName && (
          <View style={userListStyles.statsRow}>
            <Text style={[styles.text, userListStyles.stats]}>
              Store: {user.storeName}
            </Text>
            {user.couponsCreated !== undefined && (
              <Text style={[styles.text, userListStyles.stats]}>
                {user.couponsCreated} coupons created
              </Text>
            )}
          </View>
        )}
      </View>
      
      <ChevronRight size={20} color={theme.colors.secondaryText} />
    </TouchableOpacity>
  );
}

const userListStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  name: {
    fontWeight: '600',
    marginBottom: 2,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  date: {
    marginLeft: 8,
    fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  stats: {
    fontSize: 12,
    fontWeight: '500',
    marginRight: 12,
  },
});