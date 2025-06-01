import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  Typography,
  CircularProgress,
  Link
} from '@mui/material';
import { format, isAfter } from 'date-fns';
import { dashboardService } from '@/services';
import NextLink from 'next/link';

interface RecentCoupon {
  id: string;
  title: string;
  merchantName: string;
  discountValue: number;
  discountType: string;
  redemptionCount: number;
  expiryDate: Date;
  isActive: boolean;
}

export default function RecentCouponsTable() {
  const [coupons, setCoupons] = useState<RecentCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoading(true);
        setError(null);

        const recentCoupons = await dashboardService.getRecentCoupons(5);
        setCoupons(recentCoupons);
      } catch (err) {
        console.error('Error fetching recent coupons:', err);
        setError('Failed to load recent coupons');
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  const getStatus = (coupon: RecentCoupon): string => {
    if (!coupon.isActive) return 'inactive';
    return isAfter(coupon.expiryDate, new Date()) ? 'active' : 'expired';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'expired':
        return 'error';
      case 'scheduled':
        return 'info';
      case 'inactive':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
        <CircularProgress size={24} />
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

  if (coupons.length === 0) {
    return (
      <Box p={2}>
        <Typography color="textSecondary">No coupons found</Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Merchant</TableCell>
            <TableCell>Redemptions</TableCell>
            <TableCell>Expiry</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {coupons.map((coupon) => {
            const status = getStatus(coupon);
            return (
              <TableRow key={coupon.id} hover>
                <TableCell>
                  <NextLink href={`/dashboard/coupons/${coupon.id}`} passHref>
                    <Link underline="hover">
                      <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                        {coupon.title}
                      </Typography>
                    </Link>
                  </NextLink>
                </TableCell>
                <TableCell>{coupon.merchantName}</TableCell>
                <TableCell>{coupon.redemptionCount}</TableCell>
                <TableCell>{format(coupon.expiryDate, 'MMM d, yyyy')}</TableCell>
                <TableCell>
                  <Chip
                    label={status}
                    color={getStatusColor(status) as any}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
