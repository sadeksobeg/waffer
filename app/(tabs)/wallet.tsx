import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { createThemedStyles } from '@/constants/theme';
import { Wallet, Gift, ChevronRight, Clock } from 'lucide-react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import CouponCard from '@/components/customer/CouponCard';
import PointsHistoryItem from '@/components/customer/PointsHistoryItem';
import RewardCard from '@/components/customer/RewardCard';
import { mockCoupons, mockPointsHistory, mockRewards } from '@/constants/mockData';

export default function WalletScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const styles = createThemedStyles(theme);
  
  // Filter mock coupons for saved and used
  const savedCoupons = mockCoupons.slice(0, 3);
  const usedCoupons = mockCoupons.slice(3, 5);

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'coupons', title: t('savedCoupons') },
    { key: 'points', title: t('points') },
  ]);

  const CouponsRoute = () => {
    const [activeTab, setActiveTab] = useState('saved');
    
    return (
      <View style={walletStyles.tabContent}>
        <View style={walletStyles.couponsHeader}>
          <TouchableOpacity 
            style={[
              walletStyles.couponTypeButton, 
              activeTab === 'saved' && { backgroundColor: theme.colors.primary[500] }
            ]} 
            onPress={() => setActiveTab('saved')}
          >
            <Text 
              style={[
                walletStyles.couponTypeText, 
                { color: activeTab === 'saved' ? theme.colors.white : theme.colors.text }
              ]}
            >
              {t('savedCoupons')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              walletStyles.couponTypeButton, 
              activeTab === 'used' && { backgroundColor: theme.colors.primary[500] }
            ]} 
            onPress={() => setActiveTab('used')}
          >
            <Text 
              style={[
                walletStyles.couponTypeText, 
                { color: activeTab === 'used' ? theme.colors.white : theme.colors.text }
              ]}
            >
              {t('usedCoupons')}
            </Text>
          </TouchableOpacity>
        </View>
        
        {activeTab === 'saved' ? (
          savedCoupons.length > 0 ? (
            <FlatList
              data={savedCoupons}
              renderItem={({ item }) => <CouponCard coupon={item} inWallet />}
              keyExtractor={(item) => item.id}
              contentContainerStyle={walletStyles.couponsList}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.centerContainer}>
              <Text style={styles.text}>No saved coupons</Text>
            </View>
          )
        ) : (
          usedCoupons.length > 0 ? (
            <FlatList
              data={usedCoupons}
              renderItem={({ item }) => <CouponCard coupon={item} inWallet used />}
              keyExtractor={(item) => item.id}
              contentContainerStyle={walletStyles.couponsList}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.centerContainer}>
              <Text style={styles.text}>No used coupons</Text>
            </View>
          )
        )}
      </View>
    );
  };

  const PointsRoute = () => {
    const [activeTab, setActiveTab] = useState('history');
    
    return (
      <View style={walletStyles.tabContent}>
        <View style={walletStyles.pointsHeader}>
          <View style={[walletStyles.pointsCard, { backgroundColor: theme.colors.primary[50] }]}>
            <Text style={walletStyles.pointsLabel}>{t('yourPoints')}</Text>
            <Text style={walletStyles.pointsValue}>{user?.points || 0}</Text>
          </View>
        </View>
        
        <View style={walletStyles.couponsHeader}>
          <TouchableOpacity 
            style={[
              walletStyles.couponTypeButton, 
              activeTab === 'history' && { backgroundColor: theme.colors.primary[500] }
            ]} 
            onPress={() => setActiveTab('history')}
          >
            <Text 
              style={[
                walletStyles.couponTypeText, 
                { color: activeTab === 'history' ? theme.colors.white : theme.colors.text }
              ]}
            >
              {t('pointsHistory')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              walletStyles.couponTypeButton, 
              activeTab === 'rewards' && { backgroundColor: theme.colors.primary[500] }
            ]} 
            onPress={() => setActiveTab('rewards')}
          >
            <Text 
              style={[
                walletStyles.couponTypeText, 
                { color: activeTab === 'rewards' ? theme.colors.white : theme.colors.text }
              ]}
            >
              {t('rewards')}
            </Text>
          </TouchableOpacity>
        </View>
        
        {activeTab === 'history' ? (
          <FlatList
            data={mockPointsHistory}
            renderItem={({ item }) => <PointsHistoryItem item={item} />}
            keyExtractor={(item) => item.id}
            contentContainerStyle={walletStyles.pointsList}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <FlatList
            data={mockRewards}
            renderItem={({ item }) => <RewardCard reward={item} />}
            keyExtractor={(item) => item.id}
            contentContainerStyle={walletStyles.rewardsList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    );
  };

  const renderScene = SceneMap({
    coupons: CouponsRoute,
    points: PointsRoute,
  });

  return (
    <View style={styles.container}>
      <View style={walletStyles.header}>
        <Text style={styles.title}>{t('wallet')}</Text>
      </View>
      
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: 100 }}
        renderTabBar={props => (
          <TabBar
            {...props}
            style={{ backgroundColor: theme.colors.card }}
            indicatorStyle={{ backgroundColor: theme.colors.primary[500] }}
            activeColor={theme.colors.primary[500]}
            inactiveColor={theme.colors.secondaryText}
            labelStyle={{ 
              fontFamily: theme.fontFamily.medium,
              textTransform: 'none',
            }}
          />
        )}
      />
    </View>
  );
}

const walletStyles = StyleSheet.create({
  header: {
    padding: 16,
  },
  tabContent: {
    flex: 1,
  },
  couponsHeader: {
    flexDirection: 'row',
    padding: 16,
  },
  couponTypeButton: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  couponTypeText: {
    fontWeight: '500',
  },
  couponsList: {
    paddingHorizontal: 16,
  },
  pointsHeader: {
    padding: 16,
  },
  pointsCard: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  pointsLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0369a1',
    marginBottom: 8,
  },
  pointsValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0284c7',
  },
  pointsList: {
    paddingHorizontal: 16,
  },
  rewardsList: {
    padding: 16,
  },
});