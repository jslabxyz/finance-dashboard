import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { ChartContainer } from './ChartContainer';
import { CHART_COLORS } from '@/lib/constants';
import { formatCurrency } from '@/lib/formatters';
import type { SpendingGroupData } from '@/types';

interface SpendingGroupChartProps {
  data: SpendingGroupData[];
}

export function SpendingGroupChart({ data }: SpendingGroupChartProps) {
  const chartData = data
    .filter(d => d.total !== 0)
    .map(d => ({
      ...d,
      absTotal: Math.abs(d.total),
      isPositive: d.total >= 0
    }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{data.group}</p>
          <p className={`text-sm ${data.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(data.total)}
          </p>
          <p className="text-sm text-gray-500">{data.transactions} transactions</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartContainer title="Spending Groups">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="group"
            tick={{ fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            tickFormatter={(v) => formatCurrency(v, true)}
            tick={{ fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="absTotal"
            radius={[4, 4, 0, 0]}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CHART_COLORS.spendingGroups[entry.group] || CHART_COLORS.neutral}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
