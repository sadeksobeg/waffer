import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
  deleteDoc,
  addDoc
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';
import { db, storage } from '@/config/firebase';
import { api } from './apiClient';

export interface ProfileSettings {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  company: string;
  bio: string;
  avatar: string | null;
  country: string;
  language: string;
  timezone: string;
  updatedAt: Date;
}

export interface NotificationSettings {
  userId?: string;
  email: {
    enabled: boolean;
    newCoupon: boolean;
    couponExpiring: boolean;
    couponRedeemed: boolean;
    newUser: boolean;
    weeklyReport: boolean;
    monthlyReport: boolean;
  };
  push: {
    enabled: boolean;
    newCoupon: boolean;
    couponExpiring: boolean;
    couponRedeemed: boolean;
    newUser: boolean;
    weeklyReport: boolean;
    monthlyReport: boolean;
  };
  inApp: {
    enabled: boolean;
    showBadge: boolean;
    sound: boolean;
  };
  updatedAt?: Date;
}

export interface AppearanceSettings {
  userId?: string;
  theme: 'light' | 'dark' | 'system';
  fontSize: number;
  denseMode: boolean;
  sidebarCollapsed: boolean;
  animationsEnabled: boolean;
  colorScheme: string;
  updatedAt?: Date;
}

export interface SystemSettings {
  id: string;
  siteName: string;
  logo: string;
  favicon: string;
  primaryColor: string;
  secondaryColor: string;
  maintenance: {
    enabled: boolean;
    message: string;
    scheduledEnd?: Date;
  };
  features: {
    registration: boolean;
    socialLogin: boolean;
    coupons: boolean;
    rewards: boolean;
    referrals: boolean;
  };
  email: {
    fromName: string;
    fromEmail: string;
    replyTo: string;
    footer: string;
  };
  updatedAt: Date;
  updatedBy: string;
}

export interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number; // in minutes
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
    expiryDays: number; // 0 means never expires
  };
  ipRestrictions: string[]; // List of allowed IP addresses/ranges
  updatedAt?: Date;
  updatedBy?: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: Date;
  lastUsed: Date | null;
  permissions: string[];
  userId: string;
}

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: Date;
  userId: string;
}

const settingsService = {
  /**
   * Get profile settings
   */
  getProfileSettings: async (userId: string): Promise<ProfileSettings> => {
    try {
      const profileRef = doc(db, 'userProfiles', userId);
      const profileDoc = await getDoc(profileRef);

      if (profileDoc.exists()) {
        const data = profileDoc.data();
        return {
          userId,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          jobTitle: data.jobTitle || '',
          company: data.company || '',
          bio: data.bio || '',
          avatar: data.avatar || null,
          country: data.country || '',
          language: data.language || 'en',
          timezone: data.timezone || 'UTC',
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      }

      // Return default settings if not found
      return {
        userId,
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        jobTitle: '',
        company: '',
        bio: '',
        avatar: null,
        country: '',
        language: 'en',
        timezone: 'UTC',
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error('Error fetching profile settings:', error);
      throw error;
    }
  },

  /**
   * Update profile settings
   */
  updateProfileSettings: async (userId: string, settings: Partial<ProfileSettings>): Promise<ProfileSettings> => {
    try {
      const profileRef = doc(db, 'userProfiles', userId);
      const profileDoc = await getDoc(profileRef);

      const updateData: any = {
        ...settings,
        updatedAt: serverTimestamp(),
      };

      if (profileDoc.exists()) {
        await updateDoc(profileRef, updateData);
      } else {
        await setDoc(profileRef, {
          userId,
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          jobTitle: '',
          company: '',
          bio: '',
          avatar: null,
          country: '',
          language: 'en',
          timezone: 'UTC',
          ...updateData,
        });
      }

      // Get the updated profile
      return settingsService.getProfileSettings(userId);
    } catch (error) {
      console.error('Error updating profile settings:', error);
      throw error;
    }
  },

  /**
   * Upload profile avatar
   */
  uploadAvatar: async (userId: string, file: File): Promise<{ avatarUrl: string }> => {
    try {
      // Create a storage reference
      const storageRef = ref(storage, `avatars/${userId}/${file.name}`);

      // Upload the file
      await uploadBytes(storageRef, file);

      // Get the download URL
      const avatarUrl = await getDownloadURL(storageRef);

      // Update the user profile with the new avatar URL
      const profileRef = doc(db, 'userProfiles', userId);
      await updateDoc(profileRef, {
        avatar: avatarUrl,
        updatedAt: serverTimestamp(),
      });

      return { avatarUrl };
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  },

  /**
   * Get notification settings
   */
  getNotificationSettings: async (userId: string): Promise<NotificationSettings> => {
    try {
      const notificationSettingsRef = doc(db, 'userSettings', userId);
      const notificationSettingsDoc = await getDoc(notificationSettingsRef);

      if (notificationSettingsDoc.exists()) {
        const data = notificationSettingsDoc.data();
        return {
          userId,
          email: {
            enabled: data.email?.enabled ?? true,
            newCoupon: data.email?.newCoupon ?? true,
            couponExpiring: data.email?.couponExpiring ?? true,
            couponRedeemed: data.email?.couponRedeemed ?? true,
            newUser: data.email?.newUser ?? true,
            weeklyReport: data.email?.weeklyReport ?? true,
            monthlyReport: data.email?.monthlyReport ?? true,
          },
          push: {
            enabled: data.push?.enabled ?? true,
            newCoupon: data.push?.newCoupon ?? true,
            couponExpiring: data.push?.couponExpiring ?? true,
            couponRedeemed: data.push?.couponRedeemed ?? true,
            newUser: data.push?.newUser ?? true,
            weeklyReport: data.push?.weeklyReport ?? true,
            monthlyReport: data.push?.monthlyReport ?? true,
          },
          inApp: {
            enabled: data.inApp?.enabled ?? true,
            showBadge: data.inApp?.showBadge ?? true,
            sound: data.inApp?.sound ?? true,
          },
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      }

      // Return default settings if not found
      return {
        userId,
        email: {
          enabled: true,
          newCoupon: true,
          couponExpiring: true,
          couponRedeemed: true,
          newUser: true,
          weeklyReport: true,
          monthlyReport: true,
        },
        push: {
          enabled: true,
          newCoupon: true,
          couponExpiring: true,
          couponRedeemed: true,
          newUser: true,
          weeklyReport: true,
          monthlyReport: true,
        },
        inApp: {
          enabled: true,
          showBadge: true,
          sound: true,
        },
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      throw error;
    }
  },

  /**
   * Update notification settings
   */
  updateNotificationSettings: async (userId: string, settings: Partial<NotificationSettings>): Promise<NotificationSettings> => {
    try {
      const notificationSettingsRef = doc(db, 'userSettings', userId);
      const notificationSettingsDoc = await getDoc(notificationSettingsRef);

      const updateData: any = {
        ...settings,
        updatedAt: serverTimestamp(),
      };

      if (notificationSettingsDoc.exists()) {
        await updateDoc(notificationSettingsRef, updateData);
      } else {
        await setDoc(notificationSettingsRef, {
          userId,
          email: {
            enabled: true,
            newCoupon: true,
            couponExpiring: true,
            couponRedeemed: true,
            newUser: true,
            weeklyReport: true,
            monthlyReport: true,
          },
          push: {
            enabled: true,
            newCoupon: true,
            couponExpiring: true,
            couponRedeemed: true,
            newUser: true,
            weeklyReport: true,
            monthlyReport: true,
          },
          inApp: {
            enabled: true,
            showBadge: true,
            sound: true,
          },
          ...updateData,
        });
      }

      // Get the updated settings
      return settingsService.getNotificationSettings(userId);
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  },

  /**
   * Get appearance settings
   */
  getAppearanceSettings: async (userId: string): Promise<AppearanceSettings> => {
    try {
      const appearanceSettingsRef = doc(db, 'userSettings', userId);
      const appearanceSettingsDoc = await getDoc(appearanceSettingsRef);

      if (appearanceSettingsDoc.exists()) {
        const data = appearanceSettingsDoc.data();
        return {
          userId,
          theme: data.theme || 'system',
          fontSize: data.fontSize || 16,
          denseMode: data.denseMode ?? false,
          sidebarCollapsed: data.sidebarCollapsed ?? false,
          animationsEnabled: data.animationsEnabled ?? true,
          colorScheme: data.colorScheme || 'blue',
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      }

      // Return default settings if not found
      return {
        userId,
        theme: 'system',
        fontSize: 16,
        denseMode: false,
        sidebarCollapsed: false,
        animationsEnabled: true,
        colorScheme: 'blue',
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error('Error fetching appearance settings:', error);
      throw error;
    }
  },

  /**
   * Update appearance settings
   */
  updateAppearanceSettings: async (userId: string, settings: Partial<AppearanceSettings>): Promise<AppearanceSettings> => {
    try {
      const appearanceSettingsRef = doc(db, 'userSettings', userId);
      const appearanceSettingsDoc = await getDoc(appearanceSettingsRef);

      const updateData: any = {
        ...settings,
        updatedAt: serverTimestamp(),
      };

      if (appearanceSettingsDoc.exists()) {
        await updateDoc(appearanceSettingsRef, updateData);
      } else {
        await setDoc(appearanceSettingsRef, {
          userId,
          theme: 'system',
          fontSize: 16,
          denseMode: false,
          sidebarCollapsed: false,
          animationsEnabled: true,
          colorScheme: 'blue',
          ...updateData,
        });
      }

      // Get the updated settings
      return settingsService.getAppearanceSettings(userId);
    } catch (error) {
      console.error('Error updating appearance settings:', error);
      throw error;
    }
  },

  /**
   * Get system settings
   */
  getSystemSettings: async (): Promise<SystemSettings> => {
    try {
      const systemSettingsRef = doc(db, 'systemSettings', 'general');
      const systemSettingsDoc = await getDoc(systemSettingsRef);

      if (systemSettingsDoc.exists()) {
        const data = systemSettingsDoc.data();
        return {
          id: 'general',
          siteName: data.siteName || 'Coupon Admin',
          logo: data.logo || '/images/logo.png',
          favicon: data.favicon || '/favicon.ico',
          primaryColor: data.primaryColor || '#1976d2',
          secondaryColor: data.secondaryColor || '#dc004e',
          maintenance: {
            enabled: data.maintenance?.enabled ?? false,
            message: data.maintenance?.message || 'System is under maintenance. Please check back later.',
            scheduledEnd: data.maintenance?.scheduledEnd?.toDate(),
          },
          features: {
            registration: data.features?.registration ?? true,
            socialLogin: data.features?.socialLogin ?? true,
            coupons: data.features?.coupons ?? true,
            rewards: data.features?.rewards ?? true,
            referrals: data.features?.referrals ?? true,
          },
          email: {
            fromName: data.email?.fromName || 'Coupon Admin',
            fromEmail: data.email?.fromEmail || 'noreply@example.com',
            replyTo: data.email?.replyTo || 'support@example.com',
            footer: data.email?.footer || '© 2023 Coupon Admin. All rights reserved.',
          },
          updatedAt: data.updatedAt?.toDate() || new Date(),
          updatedBy: data.updatedBy || '',
        };
      }

      // Return default settings if not found
      return {
        id: 'general',
        siteName: 'Coupon Admin',
        logo: '/images/logo.png',
        favicon: '/favicon.ico',
        primaryColor: '#1976d2',
        secondaryColor: '#dc004e',
        maintenance: {
          enabled: false,
          message: 'System is under maintenance. Please check back later.',
        },
        features: {
          registration: true,
          socialLogin: true,
          coupons: true,
          rewards: true,
          referrals: true,
        },
        email: {
          fromName: 'Coupon Admin',
          fromEmail: 'noreply@example.com',
          replyTo: 'support@example.com',
          footer: '© 2023 Coupon Admin. All rights reserved.',
        },
        updatedAt: new Date(),
        updatedBy: '',
      };
    } catch (error) {
      console.error('Error fetching system settings:', error);
      throw error;
    }
  },

  /**
   * Update system settings
   */
  updateSystemSettings: async (settings: Partial<SystemSettings>, userId: string): Promise<SystemSettings> => {
    try {
      const systemSettingsRef = doc(db, 'systemSettings', 'general');

      // Prepare update data
      const updateData: any = {
        ...settings,
        updatedAt: serverTimestamp(),
        updatedBy: userId,
      };

      // Handle maintenance scheduled end date
      if (settings.maintenance?.scheduledEnd) {
        updateData.maintenance = {
          ...settings.maintenance,
          scheduledEnd: Timestamp.fromDate(settings.maintenance.scheduledEnd),
        };
      }

      await updateDoc(systemSettingsRef, updateData);

      // Get the updated settings
      return settingsService.getSystemSettings();
    } catch (error) {
      console.error('Error updating system settings:', error);
      throw error;
    }
  },

  /**
   * Get security settings
   */
  getSecuritySettings: async (): Promise<SecuritySettings> => {
    try {
      const securitySettingsRef = doc(db, 'systemSettings', 'security');
      const securitySettingsDoc = await getDoc(securitySettingsRef);

      if (securitySettingsDoc.exists()) {
        const data = securitySettingsDoc.data();
        return {
          twoFactorAuth: data.twoFactorAuth ?? false,
          sessionTimeout: data.sessionTimeout || 30,
          passwordPolicy: {
            minLength: data.passwordPolicy?.minLength || 8,
            requireUppercase: data.passwordPolicy?.requireUppercase ?? true,
            requireLowercase: data.passwordPolicy?.requireLowercase ?? true,
            requireNumbers: data.passwordPolicy?.requireNumbers ?? true,
            requireSymbols: data.passwordPolicy?.requireSymbols ?? false,
            expiryDays: data.passwordPolicy?.expiryDays || 0,
          },
          ipRestrictions: data.ipRestrictions || [],
          updatedAt: data.updatedAt?.toDate() || new Date(),
          updatedBy: data.updatedBy || '',
        };
      }

      // Return default settings if not found
      return {
        twoFactorAuth: false,
        sessionTimeout: 30,
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSymbols: false,
          expiryDays: 0,
        },
        ipRestrictions: [],
      };
    } catch (error) {
      console.error('Error fetching security settings:', error);
      throw error;
    }
  },

  /**
   * Update security settings
   */
  updateSecuritySettings: async (settings: Partial<SecuritySettings>, userId: string): Promise<SecuritySettings> => {
    try {
      const securitySettingsRef = doc(db, 'systemSettings', 'security');
      const securitySettingsDoc = await getDoc(securitySettingsRef);

      const updateData: any = {
        ...settings,
        updatedAt: serverTimestamp(),
        updatedBy: userId,
      };

      if (securitySettingsDoc.exists()) {
        await updateDoc(securitySettingsRef, updateData);
      } else {
        await setDoc(securitySettingsRef, {
          twoFactorAuth: false,
          sessionTimeout: 30,
          passwordPolicy: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSymbols: false,
            expiryDays: 0,
          },
          ipRestrictions: [],
          ...updateData,
        });
      }

      // Get the updated settings
      return settingsService.getSecuritySettings();
    } catch (error) {
      console.error('Error updating security settings:', error);
      throw error;
    }
  },

  /**
   * Get API keys
   */
  getApiKeys: async (userId: string): Promise<ApiKey[]> => {
    try {
      const apiKeysQuery = query(
        collection(db, 'apiKeys'),
        where('userId', '==', userId)
      );

      const apiKeysSnapshot = await getDocs(apiKeysQuery);
      const apiKeys: ApiKey[] = [];

      apiKeysSnapshot.forEach((doc) => {
        const data = doc.data();
        apiKeys.push({
          id: doc.id,
          name: data.name,
          key: data.key,
          createdAt: data.createdAt.toDate(),
          lastUsed: data.lastUsed ? data.lastUsed.toDate() : null,
          permissions: data.permissions || [],
          userId: data.userId,
        });
      });

      return apiKeys;
    } catch (error) {
      console.error('Error fetching API keys:', error);
      throw error;
    }
  },

  /**
   * Create API key
   */
  createApiKey: async (userId: string, name: string, permissions: string[]): Promise<ApiKey> => {
    try {
      // Generate a random API key
      const key = Array.from(Array(30), () => Math.floor(Math.random() * 36).toString(36)).join('');

      const apiKeyData = {
        name,
        key,
        permissions,
        userId,
        createdAt: serverTimestamp(),
        lastUsed: null,
      };

      const apiKeyRef = await addDoc(collection(db, 'apiKeys'), apiKeyData);

      return {
        id: apiKeyRef.id,
        name,
        key,
        createdAt: new Date(),
        lastUsed: null,
        permissions,
        userId,
      };
    } catch (error) {
      console.error('Error creating API key:', error);
      throw error;
    }
  },

  /**
   * Delete API key
   */
  deleteApiKey: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'apiKeys', id));
    } catch (error) {
      console.error('Error deleting API key:', error);
      throw error;
    }
  },

  /**
   * Get webhooks
   */
  getWebhooks: async (userId: string): Promise<Webhook[]> => {
    try {
      const webhooksQuery = query(
        collection(db, 'webhooks'),
        where('userId', '==', userId)
      );

      const webhooksSnapshot = await getDocs(webhooksQuery);
      const webhooks: Webhook[] = [];

      webhooksSnapshot.forEach((doc) => {
        const data = doc.data();
        webhooks.push({
          id: doc.id,
          url: data.url,
          events: data.events || [],
          active: data.active ?? true,
          createdAt: data.createdAt.toDate(),
          userId: data.userId,
        });
      });

      return webhooks;
    } catch (error) {
      console.error('Error fetching webhooks:', error);
      throw error;
    }
  },

  /**
   * Create webhook
   */
  createWebhook: async (userId: string, url: string, events: string[]): Promise<Webhook> => {
    try {
      const webhookData = {
        url,
        events,
        active: true,
        userId,
        createdAt: serverTimestamp(),
      };

      const webhookRef = await addDoc(collection(db, 'webhooks'), webhookData);

      return {
        id: webhookRef.id,
        url,
        events,
        active: true,
        createdAt: new Date(),
        userId,
      };
    } catch (error) {
      console.error('Error creating webhook:', error);
      throw error;
    }
  },

  /**
   * Update webhook
   */
  updateWebhook: async (id: string, data: { url?: string; events?: string[]; active?: boolean }): Promise<Webhook> => {
    try {
      const webhookRef = doc(db, 'webhooks', id);

      const updateData: any = {
        ...data,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(webhookRef, updateData);

      // Get the updated webhook
      const webhookDoc = await getDoc(webhookRef);

      if (!webhookDoc.exists()) {
        throw new Error('Webhook not found');
      }

      const webhookData = webhookDoc.data();

      return {
        id,
        url: webhookData.url,
        events: webhookData.events || [],
        active: webhookData.active ?? true,
        createdAt: webhookData.createdAt.toDate(),
        userId: webhookData.userId,
      };
    } catch (error) {
      console.error('Error updating webhook:', error);
      throw error;
    }
  },

  /**
   * Delete webhook
   */
  deleteWebhook: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'webhooks', id));
    } catch (error) {
      console.error('Error deleting webhook:', error);
      throw error;
    }
  },

  /**
   * Toggle webhook active status
   */
  toggleWebhook: async (id: string, active: boolean): Promise<Webhook> => {
    try {
      const webhookRef = doc(db, 'webhooks', id);

      await updateDoc(webhookRef, {
        active,
        updatedAt: serverTimestamp(),
      });

      // Get the updated webhook
      const webhookDoc = await getDoc(webhookRef);

      if (!webhookDoc.exists()) {
        throw new Error('Webhook not found');
      }

      const webhookData = webhookDoc.data();

      return {
        id,
        url: webhookData.url,
        events: webhookData.events || [],
        active: webhookData.active ?? true,
        createdAt: webhookData.createdAt.toDate(),
        userId: webhookData.userId,
      };
    } catch (error) {
      console.error('Error toggling webhook:', error);
      throw error;
    }
  },
};

export default settingsService;
