import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Skeleton,
  useTheme
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon
} from '@mui/icons-material';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  change?: number;
  changeLabel?: string;
  loading?: boolean;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  change,
  changeLabel,
  loading = false,
  color = 'primary'
}) => {
  const theme = useTheme();

  // Determine trend icon and color
  const getTrendIcon = () => {
    if (change === undefined) return undefined;

    if (change > 0) {
      return <TrendingUpIcon fontSize="small" sx={{ color: theme.palette.success.main }} />;
    } else if (change < 0) {
      return <TrendingDownIcon fontSize="small" sx={{ color: theme.palette.error.main }} />;
    } else {
      return <TrendingFlatIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />;
    }
  };

  const getTrendColor = () => {
    if (change === undefined) return 'default';

    if (change > 0) {
      return 'success';
    } else if (change < 0) {
      return 'error';
    } else {
      return 'default';
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'visible'
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          left: 20,
          width: 60,
          height: 60,
          borderRadius: '50%',
          backgroundColor: theme.palette[color].main,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme.palette[color].contrastText,
          boxShadow: theme.shadows[4]
        }}
      >
        {icon}
      </Box>

      <CardContent sx={{ pt: 5, pb: 2, px: 2 }}>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {title}
        </Typography>

        {loading ? (
          <Skeleton variant="text" width="80%" height={40} />
        ) : (
          <Typography variant="h4" component="div" sx={{ mb: 1 }}>
            {value}
          </Typography>
        )}

        {change !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            {loading ? (
              <Skeleton variant="text" width="60%" height={24} />
            ) : (
              <>
                <Chip
                  icon={getTrendIcon()}
                  label={`${change > 0 ? '+' : ''}${change}%`}
                  size="small"
                  color={getTrendColor()}
                  variant="outlined"
                  sx={{ mr: 1 }}
                />
                {changeLabel && (
                  <Typography variant="caption" color="textSecondary">
                    {changeLabel}
                  </Typography>
                )}
              </>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
