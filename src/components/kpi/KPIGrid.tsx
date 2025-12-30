import { KPICard } from './KPICard';
import type { DashboardKPIs } from '@/types';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Receipt,
  Calculator
} from 'lucide-react';

interface KPIGridProps {
  kpis: DashboardKPIs;
  momChange?: {
    income: number;
    expenses: number;
    net: number;
  } | null;
}

export function KPIGrid({ kpis, momChange }: KPIGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <KPICard
        title="Total Income"
        value={kpis.totalIncome}
        format="currency"
        colorScheme="green"
        icon={<TrendingUp className="h-5 w-5" />}
        trend={momChange ? {
          value: momChange.income,
          direction: momChange.income > 0 ? 'up' : momChange.income < 0 ? 'down' : 'neutral'
        } : undefined}
      />
      
      <KPICard
        title="Total Expenses"
        value={kpis.totalExpenses}
        format="currency"
        colorScheme="red"
        icon={<TrendingDown className="h-5 w-5" />}
        trend={momChange ? {
          value: momChange.expenses,
          direction: momChange.expenses > 0 ? 'up' : momChange.expenses < 0 ? 'down' : 'neutral'
        } : undefined}
      />
      
      <KPICard
        title="Net Position"
        value={kpis.netPosition}
        format="currency"
        colorScheme={kpis.netPosition >= 0 ? 'blue' : 'red'}
        icon={<Wallet className="h-5 w-5" />}
        trend={momChange ? {
          value: momChange.net,
          direction: momChange.net > 0 ? 'up' : momChange.net < 0 ? 'down' : 'neutral'
        } : undefined}
      />
      
      <KPICard
        title="Savings Rate"
        value={kpis.savingsRate}
        format="percentage"
        colorScheme={kpis.savingsRate >= 0 ? 'green' : 'red'}
        icon={<PiggyBank className="h-5 w-5" />}
      />
      
      <KPICard
        title="Transactions"
        value={kpis.totalTransactions}
        format="number"
        colorScheme="neutral"
        icon={<Receipt className="h-5 w-5" />}
      />
      
      <KPICard
        title="Avg Transaction"
        value={kpis.avgTransaction}
        format="currency"
        colorScheme="neutral"
        icon={<Calculator className="h-5 w-5" />}
      />
    </div>
  );
}
