import React from 'react';
import { Card, CardContent, Typography, Box, Avatar, Skeleton } from '@mui/material';
import {
  People as UsersIcon,
  Store as StoresIcon,
  LocalOffer as CouponsIcon,
  Redeem as RedemptionsIcon,
  Person as CustomerIcon,
  ShoppingBag as MerchantIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as UpIcon,
  TrendingDown as DownIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  change?: number;
  changeLabel?: string;
  isLoading?: boolean;
}

export default function StatCard({
  title,
  value,
  icon,
  change,
  changeLabel = 'from last month',
  isLoading = false
}: StatCardProps) {
  const theme = useTheme();

  const getIcon = () => {
    switch (icon) {
      case 'users':
        return <UsersIcon />;
      case 'stores':
      case 'merchants':
        return <StoresIcon />;
      case 'coupons':
        return <CouponsIcon />;
      case 'redemptions':
        return <RedemptionsIcon />;
      case 'customer':
        return <CustomerIcon />;
      case 'merchant':
        return <MerchantIcon />;
      case 'money':
        return <MoneyIcon />;
      default:
        return <UsersIcon />;
    }
  };

  const getIconColor = () => {
    switch (icon) {
      case 'users':
      case 'customer':
        return theme.palette.primary.main;
      case 'stores':
      case 'merchants':
      case 'merchant':
        return theme.palette.secondary.main;
      case 'coupons':
        return theme.palette.success.main;
      case 'redemptions':
        return theme.palette.warning.main;
      case 'money':
        return theme.palette.info.main;
      default:
        return theme.palette.primary.main;
    }
  };

  // Format numbers with commas
  const formatValue = (val: number | string): string => {
    if (typeof val === 'string') return val;
    return val.toLocaleString();
  };

  return (
    <Card
      sx={{
        height: '100%',
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: theme.shadows[8],
        },
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar
            sx={{
              bgcolor: `${getIconColor()}20`,
              color: getIconColor(),
              mr: 2,
            }}
          >
            {getIcon()}
          </Avatar>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>

        {isLoading ? (
          <Skeleton variant="rectangular" width="60%" height={40} sx={{ mb: 1 }} />
        ) : (
          <Typography variant="h4" component="div" gutterBottom>
            {formatValue(value)}
          </Typography>
        )}

        {change !== undefined && (
          <Box display="flex" alignItems="center">
            {isLoading ? (
              <Skeleton variant="rectangular" width="40%" height={24} />
            ) : (
              <>
                {change >= 0 ? (
                  <UpIcon fontSize="small" sx={{ color: 'success.main', mr: 0.5 }} />
                ) : (
                  <DownIcon fontSize="small" sx={{ color: 'error.main', mr: 0.5 }} />
                )}
                <Typography
                  variant="body2"
                  color={change >= 0 ? 'success.main' : 'error.main'}
                >
                  {Math.abs(change)}% {changeLabel}
                </Typography>
              </>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
