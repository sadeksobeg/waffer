import { Timestamp, FieldValue } from 'firebase-admin/firestore';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'merchant' | 'customer';
  createdAt: Date | Timestamp | FieldValue;
  lastLoginAt: Date | Timestamp | FieldValue;
  isActive: boolean;
  metadata?: {
    phoneNumber?: string;
    address?: string;
    [key: string]: any;
  };
}

export interface Store {
  id: string;
  name: string;
  description: string;
  merchantId: string;
  logoUrl?: string;
  address: string;
  isActive: boolean;
  createdAt: Date | Timestamp | FieldValue;
  updatedAt: Date | Timestamp | FieldValue;
}

export interface Coupon {
  id: string;
  title: string;
  description: string;
  storeId: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  usageLimit: number;
  validFrom: Date | Timestamp | FieldValue;
  validTo: Date | Timestamp | FieldValue;
  qrCodeUrl: string;
  isActive: boolean;
  createdAt: Date | Timestamp | FieldValue;
  updatedAt: Date | Timestamp | FieldValue;
}

export interface Redemption {
  id: string;
  couponId: string;
  userId: string;
  storeId: string;
  redeemedAt: Date | Timestamp | FieldValue;
  savings: number;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'system' | 'coupon' | 'store';
  targetAudience: 'all' | 'customers' | 'merchants' | 'admins';
  sentAt: Date | Timestamp | FieldValue;
  data?: {
    [key: string]: any;
  };
}

export interface Log {
  id: string;
  action: string;
  userId: string;
  userRole: string;
  timestamp: Date | Timestamp | FieldValue;
  details: {
    [key: string]: any;
  };
} 