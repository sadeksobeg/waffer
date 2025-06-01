import React from 'react';
import { Menu, MenuItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { 
  AccountCircle as AccountIcon,
  ExitToApp as LogoutIcon,
  SupervisorAccount as AdminIcon,
  Store as MerchantIcon,
  Support as SupportIcon
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useAuth } from '../../contexts/AuthContext';

export type UserRole = 'admin' | 'merchant' | 'support';

interface UserMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  userData: any;
  onSignOut: () => Promise<void>;
}

export default function UserMenu({ anchorEl, open, onClose, userData, onSignOut }: UserMenuProps) {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { switchUserRole } = useAuth();

  const handleProfile = () => {
    router.push('/dashboard/profile');
    onClose();
  };

  const handleSignOut = async () => {
    await onSignOut();
    router.push('/login');
    onClose();
  };

  const handleSwitchRole = async (role: UserRole) => {
    await switchUserRole(role);
    onClose();
  };

  return (
    <Menu
      id="user-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      MenuListProps={{
        'aria-labelledby': 'user-menu-button',
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      <MenuItem onClick={handleProfile}>
        <ListItemIcon>
          <AccountIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>{t('userMenu.profile')}</ListItemText>
      </MenuItem>
      
      <Divider />
      
      {/* Role switching options - only visible for development/testing */}
      {process.env.NODE_ENV === 'development' && (
        <>
          <MenuItem onClick={() => handleSwitchRole('admin')}>
            <ListItemIcon>
              <AdminIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('userMenu.switchToAdmin')}</ListItemText>
          </MenuItem>
          
          <MenuItem onClick={() => handleSwitchRole('merchant')}>
            <ListItemIcon>
              <MerchantIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('userMenu.switchToMerchant')}</ListItemText>
          </MenuItem>
          
          <MenuItem onClick={() => handleSwitchRole('support')}>
            <ListItemIcon>
              <SupportIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('userMenu.switchToSupport')}</ListItemText>
          </MenuItem>
          
          <Divider />
        </>
      )}
      
      <MenuItem onClick={handleSignOut}>
        <ListItemIcon>
          <LogoutIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>{t('userMenu.signOut')}</ListItemText>
      </MenuItem>
    </Menu>
  );
}
