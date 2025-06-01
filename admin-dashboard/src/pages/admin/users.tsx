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
  MoreVert as MoreIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import AdminLayout from '../../components/layout/AdminLayout';
import withAuth from '../../components/auth/withAuth';
import { useAuth } from '../../contexts/AuthContext';
import { User, getUsers, updateUserStatus, updateUserRole, deleteUser } from '../../services/userService';
import { DocumentSnapshot } from 'firebase/firestore';

// Define filter options
interface UserFilters {
  role: string;
  status: string;
  searchTerm: string;
}

const Users: React.FC = () => {
  // State for users data
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // State for filters
  const [filters, setFilters] = useState<UserFilters>({
    role: '',
    status: '',
    searchTerm: '',
  });

  // State for dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [userToUpdateStatus, setUserToUpdateStatus] = useState<User | null>(null);
  const [newStatus, setNewStatus] = useState<'active' | 'inactive' | 'suspended'>('active');
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [userToUpdateRole, setUserToUpdateRole] = useState<User | null>(null);
  const [newRole, setNewRole] = useState('user');

  // State for success messages
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // State for action menu
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const router = useRouter();

  // Fetch users on component mount and when filters change
  useEffect(() => {
    fetchUsers();
  }, [page, filters]);

  // Function to fetch users
  const fetchUsers = async (reset = false) => {
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
        role: filters.role || undefined,
        status: filters.status as any || undefined,
        searchTerm: filters.searchTerm || undefined,
      };

      // Get users with pagination
      const result = await getUsers(
        {
          pageSize,
          startAfter: reset ? null : lastDoc,
          orderByField: 'createdAt',
          orderDirection: 'desc',
        },
        filterOptions
      );

      // Update state
      setUsers(result.users);
      setLastDoc(result.lastDoc);
      setHasMore(result.users.length === pageSize);

    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
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
  const handleFilterChange = (filterName: keyof UserFilters, value: string) => {
    setFilters({ ...filters, [filterName]: value });
  };

  // Function to handle delete user
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setLoading(true);
      await deleteUser(userToDelete.id);
      setSuccessMessage(`User ${userToDelete.displayName} has been deleted.`);
      setDeleteDialogOpen(false);
      fetchUsers(true);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle update user status
  const handleUpdateStatus = async () => {
    if (!userToUpdateStatus) return;

    try {
      setLoading(true);
      await updateUserStatus(userToUpdateStatus.id, newStatus);
      setSuccessMessage(`User ${userToUpdateStatus.displayName}'s status has been updated to ${newStatus}.`);
      setStatusDialogOpen(false);
      fetchUsers();
    } catch (err) {
      console.error('Error updating user status:', err);
      setError('Failed to update user status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle update user role
  const handleUpdateRole = async () => {
    if (!userToUpdateRole) return;

    try {
      setLoading(true);
      await updateUserRole(userToUpdateRole.id, newRole);
      setSuccessMessage(`User ${userToUpdateRole.displayName}'s role has been updated to ${newRole}.`);
      setRoleDialogOpen(false);
      fetchUsers();
    } catch (err) {
      console.error('Error updating user role:', err);
      setError('Failed to update user role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to open action menu
  const handleOpenActionMenu = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedUser(user);
  };

  // Function to close action menu
  const handleCloseActionMenu = () => {
    setActionMenuAnchor(null);
  };

  // Function to handle action menu item click
  const handleActionMenuItemClick = (action: string) => {
    if (!selectedUser) return;

    switch (action) {
      case 'edit':
        router.push(`/admin/users/edit/${selectedUser.id}`);
        break;
      case 'delete':
        setUserToDelete(selectedUser);
        setDeleteDialogOpen(true);
        break;
      case 'status':
        setUserToUpdateStatus(selectedUser);
        setNewStatus(selectedUser.status || 'active');
        setStatusDialogOpen(true);
        break;
      case 'role':
        setUserToUpdateRole(selectedUser);
        setNewRole(selectedUser.role || 'user');
        setRoleDialogOpen(true);
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
      case 'inactive':
        return 'default';
      case 'suspended':
        return 'error';
      default:
        return 'default';
    }
  };

  // Function to get role label
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'editor':
        return 'Editor';
      case 'user':
        return 'User';
      default:
        return role;
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

  return (
    <AdminLayout title="User Management">
      <Head>
        <title>User Management - Admin Dashboard</title>
        <meta name="description" content="User Management for Coupon Platform" />
      </Head>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          User Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage user accounts and permissions
        </Typography>
      </Box>

      {/* Filters and Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', flex: 1 }}>
          <TextField
            placeholder="Search users..."
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
            <InputLabel id="role-filter-label">Role</InputLabel>
            <Select
              labelId="role-filter-label"
              value={filters.role}
              label="Role"
              onChange={(e) => handleFilterChange('role', e.target.value)}
            >
              <MenuItem value="">All Roles</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="editor">Editor</MenuItem>
              <MenuItem value="user">User</MenuItem>
            </Select>
          </FormControl>

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
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
            </Select>
          </FormControl>

          <Tooltip title="Reset Filters">
            <IconButton
              color="primary"
              onClick={() => {
                setFilters({ role: '', status: '', searchTerm: '' });
                fetchUsers(true);
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
          onClick={() => router.push('/admin/users/add')}
        >
          Add User
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              // Loading skeletons
              Array.from(new Array(5)).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton variant="text" width="80%" /></TableCell>
                  <TableCell><Skeleton variant="text" width="80%" /></TableCell>
                  <TableCell><Skeleton variant="text" width="60%" /></TableCell>
                  <TableCell><Skeleton variant="text" width="60%" /></TableCell>
                  <TableCell><Skeleton variant="text" width="60%" /></TableCell>
                  <TableCell align="right"><Skeleton variant="text" width="100%" /></TableCell>
                </TableRow>
              ))
            ) : users.length > 0 ? (
              // User data
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.displayName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      icon={user.role === 'admin' ? <AdminIcon fontSize="small" /> : <PersonIcon fontSize="small" />}
                      label={getRoleLabel(user.role)}
                      size="small"
                      color={user.role === 'admin' ? 'primary' : 'default'}
                      variant={user.role === 'admin' ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.status}
                      color={getStatusColor(user.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => handleOpenActionMenu(e, user)}
                    >
                      <MoreIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              // No users found
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body1" sx={{ py: 2 }}>
                    No users found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {users.length > 0 && (
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
        <MenuItem onClick={() => handleActionMenuItemClick('edit')}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleActionMenuItemClick('status')}>
          <ListItemIcon>
            {selectedUser?.status === 'active' ? (
              <BlockIcon fontSize="small" />
            ) : (
              <CheckCircleIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>
            {selectedUser?.status === 'active' ? 'Deactivate' : 'Activate'}
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleActionMenuItemClick('role')}>
          <ListItemIcon>
            <AdminIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Change Role</ListItemText>
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
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {userToDelete?.displayName}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteUser}
            color="error"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
      >
        <DialogTitle>Update User Status</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Update status for {userToUpdateStatus?.displayName}
          </DialogContentText>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={newStatus}
              label="Status"
              onChange={(e) => setNewStatus(e.target.value as 'active' | 'inactive' | 'suspended')}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateStatus}
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Role Dialog */}
      <Dialog
        open={roleDialogOpen}
        onClose={() => setRoleDialogOpen(false)}
      >
        <DialogTitle>Update User Role</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Update role for {userToUpdateRole?.displayName}
          </DialogContentText>
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={newRole}
              label="Role"
              onChange={(e) => setNewRole(e.target.value)}
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="editor">Editor</MenuItem>
              <MenuItem value="user">User</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateRole}
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Update
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

// Wrap the Users component with the withAuth HOC
// Specify that this page requires admin role
export default withAuth(Users, { requiredRole: 'admin' });
