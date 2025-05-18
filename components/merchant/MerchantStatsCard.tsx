import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { createThemedStyles } from '@/constants/theme';

interface MerchantStatsCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  onPress?: () => void;
}

export default function MerchantStatsCard({ icon, title, value, onPress }: MerchantStatsCardProps) {
  const { theme } = useTheme();
  const styles = createThemedStyles(theme);
  
  return (
    <TouchableOpacity 
      style={[
        statsCardStyles.container, 
        styles.shadow, 
        { 
          backgroundColor: theme.colors.card,
          borderRadius: theme.borderRadius.md
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={statsCardStyles.iconContainer}>
        {icon}
      </View>
      
      <Text style={[styles.text, statsCardStyles.title]}>{title}</Text>
      <Text style={[styles.title, statsCardStyles.value]}>{value}</Text>
    </TouchableOpacity>
  );
}

const statsCardStyles = StyleSheet.create({
  container: {
    width: '48%',
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'center',
  },
  value: {
    fontSize: 20,
    marginBottom: 0,
    fontWeight: 'bold',
  },
});