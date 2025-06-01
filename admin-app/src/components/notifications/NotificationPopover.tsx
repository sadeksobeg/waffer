import React, { useState } from 'react';
import { 
  IconButton, 
  Badge, 
  Popover, 
  Box, 
  Typography, 
  Divider, 
  List,
  Button,
  CircularProgress,
  useTheme
} from '@mui/material';
import { 
  Notifications as NotificationsIcon,
  MarkEmailRead as MarkReadIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import NotificationItem from './NotificationItem';
import { useNotifications } from '@/contexts/NotificationContext';

const NotificationPopover: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation(['common', 'notifications']);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    archiveNotification, 
    deleteNotification 
  } = useNotifications();
  
  // Show only the 5 most recent notifications in the popover
  const recentNotifications = notifications.slice(0, 5);
  
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleViewAll = () => {
    router.push('/dashboard/notifications');
    handleClose();
  };
  
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };
  
  const open = Boolean(anchorEl);
  const id = open ? 'notifications-popover' : undefined;
  
  return (
    <>
      <IconButton
        color="inherit"
        aria-label="notifications"
        onClick={handleClick}
        size="large"
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 500,
            overflow: 'hidden',
            mt: 1,
          },
        }}
      >
        <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {t('notifications:notifications')}
          </Typography>
          {unreadCount > 0 && (
            <Button
              startIcon={<MarkReadIcon />}
              onClick={handleMarkAllAsRead}
              size="small"
            >
              {t('notifications:markAllAsRead')}
            </Button>
          )}
        </Box>
        
        <Divider />
        
        <Box sx={{ maxHeight: 350, overflow: 'auto' }}>
          {loading ? (
            <Box 
              display="flex" 
              justifyContent="center" 
              alignItems="center" 
              height={200}
            >
              <CircularProgress size={30} />
            </Box>
          ) : recentNotifications.length === 0 ? (
            <Box 
              display="flex" 
              justifyContent="center" 
              alignItems="center" 
              height={200}
            >
              <Typography color="textSecondary">
                {t('notifications:noNotifications')}
              </Typography>
            </Box>
          ) : (
            <List sx={{ width: '100%', p: 0 }}>
              {recentNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onArchive={archiveNotification}
                  onDelete={deleteNotification}
                />
              ))}
            </List>
          )}
        </Box>
        
        <Divider />
        
        <Box p={1.5} display="flex" justifyContent="center">
          <Button
            endIcon={<ArrowForwardIcon />}
            onClick={handleViewAll}
            fullWidth
            variant="text"
          >
            {t('notifications:viewAll')}
          </Button>
        </Box>
      </Popover>
    </>
  );
};

export default NotificationPopover;
