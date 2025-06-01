import { api } from './apiClient';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
  getCountFromServer,
  addDoc
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { db, storage } from '@/config/firebase';
import { User } from './userService';

export interface Merchant {
  id: string;
  firstName: string;
  lastName: string;
  storeName: string;
  email: string;
  avatar?: string;
}

export interface Coupon {
  id: string;
  title: string;
  description: string;
  code: string;
  discountValue: number;
  discountType: 'percentage' | 'fixed';
  merchantId: string;
  merchantName: string;
  category: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt?: Date;
  isActive: boolean;
  usageLimit: number;
  usedCount: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  termsAndConditions?: string;
  imageUrl?: string;
}

export interface CouponFormData {
  title: string;
  description: string;
  code: string;
  discountValue: number;
  discountType: 'percentage' | 'fixed';
  merchantId: string;
  category: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  usageLimit: number;
  usedCount?: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  termsAndConditions?: string;
  imageUrl?: string;
}

export interface CouponFilters {
  search?: string;
  isActive?: boolean;
  merchantId?: string[];
  categories?: string[];
  dateRange?: {
    start: Date | null;
    end: Date | null;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  lastDoc?: QueryDocumentSnapshot<DocumentData> | null;
}

export interface Category {
  id: string;
  name: string;
}

// Helper function to convert Firestore document to Coupon
const convertDocToCoupon = (doc: DocumentData): Coupon => {
  const data = doc.data();
  return {
    id: doc.id,
    title: data.title || '',
    description: data.description || '',
    code: data.code || '',
    discountValue: data.discountValue || 0,
    discountType: data.discountType || 'percentage',
    merchantId: data.merchantId || '',
    merchantName: data.merchantName || '',
    category: data.category || '',
    startDate: data.startDate?.toDate() || new Date(),
    endDate: data.endDate?.toDate() || new Date(),
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate(),
    isActive: data.isActive !== undefined ? data.isActive : true,
    usageLimit: data.usageLimit || 0,
    usedCount: data.usedCount || 0,
    minPurchaseAmount: data.minPurchaseAmount,
    maxDiscountAmount: data.maxDiscountAmount,
    termsAndConditions: data.termsAndConditions || '',
    imageUrl: data.imageUrl || '',
  };
};

const couponService = {
  /**
   * Get all coupons with pagination and filtering
   */
  getCoupons: async (
    page: number = 1,
    pageSize: number = 10,
    filters?: CouponFilters,
    lastDoc?: QueryDocumentSnapshot<DocumentData>
  ): Promise<PaginatedResponse<Coupon>> => {
    try {
      // Build the query
      let couponsQuery = query(collection(db, 'coupons'));

      // Apply filters
      if (filters?.isActive !== undefined) {
        couponsQuery = query(couponsQuery, where('isActive', '==', filters.isActive));
      }

      if (filters?.merchantId && filters.merchantId.length > 0) {
        if (filters.merchantId.length === 1) {
          couponsQuery = query(couponsQuery, where('merchantId', '==', filters.merchantId[0]));
        } else {
          couponsQuery = query(couponsQuery, where('merchantId', 'in', filters.merchantId));
        }
      }

      if (filters?.categories && filters.categories.length > 0) {
        if (filters.categories.length === 1) {
          couponsQuery = query(couponsQuery, where('category', '==', filters.categories[0]));
        } else {
          couponsQuery = query(couponsQuery, where('category', 'in', filters.categories));
        }
      }

      if (filters?.dateRange?.start) {
        const startDate = Timestamp.fromDate(filters.dateRange.start);
        couponsQuery = query(couponsQuery, where('endDate', '>=', startDate));
      }

      if (filters?.dateRange?.end) {
        const endDate = Timestamp.fromDate(filters.dateRange.end);
        couponsQuery = query(couponsQuery, where('startDate', '<=', endDate));
      }

      // Add ordering
      couponsQuery = query(couponsQuery, orderBy('createdAt', 'desc'));

      // Get total count
      const countSnapshot = await getCountFromServer(couponsQuery);
      const total = countSnapshot.data().count;

      // Apply pagination
      if (lastDoc) {
        couponsQuery = query(couponsQuery, startAfter(lastDoc), limit(pageSize));
      } else {
        // First page
        couponsQuery = query(couponsQuery, limit(pageSize));
      }

      // Execute query
      const querySnapshot = await getDocs(couponsQuery);

      // Convert to Coupon objects
      const coupons: Coupon[] = [];
      let lastVisible: QueryDocumentSnapshot<DocumentData> | null = null;

      querySnapshot.forEach((doc) => {
        // Get the last document for pagination
        lastVisible = doc;

        // Convert document to Coupon
        const coupon = convertDocToCoupon(doc);

        // Apply search filter on client side if needed
        if (filters?.search) {
          const searchLower = filters.search.toLowerCase();
          const title = coupon.title.toLowerCase();
          const description = coupon.description.toLowerCase();
          const code = coupon.code.toLowerCase();

          if (title.includes(searchLower) ||
              description.includes(searchLower) ||
              code.includes(searchLower)) {
            coupons.push(coupon);
          }
        } else {
          coupons.push(coupon);
        }
      });

      // Calculate total pages
      const totalPages = Math.ceil(total / pageSize);

      return {
        data: coupons,
        total,
        page,
        limit: pageSize,
        totalPages,
        lastDoc: lastVisible
      };
    } catch (error) {
      console.error('Error fetching coupons:', error);
      throw error;
    }
  },

  /**
   * Get a specific coupon by ID
   */
  getCouponById: async (id: string): Promise<Coupon> => {
    try {
      const couponDoc = await getDoc(doc(db, 'coupons', id));

      if (!couponDoc.exists()) {
        throw new Error('Coupon not found');
      }

      return convertDocToCoupon(couponDoc);
    } catch (error) {
      console.error('Error fetching coupon:', error);
      throw error;
    }
  },

  /**
   * Create a new coupon
   */
  createCoupon: async (couponData: CouponFormData): Promise<Coupon> => {
    try {
      // Get merchant data to store the name
      const merchantDoc = await getDoc(doc(db, 'users', couponData.merchantId));
      let merchantName = 'Unknown Merchant';

      if (merchantDoc.exists()) {
        const merchantData = merchantDoc.data();
        merchantName = merchantData.storeName ||
          `${merchantData.firstName} ${merchantData.lastName}`;
      }

      // Prepare coupon data for Firestore
      const couponDoc = {
        title: couponData.title,
        description: couponData.description,
        code: couponData.code,
        discountValue: couponData.discountValue,
        discountType: couponData.discountType,
        merchantId: couponData.merchantId,
        merchantName,
        category: couponData.category,
        startDate: Timestamp.fromDate(couponData.startDate),
        endDate: Timestamp.fromDate(couponData.endDate),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: couponData.isActive,
        usageLimit: couponData.usageLimit,
        usedCount: couponData.usedCount || 0,
        minPurchaseAmount: couponData.minPurchaseAmount,
        maxDiscountAmount: couponData.maxDiscountAmount,
        termsAndConditions: couponData.termsAndConditions,
        imageUrl: couponData.imageUrl,
      };

      // Add coupon to Firestore
      const docRef = await addDoc(collection(db, 'coupons'), couponDoc);

      // Return the created coupon
      const newCouponDoc = await getDoc(docRef);
      return convertDocToCoupon(newCouponDoc);
    } catch (error) {
      console.error('Error creating coupon:', error);
      throw error;
    }
  },

  /**
   * Update an existing coupon
   */
  updateCoupon: async (id: string, couponData: Partial<CouponFormData>): Promise<Coupon> => {
    try {
      const couponRef = doc(db, 'coupons', id);
      const couponDoc = await getDoc(couponRef);

      if (!couponDoc.exists()) {
        throw new Error('Coupon not found');
      }

      // Prepare update data
      const updateData: any = {
        updatedAt: serverTimestamp(),
      };

      // Add fields that are being updated
      if (couponData.title !== undefined) updateData.title = couponData.title;
      if (couponData.description !== undefined) updateData.description = couponData.description;
      if (couponData.code !== undefined) updateData.code = couponData.code;
      if (couponData.discountValue !== undefined) updateData.discountValue = couponData.discountValue;
      if (couponData.discountType !== undefined) updateData.discountType = couponData.discountType;
      if (couponData.category !== undefined) updateData.category = couponData.category;
      if (couponData.isActive !== undefined) updateData.isActive = couponData.isActive;
      if (couponData.usageLimit !== undefined) updateData.usageLimit = couponData.usageLimit;
      if (couponData.usedCount !== undefined) updateData.usedCount = couponData.usedCount;
      if (couponData.minPurchaseAmount !== undefined) updateData.minPurchaseAmount = couponData.minPurchaseAmount;
      if (couponData.maxDiscountAmount !== undefined) updateData.maxDiscountAmount = couponData.maxDiscountAmount;
      if (couponData.termsAndConditions !== undefined) updateData.termsAndConditions = couponData.termsAndConditions;
      if (couponData.imageUrl !== undefined) updateData.imageUrl = couponData.imageUrl;

      // Update dates if provided
      if (couponData.startDate) {
        updateData.startDate = Timestamp.fromDate(couponData.startDate);
      }

      if (couponData.endDate) {
        updateData.endDate = Timestamp.fromDate(couponData.endDate);
      }

      // Update merchant if provided
      if (couponData.merchantId) {
        updateData.merchantId = couponData.merchantId;

        // Get merchant data to store the name
        const merchantDoc = await getDoc(doc(db, 'users', couponData.merchantId));
        if (merchantDoc.exists()) {
          const merchantData = merchantDoc.data();
          updateData.merchantName = merchantData.storeName ||
            `${merchantData.firstName} ${merchantData.lastName}`;
        }
      }

      // Update Firestore document
      await updateDoc(couponRef, updateData);

      // Get the updated coupon
      const updatedCouponDoc = await getDoc(couponRef);
      return convertDocToCoupon(updatedCouponDoc);
    } catch (error) {
      console.error('Error updating coupon:', error);
      throw error;
    }
  },

  /**
   * Delete a coupon
   */
  deleteCoupon: async (id: string): Promise<void> => {
    try {
      // Delete coupon from Firestore
      await deleteDoc(doc(db, 'coupons', id));

      // Delete coupon image if exists
      try {
        const couponDoc = await getDoc(doc(db, 'coupons', id));
        if (couponDoc.exists() && couponDoc.data().imageUrl) {
          const imageRef = ref(storage, `coupons/${id}`);
          await deleteObject(imageRef);
        }
      } catch (error) {
        console.error('Error deleting coupon image:', error);
        // Continue with deletion even if image deletion fails
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      throw error;
    }
  },

  /**
   * Change coupon status
   */
  changeCouponStatus: async (id: string, isActive: boolean): Promise<Coupon> => {
    try {
      const couponRef = doc(db, 'coupons', id);

      // Update coupon status in Firestore
      await updateDoc(couponRef, {
        isActive,
        updatedAt: serverTimestamp()
      });

      // Get the updated coupon
      const updatedCouponDoc = await getDoc(couponRef);
      return convertDocToCoupon(updatedCouponDoc);
    } catch (error) {
      console.error('Error changing coupon status:', error);
      throw error;
    }
  },

  /**
   * Generate a unique coupon code
   */
  generateCouponCode: async (): Promise<{ code: string }> => {
    try {
      // Generate a random code
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';

      for (let i = 0; i < 8; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }

      // Check if code already exists
      const couponsQuery = query(
        collection(db, 'coupons'),
        where('code', '==', code)
      );

      const querySnapshot = await getDocs(couponsQuery);

      if (!querySnapshot.empty) {
        // Code already exists, generate a new one
        return couponService.generateCouponCode();
      }

      return { code };
    } catch (error) {
      console.error('Error generating coupon code:', error);
      throw error;
    }
  },

  /**
   * Duplicate a coupon
   */
  duplicateCoupon: async (id: string): Promise<Coupon> => {
    try {
      // Get the original coupon
      const originalCoupon = await couponService.getCouponById(id);

      // Generate a new code
      const { code } = await couponService.generateCouponCode();

      // Create a new coupon with the same data but a new code
      const newCouponData: CouponFormData = {
        title: `Copy of ${originalCoupon.title}`,
        description: originalCoupon.description,
        code,
        discountValue: originalCoupon.discountValue,
        discountType: originalCoupon.discountType,
        merchantId: originalCoupon.merchantId,
        category: originalCoupon.category,
        startDate: new Date(), // Start from today
        endDate: originalCoupon.endDate,
        isActive: true,
        usageLimit: originalCoupon.usageLimit,
        usedCount: 0, // Reset used count
        minPurchaseAmount: originalCoupon.minPurchaseAmount,
        maxDiscountAmount: originalCoupon.maxDiscountAmount,
        termsAndConditions: originalCoupon.termsAndConditions,
        imageUrl: originalCoupon.imageUrl,
      };

      // Create the new coupon
      return couponService.createCoupon(newCouponData);
    } catch (error) {
      console.error('Error duplicating coupon:', error);
      throw error;
    }
  },

  /**
   * Get coupon QR code
   */
  getCouponQRCode: async (id: string): Promise<{ qrCodeUrl: string }> => {
    try {
      // Get the coupon
      const coupon = await couponService.getCouponById(id);

      // Generate QR code URL using a third-party service
      // For this example, we'll use the Google Charts API
      const qrCodeData = encodeURIComponent(JSON.stringify({
        id: coupon.id,
        code: coupon.code,
        discountValue: coupon.discountValue,
        discountType: coupon.discountType,
      }));

      const qrCodeUrl = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${qrCodeData}`;

      return { qrCodeUrl };
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  },

  /**
   * Get all merchants (stores)
   */
  getMerchants: async (): Promise<Merchant[]> => {
    try {
      // Query users with role 'merchant'
      const merchantsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'merchant')
      );

      const querySnapshot = await getDocs(merchantsQuery);
      const merchants: Merchant[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        merchants.push({
          id: doc.id,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          storeName: data.storeName || `${data.firstName} ${data.lastName}'s Store`,
          email: data.email || '',
          avatar: data.avatar || '',
        });
      });

      return merchants;
    } catch (error) {
      console.error('Error fetching merchants:', error);
      throw error;
    }
  },

  /**
   * Get all categories
   */
  getCategories: async (): Promise<Category[]> => {
    try {
      // Query categories collection
      const categoriesQuery = query(
        collection(db, 'categories'),
        orderBy('name', 'asc')
      );

      const querySnapshot = await getDocs(categoriesQuery);
      const categories: Category[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        categories.push({
          id: doc.id,
          name: data.name || '',
        });
      });

      // If no categories exist yet, return some default ones
      if (categories.length === 0) {
        return [
          { id: 'food', name: 'Food & Dining' },
          { id: 'shopping', name: 'Shopping' },
          { id: 'travel', name: 'Travel' },
          { id: 'entertainment', name: 'Entertainment' },
          { id: 'services', name: 'Services' },
          { id: 'other', name: 'Other' },
        ];
      }

      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);

      // Return default categories on error
      return [
        { id: 'food', name: 'Food & Dining' },
        { id: 'shopping', name: 'Shopping' },
        { id: 'travel', name: 'Travel' },
        { id: 'entertainment', name: 'Entertainment' },
        { id: 'services', name: 'Services' },
        { id: 'other', name: 'Other' },
      ];
    }
  },

  /**
   * Get recent coupons
   */
  getRecentCoupons: async (limitCount: number = 5): Promise<Coupon[]> => {
    try {
      // Query recent coupons
      const couponsQuery = query(
        collection(db, 'coupons'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(couponsQuery);
      const coupons: Coupon[] = [];

      querySnapshot.forEach((doc) => {
        coupons.push(convertDocToCoupon(doc));
      });

      return coupons;
    } catch (error) {
      console.error('Error fetching recent coupons:', error);
      throw error;
    }
  },

  /**
   * Export coupons to CSV/Excel
   */
  exportCoupons: async (format: 'csv' | 'excel', filters?: CouponFilters): Promise<Blob> => {
    try {
      // Get all coupons based on filters (no pagination)
      // We'll use a large limit to get all coupons
      const response = await couponService.getCoupons(1, 1000, filters);
      const coupons = response.data;

      // Convert coupons to CSV or Excel format
      if (format === 'csv') {
        // Generate CSV content
        const headers = [
          'ID',
          'Title',
          'Description',
          'Code',
          'Discount Value',
          'Discount Type',
          'Merchant',
          'Category',
          'Start Date',
          'End Date',
          'Status',
          'Usage Limit',
          'Used Count',
          'Min Purchase',
          'Max Discount',
        ].join(',');

        const rows = coupons.map(coupon => [
          coupon.id,
          `"${coupon.title.replace(/"/g, '""')}"`,
          `"${coupon.description.replace(/"/g, '""')}"`,
          coupon.code,
          coupon.discountValue,
          coupon.discountType,
          `"${coupon.merchantName.replace(/"/g, '""')}"`,
          coupon.category,
          coupon.startDate.toISOString().split('T')[0],
          coupon.endDate.toISOString().split('T')[0],
          coupon.isActive ? 'Active' : 'Inactive',
          coupon.usageLimit,
          coupon.usedCount,
          coupon.minPurchaseAmount || '',
          coupon.maxDiscountAmount || '',
        ].join(','));

        const csvContent = [headers, ...rows].join('\n');

        // Create a Blob from the CSV content
        return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      } else {
        // For Excel, we would typically use a library like xlsx
        // For simplicity, we'll return CSV for now
        // In a real implementation, you would use a library to generate Excel files
        const csvContent = 'This would be an Excel file in a real implementation';
        return new Blob([csvContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      }
    } catch (error) {
      console.error('Error exporting coupons:', error);
      throw error;
    }
  },

  /**
   * Upload coupon image
   */
  uploadCouponImage: async (id: string, file: File): Promise<{ imageUrl: string }> => {
    try {
      // Create a reference to the storage location
      const imageRef = ref(storage, `coupons/${id}`);

      // Upload the file
      await uploadBytes(imageRef, file);

      // Get the download URL
      const imageUrl = await getDownloadURL(imageRef);

      // Update the coupon document with the image URL
      const couponRef = doc(db, 'coupons', id);
      await updateDoc(couponRef, {
        imageUrl,
        updatedAt: serverTimestamp()
      });

      return { imageUrl };
    } catch (error) {
      console.error('Error uploading coupon image:', error);
      throw error;
    }
  },
};

export default couponService;
