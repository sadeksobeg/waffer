import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { createThemedStyles } from '@/constants/theme';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react-native';
import { format } from 'date-fns';

interface PointsHistoryItemProps {
  item: {
    id: string;
    amount: number;
    type: 'earned' | 'spent';
    description: string;
    date: string;
    merchant?: {
      id: string;
      name: string;
      image: string;
    } | null;
  };
}

export default function PointsHistoryItem({ item }: PointsHistoryItemProps) {
  const { theme } = useTheme();
  const styles = createThemedStyles(theme);
  
  const isEarned = item.type === 'earned';
  const formattedDate = format(new Date(item.date), 'MMM d, yyyy');
  
  return (
    <View style={[pointsItemStyles.container, { borderBottomColor: theme.colors.border }]}>
      {item.merchant ? (
        <Image source={{ uri: item.merchant.image }} style={pointsItemStyles.merchantImage} />
      ) : (
        <View 
          style={[
            pointsItemStyles.iconContainer, 
            { 
              backgroundColor: isEarned 
                ? theme.colors.success[100] 
                : theme.colors.secondary[100] 
            }
          ]}
        >
          {isEarned ? (
            <ArrowUpRight 
              size={16} 
              color={theme.colors.success[600]} 
            />
          ) : (
            <ArrowDownRight 
              size={16} 
              color={theme.colors.secondary[600]} 
            />
          )}
        </View>
      )}
      
      <View style={pointsItemStyles.contentContainer}>
        <Text style={styles.text}>{item.description}</Text>
        <Text style={styles.secondaryText}>{formattedDate}</Text>
      </View>
      
      <Text 
        style={[
          styles.text, 
          pointsItemStyles.amount, 
          { 
            color: isEarned 
              ? theme.colors.success[600] 
              : theme.colors.error[600] 
          }
        ]}
      >
        {isEarned ? '+' : '-'}{item.amount}
      </Text>
    </View>
  );
}

const pointsItemStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  merchantImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    marginLeft: 12,
  },
  amount: {
    fontWeight: 'bold',
  },
});