import type {
  Transaction,
  DashboardKPIs,
  MonthlyData,
  CategoryData,
  BankData,
  MerchantData,
  SpendingGroupData,
  FilterState
} from '@/types';

// Helper to group array by key
function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

// Apply filters to transactions
export function filterTransactions(
  transactions: Transaction[],
  filters: FilterState
): Transaction[] {
  return transactions.filter(tx => {
    // Date range filter
    if (tx.date < filters.dateRange.start || tx.date > filters.dateRange.end) {
      return false;
    }

    // Bank filter (empty = all)
    if (filters.banks.length > 0 && !filters.banks.includes(tx.bankName)) {
      return false;
    }

    // Category filter
    if (filters.categories.length > 0 && !filters.categories.includes(tx.category)) {
      return false;
    }

    // Transaction type filter
    if (filters.transactionTypes.length > 0 && !filters.transactionTypes.includes(tx.transactionType)) {
      return false;
    }

    // Spending group filter
    if (filters.spendingGroups.length > 0 && !filters.spendingGroups.includes(tx.spendingGroup)) {
      return false;
    }

    // Amount range filter
    if (tx.amount < filters.amountRange.min || tx.amount > filters.amountRange.max) {
      return false;
    }

    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const searchFields = [
        tx.description,
        tx.merchant,
        tx.category,
        tx.enhancedDescription,
        tx.subCategory
      ].join(' ').toLowerCase();
      if (!searchFields.includes(query)) {
        return false;
      }
    }

    return true;
  });
}

// Compute KPIs from transactions
export function computeKPIs(transactions: Transaction[]): DashboardKPIs {
  const income = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expenses = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const dates = transactions
    .filter(t => t.date)
    .map(t => new Date(t.date).getTime());

  return {
    totalTransactions: transactions.length,
    totalIncome: income,
    totalExpenses: expenses,
    netPosition: income - expenses,
    savingsRate: income > 0 ? (income - expenses) / income : 0,
    avgTransaction: transactions.length > 0 
      ? transactions.reduce((s, t) => s + t.amount, 0) / transactions.length 
      : 0,
    dateRange: {
      start: dates.length > 0 ? new Date(Math.min(...dates)) : new Date(),
      end: dates.length > 0 ? new Date(Math.max(...dates)) : new Date()
    }
  };
}

// Aggregate by month
export function aggregateByMonth(transactions: Transaction[]): MonthlyData[] {
  const grouped = groupBy(transactions, 'payMonth');
  
  return Object.entries(grouped)
    .map(([month, txns]) => {
      const income = txns.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
      const expenses = txns.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
      const net = income - expenses;
      
      return {
        month,
        transactions: txns.length,
        income,
        expenses,
        net,
        savingsRate: income > 0 ? net / income : 0
      };
    })
    .sort((a, b) => a.month.localeCompare(b.month));
}

// Aggregate by category
export function aggregateByCategory(transactions: Transaction[]): CategoryData[] {
  const grouped = groupBy(transactions, 'category');
  
  return Object.entries(grouped)
    .map(([category, txns]) => {
      const total = txns.reduce((s, t) => s + t.amount, 0);
      const amounts = txns.map(t => t.amount);
      
      return {
        category,
        transactions: txns.length,
        total,
        average: total / txns.length,
        min: Math.min(...amounts),
        max: Math.max(...amounts)
      };
    })
    .sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
}

// Aggregate by bank and account type
export function aggregateByBank(transactions: Transaction[]): BankData[] {
  const results: BankData[] = [];
  
  const byBank = groupBy(transactions, 'bankName');
  
  for (const [bank, bankTxns] of Object.entries(byBank)) {
    const byAccount = groupBy(bankTxns, 'accountType');
    
    for (const [accountType, txns] of Object.entries(byAccount)) {
      const income = txns.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
      const expenses = txns.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
      
      results.push({
        bank,
        accountType,
        transactions: txns.length,
        total: txns.reduce((s, t) => s + t.amount, 0),
        income,
        expenses
      });
    }
  }
  
  return results.sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
}

// Aggregate by merchant
export function aggregateByMerchant(transactions: Transaction[], limit = 15): MerchantData[] {
  const grouped = groupBy(transactions, 'merchant');
  
  return Object.entries(grouped)
    .map(([merchant, txns]) => {
      const total = txns.reduce((s, t) => s + t.amount, 0);
      const primaryCategory = getMostFrequent(txns.map(t => t.category));
      
      return {
        merchant,
        category: primaryCategory,
        transactions: txns.length,
        total,
        average: total / txns.length
      };
    })
    .sort((a, b) => Math.abs(b.total) - Math.abs(a.total))
    .slice(0, limit);
}

// Aggregate by spending group
export function aggregateBySpendingGroup(transactions: Transaction[]): SpendingGroupData[] {
  const grouped = groupBy(transactions, 'spendingGroup');
  
  return Object.entries(grouped)
    .map(([group, txns]) => ({
      group,
      transactions: txns.length,
      total: txns.reduce((s, t) => s + t.amount, 0)
    }))
    .sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
}

// Helper to get most frequent value in array
function getMostFrequent(arr: string[]): string {
  const counts: Record<string, number> = {};
  let maxCount = 0;
  let mostFrequent = arr[0] || '';
  
  for (const item of arr) {
    counts[item] = (counts[item] || 0) + 1;
    if (counts[item] > maxCount) {
      maxCount = counts[item];
      mostFrequent = item;
    }
  }
  
  return mostFrequent;
}

// Get expense-only categories for pie chart
export function getExpenseCategories(transactions: Transaction[], limit = 10): CategoryData[] {
  const expenseOnly = transactions.filter(t => t.amount < 0);
  return aggregateByCategory(expenseOnly).slice(0, limit);
}

// Calculate month-over-month change
export function calculateMoMChange(monthlyData: MonthlyData[]): { income: number; expenses: number; net: number } | null {
  if (monthlyData.length < 2) return null;
  
  const current = monthlyData[monthlyData.length - 1];
  const previous = monthlyData[monthlyData.length - 2];
  
  return {
    income: previous.income > 0 ? (current.income - previous.income) / previous.income : 0,
    expenses: previous.expenses > 0 ? (current.expenses - previous.expenses) / previous.expenses : 0,
    net: previous.net !== 0 ? (current.net - previous.net) / Math.abs(previous.net) : 0
  };
}
