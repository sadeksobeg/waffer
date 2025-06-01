import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import {
  Paper,
  Typography,
  Box,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  ContentCopy as DuplicateIcon
} from '@mui/icons-material';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import CouponFormDialog from './CouponFormDialog';
import DeleteConfirmDialog from '../common/DeleteConfirmDialog';

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

interface CouponsCalendarProps {
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

export default function CouponsCalendar({ searchQuery, filters }: CouponsCalendarProps) {
  const { t } = useTranslation(['common', 'coupons']);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

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

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

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

  // Generate calendar days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get day names for header
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={handlePrevMonth}>
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="h6">
            {format(currentMonth, 'MMMM yyyy')}
          </Typography>
          <IconButton onClick={handleNextMonth}>
            <ChevronRightIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
          {/* Calendar header */}
          {dayNames.map(day => (
            <Box
              key={day}
              sx={{
                textAlign: 'center',
                p: 1,
                fontWeight: 'bold',
                borderBottom: 1,
                borderColor: 'divider',
              }}
            >
              {day}
            </Box>
          ))}

          {/* Calendar days */}
          {calendarDays.map(day => {
            // Get coupons expiring on this day
            const daysCoupons = filteredCoupons.filter(coupon =>
              isSameDay(new Date(coupon.expiryDate), day)
            );

            return (
              <Box
                key={day.toString()}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 1,
                  minHeight: 100,
                  bgcolor: isToday(day) ? 'action.hover' : 'background.paper',
                  opacity: isSameMonth(day, currentMonth) ? 1 : 0.5,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    textAlign: 'right',
                    fontWeight: isToday(day) ? 'bold' : 'regular',
                    color: isToday(day) ? 'primary.main' : 'text.primary',
                    mb: 1,
                  }}
                >
                  {format(day, 'd')}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {daysCoupons.slice(0, 3).map(coupon => (
                    <Chip
                      key={coupon.id}
                      label={coupon.title}
                      size="small"
                      color={getStatusColor(coupon.status) as any}
                      onClick={(e) => handleMenuOpen(e, coupon)}
                      sx={{
                        height: 'auto',
                        '& .MuiChip-label': {
                          display: 'block',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          py: 0.5,
                        }
                      }}
                    />
                  ))}

                  {daysCoupons.length > 3 && (
                    <Typography variant="caption" color="text.secondary" align="center">
                      +{daysCoupons.length - 3} more
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Paper>

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
    </>
  );
}
