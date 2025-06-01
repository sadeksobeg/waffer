import React from 'react';
import { 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Typography, 
  IconButton, 
  Box,
  Tooltip,
  Chip,
  useTheme
} from '@mui/material';
import { 
  Info as InfoIcon, 
  CheckCircle as SuccessIcon, 
  Warning as WarningIcon, 
  Error as ErrorIcon,
  MarkEmailRead as MarkReadIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import { format, isToday, isYesterday } from 'date-fns';
import { Notification } from '@/services/notificationService';
import { useRouter } from 'next/router';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onArchive,
  onDelete
}) => {
  const theme = useTheme();
  const router = useRouter();
  
  // Format the notification date
  const formatDate = (date: Date) => {
    if (isToday(date)) {
      return `Today, ${format(date, 'h:mm a')}`;
    } else if (isYesterday(date)) {
      return `Yesterday, ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, yyyy h:mm a');
    }
  };
  
  // Get icon based on notification type
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <SuccessIcon sx={{ color: theme.palette.success.main }} />;
      case 'warning':
        return <WarningIcon sx={{ color: theme.palette.warning.main }} />;
      case 'error':
        return <ErrorIcon sx={{ color: theme.palette.error.main }} />;
      case 'info':
      default:
        return <InfoIcon sx={{ color: theme.palette.info.main }} />;
    }
  };
  
  // Get background color based on read status
  const getBackgroundColor = () => {
    if (!notification.isRead) {
      return theme.palette.action.hover;
    }
    return 'transparent';
  };
  
  // Handle click on notification
  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    
    if (notification.link) {
      router.push(notification.link);
    }
  };
  
  return (
    <ListItem
      alignItems="flex-start"
      sx={{
        backgroundColor: getBackgroundColor(),
        borderRadius: 1,
        mb: 1,
        transition: 'background-color 0.2s',
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        },
        cursor: notification.link ? 'pointer' : 'default',
      }}
      secondaryAction={
        <Box>
          {!notification.isRead && (
            <Tooltip title="Mark as read">
              <IconButton 
                edge="end" 
                aria-label="mark as read" 
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(notification.id);
                }}
                size="small"
              >
                <MarkReadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Archive">
            <IconButton 
              edge="end" 
              aria-label="archive" 
              onClick={(e) => {
                e.stopPropagation();
                onArchive(notification.id);
              }}
              size="small"
            >
              <ArchiveIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton 
              edge="end" 
              aria-label="delete" 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(notification.id);
              }}
              size="small"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      }
      onClick={handleClick}
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: 'transparent' }}>
          {getIcon()}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Box display="flex" alignItems="center" gap={1}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: notification.isRead ? 'normal' : 'bold',
              }}
            >
              {notification.title}
            </Typography>
            {notification.link && (
              <LinkIcon fontSize="small" color="action" />
            )}
          </Box>
        }
        secondary={
          <>
            <Typography
              variant="body2"
              color="text.primary"
              sx={{
                display: 'inline',
                fontWeight: notification.isRead ? 'normal' : 'medium',
              }}
            >
              {notification.message}
            </Typography>
            <Box mt={1} display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="text.secondary">
                {formatDate(notification.createdAt)}
              </Typography>
              <Chip 
                label={notification.recipientType} 
                size="small" 
                variant="outlined"
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            </Box>
          </>
        }
      />
    </ListItem>
  );
};

export default NotificationItem;
