import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import {
  Box,
  Typography,
  Divider,
  Grid,
  Paper,
  Button,
  TextField,
  IconButton,
  InputAdornment,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ContentCopy as CopyIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

// Define API key interface
interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string | null;
  permissions: string[];
}

// Mock API keys
const mockApiKeys: ApiKey[] = [
  {
    id: 'key1',
    name: 'Production API Key',
    key: 'pk_live_51HxSs7JkLIEz9hXcwRYzA8VyiS1tNyZBCCIVlynSMvHqqDJLIQXs4nBIlnIUbDwS9sRSFl7Nqgj2k6bFtizKe00j200I9qhVmP',
    createdAt: '2023-01-15T10:30:00Z',
    lastUsed: '2023-05-10T14:22:00Z',
    permissions: ['read', 'write'],
  },
  {
    id: 'key2',
    name: 'Development API Key',
    key: 'pk_test_51HxSs7JkLIEz9hXcRYzA8VyiS1tNyZBCCIVlynSMvHqqDJLIQXs4nBIlnIUbDwS9sRSFl7Nqgj2k6bFtizKe00j200I9qhVmP',
    createdAt: '2023-02-20T08:15:00Z',
    lastUsed: '2023-05-11T09:45:00Z',
    permissions: ['read'],
  },
];

// Define Webhook interface
interface Webhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: string;
}

// Mock webhooks
const mockWebhooks: Webhook[] = [
  {
    id: 'webhook1',
    url: 'https://example.com/webhook/coupon-events',
    events: ['coupon.created', 'coupon.redeemed'],
    active: true,
    createdAt: '2023-03-10T11:20:00Z',
  },
  {
    id: 'webhook2',
    url: 'https://example.com/webhook/user-events',
    events: ['user.created', 'user.updated'],
    active: false,
    createdAt: '2023-04-05T15:40:00Z',
  },
];

export default function ApiSettings() {
  const { t } = useTranslation(['common', 'settings']);
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [openNewKeyDialog, setOpenNewKeyDialog] = useState(false);
  const [openNewWebhookDialog, setOpenNewWebhookDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyPermissions, setNewKeyPermissions] = useState<string[]>(['read']);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newWebhookEvents, setNewWebhookEvents] = useState<string[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(mockApiKeys);
  const [webhooks, setWebhooks] = useState<Webhook[]>(mockWebhooks);
  const [showCopiedAlert, setShowCopiedAlert] = useState(false);

  const toggleShowApiKey = (keyId: string) => {
    setShowApiKey(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const handleCopyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setShowCopiedAlert(true);
    setTimeout(() => {
      setShowCopiedAlert(false);
    }, 3000);
  };

  const handleDeleteApiKey = (keyId: string) => {
    setApiKeys(prev => prev.filter(key => key.id !== keyId));
  };

  const handleDeleteWebhook = (webhookId: string) => {
    setWebhooks(prev => prev.filter(webhook => webhook.id !== webhookId));
  };

  const handleToggleWebhook = (webhookId: string) => {
    setWebhooks(prev => prev.map(webhook =>
      webhook.id === webhookId
        ? { ...webhook, active: !webhook.active }
        : webhook
    ));
  };

  const handleCreateApiKey = () => {
    // In a real app, you would call an API to create a new key
    const newKey: ApiKey = {
      id: `key${apiKeys.length + 1}`,
      name: newKeyName,
      key: `pk_test_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      createdAt: new Date().toISOString(),
      lastUsed: null,
      permissions: newKeyPermissions,
    };

    setApiKeys(prev => [...prev, newKey]);
    setNewKeyName('');
    setNewKeyPermissions(['read']);
    setOpenNewKeyDialog(false);
  };

  const handleCreateWebhook = () => {
    // In a real app, you would call an API to create a new webhook
    const newWebhook: Webhook = {
      id: `webhook${webhooks.length + 1}`,
      url: newWebhookUrl,
      events: newWebhookEvents,
      active: true,
      createdAt: new Date().toISOString(),
    };

    setWebhooks(prev => [...prev, newWebhook]);
    setNewWebhookUrl('');
    setNewWebhookEvents([]);
    setOpenNewWebhookDialog(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('settings:api.title')}
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        {t('settings:api.description')}
      </Typography>

      {showCopiedAlert && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          onClose={() => setShowCopiedAlert(false)}
        >
          {t('settings:api.keyCopied')}
        </Alert>
      )}

      <Divider sx={{ my: 3 }} />

      {/* API Keys */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            {t('settings:api.apiKeys')}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenNewKeyDialog(true)}
          >
            {t('settings:api.createKey')}
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('settings:api.name')}</TableCell>
                <TableCell>{t('settings:api.key')}</TableCell>
                <TableCell>{t('settings:api.created')}</TableCell>
                <TableCell>{t('settings:api.lastUsed')}</TableCell>
                <TableCell>{t('settings:api.permissions')}</TableCell>
                <TableCell align="right">{t('common:actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {apiKeys.map((apiKey) => (
                <TableRow key={apiKey.id}>
                  <TableCell>{apiKey.name}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TextField
                        value={showApiKey[apiKey.id] ? apiKey.key : '•'.repeat(20)}
                        variant="outlined"
                        size="small"
                        InputProps={{
                          readOnly: true,
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => toggleShowApiKey(apiKey.id)}
                                edge="end"
                              >
                                {showApiKey[apiKey.id] ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                              <IconButton
                                onClick={() => handleCopyApiKey(apiKey.key)}
                                edge="end"
                              >
                                <CopyIcon />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{ minWidth: 300 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>{formatDate(apiKey.createdAt)}</TableCell>
                  <TableCell>{apiKey.lastUsed ? formatDate(apiKey.lastUsed) : '-'}</TableCell>
                  <TableCell>
                    {apiKey.permissions.map(permission => (
                      <Chip
                        key={permission}
                        label={permission}
                        size="small"
                        sx={{ mr: 0.5 }}
                      />
                    ))}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteApiKey(apiKey.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Webhooks */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            {t('settings:api.webhooks')}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenNewWebhookDialog(true)}
          >
            {t('settings:api.createWebhook')}
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('settings:api.url')}</TableCell>
                <TableCell>{t('settings:api.events')}</TableCell>
                <TableCell>{t('settings:api.status')}</TableCell>
                <TableCell>{t('settings:api.created')}</TableCell>
                <TableCell align="right">{t('common:actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {webhooks.map((webhook) => (
                <TableRow key={webhook.id}>
                  <TableCell>{webhook.url}</TableCell>
                  <TableCell>
                    {webhook.events.map(event => (
                      <Chip
                        key={event}
                        label={event}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={webhook.active ? t('settings:api.active') : t('settings:api.inactive')}
                      color={webhook.active ? 'success' : 'default'}
                      onClick={() => handleToggleWebhook(webhook.id)}
                    />
                  </TableCell>
                  <TableCell>{formatDate(webhook.createdAt)}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteWebhook(webhook.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* New API Key Dialog */}
      <Dialog
        open={openNewKeyDialog}
        onClose={() => setOpenNewKeyDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('settings:api.createKey')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label={t('settings:api.keyName')}
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>{t('settings:api.permissions')}</InputLabel>
                <Select
                  multiple
                  value={newKeyPermissions}
                  onChange={(e) => setNewKeyPermissions(e.target.value as string[])}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  <MenuItem value="read">{t('settings:api.readPermission')}</MenuItem>
                  <MenuItem value="write">{t('settings:api.writePermission')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewKeyDialog(false)}>
            {t('common:cancel')}
          </Button>
          <Button
            onClick={handleCreateApiKey}
            variant="contained"
            disabled={!newKeyName}
          >
            {t('settings:api.create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Webhook Dialog */}
      <Dialog
        open={openNewWebhookDialog}
        onClose={() => setOpenNewWebhookDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('settings:api.createWebhook')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label={t('settings:api.webhookUrl')}
                value={newWebhookUrl}
                onChange={(e) => setNewWebhookUrl(e.target.value)}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>{t('settings:api.events')}</InputLabel>
                <Select
                  multiple
                  value={newWebhookEvents}
                  onChange={(e) => setNewWebhookEvents(e.target.value as string[])}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  <MenuItem value="coupon.created">{t('settings:api.events.couponCreated')}</MenuItem>
                  <MenuItem value="coupon.updated">{t('settings:api.events.couponUpdated')}</MenuItem>
                  <MenuItem value="coupon.redeemed">{t('settings:api.events.couponRedeemed')}</MenuItem>
                  <MenuItem value="user.created">{t('settings:api.events.userCreated')}</MenuItem>
                  <MenuItem value="user.updated">{t('settings:api.events.userUpdated')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewWebhookDialog(false)}>
            {t('common:cancel')}
          </Button>
          <Button
            onClick={handleCreateWebhook}
            variant="contained"
            disabled={!newWebhookUrl || newWebhookEvents.length === 0}
          >
            {t('settings:api.create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
