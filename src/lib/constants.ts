// Chart color palette
export const CHART_COLORS = {
  income: '#22c55e',
  expense: '#ef4444',
  net: '#3b82f6',
  transfer: '#8b5cf6',
  savings: '#06b6d4',
  neutral: '#6b7280',

  banks: {
    'Discovery Bank': '#2563eb',
    'Capitec Bank': '#dc2626',
    'Easy Equities': '#16a34a',
    'FNB': '#ca8a04',
  } as Record<string, string>,

  categories: [
    '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
    '#14b8a6', '#a855f7', '#eab308', '#0ea5e9', '#d946ef'
  ],

  spendingGroups: {
    'Day-to-day': '#ef4444',
    'Recurring': '#f59e0b',
    'Transfer': '#8b5cf6',
    'Income': '#22c55e',
    'Invest-save-repay': '#3b82f6',
    'Discretionary': '#ec4899',
    'Non-Expense': '#6b7280',
    'Exceptions': '#dc2626',
    'Essential': '#0ea5e9'
  } as Record<string, string>,

  transactionTypes: {
    'Expense': '#ef4444',
    'Income': '#22c55e',
    'Transfer': '#8b5cf6',
    'Refund': '#06b6d4'
  } as Record<string, string>
};

// Default filter state
export const DEFAULT_FILTERS = {
  dateRange: { start: '2025-03-01', end: '2025-12-31' },
  banks: [],
  categories: [],
  transactionTypes: [],
  spendingGroups: [],
  amountRange: { min: -60000, max: 70000 },
  searchQuery: ''
};

// Table configuration
export const TABLE_PAGE_SIZE = 25;

// Currency formatting
export const CURRENCY_CONFIG = {
  locale: 'en-ZA',
  currency: 'ZAR',
  symbol: 'R'
};
