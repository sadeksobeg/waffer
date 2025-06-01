import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  doc,
  Timestamp,
  startAfter,
  endBefore,
  getCountFromServer,
  addDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot,
  onSnapshot,
  QuerySnapshot,
  startAt,
  endAt,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  recipientId?: string;
  recipientType: 'user' | 'merchant' | 'admin' | 'all';
  isRead: boolean;
  isArchived: boolean;
  link?: string;
  createdAt: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

export interface NotificationTemplate {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  recipientType: 'user' | 'merchant' | 'admin' | 'all';
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationFilters {
  type?: 'info' | 'success' | 'warning' | 'error';
  recipientType?: 'user' | 'merchant' | 'admin' | 'all';
  isRead?: boolean;
  isArchived?: boolean;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export interface NotificationTemplateFilters {
  type?: 'info' | 'success' | 'warning' | 'error';
  recipientType?: 'user' | 'merchant' | 'admin' | 'all';
  category?: string;
  isActive?: boolean;
  search?: string;
}

export interface NotificationResponse {
  data: Notification[];
  total: number;
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
}

export interface NotificationTemplateResponse {
  data: NotificationTemplate[];
  total: number;
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
}

// Helper function to convert Firestore document to Notification
const convertDocToNotification = (doc: DocumentData): Notification => {
  if (!doc.exists()) {
    throw new Error('Document does not exist');
  }

  const data = doc.data();
  return {
    id: doc.id,
    title: data.title || '',
    message: data.message || '',
    type: data.type || 'info',
    recipientId: data.recipientId,
    recipientType: data.recipientType || 'all',
    isRead: data.isRead || false,
    isArchived: data.isArchived || false,
    link: data.link,
    createdAt: data.createdAt?.toDate() || new Date(),
    expiresAt: data.expiresAt?.toDate(),
    metadata: data.metadata,
  };
};

// Helper function to convert Firestore document to NotificationTemplate
const convertDocToTemplate = (doc: DocumentData): NotificationTemplate => {
  if (!doc.exists()) {
    throw new Error('Document does not exist');
  }

  const data = doc.data();
  return {
    id: doc.id,
    title: data.title || '',
    message: data.message || '',
    type: data.type || 'info',
    recipientType: data.recipientType || 'all',
    category: data.category || '',
    isActive: data.isActive || false,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
};

const notificationService = {
  /**
   * Get notifications with pagination and filtering
   */
  getNotifications: async (
    page: number = 1,
    pageSize: number = 10,
    filters: NotificationFilters = {},
    startAfterDoc?: QueryDocumentSnapshot<DocumentData> | null
  ): Promise<NotificationResponse> => {
    try {
      // Build query with filters
      let notificationsQuery = query(
        collection(db, 'notifications'),
        orderBy('createdAt', 'desc')
      );

      // Apply filters
      if (filters.type) {
        notificationsQuery = query(
          notificationsQuery,
          where('type', '==', filters.type)
        );
      }

      if (filters.recipientType) {
        notificationsQuery = query(
          notificationsQuery,
          where('recipientType', '==', filters.recipientType)
        );
      }

      if (filters.isRead !== undefined) {
        notificationsQuery = query(
          notificationsQuery,
          where('isRead', '==', filters.isRead)
        );
      }

      if (filters.isArchived !== undefined) {
        notificationsQuery = query(
          notificationsQuery,
          where('isArchived', '==', filters.isArchived)
        );
      }

      if (filters.startDate) {
        notificationsQuery = query(
          notificationsQuery,
          where('createdAt', '>=', Timestamp.fromDate(filters.startDate))
        );
      }

      if (filters.endDate) {
        notificationsQuery = query(
          notificationsQuery,
          where('createdAt', '<=', Timestamp.fromDate(filters.endDate))
        );
      }

      // Get total count
      const countSnapshot = await getCountFromServer(notificationsQuery);
      const total = countSnapshot.data().count;

      // Apply pagination
      if (startAfterDoc) {
        notificationsQuery = query(
          notificationsQuery,
          startAfter(startAfterDoc),
          limit(pageSize)
        );
      } else {
        notificationsQuery = query(
          notificationsQuery,
          limit(pageSize)
        );
      }

      // Execute query
      const querySnapshot = await getDocs(notificationsQuery);

      // Convert documents to Notification objects
      const notifications: Notification[] = [];
      let lastDoc: QueryDocumentSnapshot<DocumentData> | null = null;

      querySnapshot.forEach((doc) => {
        notifications.push(convertDocToNotification(doc));
        lastDoc = doc;
      });

      // Filter by search term if provided (client-side filtering)
      let filteredNotifications = notifications;
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredNotifications = notifications.filter(
          (notification) =>
            notification.title.toLowerCase().includes(searchTerm) ||
            notification.message.toLowerCase().includes(searchTerm)
        );
      }

      return {
        data: filteredNotifications,
        total,
        lastDoc
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  /**
   * Get notification by ID
   */
  getNotificationById: async (id: string): Promise<Notification> => {
    try {
      const notificationDoc = await getDoc(doc(db, 'notifications', id));

      if (!notificationDoc.exists()) {
        throw new Error('Notification not found');
      }

      return convertDocToNotification(notificationDoc);
    } catch (error) {
      console.error('Error fetching notification:', error);
      throw error;
    }
  },

  /**
   * Create a new notification
   */
  createNotification: async (notificationData: Omit<Notification, 'id' | 'createdAt' | 'isRead' | 'isArchived'>): Promise<Notification> => {
    try {
      // Prepare notification data for Firestore
      const notificationDoc = {
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type,
        recipientId: notificationData.recipientId,
        recipientType: notificationData.recipientType,
        isRead: false,
        isArchived: false,
        link: notificationData.link,
        createdAt: serverTimestamp(),
        expiresAt: notificationData.expiresAt ? Timestamp.fromDate(notificationData.expiresAt) : null,
        metadata: notificationData.metadata || {},
      };

      // Add notification to Firestore
      const docRef = await addDoc(collection(db, 'notifications'), notificationDoc);

      // Return the created notification
      const newNotificationDoc = await getDoc(docRef);
      return convertDocToNotification(newNotificationDoc);
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  /**
   * Update notification (mark as read/archived)
   */
  updateNotification: async (id: string, updates: Partial<Notification>): Promise<Notification> => {
    try {
      const notificationRef = doc(db, 'notifications', id);

      // Prepare update data
      const updateData: any = {};

      if (updates.isRead !== undefined) updateData.isRead = updates.isRead;
      if (updates.isArchived !== undefined) updateData.isArchived = updates.isArchived;

      // Update Firestore document
      await updateDoc(notificationRef, updateData);

      // Get the updated notification
      const updatedNotificationDoc = await getDoc(notificationRef);
      return convertDocToNotification(updatedNotificationDoc);
    } catch (error) {
      console.error('Error updating notification:', error);
      throw error;
    }
  },

  /**
   * Delete notification
   */
  deleteNotification: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (recipientId?: string): Promise<void> => {
    try {
      // Build query to get unread notifications
      let unreadQuery = query(
        collection(db, 'notifications'),
        where('isRead', '==', false)
      );

      // Filter by recipient if provided
      if (recipientId) {
        unreadQuery = query(
          unreadQuery,
          where('recipientId', '==', recipientId)
        );
      }

      // Get all unread notifications
      const querySnapshot = await getDocs(unreadQuery);

      // Update each notification
      const batch = writeBatch(db);

      querySnapshot.forEach((doc) => {
        const notificationRef = doc.ref;
        batch.update(notificationRef, { isRead: true });
      });

      // Commit the batch
      await batch.commit();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  /**
   * Get notification templates
   */
  getNotificationTemplates: async (
    page: number = 1,
    pageSize: number = 10,
    filters: NotificationTemplateFilters = {},
    startAfterDoc?: QueryDocumentSnapshot<DocumentData> | null
  ): Promise<NotificationTemplateResponse> => {
    try {
      // Build query with filters
      let templatesQuery = query(
        collection(db, 'notificationTemplates'),
        orderBy('createdAt', 'desc')
      );

      // Apply filters
      if (filters.type) {
        templatesQuery = query(
          templatesQuery,
          where('type', '==', filters.type)
        );
      }

      if (filters.recipientType) {
        templatesQuery = query(
          templatesQuery,
          where('recipientType', '==', filters.recipientType)
        );
      }

      if (filters.category) {
        templatesQuery = query(
          templatesQuery,
          where('category', '==', filters.category)
        );
      }

      if (filters.isActive !== undefined) {
        templatesQuery = query(
          templatesQuery,
          where('isActive', '==', filters.isActive)
        );
      }

      // Get total count
      const countSnapshot = await getCountFromServer(templatesQuery);
      const total = countSnapshot.data().count;

      // Apply pagination
      if (startAfterDoc) {
        templatesQuery = query(
          templatesQuery,
          startAfter(startAfterDoc),
          limit(pageSize)
        );
      } else {
        templatesQuery = query(
          templatesQuery,
          limit(pageSize)
        );
      }

      // Execute query
      const querySnapshot = await getDocs(templatesQuery);

      // Convert documents to NotificationTemplate objects
      const templates: NotificationTemplate[] = [];
      let lastDoc: QueryDocumentSnapshot<DocumentData> | null = null;

      querySnapshot.forEach((doc) => {
        templates.push(convertDocToTemplate(doc));
        lastDoc = doc;
      });

      // Filter by search term if provided (client-side filtering)
      let filteredTemplates = templates;
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredTemplates = templates.filter(
          (template) =>
            template.title.toLowerCase().includes(searchTerm) ||
            template.message.toLowerCase().includes(searchTerm) ||
            template.category.toLowerCase().includes(searchTerm)
        );
      }

      return {
        data: filteredTemplates,
        total,
        lastDoc
      };
    } catch (error) {
      console.error('Error fetching notification templates:', error);
      throw error;
    }
  },

  /**
   * Create notification template
   */
  createNotificationTemplate: async (templateData: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<NotificationTemplate> => {
    try {
      // Prepare template data for Firestore
      const templateDoc = {
        title: templateData.title,
        message: templateData.message,
        type: templateData.type,
        recipientType: templateData.recipientType,
        category: templateData.category,
        isActive: templateData.isActive,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Add template to Firestore
      const docRef = await addDoc(collection(db, 'notificationTemplates'), templateDoc);

      // Return the created template
      const newTemplateDoc = await getDoc(docRef);
      return convertDocToTemplate(newTemplateDoc);
    } catch (error) {
      console.error('Error creating notification template:', error);
      throw error;
    }
  },

  /**
   * Update notification template
   */
  updateNotificationTemplate: async (id: string, updates: Partial<NotificationTemplate>): Promise<NotificationTemplate> => {
    try {
      const templateRef = doc(db, 'notificationTemplates', id);

      // Prepare update data
      const updateData: any = {
        updatedAt: serverTimestamp(),
      };

      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.message !== undefined) updateData.message = updates.message;
      if (updates.type !== undefined) updateData.type = updates.type;
      if (updates.recipientType !== undefined) updateData.recipientType = updates.recipientType;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.isActive !== undefined) updateData.isActive = updates.isActive;

      // Update Firestore document
      await updateDoc(templateRef, updateData);

      // Get the updated template
      const updatedTemplateDoc = await getDoc(templateRef);
      return convertDocToTemplate(updatedTemplateDoc);
    } catch (error) {
      console.error('Error updating notification template:', error);
      throw error;
    }
  },

  /**
   * Delete notification template
   */
  deleteNotificationTemplate: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'notificationTemplates', id));
    } catch (error) {
      console.error('Error deleting notification template:', error);
      throw error;
    }
  },

  /**
   * Send notification from template
   */
  sendNotificationFromTemplate: async (
    templateId: string,
    recipientIds: string[],
    metadata?: Record<string, any>
  ): Promise<void> => {
    try {
      // Get the template
      const templateDoc = await getDoc(doc(db, 'notificationTemplates', templateId));

      if (!templateDoc.exists()) {
        throw new Error('Notification template not found');
      }

      const templateData = templateDoc.data();

      // Create a batch for multiple notifications
      const batch = writeBatch(db);

      // Create a notification for each recipient
      for (const recipientId of recipientIds) {
        const notificationRef = doc(collection(db, 'notifications'));

        batch.set(notificationRef, {
          title: templateData.title,
          message: templateData.message,
          type: templateData.type,
          recipientId,
          recipientType: templateData.recipientType,
          isRead: false,
          isArchived: false,
          createdAt: serverTimestamp(),
          metadata: metadata || {},
        });
      }

      // Commit the batch
      await batch.commit();
    } catch (error) {
      console.error('Error sending notifications from template:', error);
      throw error;
    }
  },
};

export default notificationService;
