import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Divider,
  FormControlLabel,
  Switch,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { 
  Lock as LockIcon, 
  Delete as DeleteIcon 
} from '@mui/icons-material';

export default function AccountSettings() {
  const { t } = useTranslation(['common', 'settings']);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  
  const handleTwoFactorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTwoFactorEnabled(event.target.checked);
  };
  
  const handleOpenDeleteDialog = () => {
    setOpenDeleteDialog(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };
  
  const handleDeleteAccount = () => {
    console.log('Deleting account...');
    setOpenDeleteDialog(false);
    // In a real app, you would call an API to delete the account
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('settings:account.title')}
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        {t('settings:account.description')}
      </Typography>
      
      <Divider sx={{ my: 3 }} />
      
      <Typography variant="h6" gutterBottom>
        {t('settings:account.changePassword')}
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label={t('settings:account.currentPassword')}
            type="password"
            autoComplete="current-password"
          />
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label={t('settings:account.newPassword')}
            type="password"
            autoComplete="new-password"
          />
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label={t('settings:account.confirmPassword')}
            type="password"
            autoComplete="new-password"
          />
        </Grid>
        
        <Grid item xs={12}>
          <Button 
            variant="outlined" 
            startIcon={<LockIcon />}
          >
            {t('settings:account.updatePassword')}
          </Button>
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 3 }} />
      
      <Typography variant="h6" gutterBottom>
        {t('settings:account.twoFactorAuth')}
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <FormControlLabel
          control={
            <Switch 
              checked={twoFactorEnabled} 
              onChange={handleTwoFactorChange} 
              color="primary"
            />
          }
          label={t('settings:account.enableTwoFactor')}
        />
        
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          {t('settings:account.twoFactorDescription')}
        </Typography>
        
        {twoFactorEnabled && (
          <Alert severity="info" sx={{ mt: 2 }}>
            {t('settings:account.twoFactorInstructions')}
          </Alert>
        )}
      </Box>
      
      <Divider sx={{ my: 3 }} />
      
      <Typography variant="h6" gutterBottom sx={{ color: 'error.main' }}>
        {t('settings:account.dangerZone')}
      </Typography>
      
      <Box>
        <Typography variant="body2" color="textSecondary" paragraph>
          {t('settings:account.deleteWarning')}
        </Typography>
        
        <Button 
          variant="outlined" 
          color="error" 
          startIcon={<DeleteIcon />}
          onClick={handleOpenDeleteDialog}
        >
          {t('settings:account.deleteAccount')}
        </Button>
      </Box>
      
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>{t('settings:account.deleteConfirmTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('settings:account.deleteConfirmMessage')}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label={t('settings:account.typeDelete')}
            fullWidth
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>
            {t('common:cancel')}
          </Button>
          <Button onClick={handleDeleteAccount} color="error">
            {t('settings:account.confirmDelete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
