import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency, formatPercentage, formatNumber } from '@/lib/formatters';

interface KPICardProps {
  title: string;
  value: number;
  format?: 'currency' | 'percentage' | 'number';
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  icon?: React.ReactNode;
  colorScheme?: 'green' | 'red' | 'blue' | 'neutral';
}

export function KPICard({
  title,
  value,
  format = 'number',
  trend,
  icon,
  colorScheme = 'neutral'
}: KPICardProps) {
  const formattedValue = (() => {
    switch (format) {
      case 'currency':
        return formatCurrency(value, true);
      case 'percentage':
        return formatPercentage(value);
      case 'number':
      default:
        return formatNumber(value);
    }
  })();

  const colorClasses = {
    green: 'bg-green-50 border-green-100',
    red: 'bg-red-50 border-red-100',
    blue: 'bg-blue-50 border-blue-100',
    neutral: 'bg-white border-gray-100'
  };

  const valueColorClasses = {
    green: 'text-green-700',
    red: 'text-red-700',
    blue: 'text-blue-700',
    neutral: 'text-gray-900'
  };

  return (
    <div className={cn(
      'rounded-xl border p-5 shadow-sm',
      colorClasses[colorScheme]
    )}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        {icon && <span className="text-gray-400">{icon}</span>}
      </div>
      
      <div className="mt-2">
        <span className={cn(
          'text-2xl font-bold',
          valueColorClasses[colorScheme]
        )}>
          {formattedValue}
        </span>
      </div>

      {trend && (
        <div className="mt-2 flex items-center gap-1">
          {trend.direction === 'up' && (
            <TrendingUp className="h-4 w-4 text-green-500" />
          )}
          {trend.direction === 'down' && (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          {trend.direction === 'neutral' && (
            <Minus className="h-4 w-4 text-gray-400" />
          )}
          <span className={cn(
            'text-sm font-medium',
            trend.direction === 'up' && 'text-green-600',
            trend.direction === 'down' && 'text-red-600',
            trend.direction === 'neutral' && 'text-gray-500'
          )}>
            {formatPercentage(Math.abs(trend.value))} vs last month
          </span>
        </div>
      )}
    </div>
  );
}
