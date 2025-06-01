import { Timestamp, FieldValue } from 'firebase-admin/firestore';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'merchant' | 'customer' | 'support';
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  isActive: boolean;
  avatar?: string;
  phoneNumber?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

export interface Store {
  id: string;
  name: string;
  description?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  location?: {
    latitude: number;
    longitude: number;
  };
  phoneNumber?: string;
  email?: string;
  website?: string;
  logo?: string;
  coverImage?: string;
  merchantId: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  openingHours?: {
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  };
  categories?: string[];
}

export interface Coupon {
  id: string;
  title: string;
  description: string;
  code: string;
  discountType: 'percentage' | 'fixed' | 'freeItem';
  discountValue: number;
  startDate: Timestamp;
  endDate: Timestamp;
  isActive: boolean;
  storeId: string;
  merchantId: string;
  usageLimit?: number;
  usageCount: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  image?: string;
  terms?: string;
  categories?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'system' | 'coupon' | 'store' | 'user';
  targetAudience: string;
  data?: Record<string, string>;
  sentAt: Timestamp | FieldValue;
  read?: boolean;
  readAt?: Timestamp;
}

export interface Redemption {
  id: string;
  couponId: string;
  userId: string;
  storeId: string;
  redeemedAt: Timestamp;
  amount?: number;
  transactionId?: string;
}
