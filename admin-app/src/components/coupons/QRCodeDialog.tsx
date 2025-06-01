import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import {
  Download as DownloadIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { QRCodeCanvas } from 'qrcode.react';
import couponService from '@/services/couponService';

interface QRCodeDialogProps {
  open: boolean;
  onClose: () => void;
  couponId: string;
  couponCode: string;
  couponTitle: string;
}

export default function QRCodeDialog({
  open,
  onClose,
  couponId,
  couponCode,
  couponTitle
}: QRCodeDialogProps) {
  const { t } = useTranslation(['common', 'coupons']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Create a data object to encode in the QR code
  const qrData = JSON.stringify({
    couponId,
    code: couponCode
  });

  const handleDownload = () => {
    const canvas = document.getElementById('coupon-qrcode') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');

      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `${couponCode}-qrcode.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('coupons:qrCode.title')}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            {couponTitle}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="textSecondary">
              {t('coupons:qrCode.code')}:
            </Typography>
            <Typography variant="body2" sx={{ ml: 1, fontWeight: 'medium' }}>
              {couponCode}
            </Typography>
            <IconButton
              size="small"
              onClick={handleCopyCode}
              sx={{ ml: 1 }}
              color={copied ? 'success' : 'default'}
            >
              <CopyIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 2
          }}
        >
          {loading ? (
            <CircularProgress />
          ) : (
            <>
              <QRCodeCanvas
                id="coupon-qrcode"
                value={qrData}
                size={200}
                level="H"
                includeMargin
              />

              <Typography variant="body2" sx={{ mt: 3, fontWeight: 'medium', textAlign: 'center' }}>
                {t('coupons:qrCode.scanInstructions')}
              </Typography>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common:close')}</Button>
        <Button
          variant="contained"
          onClick={handleDownload}
          startIcon={<DownloadIcon />}
          disabled={loading}
        >
          {t('coupons:qrCode.download')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
