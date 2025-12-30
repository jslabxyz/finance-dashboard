import { format, parseISO } from 'date-fns';
import { CURRENCY_CONFIG } from './constants';

export function formatCurrency(value: number, compact = false): string {
  if (compact && Math.abs(value) >= 1000) {
    const absValue = Math.abs(value);
    if (absValue >= 1000000) {
      return `${CURRENCY_CONFIG.symbol}${(value / 1000000).toFixed(1)}M`;
    }
    return `${CURRENCY_CONFIG.symbol}${(value / 1000).toFixed(1)}K`;
  }
  
  return new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
    style: 'currency',
    currency: CURRENCY_CONFIG.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCurrencyFull(value: number): string {
  return new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
    style: 'currency',
    currency: CURRENCY_CONFIG.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat(CURRENCY_CONFIG.locale).format(value);
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatDate(dateString: string): string {
  try {
    return format(parseISO(dateString), 'dd MMM yyyy');
  } catch {
    return dateString;
  }
}

export function formatMonth(monthString: string): string {
  try {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return format(date, 'MMM yyyy');
  } catch {
    return monthString;
  }
}

export function formatShortMonth(monthString: string): string {
  try {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return format(date, 'MMM');
  } catch {
    return monthString;
  }
}

export function getMonthLabel(monthString: string): string {
  try {
    const [, month] = monthString.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[parseInt(month) - 1] || monthString;
  } catch {
    return monthString;
  }
}
