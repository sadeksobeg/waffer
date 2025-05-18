import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { createThemedStyles } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

interface RewardCardProps {
  reward: {
    id: string;
    title: string;
    points: number;
    description: string;
    image: string;
  };
  onRedeem?: () => void;
}

export default function RewardCard({ reward, onRedeem }: RewardCardProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const styles = createThemedStyles(theme);
  
  const hasEnoughPoints = user?.points && user.points >= reward.points;
  
  return (
    <View 
      style={[
        rewardCardStyles.container, 
        styles.shadow, 
        { backgroundColor: theme.colors.card }
      ]}
    >
      <Image 
        source={{ uri: reward.image }} 
        style={rewardCardStyles.image} 
      />
      
      <View style={rewardCardStyles.content}>
        <Text style={[styles.subtitle, rewardCardStyles.title]}>{reward.title}</Text>
        <Text style={styles.secondaryText}>{reward.description}</Text>
        
        <View style={rewardCardStyles.footer}>
          <View style={[rewardCardStyles.pointsBadge, { backgroundColor: theme.colors.primary[50] }]}>
            <Text style={[rewardCardStyles.pointsText, { color: theme.colors.primary[700] }]}>
              {reward.points} {t('points')}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[
              styles.button, 
              rewardCardStyles.redeemButton, 
              { 
                backgroundColor: hasEnoughPoints 
                  ? theme.colors.primary[500] 
                  : theme.colors.neutral[300],
              }
            ]} 
            onPress={onRedeem}
            disabled={!hasEnoughPoints}
          >
            <Text 
              style={[
                styles.buttonText, 
                { 
                  color: hasEnoughPoints 
                    ? theme.colors.white 
                    : theme.colors.neutral[600]
                }
              ]}
            >
              {t('redeemPoints')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const rewardCardStyles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 150,
  },
  content: {
    padding: 16,
  },
  title: {
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  pointsBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pointsText: {
    fontWeight: '600',
    fontSize: 14,
  },
  redeemButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
});