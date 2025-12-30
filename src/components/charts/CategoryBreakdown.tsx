import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ChartContainer } from './ChartContainer';
import { CHART_COLORS } from '@/lib/constants';
import { formatCurrency } from '@/lib/formatters';
import type { CategoryData } from '@/types';

interface CategoryBreakdownProps {
  data: CategoryData[];
  onCategoryClick?: (category: string) => void;
}

export function CategoryBreakdown({ data, onCategoryClick }: CategoryBreakdownProps) {
  // Take top 9 and group the rest as "Others"
  const top9 = data.slice(0, 9);
  const others = data.slice(9);
  const othersTotal = others.reduce((s, c) => s + Math.abs(c.total), 0);

  const chartData = [
    ...top9.map(c => ({ name: c.category, value: Math.abs(c.total) })),
    ...(othersTotal > 0 ? [{ name: 'Others', value: othersTotal }] : [])
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            {formatCurrency(data.value)} ({((data.value / chartData.reduce((s, c) => s + c.value, 0)) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ChartContainer title="Expense Categories">
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            paddingAngle={2}
            dataKey="value"
            labelLine={false}
            label={renderCustomLabel}
            onClick={(entry) => onCategoryClick?.(entry.name)}
            style={{ cursor: 'pointer' }}
          >
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CHART_COLORS.categories[index % CHART_COLORS.categories.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            formatter={(value) => (
              <span className="text-sm text-gray-600">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
