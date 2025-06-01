import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  CircularProgress,
  Typography,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { dashboardService } from '@/services';
import { format, subDays } from 'date-fns';

// Interface for chart data
interface ChartData {
  date: string;
  redemptions: number;
  issuances?: number;
}

interface RedemptionChartProps {
  height?: number;
}

export default function RedemptionChart({ height = 300 }: RedemptionChartProps) {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await dashboardService.getRedemptionChartData();

        // Filter data based on selected time range
        const filteredData = filterDataByTimeRange(data, timeRange);

        setChartData(filteredData);
      } catch (err) {
        console.error('Error fetching redemption chart data:', err);
        setError('Failed to load chart data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  const filterDataByTimeRange = (data: ChartData[], range: '7d' | '30d' | '90d'): ChartData[] => {
    const today = new Date();
    let startDate: Date;

    switch (range) {
      case '7d':
        startDate = subDays(today, 7);
        break;
      case '30d':
        startDate = subDays(today, 30);
        break;
      case '90d':
        startDate = subDays(today, 90);
        break;
      default:
        startDate = subDays(today, 30);
    }

    return data.filter(item => new Date(item.date) >= startDate);
  };

  const handleTimeRangeChange = (
    event: React.MouseEvent<HTMLElement>,
    newTimeRange: '7d' | '30d' | '90d' | null,
  ) => {
    if (newTimeRange !== null) {
      setTimeRange(newTimeRange);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'MMM d');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={height}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={height}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" alignItems="center" mb={2}>
        <ToggleButtonGroup
          value={timeRange}
          exclusive
          onChange={handleTimeRangeChange}
          size="small"
        >
          <ToggleButton value="7d">7D</ToggleButton>
          <ToggleButton value="30d">30D</ToggleButton>
          <ToggleButton value="90d">90D</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ width: '100%', height }}>
        <ResponsiveContainer>
          <AreaChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke={theme.palette.text.secondary}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              stroke={theme.palette.text.secondary}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: number) => [value, 'Redemptions']}
              labelFormatter={formatDate}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="redemptions"
              stroke={theme.palette.secondary.main}
              fill={theme.palette.secondary.light}
              fillOpacity={0.3}
              activeDot={{ r: 8 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
