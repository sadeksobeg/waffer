import React from 'react';
import { 
  List, 
  Typography, 
  Box, 
  Button, 
  Divider, 
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';
import { 
  MarkEmailRead as MarkReadIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import NotificationItem from './NotificationItem';
import { Notification } from '@/services/notificationService';
import { useTranslation } from 'next-i18next';

interface NotificationListProps {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
  emptyMessage?: string;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  loading,
  error,
  onMarkAsRead,
  onMarkAllAsRead,
  onArchive,
  onDelete,
  onRefresh,
  emptyMessage = 'No notifications'
}) => {
  const { t } = useTranslation(['common', 'notifications']);
  
  // Check if there are any unread notifications
  const hasUnread = notifications.some(notification => !notification.isRead);
  
  return (
    <Paper elevation={0} variant="outlined" sx={{ height: '100%' }}>
      <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">
          {t('notifications:title')}
        </Typography>
        <Box>
          {hasUnread && (
            <Button
              startIcon={<MarkReadIcon />}
              onClick={onMarkAllAsRead}
              size="small"
              sx={{ mr: 1 }}
            >
              {t('notifications:markAllAsRead')}
            </Button>
          )}
          <Button
            startIcon={<RefreshIcon />}
            onClick={onRefresh}
            size="small"
          >
            {t('common:refresh')}
          </Button>
        </Box>
      </Box>
      
      <Divider />
      
      {error && (
        <Box p={2}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}
      
      {loading ? (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          height="200px"
        >
          <CircularProgress />
        </Box>
      ) : notifications.length === 0 ? (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          height="200px"
        >
          <Typography color="textSecondary">
            {emptyMessage}
          </Typography>
        </Box>
      ) : (
        <List sx={{ width: '100%', p: 2 }}>
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
              onArchive={onArchive}
              onDelete={onDelete}
            />
          ))}
        </List>
      )}
    </Paper>
  );
};

export default NotificationList;
