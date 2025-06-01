import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
  serverTimestamp,
  Timestamp,
  increment,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { db, storage } from '../config/firebase';

// Coupon interface
export interface Coupon {
  id: string;
  code: string;
  storeName: string; // Store/merchant name
  storeImage?: string; // Store/coupon image URL
  discount: {
    type: 'percentage' | 'fixed';
    value: number;
  };
  validFrom: Timestamp;
  validTo: Timestamp;
  status: 'active' | 'expired' | 'scheduled' | 'disabled';
  usageLimit: number;
  usageCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  description?: string;
  minPurchase?: number;
  maxDiscount?: number;
  applicableProducts?: string[];
  applicableCategories?: string[];
  exclusions?: string[];
}

// Coupon input interface for creating/updating coupons
export interface CouponInput {
  code: string;
  storeName: string; // Store/merchant name
  storeImage?: string; // Store/coupon image URL
  discount: {
    type: 'percentage' | 'fixed';
    value: number;
  };
  validFrom: Date;
  validTo: Date;
  status?: 'active' | 'expired' | 'scheduled' | 'disabled';
  usageLimit: number;
  description?: string;
  minPurchase?: number;
  maxDiscount?: number;
  applicableProducts?: string[];
  applicableCategories?: string[];
  exclusions?: string[];
}

// Pagination options
export interface PaginationOptions {
  pageSize: number;
  startAfter?: DocumentSnapshot;
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
}

// Filter options
export interface FilterOptions {
  status?: 'active' | 'expired' | 'scheduled' | 'disabled';
  searchTerm?: string;
  minDiscount?: number;
  maxDiscount?: number;
  validNow?: boolean;
}

/**
 * Get a coupon by ID
 * @param couponId Coupon ID
 * @returns Coupon object or null if not found
 */
export const getCouponById = async (couponId: string): Promise<Coupon | null> => {
  try {
    const couponDoc = await getDoc(doc(db, 'coupons', couponId));

    if (!couponDoc.exists()) {
      return null;
    }

    return {
      id: couponDoc.id,
      ...couponDoc.data(),
    } as Coupon;
  } catch (error) {
    console.error('Error getting coupon:', error);
    throw error;
  }
};

/**
 * Get a coupon by code
 * @param code Coupon code
 * @returns Coupon object or null if not found
 */
export const getCouponByCode = async (code: string): Promise<Coupon | null> => {
  try {
    const couponsQuery = query(
      collection(db, 'coupons'),
      where('code', '==', code),
      limit(1)
    );

    const couponSnapshot = await getDocs(couponsQuery);

    if (couponSnapshot.empty) {
      return null;
    }

    const couponDoc = couponSnapshot.docs[0];

    return {
      id: couponDoc.id,
      ...couponDoc.data(),
    } as Coupon;
  } catch (error) {
    console.error('Error getting coupon by code:', error);
    throw error;
  }
};

/**
 * Get coupons with pagination and filtering
 * @param paginationOptions Pagination options
 * @param filterOptions Filter options
 * @returns Array of coupons and the last document for pagination
 */
export const getCoupons = async (
  paginationOptions: PaginationOptions,
  filterOptions: FilterOptions = {}
): Promise<{ coupons: Coupon[]; lastDoc: DocumentSnapshot | null }> => {
  try {
    const { pageSize = 10, startAfter, orderByField = 'createdAt', orderDirection = 'desc' } = paginationOptions;
    const { status, searchTerm, minDiscount, maxDiscount, validNow } = filterOptions;

    let couponsQuery = collection(db, 'coupons');
    let constraints: any[] = [];

    // Add filters
    if (status) {
      constraints.push(where('status', '==', status));
    }

    // Filter for valid coupons (current date is between validFrom and validTo)
    if (validNow) {
      const now = new Date();
      constraints.push(where('validFrom', '<=', now));
      constraints.push(where('validTo', '>=', now));
    }

    // Add ordering
    constraints.push(orderBy(orderByField, orderDirection));

    // Add pagination
    if (startAfter) {
      constraints.push(startAfter(startAfter));
    }

    constraints.push(limit(pageSize));

    // Execute query
    const couponsSnapshot = await getDocs(query(couponsQuery, ...constraints));

    // Apply client-side filtering
    let coupons = couponsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Coupon[];

    // Filter by search term if provided
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      coupons = coupons.filter(coupon =>
        coupon.code.toLowerCase().includes(term) ||
        coupon.storeName.toLowerCase().includes(term) ||
        (coupon.description && coupon.description.toLowerCase().includes(term))
      );
    }

    // Filter by discount range
    if (minDiscount !== undefined) {
      coupons = coupons.filter(coupon =>
        coupon.discount.type === 'percentage'
          ? coupon.discount.value >= minDiscount
          : coupon.discount.value >= minDiscount
      );
    }

    if (maxDiscount !== undefined) {
      coupons = coupons.filter(coupon =>
        coupon.discount.type === 'percentage'
          ? coupon.discount.value <= maxDiscount
          : coupon.discount.value <= maxDiscount
      );
    }

    const lastDoc = couponsSnapshot.docs.length > 0
      ? couponsSnapshot.docs[couponsSnapshot.docs.length - 1]
      : null;

    return { coupons, lastDoc };
  } catch (error) {
    console.error('Error getting coupons:', error);
    throw error;
  }
};

/**
 * Create a new coupon
 * @param couponData Coupon data
 * @param createdBy User ID of the creator
 * @returns Created coupon
 */
export const createCoupon = async (couponData: CouponInput, createdBy: string): Promise<Coupon> => {
  try {
    // Check if coupon code already exists
    const existingCoupon = await getCouponByCode(couponData.code);
    if (existingCoupon) {
      throw new Error(`Coupon with code ${couponData.code} already exists`);
    }

    const timestamp = serverTimestamp();
    const newCoupon = {
      ...couponData,
      validFrom: Timestamp.fromDate(couponData.validFrom),
      validTo: Timestamp.fromDate(couponData.validTo),
      status: couponData.status || 'active',
      usageCount: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy,
    };

    const couponRef = doc(collection(db, 'coupons'));
    await setDoc(couponRef, newCoupon);

    return {
      id: couponRef.id,
      ...newCoupon,
    } as Coupon;
  } catch (error) {
    console.error('Error creating coupon:', error);
    throw error;
  }
};

/**
 * Update a coupon
 * @param couponId Coupon ID
 * @param couponData Coupon data to update
 * @returns Updated coupon
 */
export const updateCoupon = async (couponId: string, couponData: Partial<CouponInput>): Promise<Coupon> => {
  try {
    const couponRef = doc(db, 'coupons', couponId);
    const couponDoc = await getDoc(couponRef);

    if (!couponDoc.exists()) {
      throw new Error(`Coupon with ID ${couponId} not found`);
    }

    // If code is being updated, check if it already exists
    if (couponData.code && couponData.code !== couponDoc.data().code) {
      const existingCoupon = await getCouponByCode(couponData.code);
      if (existingCoupon) {
        throw new Error(`Coupon with code ${couponData.code} already exists`);
      }
    }

    const updatedData: any = {
      ...couponData,
      updatedAt: serverTimestamp(),
    };

    // Convert Date objects to Firestore Timestamps
    if (couponData.validFrom) {
      updatedData.validFrom = Timestamp.fromDate(couponData.validFrom);
    }

    if (couponData.validTo) {
      updatedData.validTo = Timestamp.fromDate(couponData.validTo);
    }

    await updateDoc(couponRef, updatedData);

    // Get the updated coupon
    const updatedCouponDoc = await getDoc(couponRef);

    return {
      id: updatedCouponDoc.id,
      ...updatedCouponDoc.data(),
    } as Coupon;
  } catch (error) {
    console.error('Error updating coupon:', error);
    throw error;
  }
};

/**
 * Delete a coupon
 * @param couponId Coupon ID
 */
export const deleteCoupon = async (couponId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'coupons', couponId));
  } catch (error) {
    console.error('Error deleting coupon:', error);
    throw error;
  }
};

/**
 * Increment coupon usage count
 * @param couponId Coupon ID
 * @returns Updated usage count
 */
export const incrementCouponUsage = async (couponId: string): Promise<number> => {
  try {
    const couponRef = doc(db, 'coupons', couponId);

    await updateDoc(couponRef, {
      usageCount: increment(1),
      updatedAt: serverTimestamp(),
    });

    const updatedCoupon = await getDoc(couponRef);
    return updatedCoupon.data()?.usageCount || 0;
  } catch (error) {
    console.error('Error incrementing coupon usage:', error);
    throw error;
  }
};

/**
 * Upload coupon image to Firebase Storage
 * @param couponId Coupon ID
 * @param file Image file
 * @returns Image URL
 */
export const uploadCouponImage = async (couponId: string, file: File): Promise<string> => {
  try {
    // Create a reference to the storage location
    const imageRef = ref(storage, `coupons/${couponId}/${file.name}`);

    // Upload the file
    await uploadBytes(imageRef, file);

    // Get the download URL
    const imageUrl = await getDownloadURL(imageRef);

    // Update the coupon document with the image URL
    const couponRef = doc(db, 'coupons', couponId);
    await updateDoc(couponRef, {
      storeImage: imageUrl,
      updatedAt: serverTimestamp(),
    });

    return imageUrl;
  } catch (error) {
    console.error('Error uploading coupon image:', error);
    throw error;
  }
};

/**
 * Delete coupon image from Firebase Storage
 * @param couponId Coupon ID
 * @param imageUrl Image URL to delete
 */
export const deleteCouponImage = async (couponId: string, imageUrl: string): Promise<void> => {
  try {
    // Extract the file path from the URL
    const imageRef = ref(storage, imageUrl);

    // Delete the file
    await deleteObject(imageRef);

    // Update the coupon document to remove the image URL
    const couponRef = doc(db, 'coupons', couponId);
    await updateDoc(couponRef, {
      storeImage: null,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error deleting coupon image:', error);
    throw error;
  }
};
