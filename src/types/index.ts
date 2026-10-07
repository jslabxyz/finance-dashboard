// Transaction Types
export interface Transaction {
  id: string;
  date: string;
  enhancedDescription: string;
  merchant: string;
  category: string;
  subCategory: string;
  spendingGroup: SpendingGroup;
  transactionType: TransactionType;
  amount: number;
  bankName: BankName;
  accountType: AccountType;
  account: string;
  payMonth: string;
  description: string;
}

export type SpendingGroup =
  | 'Day-to-day'
  | 'Recurring'
  | 'Transfer'
  | 'Income'
  | 'Invest-save-repay'
  | 'Discretionary'
  | 'Non-Expense'
  | 'Exceptions'
  | 'Essential';

export type TransactionType = 'Expense' | 'Income' | 'Transfer' | 'Refund';
export type BankName = 'Discovery Bank' | 'Capitec Bank' | 'Easy Equities' | 'FNB';
export type AccountType = 'Current Account' | 'Credit Card' | 'Tax Free Savings' | 'Retirement Fund' | 'Trading Account';

// Data file structure
export interface TransactionData {
  transactions: Transaction[];
  metadata: {
    synthetic: true;
    fixtureVersion: number;
    exportedAt: string;
    totalRecords: number;
    dateRange: { start: string; end: string };
    amountRange: { min: number; max: number };
  };
  filterOptions: {
    categories: string[];
    subCategories: string[];
    spendingGroups: string[];
    transactionTypes: string[];
    banks: string[];
    accountTypes: string[];
    payMonths: string[];
  };
}

// Aggregated Data Types
export interface DashboardKPIs {
  totalTransactions: number;
  totalIncome: number;
  totalExpenses: number;
  netPosition: number;
  savingsRate: number;
  avgTransaction: number;
  dateRange: { start: Date; end: Date };
}

export interface MonthlyData {
  month: string;
  transactions: number;
  income: number;
  expenses: number;
  net: number;
  savingsRate: number;
}

export interface CategoryData {
  category: string;
  transactions: number;
  total: number;
  average: number;
  min: number;
  max: number;
}

export interface BankData {
  bank: string;
  accountType: string;
  transactions: number;
  total: number;
  income: number;
  expenses: number;
}

export interface MerchantData {
  merchant: string;
  category: string;
  transactions: number;
  total: number;
  average: number;
}

export interface SpendingGroupData {
  group: string;
  transactions: number;
  total: number;
}

// Filter State
export interface FilterState {
  dateRange: { start: string; end: string };
  banks: string[];
  categories: string[];
  transactionTypes: string[];
  spendingGroups: string[];
  amountRange: { min: number; max: number };
  searchQuery: string;
}

// Chart Props
export interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}
