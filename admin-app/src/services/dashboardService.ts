import { db } from '@/config/firebase';
import {
  collection,
  query,
  getDocs,
  getDoc,
  doc,
  where,
  orderBy,
  limit,
  Timestamp,
  getCountFromServer
} from 'firebase/firestore';
import { subDays, startOfDay, endOfDay } from 'date-fns';

export interface DashboardStats {
  totalUsers: number;
  newUsers: number;
  totalMerchants: number;
  totalCoupons: number;
  activeCoupons: number;
  totalRedemptions: number;
  todayRedemptions: number;
}

export interface RecentCoupon {
  id: string;
  title: string;
  merchantName: string;
  discountValue: number;
  discountType: string;
  redemptionCount: number;
  expiryDate: Date;
  isActive: boolean;
}

export interface RedemptionChartData {
  date: string;
  redemptions: number;
}

const dashboardService = {
  /**
   * Get dashboard statistics
   */
  getStats: async (): Promise<DashboardStats> => {
    try {
      // Get total users count
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getCountFromServer(usersQuery);
      const totalUsers = usersSnapshot.data().count;

      // Get new users count (last 7 days)
      const sevenDaysAgo = startOfDay(subDays(new Date(), 7));
      const newUsersQuery = query(
        collection(db, 'users'),
        where('createdAt', '>=', Timestamp.fromDate(sevenDaysAgo))
      );
      const newUsersSnapshot = await getCountFromServer(newUsersQuery);
      const newUsers = newUsersSnapshot.data().count;

      // Get merchants count
      const merchantsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'merchant')
      );
      const merchantsSnapshot = await getCountFromServer(merchantsQuery);
      const totalMerchants = merchantsSnapshot.data().count;

      // Get total coupons count
      const couponsQuery = query(collection(db, 'coupons'));
      const couponsSnapshot = await getCountFromServer(couponsQuery);
      const totalCoupons = couponsSnapshot.data().count;

      // Get active coupons count
      const now = new Date();
      const activeCouponsQuery = query(
        collection(db, 'coupons'),
        where('isActive', '==', true),
        where('endDate', '>=', Timestamp.fromDate(now))
      );
      const activeCouponsSnapshot = await getCountFromServer(activeCouponsQuery);
      const activeCoupons = activeCouponsSnapshot.data().count;

      // Get total redemptions count
      const redemptionsQuery = query(collection(db, 'redemptions'));
      const redemptionsSnapshot = await getCountFromServer(redemptionsQuery);
      const totalRedemptions = redemptionsSnapshot.data().count;

      // Get today's redemptions count
      const todayStart = startOfDay(new Date());
      const todayEnd = endOfDay(new Date());
      const todayRedemptionsQuery = query(
        collection(db, 'redemptions'),
        where('redeemedAt', '>=', Timestamp.fromDate(todayStart)),
        where('redeemedAt', '<=', Timestamp.fromDate(todayEnd))
      );
      const todayRedemptionsSnapshot = await getCountFromServer(todayRedemptionsQuery);
      const todayRedemptions = todayRedemptionsSnapshot.data().count;

      return {
        totalUsers,
        newUsers,
        totalMerchants,
        totalCoupons,
        activeCoupons,
        totalRedemptions,
        todayRedemptions
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  /**
   * Get recent coupons
   */
  getRecentCoupons: async (limitCount: number = 5): Promise<RecentCoupon[]> => {
    try {
      const couponsQuery = query(
        collection(db, 'coupons'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const couponsSnapshot = await getDocs(couponsQuery);
      const coupons: RecentCoupon[] = [];

      for (const docSnapshot of couponsSnapshot.docs) {
        const couponData = docSnapshot.data();

        // Get merchant name
        let merchantName = 'Unknown';
        if (couponData.merchantId) {
          const merchantDoc = await getDoc(doc(db, 'users', couponData.merchantId));
          if (merchantDoc.exists()) {
            const merchantData = merchantDoc.data();
            merchantName = `${merchantData.firstName} ${merchantData.lastName}`;
          }
        }

        // Get redemption count
        const redemptionsQuery = query(
          collection(db, 'redemptions'),
          where('couponId', '==', docSnapshot.id)
        );
        const redemptionsSnapshot = await getCountFromServer(redemptionsQuery);
        const redemptionCount = redemptionsSnapshot.data().count;

        coupons.push({
          id: docSnapshot.id,
          title: couponData.title,
          merchantName,
          discountValue: couponData.discountValue,
          discountType: couponData.discountType,
          redemptionCount,
          expiryDate: couponData.endDate.toDate(),
          isActive: couponData.isActive
        });
      }

      return coupons;
    } catch (error) {
      console.error('Error fetching recent coupons:', error);
      throw error;
    }
  },

  /**
   * Get redemption chart data for the last 30 days
   */
  getRedemptionChartData: async (): Promise<RedemptionChartData[]> => {
    try {
      const thirtyDaysAgo = startOfDay(subDays(new Date(), 30));
      const redemptionsQuery = query(
        collection(db, 'redemptions'),
        where('redeemedAt', '>=', Timestamp.fromDate(thirtyDaysAgo)),
        orderBy('redeemedAt', 'asc')
      );

      const redemptionsSnapshot = await getDocs(redemptionsQuery);

      // Group redemptions by date
      const redemptionsByDate: Record<string, number> = {};

      redemptionsSnapshot.docs.forEach(docSnapshot => {
        const redemptionData = docSnapshot.data();
        const date = redemptionData.redeemedAt.toDate();
        const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD

        if (redemptionsByDate[dateString]) {
          redemptionsByDate[dateString]++;
        } else {
          redemptionsByDate[dateString] = 1;
        }
      });

      // Fill in missing dates
      const chartData: RedemptionChartData[] = [];
      const today = new Date();

      for (let i = 0; i < 30; i++) {
        const date = subDays(today, 29 - i);
        const dateString = date.toISOString().split('T')[0];

        chartData.push({
          date: dateString,
          redemptions: redemptionsByDate[dateString] || 0
        });
      }

      return chartData;
    } catch (error) {
      console.error('Error fetching redemption chart data:', error);
      throw error;
    }
  }
};

export default dashboardService;
