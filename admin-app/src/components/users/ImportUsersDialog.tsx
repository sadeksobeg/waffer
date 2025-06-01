import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemText,
  Paper,
  CircularProgress
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { userService } from '@/services';

interface ImportUsersDialogProps {
  open: boolean;
  onClose: () => void;
  onImportComplete?: () => void;
}

export default function ImportUsersDialog({ open, onClose, onImportComplete }: ImportUsersDialogProps) {
  const { t } = useTranslation(['common', 'users']);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    details?: { success: number; failed: number; errors?: string[] };
  } | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Upload the file using the userService
      const result = await userService.importUsers(file, (progress) => {
        setUploadProgress(progress);
      });

      // Set the upload result
      setUploadResult({
        success: true,
        message: t('users:import.successMessage'),
        details: {
          success: result.success,
          failed: result.failed,
          errors: result.errors
        }
      });

      // Call the onImportComplete callback if provided
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (error: any) {
      console.error('Error importing users:', error);

      setUploadResult({
        success: false,
        message: error.message || t('users:import.errorMessage'),
        details: {
          success: 0,
          failed: 0
        }
      });
    } finally {
      setUploading(false);
      setUploadProgress(100);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setFile(null);
      setUploadProgress(0);
      setUploadResult(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{t('users:import.title')}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" gutterBottom>
            {t('users:import.description')}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {t('users:import.instructions')}
          </Typography>
        </Box>

        {!file && !uploadResult && (
          <Box
            sx={{
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 1,
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover',
              },
            }}
            component="label"
          >
            <input
              type="file"
              accept=".csv,.xlsx"
              hidden
              onChange={handleFileChange}
            />
            <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {t('users:import.dropzone')}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {t('users:import.fileTypes')}
            </Typography>
          </Box>
        )}

        {file && !uploadResult && (
          <Box sx={{ mt: 2 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                {t('users:import.selectedFile')}
              </Typography>
              <Typography variant="body1">{file.name}</Typography>
              <Typography variant="body2" color="textSecondary">
                {(file.size / 1024).toFixed(2)} KB
              </Typography>

              {uploading && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress variant="determinate" value={uploadProgress} />
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                    <CircularProgress size={16} sx={{ mr: 1 }} />
                    <Typography variant="body2" color="textSecondary">
                      {uploadProgress}% - {t('users:import.processing')}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Paper>
          </Box>
        )}

        {uploadResult && (
          <Box sx={{ mt: 2 }}>
            <Alert severity={uploadResult.success ? "success" : "error"} sx={{ mb: 2 }}>
              <AlertTitle>{uploadResult.success ? t('common:success') : t('common:error')}</AlertTitle>
              {uploadResult.message}
            </Alert>

            {uploadResult.details && (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {t('users:import.summary')}
                </Typography>
                <Typography variant="body1">
                  {t('users:import.successCount', { count: uploadResult.details.success })}
                </Typography>
                <Typography variant="body1">
                  {t('users:import.failedCount', { count: uploadResult.details.failed })}
                </Typography>

                {uploadResult.details.errors && uploadResult.details.errors.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {t('users:import.errors')}
                    </Typography>
                    <List dense>
                      {uploadResult.details.errors.map((error, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={error} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Paper>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={uploading}>
          {uploadResult ? t('common:close') : t('common:cancel')}
        </Button>
        {file && !uploadResult && (
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={uploading}
            startIcon={uploading ? <CircularProgress size={20} /> : undefined}
          >
            {uploading ? t('users:import.uploading') : t('users:import.upload')}
          </Button>
        )}
        {uploadResult && (
          <Button
            onClick={() => {
              setFile(null);
              setUploadResult(null);
            }}
            variant="contained"
          >
            {t('users:import.importAnother')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
