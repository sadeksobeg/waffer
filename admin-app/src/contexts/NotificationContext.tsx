import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from './AuthContext';
import notificationService, { Notification } from '@/services/notificationService';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  archiveNotification: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { userData } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unsubscribe, setUnsubscribe] = useState<(() => void) | null>(null);

  // Helper function to convert Firestore document to Notification
  const convertDocToNotification = (doc: QueryDocumentSnapshot<DocumentData>): Notification => {
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

  // Set up real-time listener for notifications
  const setupNotificationsListener = () => {
    if (!userData) return;

    try {
      // Clear any existing listener
      if (unsubscribe) {
        unsubscribe();
      }

      setLoading(true);
      setError(null);

      // Create query for user's notifications
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('recipientId', '==', userData.id),
        where('isArchived', '==', false),
        orderBy('createdAt', 'desc'),
        limit(20)
      );

      // Set up real-time listener
      const unsubscribeFunc = onSnapshot(
        notificationsQuery,
        (querySnapshot) => {
          const notificationsList: Notification[] = [];
          let unread = 0;

          querySnapshot.forEach((doc) => {
            const notification = convertDocToNotification(doc);
            notificationsList.push(notification);

            if (!notification.isRead) {
              unread++;
            }
          });

          setNotifications(notificationsList);
          setUnreadCount(unread);
          setLoading(false);
        },
        (err) => {
          console.error('Error listening to notifications:', err);
          setError('Failed to load notifications');
          setLoading(false);
        }
      );

      setUnsubscribe(() => unsubscribeFunc);
    } catch (err) {
      console.error('Error setting up notifications listener:', err);
      setError('Failed to load notifications');
      setLoading(false);
    }
  };

  // Set up listener when user data changes
  useEffect(() => {
    setupNotificationsListener();

    // Clean up listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userData]);

  // Mark a notification as read
  const markAsRead = async (id: string) => {
    try {
      await notificationService.updateNotification(id, { isRead: true });
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError('Failed to mark notification as read');
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      if (!userData) return;
      await notificationService.markAllAsRead(userData.id);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError('Failed to mark all notifications as read');
    }
  };

  // Archive a notification
  const archiveNotification = async (id: string) => {
    try {
      await notificationService.updateNotification(id, { isArchived: true });
    } catch (err) {
      console.error('Error archiving notification:', err);
      setError('Failed to archive notification');
    }
  };

  // Delete a notification
  const deleteNotification = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError('Failed to delete notification');
    }
  };

  // Refresh notifications
  const refreshNotifications = () => {
    setupNotificationsListener();
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    deleteNotification,
    refreshNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
