import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import {
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  Divider,
  useMediaQuery,
  styled,
  Theme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Language as LanguageIcon,
  AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';
import MainNavigation from './MainNavigation';
import UserMenu from './UserMenu';
import NotificationPopover from '../notifications/NotificationPopover';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationProvider } from '../../contexts/NotificationContext';
import { useTheme } from '@mui/material/styles';

const drawerWidth = 240;

const openedMixin = (theme: Theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

interface AppBarProps {
  open?: boolean;
}

const AppBarStyled = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

interface DrawerStyledProps {
  open?: boolean;
  theme?: Theme;
}

const DrawerStyled = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})`
  width: ${drawerWidth}px;
  flex-shrink: 0;
  white-space: nowrap;
  box-sizing: border-box;

  ${(props: DrawerStyledProps) => props.open && `
    width: ${drawerWidth}px;
    transition: ${props.theme?.transitions.create('width', {
      easing: props.theme?.transitions.easing.sharp,
      duration: props.theme?.transitions.duration.enteringScreen,
    })};
    overflow-x: hidden;

    & .MuiDrawer-paper {
      width: ${drawerWidth}px;
      transition: ${props.theme?.transitions.create('width', {
        easing: props.theme?.transitions.easing.sharp,
        duration: props.theme?.transitions.duration.enteringScreen,
      })};
      overflow-x: hidden;
    }
  `}

  ${(props: DrawerStyledProps) => !props.open && `
    transition: ${props.theme?.transitions.create('width', {
      easing: props.theme?.transitions.easing.sharp,
      duration: props.theme?.transitions.duration.leavingScreen,
    })};
    overflow-x: hidden;
    width: calc(${props.theme?.spacing(7)} + 1px);

    @media (min-width: ${props.theme?.breakpoints.values.sm}px) {
      width: calc(${props.theme?.spacing(8)} + 1px);
    }

    & .MuiDrawer-paper {
      transition: ${props.theme?.transitions.create('width', {
        easing: props.theme?.transitions.easing.sharp,
        duration: props.theme?.transitions.duration.leavingScreen,
      })};
      overflow-x: hidden;
      width: calc(${props.theme?.spacing(7)} + 1px);

      @media (min-width: ${props.theme?.breakpoints.values.sm}px) {
        width: calc(${props.theme?.spacing(8)} + 1px);
      }
    }
  `}
`;

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function DashboardLayout({ children, title = 'Dashboard' }: DashboardLayoutProps) {
  const theme = useTheme();
  const router = useRouter();
  const { t, i18n } = useTranslation('common');
  const { userData, signOut } = useAuth();
  const [open, setOpen] = useState(true);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const mode = theme.palette.mode;

  // Close drawer on mobile by default
  useEffect(() => {
    if (isMobile) {
      setOpen(false);
    }
  }, [isMobile]);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLanguageToggle = () => {
    const newLocale = i18n.language === 'en' ? 'fr' : 'en';
    router.push(router.pathname, router.asPath, { locale: newLocale });
  };

  const toggleMode = () => {
    // This would be handled by your theme context
    // For now, we'll just log it
    console.log('Toggle theme mode');
  };

  return (
    <NotificationProvider>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBarStyled position="fixed" open={open}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{
                marginRight: 5,
                ...(open && { display: 'none' }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              {title}
            </Typography>

            <IconButton color="inherit" onClick={toggleMode}>
              {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>

            <IconButton color="inherit" onClick={handleLanguageToggle}>
              <LanguageIcon />
            </IconButton>

            <NotificationPopover />

            <IconButton
              color="inherit"
              onClick={handleUserMenuOpen}
              aria-controls="user-menu"
              aria-haspopup="true"
            >
              <AccountCircleIcon />
            </IconButton>

            <UserMenu
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={handleUserMenuClose}
              userData={userData}
              onSignOut={signOut}
            />
          </Toolbar>
        </AppBarStyled>

        <DrawerStyled variant="permanent" open={open}>
          <DrawerHeader>
            <IconButton onClick={handleDrawerClose}>
              <ChevronLeftIcon />
            </IconButton>
          </DrawerHeader>
          <Divider />
          <MainNavigation open={open} />
        </DrawerStyled>

        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <DrawerHeader />
          {children}
        </Box>
      </Box>
    </NotificationProvider>
  );
}
