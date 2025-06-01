import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Skeleton,
  Alert,
  Snackbar,
  Pagination,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
  ContentCopy as CopyIcon,
  MoreVert as MoreIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  BarChart as BarChartIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import AdminLayout from '../../components/layout/AdminLayout';
import withAuth from '../../components/auth/withAuth';
import { useAuth } from '../../contexts/AuthContext';
import { Coupon, getCoupons, deleteCoupon } from '../../services/couponService';
import { DocumentSnapshot } from 'firebase/firestore';

// Define filter options
interface CouponFilters {
  status: string;
  searchTerm: string;
  validNow: boolean;
}

const Coupons: React.FC = () => {
  // State for coupons data
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // State for filters
  const [filters, setFilters] = useState<CouponFilters>({
    status: '',
    searchTerm: '',
    validNow: false,
  });

  // State for dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);

  // State for success messages
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // State for action menu
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  const router = useRouter();

  // Fetch coupons on component mount and when filters change
  useEffect(() => {
    fetchCoupons();
  }, [page, filters]);

  // Function to fetch coupons
  const fetchCoupons = async (reset = false) => {
    try {
      setLoading(true);
      setError(null);

      // If resetting, clear the lastDoc
      if (reset) {
        setLastDoc(null);
        setPage(1);
      }

      // Convert filters to the format expected by the service
      const filterOptions = {
        status: filters.status as any || undefined,
        searchTerm: filters.searchTerm || undefined,
        validNow: filters.validNow || undefined,
      };

      // Get coupons with pagination
      const result = await getCoupons(
        {
          pageSize,
          startAfter: reset ? null : lastDoc,
          orderByField: 'createdAt',
          orderDirection: 'desc',
        },
        filterOptions
      );

      // Update state
      setCoupons(result.coupons);
      setLastDoc(result.lastDoc);
      setHasMore(result.coupons.length === pageSize);

    } catch (err) {
      console.error('Error fetching coupons:', err);
      setError('Failed to load coupons. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle page change
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // Function to handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value;
    setFilters({ ...filters, searchTerm });
  };

  // Function to handle filter change
  const handleFilterChange = (filterName: keyof CouponFilters, value: any) => {
    setFilters({ ...filters, [filterName]: value });
  };

  // Function to handle delete coupon
  const handleDeleteCoupon = async () => {
    if (!couponToDelete) return;

    try {
      setLoading(true);
      await deleteCoupon(couponToDelete.id);
      setSuccessMessage(`Coupon ${couponToDelete.code} has been deleted.`);
      setDeleteDialogOpen(false);
      fetchCoupons(true);
    } catch (err) {
      console.error('Error deleting coupon:', err);
      setError('Failed to delete coupon. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle copy code
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setSuccessMessage(`Coupon code ${code} copied to clipboard!`);
  };

  // Function to open action menu
  const handleOpenActionMenu = (event: React.MouseEvent<HTMLElement>, coupon: Coupon) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedCoupon(coupon);
  };

  // Function to close action menu
  const handleCloseActionMenu = () => {
    setActionMenuAnchor(null);
  };

  // Function to handle action menu item click
  const handleActionMenuItemClick = (action: string) => {
    if (!selectedCoupon) return;

    switch (action) {
      case 'edit':
        router.push(`/admin/coupons/edit/${selectedCoupon.id}`);
        break;
      case 'delete':
        setCouponToDelete(selectedCoupon);
        setDeleteDialogOpen(true);
        break;
      case 'view':
        router.push(`/admin/coupons/view/${selectedCoupon.id}`);
        break;
      case 'stats':
        router.push(`/admin/coupons/stats/${selectedCoupon.id}`);
        break;
      default:
        break;
    }

    handleCloseActionMenu();
  };

  // Function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'expired':
        return 'default';
      case 'scheduled':
        return 'info';
      case 'disabled':
        return 'error';
      default:
        return 'default';
    }
  };

  // Function to format date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';

    try {
      const date = timestamp.toDate();
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(date);
    } catch (err) {
      return 'Invalid date';
    }
  };

  // Function to format discount
  const formatDiscount = (discount: { type: 'percentage' | 'fixed'; value: number }) => {
    if (!discount) return 'N/A';

    return discount.type === 'percentage'
      ? `${discount.value}%`
      : `$${discount.value.toFixed(2)}`;
  };

  return (
    <AdminLayout title="Coupon Management">
      <Head>
        <title>Coupon Management - Admin Dashboard</title>
        <meta name="description" content="Coupon Management for Coupon Platform" />
      </Head>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Coupon Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create and manage coupon campaigns
        </Typography>
      </Box>

      {/* Filters and Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', flex: 1 }}>
          <TextField
            placeholder="Search coupons..."
            variant="outlined"
            size="small"
            value={filters.searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 200, flex: 1, maxWidth: 300 }}
          />

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={filters.status}
              label="Status"
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="expired">Expired</MenuItem>
              <MenuItem value="scheduled">Scheduled</MenuItem>
              <MenuItem value="disabled">Disabled</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="valid-now-filter-label">Validity</InputLabel>
            <Select
              labelId="valid-now-filter-label"
              value={filters.validNow ? 'valid' : 'all'}
              label="Validity"
              onChange={(e) => handleFilterChange('validNow', e.target.value === 'valid')}
            >
              <MenuItem value="all">All Coupons</MenuItem>
              <MenuItem value="valid">Currently Valid</MenuItem>
            </Select>
          </FormControl>

          <Tooltip title="Reset Filters">
            <IconButton
              color="primary"
              onClick={() => {
                setFilters({ status: '', searchTerm: '', validNow: false });
                fetchCoupons(true);
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => router.push('/admin/coupons/add')}
        >
          Create Coupon
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Coupons Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Store Name</TableCell>
              <TableCell>Discount</TableCell>
              <TableCell>Valid From</TableCell>
              <TableCell>Valid To</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Usage</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              // Loading skeletons
              Array.from(new Array(5)).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton variant="text" width="80%" /></TableCell>
                  <TableCell><Skeleton variant="text" width="70%" /></TableCell>
                  <TableCell><Skeleton variant="text" width="60%" /></TableCell>
                  <TableCell><Skeleton variant="text" width="80%" /></TableCell>
                  <TableCell><Skeleton variant="text" width="80%" /></TableCell>
                  <TableCell><Skeleton variant="text" width="60%" /></TableCell>
                  <TableCell><Skeleton variant="text" width="60%" /></TableCell>
                  <TableCell align="right"><Skeleton variant="text" width="100%" /></TableCell>
                </TableRow>
              ))
            ) : coupons.length > 0 ? (
              // Coupon data
              coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" fontWeight="bold">
                        {coupon.code}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleCopyCode(coupon.code)}
                        sx={{ ml: 1 }}
                      >
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {coupon.storeName || 'No Store'}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatDiscount(coupon.discount)}</TableCell>
                  <TableCell>{formatDate(coupon.validFrom)}</TableCell>
                  <TableCell>{formatDate(coupon.validTo)}</TableCell>
                  <TableCell>
                    <Chip
                      label={coupon.status}
                      color={getStatusColor(coupon.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {coupon.usageCount} / {coupon.usageLimit === 0 ? '∞' : coupon.usageLimit}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => handleOpenActionMenu(e, coupon)}
                    >
                      <MoreIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              // No coupons found
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body1" sx={{ py: 2 }}>
                    No coupons found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {coupons.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={hasMore ? page + 1 : page}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleCloseActionMenu}
      >
        <MenuItem onClick={() => handleActionMenuItemClick('view')}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleActionMenuItemClick('edit')}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleActionMenuItemClick('stats')}>
          <ListItemIcon>
            <BarChartIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Stats</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleActionMenuItemClick('delete')}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Coupon</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the coupon <strong>{couponToDelete?.code}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteCoupon}
            color="error"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessMessage(null)} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>
    </AdminLayout>
  );
};

export default withAuth(Coupons);
