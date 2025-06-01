import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { 
  Box, 
  Typography, 
  Grid, 
  Tabs, 
  Tab, 
  Paper,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import NotificationList from '@/components/notifications/NotificationList';
import NotificationForm from '@/components/notifications/NotificationForm';
import notificationService, { 
  Notification, 
  NotificationFilters 
} from '@/services/notificationService';
import { useNotifications } from '@/contexts/NotificationContext';

// Tab panel component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`notifications-tabpanel-${index}`}
      aria-labelledby={`notifications-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function NotificationsPage() {
  const { t } = useTranslation(['common', 'notifications']);
  const { 
    notifications: recentNotifications, 
    markAsRead, 
    markAllAsRead, 
    archiveNotification, 
    deleteNotification,
    refreshNotifications
  } = useNotifications();
  
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [archivedNotifications, setArchivedNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filter state
  const [filters, setFilters] = useState<NotificationFilters>({
    isArchived: false,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'info' | 'success' | 'warning' | 'error' | ''>('');
  const [readFilter, setReadFilter] = useState<'read' | 'unread' | ''>('');
  
  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Prepare filters
      const notificationFilters: NotificationFilters = {
        ...filters,
        search: searchTerm || undefined,
        type: typeFilter || undefined,
        isRead: readFilter === 'read' ? true : readFilter === 'unread' ? false : undefined,
      };
      
      // Fetch notifications
      const response = await notificationService.getNotifications(1, 50, notificationFilters);
      
      if (filters.isArchived) {
        setArchivedNotifications(response.data);
      } else {
        setNotifications(response.data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(t('notifications:fetchError'));
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [filters, searchTerm, typeFilter, readFilter]);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    
    // Update filters based on tab
    if (newValue === 0) {
      // All notifications
      setFilters({ isArchived: false });
    } else if (newValue === 1) {
      // Archived notifications
      setFilters({ isArchived: true });
    }
  };
  
  // Handle mark as read
  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      fetchNotifications();
      setSuccess(t('notifications:markAsReadSuccess'));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError(t('notifications:markAsReadError'));
    }
  };
  
  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      fetchNotifications();
      setSuccess(t('notifications:markAllAsReadSuccess'));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError(t('notifications:markAllAsReadError'));
    }
  };
  
  // Handle archive
  const handleArchive = async (id: string) => {
    try {
      await archiveNotification(id);
      fetchNotifications();
      refreshNotifications();
      setSuccess(t('notifications:archiveSuccess'));
    } catch (err) {
      console.error('Error archiving notification:', err);
      setError(t('notifications:archiveError'));
    }
  };
  
  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      fetchNotifications();
      refreshNotifications();
      setSuccess(t('notifications:deleteSuccess'));
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError(t('notifications:deleteError'));
    }
  };
  
  // Handle refresh
  const handleRefresh = () => {
    fetchNotifications();
    refreshNotifications();
  };
  
  // Handle notification creation success
  const handleNotificationCreated = () => {
    fetchNotifications();
    refreshNotifications();
  };
  
  // Handle close error
  const handleCloseError = () => {
    setError(null);
  };
  
  // Handle close success
  const handleCloseSuccess = () => {
    setSuccess(null);
  };
  
  return (
    <DashboardLayout title={t('notifications:title')}>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error">
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar open={!!success} autoHideDuration={3000} onClose={handleCloseSuccess}>
        <Alert onClose={handleCloseSuccess} severity="success">
          {success}
        </Alert>
      </Snackbar>
      
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          {t('notifications:title')}
        </Typography>
        <Typography variant="body1" color="textSecondary">
          {t('notifications:description')}
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="notification tabs"
              variant="fullWidth"
            >
              <Tab label={t('notifications:tabs.all')} id="notifications-tab-0" />
              <Tab label={t('notifications:tabs.archived')} id="notifications-tab-1" />
            </Tabs>
            
            <Box p={2}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label={t('common:search')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    fullWidth
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>{t('notifications:typeFilter')}</InputLabel>
                    <Select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value as any)}
                      label={t('notifications:typeFilter')}
                    >
                      <MenuItem value="">{t('common:all')}</MenuItem>
                      <MenuItem value="info">{t('notifications:types.info')}</MenuItem>
                      <MenuItem value="success">{t('notifications:types.success')}</MenuItem>
                      <MenuItem value="warning">{t('notifications:types.warning')}</MenuItem>
                      <MenuItem value="error">{t('notifications:types.error')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>{t('notifications:readFilter')}</InputLabel>
                    <Select
                      value={readFilter}
                      onChange={(e) => setReadFilter(e.target.value as any)}
                      label={t('notifications:readFilter')}
                    >
                      <MenuItem value="">{t('common:all')}</MenuItem>
                      <MenuItem value="read">{t('notifications:read')}</MenuItem>
                      <MenuItem value="unread">{t('notifications:unread')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={2}>
                  <Button
                    startIcon={<RefreshIcon />}
                    onClick={handleRefresh}
                    fullWidth
                    variant="outlined"
                    size="medium"
                  >
                    {t('common:refresh')}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
          
          <TabPanel value={tabValue} index={0}>
            <NotificationList
              notifications={notifications}
              loading={loading}
              error={null}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
              onArchive={handleArchive}
              onDelete={handleDelete}
              onRefresh={handleRefresh}
              emptyMessage={t('notifications:noNotifications')}
            />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <NotificationList
              notifications={archivedNotifications}
              loading={loading}
              error={null}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
              onArchive={handleArchive}
              onDelete={handleDelete}
              onRefresh={handleRefresh}
              emptyMessage={t('notifications:noArchivedNotifications')}
            />
          </TabPanel>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <NotificationForm onSuccess={handleNotificationCreated} />
        </Grid>
      </Grid>
    </DashboardLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common', 'notifications'])),
    },
  };
};
