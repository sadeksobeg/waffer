import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Divider,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Person as PersonIcon,
  AccountCircle as AccountIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Api as ApiIcon
} from '@mui/icons-material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import SettingsLayout from '@/components/settings/SettingsLayout';
import { useAuth } from '@/contexts/AuthContext';

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
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
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

export default function SettingsIndexPage() {
  const { t } = useTranslation(['common', 'settings']);
  const { userData } = useAuth();
  const router = useRouter();

  const settingsCategories = [
    {
      title: t('settings:tabs.profile'),
      description: t('settings:profile.indexDescription'),
      icon: <PersonIcon fontSize="large" color="primary" />,
      path: '/dashboard/settings/profile',
      adminOnly: false,
    },
    {
      title: t('settings:tabs.account'),
      description: t('settings:account.indexDescription'),
      icon: <AccountIcon fontSize="large" color="primary" />,
      path: '/dashboard/settings/account',
      adminOnly: false,
    },
    {
      title: t('settings:tabs.notifications'),
      description: t('settings:notifications.indexDescription'),
      icon: <NotificationsIcon fontSize="large" color="primary" />,
      path: '/dashboard/settings/notifications',
      adminOnly: false,
    },
    {
      title: t('settings:tabs.appearance'),
      description: t('settings:appearance.indexDescription'),
      icon: <PaletteIcon fontSize="large" color="primary" />,
      path: '/dashboard/settings/appearance',
      adminOnly: false,
    },
    {
      title: t('settings:tabs.api'),
      description: t('settings:api.indexDescription'),
      icon: <ApiIcon fontSize="large" color="primary" />,
      path: '/dashboard/settings/api',
      adminOnly: false,
    },
    {
      title: t('settings:security.title'),
      description: t('settings:security.indexDescription'),
      icon: <SecurityIcon fontSize="large" color="primary" />,
      path: '/dashboard/settings/security',
      adminOnly: true,
    },
    {
      title: t('settings:system.title'),
      description: t('settings:system.indexDescription'),
      icon: <SettingsIcon fontSize="large" color="primary" />,
      path: '/dashboard/settings/system',
      adminOnly: true,
    },
  ];

  const isAdmin = userData?.role === 'admin';

  const filteredCategories = isAdmin
    ? settingsCategories
    : settingsCategories.filter(category => !category.adminOnly);

  return (
    <DashboardLayout title={t('settings:title')}>
      <SettingsLayout>
        <Typography variant="h6" gutterBottom>
          {t('settings:title')}
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          {t('settings:description')}
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          {filteredCategories.map((category) => (
            <Grid item xs={12} sm={6} md={4} key={category.path}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    {category.icon}
                    <Typography variant="h6" component="div" sx={{ ml: 1 }}>
                      {category.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {category.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => router.push(category.path)}
                    sx={{ ml: 'auto' }}
                  >
                    {t('common:manage')}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box mt={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('settings:quickLinks')}
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <List>
              <ListItem button onClick={() => router.push('/dashboard/settings/profile')}>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText
                  primary={t('settings:tabs.profile')}
                  secondary={t('settings:profile.quickLinkDescription')}
                />
              </ListItem>

              <ListItem button onClick={() => router.push('/dashboard/settings/account')}>
                <ListItemIcon>
                  <AccountIcon />
                </ListItemIcon>
                <ListItemText
                  primary={t('settings:tabs.account')}
                  secondary={t('settings:account.quickLinkDescription')}
                />
              </ListItem>

              <ListItem button onClick={() => router.push('/dashboard/settings/notifications')}>
                <ListItemIcon>
                  <NotificationsIcon />
                </ListItemIcon>
                <ListItemText
                  primary={t('settings:tabs.notifications')}
                  secondary={t('settings:notifications.quickLinkDescription')}
                />
              </ListItem>

              <ListItem button onClick={() => router.push('/dashboard/settings/appearance')}>
                <ListItemIcon>
                  <PaletteIcon />
                </ListItemIcon>
                <ListItemText
                  primary={t('settings:tabs.appearance')}
                  secondary={t('settings:appearance.quickLinkDescription')}
                />
              </ListItem>

              {isAdmin && (
                <>
                  <ListItem button onClick={() => router.push('/dashboard/settings/security')}>
                    <ListItemIcon>
                      <SecurityIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={t('settings:security.title')}
                      secondary={t('settings:security.quickLinkDescription')}
                    />
                  </ListItem>

                  <ListItem button onClick={() => router.push('/dashboard/settings/system')}>
                    <ListItemIcon>
                      <SettingsIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={t('settings:system.title')}
                      secondary={t('settings:system.quickLinkDescription')}
                    />
                  </ListItem>
                </>
              )}
            </List>
          </Paper>
        </Box>
      </SettingsLayout>
    </DashboardLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common', 'settings'])),
    },
  };
};
