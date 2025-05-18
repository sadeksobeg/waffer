import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { createThemedStyles } from '@/constants/theme';
import { TrendingUp, TrendingDown } from 'lucide-react-native';

interface AdminStatsCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  onPress?: () => void;
}

export default function AdminStatsCard({ 
  icon, 
  title, 
  value, 
  change, 
  isPositive = true, 
  onPress 
}: AdminStatsCardProps) {
  const { theme } = useTheme();
  const styles = createThemedStyles(theme);
  
  return (
    <TouchableOpacity 
      style={[
        statsCardStyles.container, 
        styles.shadow, 
        { backgroundColor: theme.colors.card }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={statsCardStyles.topRow}>
        <View style={statsCardStyles.iconContainer}>
          {icon}
        </View>
        
        {change && (
          <View style={[
            statsCardStyles.changeContainer,
            { 
              backgroundColor: isPositive 
                ? theme.colors.success[100] 
                : theme.colors.error[100] 
            }
          ]}>
            {isPositive ? (
              <TrendingUp size={14} color={theme.colors.success[700]} />
            ) : (
              <TrendingDown size={14} color={theme.colors.error[700]} />
            )}
            <Text 
              style={[
                statsCardStyles.changeText,
                { 
                  color: isPositive 
                    ? theme.colors.success[700] 
                    : theme.colors.error[700] 
                }
              ]}
            >
              {change}
            </Text>
          </View>
        )}
      </View>
      
      <Text style={[styles.title, statsCardStyles.value]}>{value}</Text>
      <Text style={[styles.secondaryText, statsCardStyles.title]}>{title}</Text>
    </TouchableOpacity>
  );
}

const statsCardStyles = StyleSheet.create({
  container: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    borderRadius: 8,
    padding: 8,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  value: {
    fontSize: 28,
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
  },
});