import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  Grid,
  Paper,
  Typography,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useTranslation } from 'next-i18next';
import { Send as SendIcon } from '@mui/icons-material';
import notificationService from '@/services/notificationService';

interface NotificationFormProps {
  onSuccess?: () => void;
}

const NotificationForm: React.FC<NotificationFormProps> = ({ onSuccess }) => {
  const { t } = useTranslation(['common', 'notifications']);
  
  // Form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'success' | 'warning' | 'error'>('info');
  const [recipientType, setRecipientType] = useState<'user' | 'merchant' | 'admin' | 'all'>('all');
  const [link, setLink] = useState('');
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form validation
  const [errors, setErrors] = useState<{
    title?: string;
    message?: string;
    type?: string;
    recipientType?: string;
    link?: string;
  }>({});
  
  const validateForm = () => {
    const newErrors: {
      title?: string;
      message?: string;
      type?: string;
      recipientType?: string;
      link?: string;
    } = {};
    
    if (!title.trim()) {
      newErrors.title = t('notifications:errors.titleRequired');
    }
    
    if (!message.trim()) {
      newErrors.message = t('notifications:errors.messageRequired');
    }
    
    if (!type) {
      newErrors.type = t('notifications:errors.typeRequired');
    }
    
    if (!recipientType) {
      newErrors.recipientType = t('notifications:errors.recipientTypeRequired');
    }
    
    if (link && !link.startsWith('/') && !link.startsWith('http')) {
      newErrors.link = t('notifications:errors.invalidLink');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await notificationService.createNotification({
        title,
        message,
        type,
        recipientType,
        link: link || undefined,
        expiresAt: expiresAt || undefined,
      });
      
      setSuccess(t('notifications:createSuccess'));
      
      // Reset form
      setTitle('');
      setMessage('');
      setType('info');
      setRecipientType('all');
      setLink('');
      setExpiresAt(null);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error creating notification:', err);
      setError(t('notifications:createError'));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Paper elevation={0} variant="outlined">
      <Box p={3}>
        <Typography variant="h6" gutterBottom>
          {t('notifications:createNotification')}
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          {t('notifications:createDescription')}
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label={t('notifications:title')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
                required
                error={!!errors.title}
                helperText={errors.title}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label={t('notifications:message')}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                fullWidth
                required
                multiline
                rows={4}
                error={!!errors.message}
                helperText={errors.message}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.type}>
                <InputLabel>{t('notifications:type')}</InputLabel>
                <Select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  label={t('notifications:type')}
                  required
                >
                  <MenuItem value="info">{t('notifications:types.info')}</MenuItem>
                  <MenuItem value="success">{t('notifications:types.success')}</MenuItem>
                  <MenuItem value="warning">{t('notifications:types.warning')}</MenuItem>
                  <MenuItem value="error">{t('notifications:types.error')}</MenuItem>
                </Select>
                {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.recipientType}>
                <InputLabel>{t('notifications:recipientType')}</InputLabel>
                <Select
                  value={recipientType}
                  onChange={(e) => setRecipientType(e.target.value as any)}
                  label={t('notifications:recipientType')}
                  required
                >
                  <MenuItem value="user">{t('notifications:recipients.user')}</MenuItem>
                  <MenuItem value="merchant">{t('notifications:recipients.merchant')}</MenuItem>
                  <MenuItem value="admin">{t('notifications:recipients.admin')}</MenuItem>
                  <MenuItem value="all">{t('notifications:recipients.all')}</MenuItem>
                </Select>
                {errors.recipientType && <FormHelperText>{errors.recipientType}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label={t('notifications:link')}
                value={link}
                onChange={(e) => setLink(e.target.value)}
                fullWidth
                placeholder="/dashboard/coupons"
                error={!!errors.link}
                helperText={errors.link || t('notifications:linkHelp')}
              />
            </Grid>
            
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label={t('notifications:expiresAt')}
                  value={expiresAt}
                  onChange={(newValue) => setExpiresAt(newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      helperText: t('notifications:expiresAtHelp'),
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end">
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                  disabled={loading}
                >
                  {loading ? t('common:sending') : t('notifications:send')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Paper>
  );
};

export default NotificationForm;
