import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import {
  Box,
  Typography,
  Button,
  Paper,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import UsersTable from '../../../components/users/UsersTable';
import UserFormDialog from '../../../components/users/UserFormDialog';
import ImportUsersDialog from '../../../components/users/ImportUsersDialog';
import userService, { UserFilters } from '@/services/userService';

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
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function UsersManagement() {
  const { t } = useTranslation(['common', 'users']);
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [openUserForm, setOpenUserForm] = useState(false);
  const [openImportDialog, setOpenImportDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [refreshTable, setRefreshTable] = useState(0);

  // Map tab value to user type
  const getUserType = (): 'customer' | 'merchant' | 'admin' | 'support' => {
    switch (tabValue) {
      case 0: return 'customer';
      case 1: return 'merchant';
      case 2: return 'admin';
      case 3: return 'support';
      default: return 'customer';
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleExportUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create filters based on current tab and search query
      const filters: UserFilters = {
        search: searchQuery,
        role: [getUserType()],
      };

      // Export users to CSV
      const blob = await userService.exportUsers('csv', filters);

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${getUserType()}-users.csv`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess(t('users:messages.exportSuccess'));
    } catch (err) {
      console.error('Error exporting users:', err);
      setError(t('users:messages.exportError'));
    } finally {
      setLoading(false);
    }
  };

  const handleUserSaved = () => {
    // Refresh the table
    setRefreshTable(prev => prev + 1);
    setSuccess(t('users:messages.userSaved'));
  };

  const handleCloseError = () => {
    setError(null);
  };

  const handleCloseSuccess = () => {
    setSuccess(null);
  };

  return (
    <DashboardLayout title={t('users:title')}>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          {t('users:title')}
        </Typography>
        <Typography variant="body1" color="textSecondary">
          {t('users:description')}
        </Typography>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="user management tabs">
            <Tab label={t('users:tabs.customers')} id="user-tab-0" />
            <Tab label={t('users:tabs.merchants')} id="user-tab-1" />
            <Tab label={t('users:tabs.admins')} id="user-tab-2" />
            <Tab label={t('users:tabs.support')} id="user-tab-3" />
          </Tabs>
        </Box>

        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            placeholder={t('common:search')}
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={() => setOpenImportDialog(true)}
              disabled={loading}
            >
              {t('users:actions.import')}
            </Button>

            <Button
              variant="outlined"
              startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
              onClick={handleExportUsers}
              disabled={loading}
            >
              {loading ? t('common:exporting') : t('users:actions.export')}
            </Button>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenUserForm(true)}
              disabled={loading}
            >
              {t('users:actions.addUser')}
            </Button>
          </Box>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <UsersTable
            userType="customer"
            searchQuery={searchQuery}
            key={`customer-${refreshTable}`}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <UsersTable
            userType="merchant"
            searchQuery={searchQuery}
            key={`merchant-${refreshTable}`}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <UsersTable
            userType="admin"
            searchQuery={searchQuery}
            key={`admin-${refreshTable}`}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <UsersTable
            userType="support"
            searchQuery={searchQuery}
            key={`support-${refreshTable}`}
          />
        </TabPanel>
      </Paper>

      <UserFormDialog
        open={openUserForm}
        onClose={() => setOpenUserForm(false)}
        userType={getUserType()}
        onSave={handleUserSaved}
      />

      <ImportUsersDialog
        open={openImportDialog}
        onClose={() => setOpenImportDialog(false)}
        onImportComplete={handleUserSaved}
      />

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
      >
        <Alert onClose={handleCloseError} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={handleCloseSuccess}
      >
        <Alert onClose={handleCloseSuccess} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common', 'users'])),
    },
  };
};
