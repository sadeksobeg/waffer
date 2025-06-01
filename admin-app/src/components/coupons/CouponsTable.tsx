import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  IconButton,
  Chip,
  Avatar,
  Tooltip,
  Typography,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  ContentCopy as DuplicateIcon,
  MoreVert as MoreVertIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  QrCode as QrCodeIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import CouponFormDialog from './CouponFormDialog';
import DeleteConfirmDialog from '../common/DeleteConfirmDialog';
import QRCodeDialog from './QRCodeDialog';
import couponService, { Coupon, CouponFilters } from '@/services/couponService';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

interface CouponsTableProps {
  searchQuery?: string;
  filters?: CouponFilters;
  onCouponUpdated?: () => void;
}

export default function CouponsTable({
  searchQuery = '',
  filters = {},
  onCouponUpdated
}: CouponsTableProps) {
  const { t } = useTranslation(['common', 'coupons']);
  const router = useRouter();

  // State
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCoupons, setTotalCoupons] = useState(0);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [editCoupon, setEditCoupon] = useState<Coupon | null>(null);
  const [deleteCoupon, setDeleteCoupon] = useState<Coupon | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [openQRCodeDialog, setOpenQRCodeDialog] = useState(false);

  // Create combined filters
  const combinedFilters: CouponFilters = {
    ...filters,
    search: searchQuery,
  };

  // Fetch coupons
  const fetchCoupons = async (newPage: number = page) => {
    try {
      setLoading(true);
      setError(null);

      // If going to first page, reset lastDoc
      const docToStartAfter = newPage === 0 ? undefined : lastDoc || undefined;

      const response = await couponService.getCoupons(
        newPage + 1,
        rowsPerPage,
        combinedFilters,
        docToStartAfter
      );

      setCoupons(response.data);
      setTotalCoupons(response.total);
      setLastDoc(response.lastDoc || null);
    } catch (err) {
      console.error('Error fetching coupons:', err);
      setError('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  // Fetch coupons when filters, page, or rowsPerPage changes
  useEffect(() => {
    fetchCoupons(0); // Reset to first page when filters change
    setPage(0);
  }, [JSON.stringify(combinedFilters), rowsPerPage]);

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
    fetchCoupons(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  // Handle action menu
  const handleOpenActionMenu = (event: React.MouseEvent<HTMLElement>, coupon: Coupon) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedCoupon(coupon);
  };

  const handleCloseActionMenu = () => {
    setActionMenuAnchor(null);
  };

  // Handle view coupon
  const handleViewCoupon = (couponId: string) => {
    router.push(`/dashboard/coupons/${couponId}`);
    handleCloseActionMenu();
  };

  // Handle edit coupon
  const handleEditCoupon = (coupon: Coupon) => {
    setEditCoupon(coupon);
    setOpenEditDialog(true);
    handleCloseActionMenu();
  };

  // Handle delete coupon
  const handleDeleteCoupon = (coupon: Coupon) => {
    setDeleteCoupon(coupon);
    setOpenDeleteDialog(true);
    handleCloseActionMenu();
  };

  // Handle duplicate coupon
  const handleDuplicateCoupon = async (coupon: Coupon) => {
    try {
      await couponService.duplicateCoupon(coupon.id);
      fetchCoupons(page); // Refresh the list
      if (onCouponUpdated) {
        onCouponUpdated();
      }
    } catch (err) {
      console.error('Error duplicating coupon:', err);
      // Show error notification
    }
    handleCloseActionMenu();
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (deleteCoupon) {
      try {
        await couponService.deleteCoupon(deleteCoupon.id);
        fetchCoupons(page); // Refresh the list
        if (onCouponUpdated) {
          onCouponUpdated();
        }
      } catch (err) {
        console.error('Error deleting coupon:', err);
        // Show error notification
      }
    }
    setOpenDeleteDialog(false);
    setDeleteCoupon(null);
  };

  // Handle toggle coupon status
  const handleToggleCouponStatus = async () => {
    if (selectedCoupon) {
      try {
        await couponService.changeCouponStatus(selectedCoupon.id, !selectedCoupon.isActive);
        fetchCoupons(page); // Refresh the list
        if (onCouponUpdated) {
          onCouponUpdated();
        }
      } catch (err) {
        console.error('Error changing coupon status:', err);
        // Show error notification
      }
    }
    handleCloseActionMenu();
  };

  // Handle show QR code
  const handleShowQRCode = () => {
    setOpenQRCodeDialog(true);
    handleCloseActionMenu();
  };

  // Format discount value
  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}%`;
    } else {
      return `$${coupon.discountValue.toFixed(2)}`;
    }
  };

  // Check if coupon is expired
  const isCouponExpired = (coupon: Coupon) => {
    return new Date(coupon.endDate) < new Date();
  };

  // Get coupon status
  const getCouponStatus = (coupon: Coupon): 'active' | 'inactive' | 'expired' => {
    if (!coupon.isActive) return 'inactive';
    return isCouponExpired(coupon) ? 'expired' : 'active';
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'expired':
        return 'error';
      case 'inactive':
        return 'default';
      default:
        return 'default';
    }
  };

  if (loading && coupons.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (coupons.length === 0 && !loading) {
    return (
      <Box p={2}>
        <Typography color="textSecondary">{t('coupons:noCouponsFound')}</Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="coupons table">
          <TableHead>
            <TableRow>
              <TableCell>{t('coupons:table.title')}</TableCell>
              <TableCell>{t('coupons:table.code')}</TableCell>
              <TableCell>{t('coupons:table.discount')}</TableCell>
              <TableCell>{t('coupons:table.merchant')}</TableCell>
              <TableCell>{t('coupons:table.expiryDate')}</TableCell>
              <TableCell>{t('coupons:table.status')}</TableCell>
              <TableCell>{t('coupons:table.usage')}</TableCell>
              <TableCell align="right">{t('common:actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {coupons.map((coupon) => {
              const status = getCouponStatus(coupon);
              return (
                <TableRow key={coupon.id} hover>
                  <TableCell component="th" scope="row">
                    <Typography variant="body2" fontWeight="medium">
                      {coupon.title}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {coupon.category}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={coupon.code}
                      size="small"
                      variant="outlined"
                      color="primary"
                      onClick={() => {
                        navigator.clipboard.writeText(coupon.code);
                        // You could add a toast notification here
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {formatDiscount(coupon)}
                  </TableCell>
                  <TableCell>
                    {coupon.merchantName}
                  </TableCell>
                  <TableCell>
                    {format(new Date(coupon.endDate), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={t(`coupons:status.${status}`)}
                      color={getStatusColor(status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {`${coupon.usedCount}/${coupon.usageLimit === 0 ? '∞' : coupon.usageLimit}`}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title={t('common:view')}>
                      <IconButton size="small" onClick={() => handleViewCoupon(coupon.id)}>
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('common:edit')}>
                      <IconButton size="small" onClick={() => handleEditCoupon(coupon)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <IconButton
                      size="small"
                      onClick={(e) => handleOpenActionMenu(e, coupon)}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={totalCoupons}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <CouponFormDialog
        open={openEditDialog}
        onClose={() => {
          setOpenEditDialog(false);
          fetchCoupons(page); // Refresh the list after editing
          if (onCouponUpdated) {
            onCouponUpdated();
          }
        }}
        coupon={editCoupon}
      />

      <DeleteConfirmDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title={t('coupons:deleteDialog.title')}
        content={t('coupons:deleteDialog.content', { title: deleteCoupon?.title })}
      />

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleCloseActionMenu}
      >
        <MenuItem onClick={() => selectedCoupon && handleViewCoupon(selectedCoupon.id)}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('common:view')} />
        </MenuItem>
        <MenuItem onClick={() => selectedCoupon && handleEditCoupon(selectedCoupon)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('common:edit')} />
        </MenuItem>
        <MenuItem onClick={handleToggleCouponStatus}>
          <ListItemIcon>
            {selectedCoupon?.isActive ? (
              <BlockIcon fontSize="small" />
            ) : (
              <CheckCircleIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText
            primary={
              selectedCoupon?.isActive
                ? t('coupons:actions.deactivate')
                : t('coupons:actions.activate')
            }
          />
        </MenuItem>
        <MenuItem onClick={() => selectedCoupon && handleDuplicateCoupon(selectedCoupon)}>
          <ListItemIcon>
            <DuplicateIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('coupons:actions.duplicate')} />
        </MenuItem>
        <MenuItem onClick={handleShowQRCode}>
          <ListItemIcon>
            <QrCodeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('coupons:actions.showQRCode')} />
        </MenuItem>
        <MenuItem onClick={() => selectedCoupon && handleDeleteCoupon(selectedCoupon)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('common:delete')} />
        </MenuItem>
      </Menu>

      {/* QR Code Dialog */}
      {selectedCoupon && (
        <QRCodeDialog
          open={openQRCodeDialog}
          onClose={() => setOpenQRCodeDialog(false)}
          couponId={selectedCoupon.id}
          couponCode={selectedCoupon.code}
          couponTitle={selectedCoupon.title}
        />
      )}
    </>
  );
}
