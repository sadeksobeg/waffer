// Import Firebase services dynamically to avoid initialization conflicts
let firestore: any;
try {
  const firebaseConfig = require('../config/firebase');
  firestore = firebaseConfig.firestore;
} catch (error) {
  console.warn('Could not load Firebase config:', error);
}

// Collection references
const COUPONS_COLLECTION = 'coupons';
const REDEMPTIONS_COLLECTION = 'redemptions';

// Coupon status
export type CouponStatus = 'active' | 'expired' | 'used' | 'inactive';

// Coupon type
export type CouponType = 'percentage' | 'fixed' | 'freeItem';

// Coupon interface
export interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  type: CouponType;
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  startDate: any;
  endDate: any;
  storeId: string;
  storeName: string;
  storeImage?: string;
  status: CouponStatus;
  usageLimit: number;
  usageCount: number;
  createdBy: string;
  createdAt: any;
  updatedAt: any;
  imageUrl?: string;
  terms?: string;
  categories?: string[];
}

// Redemption interface
export interface Redemption {
  id: string;
  couponId: string;
  userId: string;
  storeId: string;
  redeemedAt: any;
  amount: number;
  transactionId?: string;
}

/**
 * Get all coupons with pagination
 */
export const getCoupons = async (
  lastDoc: any = null,
  pageSize: number = 20,
  filters: { status?: CouponStatus; storeId?: string; } = {}
): Promise<{ coupons: Coupon[]; lastDoc: any }> => {
  try {
    let query = firestore().collection(COUPONS_COLLECTION).orderBy('createdAt', 'desc').limit(pageSize);

    if (filters.status) {
      query = query.where('status', '==', filters.status);
    }

    if (filters.storeId) {
      query = query.where('storeId', '==', filters.storeId);
    }

    // Add pagination
    if (lastDoc) {
      query = query.startAfter(lastDoc);
    }

    const querySnapshot = await query.get();

    const coupons: Coupon[] = [];
    let lastVisible = null;

    querySnapshot.forEach((doc: any) => {
      const data = doc.data();
      if (data) {
        // Map Firebase data structure to expected format
        const coupon = {
          id: doc.id,
          code: data.code || 'COUPON',
          // Map missing fields for UI compatibility
          storeName: data.storeName || data.merchant?.name || 'Unknown Store',
          storeImage: data.storeImage || data.merchant?.image || data.imageUrl || '',
          title: data.title || data.description || data.code || 'Special Offer',
          description: data.description || data.title || 'Great savings await!',
          // Handle different date field names
          startDate: data.startDate || data.validFrom,
          endDate: data.endDate || data.validTo,
          // Handle different value structures - ensure they're primitive values
          value: data.discount?.value || data.value || 0,
          type: data.discount?.type || data.type || 'fixed',
          // Ensure all required fields are present
          status: data.status || 'active',
          usageLimit: data.usageLimit || 0,
          usageCount: data.usageCount || 0,
          createdBy: data.createdBy || '',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          minPurchase: data.minPurchase || 0,
          maxDiscount: data.maxDiscount || 0,
          imageUrl: data.imageUrl || '',
          terms: data.terms || '',
          categories: data.categories || data.applicableCategories || [],
        } as Coupon;

        coupons.push(coupon);
        lastVisible = doc;
      }
    });

    // Debug: Log the first coupon structure to understand the data format
    if (coupons.length > 0) {
      console.log('🔍 First coupon structure:', JSON.stringify(coupons[0], null, 2));
    }

    return { coupons, lastDoc: lastVisible };
  } catch (error) {
    console.error('Error getting coupons:', error);
    throw error;
  }
};

/**
 * Get coupon by ID
 */
export const getCouponById = async (couponId: string): Promise<Coupon | null> => {
  try {
    const couponDoc = await firestore().collection(COUPONS_COLLECTION).doc(couponId).get();

    const data = couponDoc.data();
    if (data) {
      // Map Firebase data structure to expected format
      return {
        id: couponDoc.id,
        ...data,
        // Map missing fields for UI compatibility
        storeName: data.storeName || data.merchant?.name || 'Store',
        storeImage: data.storeImage || data.merchant?.image || data.imageUrl || '',
        title: data.title || data.description || 'Special Offer',
        description: data.description || data.title || 'Great savings await!',
        // Handle different date field names
        startDate: data.startDate || data.validFrom,
        endDate: data.endDate || data.validTo,
        // Handle different value structures
        value: data.value || data.discount?.value || 0,
        type: data.type || data.discount?.type || 'fixed',
      } as Coupon;
    }

    return null;
  } catch (error) {
    console.error('Error getting coupon:', error);
    throw error;
  }
};

/**
 * Get coupon by code
 */
export const getCouponByCode = async (code: string): Promise<Coupon | null> => {
  try {
    const querySnapshot = await firestore()
      .collection(COUPONS_COLLECTION)
      .where('code', '==', code.toUpperCase())
      .limit(1)
      .get();

    if (!querySnapshot.empty) {
      const couponDoc = querySnapshot.docs[0];
      const data = couponDoc.data();
      if (data) {
        // Map Firebase data structure to expected format
        return {
          id: couponDoc.id,
          code: data.code || 'COUPON',
          // Map missing fields for UI compatibility
          storeName: data.storeName || data.merchant?.name || 'Unknown Store',
          storeImage: data.storeImage || data.merchant?.image || data.imageUrl || '',
          title: data.title || data.description || data.code || 'Special Offer',
          description: data.description || data.title || 'Great savings await!',
          // Handle different date field names
          startDate: data.startDate || data.validFrom,
          endDate: data.endDate || data.validTo,
          // Handle different value structures - ensure they're primitive values
          value: data.discount?.value || data.value || 0,
          type: data.discount?.type || data.type || 'fixed',
          // Ensure all required fields are present
          status: data.status || 'active',
          usageLimit: data.usageLimit || 0,
          usageCount: data.usageCount || 0,
          createdBy: data.createdBy || '',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          minPurchase: data.minPurchase || 0,
          maxDiscount: data.maxDiscount || 0,
          imageUrl: data.imageUrl || '',
          terms: data.terms || '',
          categories: data.categories || data.applicableCategories || [],
        } as Coupon;
      }
      return null;
    }

    return null;
  } catch (error) {
    console.error('Error getting coupon by code:', error);
    throw error;
  }
};

/**
 * Create a new coupon
 */
export const createCoupon = async (couponData: Omit<Coupon, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    // Check if code already exists
    const existingCoupon = await getCouponByCode(couponData.code);

    if (existingCoupon) {
      throw new Error('Coupon code already exists');
    }

    // Create new coupon with a random ID
    const couponId = Math.random().toString(36).substring(2, 15);

    await firestore().collection(COUPONS_COLLECTION).doc(couponId).set({
      ...couponData,
      code: couponData.code.toUpperCase(),
      usageCount: 0,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp()
    });

    return couponId;
  } catch (error) {
    console.error('Error creating coupon:', error);
    throw error;
  }
};

/**
 * Update an existing coupon
 */
export const updateCoupon = async (couponId: string, couponData: Partial<Coupon>): Promise<void> => {
  try {
    // If code is being updated, check if it already exists
    if (couponData.code) {
      const existingCoupon = await getCouponByCode(couponData.code);

      if (existingCoupon && existingCoupon.id !== couponId) {
        throw new Error('Coupon code already exists');
      }

      couponData.code = couponData.code.toUpperCase();
    }

    await firestore().collection(COUPONS_COLLECTION).doc(couponId).update({
      ...couponData,
      updatedAt: firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating coupon:', error);
    throw error;
  }
};

/**
 * Delete a coupon
 */
export const deleteCoupon = async (couponId: string): Promise<void> => {
  try {
    await firestore().collection(COUPONS_COLLECTION).doc(couponId).delete();
  } catch (error) {
    console.error('Error deleting coupon:', error);
    throw error;
  }
};

/**
 * Redeem a coupon
 */
export const redeemCoupon = async (
  couponId: string,
  userId: string,
  amount: number,
  transactionId?: string
): Promise<Redemption> => {
  try {
    // Get coupon
    const couponDoc = await firestore().collection(COUPONS_COLLECTION).doc(couponId).get();

    const couponData = couponDoc.data();
    if (!couponData) {
      throw new Error('Coupon not found');
    }

    // Check if coupon is active
    if (couponData.status !== 'active') {
      throw new Error('Coupon is not active');
    }

    // Check if coupon is expired
    const now = new Date();
    const startDate = couponData.startDate?.toDate?.() || new Date(couponData.startDate);
    const endDate = couponData.endDate?.toDate?.() || new Date(couponData.endDate);

    if (now < startDate || now > endDate) {
      // Update coupon status to expired
      await firestore().collection(COUPONS_COLLECTION).doc(couponId).update({
        status: 'expired',
        updatedAt: firestore.FieldValue.serverTimestamp()
      });

      throw new Error('Coupon has expired');
    }

    // Check if coupon has reached usage limit
    if (couponData.usageLimit > 0 && couponData.usageCount >= couponData.usageLimit) {
      // Update coupon status to used
      await firestore().collection(COUPONS_COLLECTION).doc(couponId).update({
        status: 'used',
        updatedAt: firestore.FieldValue.serverTimestamp()
      });

      throw new Error('Coupon has reached its usage limit');
    }

    // Create redemption record
    const redemptionData: Omit<Redemption, 'id'> = {
      couponId,
      userId,
      storeId: couponData.storeId,
      redeemedAt: firestore.FieldValue.serverTimestamp(),
      amount,
      transactionId
    };

    // Create a new redemption with a random ID
    const redemptionId = Math.random().toString(36).substring(2, 15);
    await firestore().collection(REDEMPTIONS_COLLECTION).doc(redemptionId).set(redemptionData);

    // Update coupon usage count
    await firestore().collection(COUPONS_COLLECTION).doc(couponId).update({
      usageCount: (couponData.usageCount || 0) + 1,
      updatedAt: firestore.FieldValue.serverTimestamp()
    });

    // If this was the last available use, update status
    if (couponData.usageLimit > 0 && couponData.usageCount + 1 >= couponData.usageLimit) {
      await firestore().collection(COUPONS_COLLECTION).doc(couponId).update({
        status: 'used',
        updatedAt: firestore.FieldValue.serverTimestamp()
      });
    }

    return {
      id: redemptionId,
      ...redemptionData
    };
  } catch (error) {
    console.error('Error redeeming coupon:', error);
    throw error;
  }
};

// Save/Unsave coupon functionality
export const saveCoupon = async (userId: string, couponId: string): Promise<void> => {
  try {
    const userRef = firestore().collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      const savedCoupons = userData?.savedCoupons || [];

      if (!savedCoupons.includes(couponId)) {
        await userRef.update({
          savedCoupons: [...savedCoupons, couponId]
        });
        console.log('✅ Coupon saved successfully');
      }
    } else {
      // Create user document if it doesn't exist
      await userRef.set({
        savedCoupons: [couponId],
        createdAt: new Date()
      });
      console.log('✅ User created and coupon saved');
    }
  } catch (error) {
    console.error('❌ Error saving coupon:', error);
    throw error;
  }
};

export const unsaveCoupon = async (userId: string, couponId: string): Promise<void> => {
  try {
    const userRef = firestore().collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      const savedCoupons = userData?.savedCoupons || [];

      const updatedSavedCoupons = savedCoupons.filter((id: string) => id !== couponId);
      await userRef.update({
        savedCoupons: updatedSavedCoupons
      });
      console.log('✅ Coupon unsaved successfully');
    }
  } catch (error) {
    console.error('❌ Error unsaving coupon:', error);
    throw error;
  }
};

export const getSavedCoupons = async (userId: string): Promise<Coupon[]> => {
  try {
    const userRef = firestore().collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      const savedCouponIds = userData?.savedCoupons || [];

      if (savedCouponIds.length === 0) {
        return [];
      }

      // Get all saved coupons
      const savedCoupons: Coupon[] = [];
      for (const couponId of savedCouponIds) {
        const coupon = await getCouponById(couponId);
        if (coupon) {
          savedCoupons.push(coupon);
        }
      }

      return savedCoupons;
    }

    return [];
  } catch (error) {
    console.error('❌ Error getting saved coupons:', error);
    return [];
  }
};

export const isCouponSaved = async (userId: string, couponId: string): Promise<boolean> => {
  try {
    const userRef = firestore().collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      const savedCoupons = userData?.savedCoupons || [];
      return savedCoupons.includes(couponId);
    }

    return false;
  } catch (error) {
    console.error('❌ Error checking if coupon is saved:', error);
    return false;
  }
};

// Export a React component as default for Expo Router
export default function CouponService() {
  return null;
}