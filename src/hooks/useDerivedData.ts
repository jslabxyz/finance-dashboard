import { useMemo } from 'react';
import { useDashboardStore } from '@/stores/dashboardStore';
import {
  filterTransactions,
  computeKPIs,
  aggregateByMonth,
  aggregateByCategory,
  aggregateByBank,
  aggregateByMerchant,
  aggregateBySpendingGroup,
  getExpenseCategories,
  calculateMoMChange
} from '@/lib/dataTransform';

export function useDerivedData() {
  const {
    transactions,
    filters,
    selectedCategory,
    selectedMonth,
    filterOptions
  } = useDashboardStore();

  // Step 1: Apply all filters
  const filteredTransactions = useMemo(() => {
    return filterTransactions(transactions, filters);
  }, [transactions, filters]);

  // Step 2: Compute all aggregations from filtered data
  const kpis = useMemo(
    () => computeKPIs(filteredTransactions),
    [filteredTransactions]
  );

  const monthlyData = useMemo(
    () => aggregateByMonth(filteredTransactions),
    [filteredTransactions]
  );

  const categoryData = useMemo(
    () => aggregateByCategory(filteredTransactions),
    [filteredTransactions]
  );

  const expenseCategoryData = useMemo(
    () => getExpenseCategories(filteredTransactions, 10),
    [filteredTransactions]
  );

  const bankData = useMemo(
    () => aggregateByBank(filteredTransactions),
    [filteredTransactions]
  );

  const merchantData = useMemo(
    () => aggregateByMerchant(filteredTransactions, 15),
    [filteredTransactions]
  );

  const spendingGroupData = useMemo(
    () => aggregateBySpendingGroup(filteredTransactions),
    [filteredTransactions]
  );

  const momChange = useMemo(
    () => calculateMoMChange(monthlyData),
    [monthlyData]
  );

  // Step 3: Drill-down data (when category or month selected)
  const drillDownTransactions = useMemo(() => {
    let result = filteredTransactions;
    
    if (selectedCategory) {
      result = result.filter(tx => tx.category === selectedCategory);
    }
    
    if (selectedMonth) {
      result = result.filter(tx => tx.payMonth === selectedMonth);
    }
    
    return result;
  }, [filteredTransactions, selectedCategory, selectedMonth]);

  return {
    // Filtered data
    filteredTransactions,
    drillDownTransactions,
    
    // Aggregations
    kpis,
    monthlyData,
    categoryData,
    expenseCategoryData,
    bankData,
    merchantData,
    spendingGroupData,
    momChange,
    
    // Counts
    totalCount: transactions.length,
    filteredCount: filteredTransactions.length,
    
    // Filter options
    filterOptions
  };
}
