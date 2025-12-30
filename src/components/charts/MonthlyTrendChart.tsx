import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { ChartContainer } from './ChartContainer';
import { CHART_COLORS } from '@/lib/constants';
import { formatCurrency, getMonthLabel } from '@/lib/formatters';
import type { MonthlyData } from '@/types';

interface MonthlyTrendChartProps {
  data: MonthlyData[];
  onMonthClick?: (month: string) => void;
}

export function MonthlyTrendChart({ data, onMonthClick }: MonthlyTrendChartProps) {
  const chartData = data.map(d => ({
    ...d,
    monthLabel: getMonthLabel(d.month),
    expensesPositive: d.expenses // Already positive from aggregation
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ChartContainer title="Monthly Income & Expenses">
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart 
          data={chartData}
          onClick={(e) => {
            if (e?.activePayload?.[0] && onMonthClick) {
              onMonthClick(e.activePayload[0].payload.month);
            }
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="monthLabel" 
            tick={{ fontSize: 12 }}
            tickLine={false}
          />
          <YAxis 
            tickFormatter={(v) => formatCurrency(v, true)}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            dataKey="income" 
            fill={CHART_COLORS.income} 
            name="Income"
            radius={[4, 4, 0, 0]}
            cursor="pointer"
          />
          <Bar 
            dataKey="expensesPositive" 
            fill={CHART_COLORS.expense} 
            name="Expenses"
            radius={[4, 4, 0, 0]}
            cursor="pointer"
          />
          <Line
            type="monotone"
            dataKey="net"
            stroke={CHART_COLORS.net}
            strokeWidth={3}
            name="Net"
            dot={{ fill: CHART_COLORS.net, strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
