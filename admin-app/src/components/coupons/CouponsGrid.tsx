import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  ContentCopy as DuplicateIcon,
  QrCode as QrCodeIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import CouponFormDialog from './CouponFormDialog';
import DeleteConfirmDialog from '../common/DeleteConfirmDialog';
import QRCodeDialog from './QRCodeDialog';

// Use the same mock data as in CouponsTable.tsx
const mockCoupons = [
  {
    id: 'coupon1',
    title: '20% Off All Clothing',
    description: 'Get 20% off on all clothing items. Valid for both online and in-store purchases.',
    discount: '20',
    discountType: 'percentage',
    merchant: {
      id: 'store1',
      name: 'Fashion Hub',
      image: 'https://via.placeholder.com/40',
    },
    category: 'fashion',
    expiryDate: new Date(2023, 6, 15),
    createdAt: new Date(2023, 5, 1),
    code: 'FASHION20',
    status: 'active',
    usageLimit: 1,
    usedCount: 0,
  },
  {
    id: 'coupon2',
    title: 'Free Coffee with Breakfast',
    description: 'Get a free coffee when you order any breakfast item from our menu.',
    discount: '100',
    discountType: 'percentage',
    merchant: {
      id: 'store2',
      name: 'Café Delight',
      image: 'https://via.placeholder.com/40',
    },
    category: 'coffee',
    expiryDate: new Date(2023, 7, 10),
    createdAt: new Date(2023, 5, 5),
    code: 'MORNINGCOFFEE',
    status: 'active',
    usageLimit: 1,
    usedCount: 0,
  },
  {
    id: 'coupon3',
    title: '30% Off Smartphones',
    description: 'Get 30% off on selected smartphone models. Limited time offer.',
    discount: '30',
    discountType: 'percentage',
    merchant: {
      id: 'store3',
      name: 'Tech World',
      image: 'https://via.placeholder.com/40',
    },
    category: 'electronics',
    expiryDate: new Date(2023, 6, 30),
    createdAt: new Date(2023, 5, 10),
    code: 'PHONE30',
    status: 'active',
    usageLimit: 1,
    usedCount: 0,
  },
  {
    id: 'coupon4',
    title: '2 Months Free Membership',
    description: 'Sign up for a 6-month membership and get 2 months free. New members only.',
    discount: '33',
    discountType: 'percentage',
    merchant: {
      id: 'store4',
      name: 'Fitness First',
      image: 'https://via.placeholder.com/40',
    },
    category: 'fitness',
    expiryDate: new Date(2023, 4, 15), // Already expired
    createdAt: new Date(2023, 3, 20),
    code: 'FIT2FREE',
    status: 'expired',
    usageLimit: 1,
    usedCount: 1,
  },
  {
    id: 'coupon5',
    title: '15% Off Flight Bookings',
    description: 'Use this coupon to get 15% off on all international flight bookings.',
    discount: '15',
    discountType: 'percentage',
    merchant: {
      id: 'store5',
      name: 'Travel Paradise',
      image: 'https://via.placeholder.com/40',
    },
    category: 'travel',
    expiryDate: new Date(2023, 8, 30),
    createdAt: new Date(2023, 5, 15),
    code: 'FLYNOW15',
    status: 'active',
    usageLimit: 1,
    usedCount: 0,
  },
];

// Mock categories for display
const mockCategories = [
  { id: 'fashion', name: 'Fashion' },
  { id: 'food', name: 'Food' },
  { id: 'coffee', name: 'Coffee' },
  { id: 'electronics', name: 'Electronics' },
  { id: 'fitness', name: 'Fitness' },
  { id: 'travel', name: 'Travel' },
  { id: 'home', name: 'Home' },
  { id: 'beauty', name: 'Beauty' },
];

interface CouponsGridProps {
  searchQuery: string;
  filters: {
    isActive?: boolean;
    merchantId?: string[];
    categories?: string[];
    dateRange?: {
      start: Date | null;
      end: Date | null;
    };
  };
}

export default function CouponsGrid({ searchQuery, filters }: CouponsGridProps) {
  const { t } = useTranslation(['common', 'coupons']);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openQRCodeDialog, setOpenQRCodeDialog] = useState(false);

  // Filter coupons (same logic as in CouponsTable.tsx)
  const filteredCoupons = mockCoupons.filter(coupon => {
    // Search query filter
    const matchesSearch =
      searchQuery === '' ||
      coupon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coupon.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coupon.code.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus =
      filters.isActive === undefined ||
      filters.isActive === (coupon.status === 'active');

    // Store filter
    const matchesStore =
      !filters.merchantId ||
      filters.merchantId.length === 0 ||
      filters.merchantId.includes(coupon.merchant.id);

    // Category filter
    const matchesCategory =
      !filters.categories ||
      filters.categories.length === 0 ||
      filters.categories.includes(coupon.category);

    // Date range filter
    const matchesDateRange =
      !filters.dateRange ||
      ((filters.dateRange.start === null || new Date(coupon.expiryDate) >= filters.dateRange.start) &&
      (filters.dateRange.end === null || new Date(coupon.expiryDate) <= filters.dateRange.end));

    return matchesSearch && matchesStatus && matchesStore && matchesCategory && matchesDateRange;
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, coupon: any) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedCoupon(coupon);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleEditCoupon = () => {
    setOpenEditDialog(true);
    handleMenuClose();
  };

  const handleDeleteCoupon = () => {
    setOpenDeleteDialog(true);
    handleMenuClose();
  };

  const handleDuplicateCoupon = () => {
    // Create a duplicate coupon with a new ID and slightly modified title
    const duplicatedCoupon = {
      ...selectedCoupon,
      id: `${selectedCoupon.id}-copy`,
      title: `${selectedCoupon.title} (Copy)`,
      code: `${selectedCoupon.code}-COPY`,
    };

    // In a real app, you would save this to your database
    console.log('Duplicated coupon:', duplicatedCoupon);

    // For now, just open the edit dialog with the duplicated coupon
    setSelectedCoupon(duplicatedCoupon);
    setOpenEditDialog(true);
    handleMenuClose();
  };

  const handleShowQRCode = () => {
    setOpenQRCodeDialog(true);
    handleMenuClose();
  };

  const handleConfirmDelete = () => {
    // Logic to delete coupon
    console.log('Deleting coupon:', selectedCoupon);
    setOpenDeleteDialog(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'expired':
        return 'error';
      case 'scheduled':
        return 'info';
      case 'paused':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <>
      {filteredCoupons.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            {t('coupons:noCouponsFound')}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredCoupons.map((coupon) => (
            <Grid item xs={12} sm={6} md={4} key={coupon.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6,
                  },
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    borderBottom: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      src={coupon.merchant.image}
                      alt={coupon.merchant.name}
                      sx={{ width: 32, height: 32, mr: 1 }}
                    />
                    <Typography variant="subtitle1">
                      {coupon.merchant.name}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, coupon)}
                    aria-label="coupon actions"
                  >
                    <MoreIcon />
                  </IconButton>
                </Box>

                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {coupon.title}
                  </Typography>

                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {coupon.description}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      {t('coupons:table.discount')}:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {coupon.discountType === 'percentage'
                        ? `${coupon.discount}%`
                        : `$${coupon.discount}`}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      {t('coupons:table.code')}:
                    </Typography>
                    <Chip
                      label={coupon.code}
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        navigator.clipboard.writeText(coupon.code);
                        // You could add a toast notification here
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      {t('coupons:table.expiryDate')}:
                    </Typography>
                    <Typography variant="body2">
                      {format(coupon.expiryDate, 'MMM d, yyyy')}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      {t('coupons:table.usage')}:
                    </Typography>
                    <Typography variant="body2">
                      {`${coupon.usedCount}/${coupon.usageLimit === -1 ? '∞' : coupon.usageLimit}`}
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', p: 2, pt: 0 }}>
                  <Chip
                    label={t(`coupons:status.${coupon.status}`)}
                    color={getStatusColor(coupon.status) as any}
                    size="small"
                  />
                  <Chip
                    label={mockCategories.find(c => c.id === coupon.category)?.name}
                    size="small"
                    variant="outlined"
                  />
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { console.log('View coupon:', selectedCoupon); handleMenuClose(); }}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('common:view')}</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleEditCoupon}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('common:edit')}</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleDuplicateCoupon}>
          <ListItemIcon>
            <DuplicateIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('coupons:actions.duplicate')}</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleShowQRCode}>
          <ListItemIcon>
            <QrCodeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('coupons:actions.showQRCode')}</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleDeleteCoupon}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>{t('common:delete')}</ListItemText>
        </MenuItem>
      </Menu>

      <CouponFormDialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        coupon={selectedCoupon}
      />

      <DeleteConfirmDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title={t('coupons:deleteDialog.title')}
        content={t('coupons:deleteDialog.content', { title: selectedCoupon?.title })}
      />

      <QRCodeDialog
        open={openQRCodeDialog}
        onClose={() => setOpenQRCodeDialog(false)}
        couponId={selectedCoupon?.id || ''}
        couponCode={selectedCoupon?.code || ''}
        couponTitle={selectedCoupon?.title || ''}
      />
    </>
  );
}
