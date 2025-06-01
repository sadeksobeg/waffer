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
  CircularProgress,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  MoreVert as MoreVertIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  AdminPanelSettings as AdminIcon,
  Store as MerchantIcon,
  Person as CustomerIcon,
  Support as SupportIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import UserFormDialog from './UserFormDialog';
import DeleteConfirmDialog from '../common/DeleteConfirmDialog';
import userService, { User, UserFilters } from '@/services/userService';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

interface UsersTableProps {
  userType?: 'customer' | 'merchant' | 'admin' | 'support' | 'all';
  searchQuery?: string;
  filters?: UserFilters;
}

export default function UsersTable({
  userType = 'all',
  searchQuery = '',
  filters: externalFilters
}: UsersTableProps) {
  const { t } = useTranslation(['common', 'users']);
  const router = useRouter();

  // State
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Combine external filters with component filters
  const filters: UserFilters = {
    ...externalFilters,
    search: searchQuery,
    ...(userType !== 'all' && { role: [userType] }),
  };

  // Fetch users
  const fetchUsers = async (newPage: number = page) => {
    try {
      setLoading(true);
      setError(null);

      // If going to first page, reset lastDoc
      const docToStartAfter = newPage === 0 ? undefined : lastDoc || undefined;

      const response = await userService.getUsers(
        newPage + 1,
        rowsPerPage,
        filters,
        docToStartAfter
      );

      setUsers(response.data);
      setTotalUsers(response.total);
      setLastDoc(response.lastDoc || null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Fetch users when filters, page, or rowsPerPage changes
  useEffect(() => {
    fetchUsers(0); // Reset to first page when filters change
    setPage(0);
  }, [JSON.stringify(filters), rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
    fetchUsers(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  // Handle action menu
  const handleOpenActionMenu = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedUser(user);
  };

  const handleCloseActionMenu = () => {
    setActionMenuAnchor(null);
  };

  const handleEditUser = (user: User) => {
    setEditUser(user);
    setOpenEditDialog(true);
    handleCloseActionMenu();
  };

  const handleViewUser = (userId: string) => {
    router.push(`/dashboard/users/${userId}`);
    handleCloseActionMenu();
  };

  const handleDeleteUser = (user: User) => {
    setDeleteUser(user);
    setOpenDeleteDialog(true);
    handleCloseActionMenu();
  };

  const handleToggleUserStatus = async (user: User) => {
    try {
      await userService.changeUserStatus(user.id, !user.isActive);
      fetchUsers(page); // Refresh the current page
    } catch (err) {
      console.error('Error changing user status:', err);
      // Show error notification
    }
    handleCloseActionMenu();
  };

  const handleConfirmDelete = async () => {
    if (deleteUser) {
      try {
        await userService.deleteUser(deleteUser.id);
        fetchUsers(page); // Refresh the current page
      } catch (err) {
        console.error('Error deleting user:', err);
        // Show error notification
      }
    }
    setOpenDeleteDialog(false);
    setDeleteUser(null);
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <AdminIcon fontSize="small" />;
      case 'merchant':
        return <MerchantIcon fontSize="small" />;
      case 'customer':
        return <CustomerIcon fontSize="small" />;
      case 'support':
        return <SupportIcon fontSize="small" />;
      default:
        return <CustomerIcon fontSize="small" />;
    }
  };

  // Get role color
  const getRoleColor = (role: string): 'primary' | 'secondary' | 'default' | 'error' | 'info' | 'success' | 'warning' => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'merchant':
        return 'secondary';
      case 'customer':
        return 'primary';
      case 'support':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading && users.length === 0) {
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

  if (users.length === 0 && !loading) {
    return (
      <Box p={2}>
        <Typography color="textSecondary">{t('users:noUsersFound')}</Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="users table">
          <TableHead>
            <TableRow>
              <TableCell>{t('users:table.user')}</TableCell>
              <TableCell>{t('users:table.email')}</TableCell>
              <TableCell>{t('users:table.role')}</TableCell>
              <TableCell>{t('users:table.status')}</TableCell>
              <TableCell>{t('users:table.joinDate')}</TableCell>
              {userType === 'merchant' && (
                <TableCell>{t('users:table.storeName')}</TableCell>
              )}
              <TableCell align="right">{t('common:actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell component="th" scope="row">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      src={user.avatar}
                      alt={`${user.firstName} ${user.lastName}`}
                      sx={{ mr: 2, width: 40, height: 40 }}
                    >
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body1">
                        {user.firstName} {user.lastName}
                      </Typography>
                      {user.storeName && (
                        <Typography variant="caption" color="textSecondary">
                          {user.storeName}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    icon={getRoleIcon(user.role)}
                    label={t(`users:roles.${user.role}`)}
                    color={getRoleColor(user.role)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.isActive ? t('users:status.active') : t('users:status.inactive')}
                    color={user.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{format(user.createdAt, 'MMM d, yyyy')}</TableCell>
                {userType === 'merchant' && (
                  <TableCell>{user.storeName || '-'}</TableCell>
                )}
                <TableCell align="right">
                  <Tooltip title={t('common:view')}>
                    <IconButton size="small" onClick={() => handleViewUser(user.id)}>
                      <ViewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('common:edit')}>
                    <IconButton size="small" onClick={() => handleEditUser(user)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <IconButton
                    size="small"
                    onClick={(e) => handleOpenActionMenu(e, user)}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={totalUsers}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <UserFormDialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        userType={userType === 'all' ? 'customer' : userType}
        user={editUser}
        onSave={() => fetchUsers(page)}
      />

      <DeleteConfirmDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title={t('users:deleteDialog.title')}
        content={t('users:deleteDialog.content', {
          name: deleteUser ? `${deleteUser.firstName} ${deleteUser.lastName}` : ''
        })}
      />

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleCloseActionMenu}
      >
        <MenuItem onClick={() => selectedUser && handleViewUser(selectedUser.id)}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('common:view')} />
        </MenuItem>
        <MenuItem onClick={() => selectedUser && handleEditUser(selectedUser)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('common:edit')} />
        </MenuItem>
        <MenuItem onClick={() => selectedUser && handleToggleUserStatus(selectedUser)}>
          <ListItemIcon>
            {selectedUser?.isActive ? (
              <BlockIcon fontSize="small" />
            ) : (
              <CheckCircleIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText
            primary={selectedUser?.isActive ? t('users:actions.deactivate') : t('users:actions.activate')}
          />
        </MenuItem>
        <MenuItem onClick={() => selectedUser && handleDeleteUser(selectedUser)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('common:delete')} />
        </MenuItem>
      </Menu>
    </>
  );
}
