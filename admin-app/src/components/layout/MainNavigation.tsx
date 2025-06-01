import React from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Store as StoreIcon,
  LocalOffer as CouponIcon,
  BarChart as AnalyticsIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface NavigationItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  roles: string[];
}

interface MainNavigationProps {
  open: boolean;
}

export default function MainNavigation({ open }: MainNavigationProps) {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { userData } = useAuth();

  const navigationItems: NavigationItem[] = [
    {
      key: 'dashboard',
      label: t('navigation.dashboard'),
      icon: <DashboardIcon />,
      path: '/dashboard',
      roles: ['admin', 'merchant', 'support'],
    },
    {
      key: 'users',
      label: t('navigation.users'),
      icon: <PeopleIcon />,
      path: '/dashboard/users',
      roles: ['admin'],
    },
    {
      key: 'stores',
      label: t('navigation.stores'),
      icon: <StoreIcon />,
      path: '/dashboard/stores',
      roles: ['admin', 'merchant'],
    },
    {
      key: 'coupons',
      label: t('navigation.coupons'),
      icon: <CouponIcon />,
      path: '/dashboard/coupons',
      roles: ['admin', 'merchant'],
    },
    {
      key: 'analytics',
      label: t('navigation.analytics'),
      icon: <AnalyticsIcon />,
      path: '/dashboard/analytics',
      roles: ['admin', 'merchant'],
    },
    {
      key: 'notifications',
      label: t('navigation.notifications'),
      icon: <NotificationsIcon />,
      path: '/dashboard/notifications',
      roles: ['admin', 'support'],
    },
    {
      key: 'notification-templates',
      label: t('navigation.notificationTemplates'),
      icon: <NotificationsIcon />,
      path: '/dashboard/notifications/templates',
      roles: ['admin'],
    },
    {
      key: 'settings',
      label: t('navigation.settings'),
      icon: <SettingsIcon />,
      path: '/dashboard/settings',
      roles: ['admin', 'merchant', 'support'],
    },
  ];

  // Filter navigation items based on user role
  const filteredItems = navigationItems.filter(item =>
    userData?.role ? item.roles.includes(userData.role) : false
  );

  return (
    <>
      <List>
        {filteredItems.map((item) => (
          <ListItem key={item.key} disablePadding sx={{ display: 'block' }}>
            <Tooltip title={open ? '' : item.label} placement="right">
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  backgroundColor: router.pathname === item.path ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                }}
                onClick={() => router.push(item.path)}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                    color: router.pathname === item.path ? 'primary.main' : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  sx={{
                    opacity: open ? 1 : 0,
                    color: router.pathname === item.path ? 'primary.main' : 'inherit',
                  }}
                />
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>
    </>
  );
}
