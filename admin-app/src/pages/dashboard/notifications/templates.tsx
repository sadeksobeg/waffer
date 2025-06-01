import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  InputAdornment,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import DashboardLayout from '@/components/layout/DashboardLayout';
import notificationService, {
  NotificationTemplate,
  NotificationTemplateFilters
} from '@/services/notificationService';

export default function NotificationTemplatesPage() {
  const { t } = useTranslation(['common', 'notifications']);

  // Templates state
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'info' | 'success' | 'warning' | 'error' | ''>('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null);

  // Form state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<NotificationTemplate | null>(null);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'success' | 'warning' | 'error'>('info');
  const [recipientType, setRecipientType] = useState<'user' | 'merchant' | 'admin' | 'all'>('all');
  const [category, setCategory] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Form validation
  const [formErrors, setFormErrors] = useState<{
    title?: string;
    message?: string;
    type?: string;
    recipientType?: string;
    category?: string;
  }>({});

  // Send dialog state
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [recipientIds, setRecipientIds] = useState('');
  const [sendLoading, setSendLoading] = useState(false);

  // Fetch templates
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      // Prepare filters
      const templateFilters: NotificationTemplateFilters = {
        search: searchTerm || undefined,
        type: typeFilter || undefined,
        category: categoryFilter || undefined,
        isActive: activeFilter === null ? undefined : activeFilter,
      };

      // Fetch templates
      const response = await notificationService.getNotificationTemplates(1, 50, templateFilters);
      setTemplates(response.data);
    } catch (err) {
      console.error('Error fetching notification templates:', err);
      setError(t('notifications:fetchTemplatesError'));
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchTemplates();
  }, [searchTerm, typeFilter, categoryFilter, activeFilter]);

  // Validate form
  const validateForm = () => {
    const errors: {
      title?: string;
      message?: string;
      type?: string;
      recipientType?: string;
      category?: string;
    } = {};

    if (!title.trim()) {
      errors.title = t('notifications:errors.titleRequired');
    }

    if (!message.trim()) {
      errors.message = t('notifications:errors.messageRequired');
    }

    if (!type) {
      errors.type = t('notifications:errors.typeRequired');
    }

    if (!recipientType) {
      errors.recipientType = t('notifications:errors.recipientTypeRequired');
    }

    if (!category.trim()) {
      errors.category = t('notifications:errors.categoryRequired');
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open create dialog
  const handleOpenCreateDialog = () => {
    setIsEditMode(false);
    setCurrentTemplate(null);
    setTitle('');
    setMessage('');
    setType('info');
    setRecipientType('all');
    setCategory('');
    setIsActive(true);
    setFormErrors({});
    setIsDialogOpen(true);
  };

  // Open edit dialog
  const handleOpenEditDialog = (template: NotificationTemplate) => {
    setIsEditMode(true);
    setCurrentTemplate(template);
    setTitle(template.title);
    setMessage(template.message);
    setType(template.type);
    setRecipientType(template.recipientType);
    setCategory(template.category);
    setIsActive(template.isActive);
    setFormErrors({});
    setIsDialogOpen(true);
  };

  // Open send dialog
  const handleOpenSendDialog = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setRecipientIds('');
    setIsSendDialogOpen(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  // Close send dialog
  const handleCloseSendDialog = () => {
    setIsSendDialogOpen(false);
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isEditMode && currentTemplate) {
        // Update template
        await notificationService.updateNotificationTemplate(currentTemplate.id, {
          title,
          message,
          type,
          recipientType,
          category,
          isActive,
        });

        setSuccess(t('notifications:updateTemplateSuccess'));
      } else {
        // Create template
        await notificationService.createNotificationTemplate({
          title,
          message,
          type,
          recipientType,
          category,
          isActive,
        });

        setSuccess(t('notifications:createTemplateSuccess'));
      }

      // Close dialog and refresh templates
      setIsDialogOpen(false);
      fetchTemplates();
    } catch (err) {
      console.error('Error saving notification template:', err);
      setError(isEditMode
        ? t('notifications:updateTemplateError')
        : t('notifications:createTemplateError')
      );
    } finally {
      setLoading(false);
    }
  };

  // Delete template
  const handleDelete = async (id: string) => {
    if (!window.confirm(t('notifications:confirmDeleteTemplate'))) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await notificationService.deleteNotificationTemplate(id);
      setSuccess(t('notifications:deleteTemplateSuccess'));
      fetchTemplates();
    } catch (err) {
      console.error('Error deleting notification template:', err);
      setError(t('notifications:deleteTemplateError'));
    } finally {
      setLoading(false);
    }
  };

  // Send notification from template
  const handleSendNotification = async () => {
    if (!selectedTemplateId || !recipientIds.trim()) {
      return;
    }

    setSendLoading(true);
    setError(null);

    try {
      // Split recipient IDs by comma, newline, or space
      const ids = recipientIds
        .split(/[\s,]+/)
        .map(id => id.trim())
        .filter(id => id);

      await notificationService.sendNotificationFromTemplate(selectedTemplateId, ids);
      setSuccess(t('notifications:sendNotificationSuccess'));
      setIsSendDialogOpen(false);
    } catch (err) {
      console.error('Error sending notification from template:', err);
      setError(t('notifications:sendNotificationError'));
    } finally {
      setSendLoading(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchTemplates();
  };

  // Handle close error
  const handleCloseError = () => {
    setError(null);
  };

  // Handle close success
  const handleCloseSuccess = () => {
    setSuccess(null);
  };

  // Get chip color based on notification type
  const getChipColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'info':
      default:
        return 'info';
    }
  };

  return (
    <DashboardLayout title={t('notifications:templatesTitle')}>
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
          {t('notifications:templatesTitle')}
        </Typography>
        <Typography variant="body1" color="textSecondary">
          {t('notifications:templatesDescription')}
        </Typography>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
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

          <Grid item xs={12} sm={6} md={2}>
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

          <Grid item xs={12} sm={6} md={2}>
            <TextField
              label={t('notifications:categoryFilter')}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              fullWidth
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('notifications:activeFilter')}</InputLabel>
              <Select
                value={activeFilter === null ? '' : activeFilter ? 'active' : 'inactive'}
                onChange={(e) => {
                  const value = e.target.value;
                  setActiveFilter(value === 'active' ? true : value === 'inactive' ? false : null);
                }}
                label={t('notifications:activeFilter')}
              >
                <MenuItem value="">{t('common:all')}</MenuItem>
                <MenuItem value="active">{t('notifications:active')}</MenuItem>
                <MenuItem value="inactive">{t('notifications:inactive')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={1}>
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

          <Grid item xs={12} sm={6} md={2}>
            <Button
              startIcon={<AddIcon />}
              onClick={handleOpenCreateDialog}
              fullWidth
              variant="contained"
              color="primary"
              size="medium"
            >
              {t('notifications:createTemplate')}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('notifications:title')}</TableCell>
                <TableCell>{t('notifications:category')}</TableCell>
                <TableCell>{t('notifications:type')}</TableCell>
                <TableCell>{t('notifications:recipientType')}</TableCell>
                <TableCell>{t('notifications:status')}</TableCell>
                <TableCell>{t('common:createdAt')}</TableCell>
                <TableCell align="right">{t('common:actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : templates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography color="textSecondary">
                      {t('notifications:noTemplates')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>{template.title}</TableCell>
                    <TableCell>
                      <Chip
                        label={template.category}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={t(`notifications:types.${template.type}`)}
                        size="small"
                        color={getChipColor(template.type) as any}
                      />
                    </TableCell>
                    <TableCell>
                      {t(`notifications:recipients.${template.recipientType}`)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={template.isActive ? t('notifications:active') : t('notifications:inactive')}
                        size="small"
                        color={template.isActive ? 'success' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {format(template.createdAt, 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenSendDialog(template.id)}
                        color="primary"
                      >
                        <SendIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenEditDialog(template)}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(template.id)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Create/Edit Template Dialog */}
      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditMode
            ? t('notifications:editTemplate')
            : t('notifications:createTemplate')
          }
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label={t('notifications:title')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
                required
                error={!!formErrors.title}
                helperText={formErrors.title}
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
                error={!!formErrors.message}
                helperText={formErrors.message}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.type}>
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
                {formErrors.type && <FormHelperText>{formErrors.type}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.recipientType}>
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
                {formErrors.recipientType && <FormHelperText>{formErrors.recipientType}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label={t('notifications:category')}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                fullWidth
                required
                error={!!formErrors.category}
                helperText={formErrors.category || t('notifications:categoryHelp')}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    color="primary"
                  />
                }
                label={t('notifications:isActive')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {t('common:cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? t('common:saving') : t('common:save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Send Notification Dialog */}
      <Dialog open={isSendDialogOpen} onClose={handleCloseSendDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {t('notifications:sendNotification')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <TextField
              label={t('notifications:recipientIds')}
              value={recipientIds}
              onChange={(e) => setRecipientIds(e.target.value)}
              fullWidth
              multiline
              rows={4}
              required
              helperText={t('notifications:recipientIdsHelp')}
              sx={{ mb: 2 }}
            />

            <Typography variant="body2" color="textSecondary">
              {t('notifications:sendNotificationHelp')}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSendDialog}>
            {t('common:cancel')}
          </Button>
          <Button
            onClick={handleSendNotification}
            variant="contained"
            color="primary"
            disabled={sendLoading || !recipientIds.trim()}
            startIcon={sendLoading ? <CircularProgress size={20} /> : <SendIcon />}
          >
            {sendLoading ? t('common:sending') : t('notifications:send')}
          </Button>
        </DialogActions>
      </Dialog>
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
