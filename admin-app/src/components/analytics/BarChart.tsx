import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  useTheme,
  Skeleton,
  Typography,
  Divider
} from '@mui/material';
import { 
  BarChart as MuiBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface DataPoint {
  [key: string]: any;
}

interface BarChartProps {
  title: string;
  data: DataPoint[];
  xAxisKey: string;
  series: {
    name: string;
    dataKey: string;
    color?: string;
  }[];
  loading?: boolean;
  height?: number;
  subtitle?: string;
  layout?: 'vertical' | 'horizontal';
  stacked?: boolean;
}

const BarChart: React.FC<BarChartProps> = ({
  title,
  data,
  xAxisKey,
  series,
  loading = false,
  height = 300,
  subtitle,
  layout = 'horizontal',
  stacked = false
}) => {
  const theme = useTheme();
  
  // Generate default colors if not provided
  const defaultColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.info.main
  ];
  
  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader 
        title={title} 
        titleTypographyProps={{ variant: 'h6' }}
        subheader={subtitle}
        subheaderTypographyProps={{ variant: 'body2', color: 'textSecondary' }}
      />
      <Divider />
      <CardContent sx={{ height: height, pt: 2 }}>
        {loading ? (
          <Box sx={{ width: '100%', height: '100%' }}>
            <Skeleton variant="rectangular" width="100%" height="100%" />
          </Box>
        ) : data.length === 0 ? (
          <Box 
            sx={{ 
              width: '100%', 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}
          >
            <Typography variant="body2" color="textSecondary">
              No data available
            </Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <MuiBarChart
              data={data}
              layout={layout}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              {layout === 'horizontal' ? (
                <>
                  <XAxis 
                    dataKey={xAxisKey} 
                    tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                    stroke={theme.palette.divider}
                  />
                  <YAxis 
                    tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                    stroke={theme.palette.divider}
                  />
                </>
              ) : (
                <>
                  <XAxis 
                    type="number"
                    tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                    stroke={theme.palette.divider}
                  />
                  <YAxis 
                    dataKey={xAxisKey}
                    type="category"
                    tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                    stroke={theme.palette.divider}
                    width={120}
                  />
                </>
              )}
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 4,
                  boxShadow: theme.shadows[3],
                }}
                labelStyle={{ color: theme.palette.text.primary }}
                itemStyle={{ color: theme.palette.text.primary }}
              />
              <Legend 
                wrapperStyle={{ 
                  paddingTop: 10,
                  fontSize: 12,
                  color: theme.palette.text.secondary
                }} 
              />
              {series.map((s, index) => (
                <Bar
                  key={s.dataKey}
                  dataKey={s.dataKey}
                  name={s.name}
                  fill={s.color || defaultColors[index % defaultColors.length]}
                  stackId={stacked ? 'stack' : undefined}
                />
              ))}
            </MuiBarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default BarChart;
