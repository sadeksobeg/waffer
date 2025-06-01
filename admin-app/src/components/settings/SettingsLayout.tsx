import React, { ReactNode, useState } from 'react';
import {
  Box,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Drawer,
  IconButton,
  Breadcrumbs,
  Link,
  Typography
} from '@mui/material';
import {
  Person as PersonIcon,
  AccountCircle as AccountIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Security as SecurityIcon,
  VpnKey as ApiIcon,
  Webhook as WebhookIcon,
  Settings as SystemIcon,
  Menu as MenuIcon,
  Home as HomeIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/contexts/AuthContext';

interface SettingsLayoutProps {
  children: ReactNode;
}

const SettingsLayout: React.FC<SettingsLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation(['settings', 'common']);
  const { userData } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = userData?.role === 'admin';

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    {
      key: 'profile',
      label: t('menu.profile'),
      icon: <PersonIcon />,
      path: '/dashboard/settings/profile',
      roles: ['admin', 'merchant', 'support'],
    },
    {
      key: 'account',
      label: t('menu.account'),
      icon: <AccountIcon />,
      path: '/dashboard/settings/account',
      roles: ['admin', 'merchant', 'support'],
    },
    {
      key: 'notifications',
      label: t('menu.notifications'),
      icon: <NotificationsIcon />,
      path: '/dashboard/settings/notifications',
      roles: ['admin', 'merchant', 'support'],
    },
    {
      key: 'appearance',
      label: t('menu.appearance'),
      icon: <PaletteIcon />,
      path: '/dashboard/settings/appearance',
      roles: ['admin', 'merchant', 'support'],
    },
    {
      key: 'security',
      label: t('menu.security'),
      icon: <SecurityIcon />,
      path: '/dashboard/settings/security',
      roles: ['admin'],
    },
    {
      key: 'api',
      label: t('menu.api'),
      icon: <ApiIcon />,
      path: '/dashboard/settings/api',
      roles: ['admin', 'merchant'],
    },
    {
      key: 'webhooks',
      label: t('menu.webhooks'),
      icon: <WebhookIcon />,
      path: '/dashboard/settings/webhooks',
      roles: ['admin', 'merchant'],
    },
    {
      key: 'system',
      label: t('menu.system'),
      icon: <SystemIcon />,
      path: '/dashboard/settings/system',
      roles: ['admin'],
    },
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item =>
    userData?.role ? item.roles.includes(userData.role) : false
  );

  // Get current page title for breadcrumbs
  const getCurrentPageTitle = () => {
    const currentPath = router.pathname;
    const currentMenuItem = menuItems.find(item => item.path === currentPath);
    return currentMenuItem?.label || t('settings:title');
  };

  const handleMenuItemClick = (path: string) => {
    router.push(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <List component="nav" aria-label="settings navigation">
      {filteredMenuItems.map((item) => (
        <ListItem key={item.key} disablePadding>
          <ListItemButton
            selected={router.pathname === item.path}
            onClick={() => handleMenuItemClick(item.path)}
          >
            <ListItemIcon
              sx={{
                color: router.pathname === item.path ? 'primary.main' : 'inherit',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              sx={{
                color: router.pathname === item.path ? 'primary.main' : 'inherit',
              }}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );

  const drawerWidth = 280;

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        aria-label="breadcrumb"
        separator={<ChevronRightIcon fontSize="small" />}
        sx={{ mb: 3 }}
      >
        <Link
          color="inherit"
          href="/dashboard"
          onClick={(e) => {
            e.preventDefault();
            router.push('/dashboard');
          }}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          {t('common:dashboard')}
        </Link>
        <Link
          color="inherit"
          href="/dashboard/settings"
          onClick={(e) => {
            e.preventDefault();
            router.push('/dashboard/settings');
          }}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <SystemIcon sx={{ mr: 0.5 }} fontSize="small" />
          {t('settings:title')}
        </Link>
        {router.pathname !== '/dashboard/settings' && (
          <Typography color="textPrimary">
            {getCurrentPageTitle()}
          </Typography>
        )}
      </Breadcrumbs>

      <Grid container spacing={3}>
        {/* Mobile drawer toggle */}
        {isMobile && (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="subtitle1">
                {t('settings:menu')}
              </Typography>
            </Box>
          </Grid>
        )}

        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop sidebar */}
        {!isMobile && (
          <Grid item xs={12} md={3} lg={2}>
            <Paper sx={{ height: '100%' }}>
              {drawer}
            </Paper>
          </Grid>
        )}

        {/* Main content */}
        <Grid item xs={12} md={9} lg={10}>
          {children}
        </Grid>
      </Grid>
    </Box>
  );
};

export default SettingsLayout;
