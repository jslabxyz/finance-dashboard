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
import type { MerchantData } from '@/types';

interface MerchantRankingProps {
  data: MerchantData[];
  limit?: number;
}

export function MerchantRanking({ data, limit = 12 }: MerchantRankingProps) {
  const chartData = data.slice(0, limit).map(d => ({
    ...d,
    displayName: d.merchant.length > 25 ? d.merchant.slice(0, 22) + '...' : d.merchant,
    absTotal: Math.abs(d.total),
    isPositive: d.total >= 0
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{data.merchant}</p>
          <p className="text-sm text-gray-500">{data.category}</p>
          <p className="text-sm mt-1">
            <span className={data.isPositive ? 'text-green-600' : 'text-red-600'}>
              {formatCurrency(data.total)}
            </span>
            <span className="text-gray-400 ml-2">({data.transactions} txns)</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartContainer title="Top Merchants by Volume">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            type="number"
            tickFormatter={(v) => formatCurrency(v, true)}
            tick={{ fontSize: 11 }}
          />
          <YAxis 
            type="category"
            dataKey="displayName"
            tick={{ fontSize: 11 }}
            width={150}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="absTotal"
            radius={[0, 4, 4, 0]}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.isPositive ? CHART_COLORS.income : CHART_COLORS.expense}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
