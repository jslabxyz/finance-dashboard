import {
  BarChart,
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
import { formatCurrency } from '@/lib/formatters';
import type { BankData } from '@/types';

interface BankDistributionProps {
  data: BankData[];
}

export function BankDistribution({ data }: BankDistributionProps) {
  // Group by bank
  const bankGroups: Record<string, { income: number; expenses: number }> = {};
  
  data.forEach(d => {
    if (!bankGroups[d.bank]) {
      bankGroups[d.bank] = { income: 0, expenses: 0 };
    }
    bankGroups[d.bank].income += d.income;
    bankGroups[d.bank].expenses += d.expenses;
  });

  const chartData = Object.entries(bankGroups).map(([bank, values]) => ({
    bank,
    income: values.income,
    expenses: values.expenses
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
    <ChartContainer title="Bank Distribution">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            type="number" 
            tickFormatter={(v) => formatCurrency(v, true)}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            type="category" 
            dataKey="bank"
            tick={{ fontSize: 12 }}
            width={120}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            dataKey="income" 
            fill={CHART_COLORS.income} 
            name="Income"
            radius={[0, 4, 4, 0]}
          />
          <Bar 
            dataKey="expenses" 
            fill={CHART_COLORS.expense} 
            name="Expenses"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
