import React from 'react';
import {
  ToggleButtonGroup,
  ToggleButton,
  Box,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';

export type Period = 'today' | 'yesterday' | 'week' | 'month' | 'year';

interface PeriodSelectorProps {
  value: Period;
  onChange: (value: Period) => void;
  showToday?: boolean;
  showYesterday?: boolean;
  showWeek?: boolean;
  showMonth?: boolean;
  showYear?: boolean;
  label?: string;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  value,
  onChange,
  showToday = true,
  showYesterday = true,
  showWeek = true,
  showMonth = true,
  showYear = true,
  label = 'Period'
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const handleChange = (
    event: React.MouseEvent<HTMLElement>,
    newValue: Period | null,
  ) => {
    if (newValue !== null) {
      onChange(newValue);
    }
  };
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
      {label && (
        <Typography 
          variant="body2" 
          color="textSecondary"
          sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }}
        >
          {label}:
        </Typography>
      )}
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={handleChange}
        aria-label="period selector"
        size={isMobile ? 'small' : 'medium'}
      >
        {showToday && (
          <ToggleButton value="today" aria-label="today">
            Today
          </ToggleButton>
        )}
        {showYesterday && (
          <ToggleButton value="yesterday" aria-label="yesterday">
            Yesterday
          </ToggleButton>
        )}
        {showWeek && (
          <ToggleButton value="week" aria-label="week">
            Last 7 Days
          </ToggleButton>
        )}
        {showMonth && (
          <ToggleButton value="month" aria-label="month">
            Last 30 Days
          </ToggleButton>
        )}
        {showYear && (
          <ToggleButton value="year" aria-label="year">
            Last Year
          </ToggleButton>
        )}
      </ToggleButtonGroup>
    </Box>
  );
};

export default PeriodSelector;
