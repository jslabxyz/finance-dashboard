import { useEffect } from 'react';
import { useDashboardStore } from '@/stores/dashboardStore';
import type { TransactionData } from '@/types';

export function useTransactions() {
  const { setData, setLoading, setError, isLoading, error, transactions } = useDashboardStore();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const response = await fetch('/data/transactions.json');
        
        if (!response.ok) {
          throw new Error(`Failed to load data: ${response.status}`);
        }
        
        const data: TransactionData = await response.json();
        setData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load transaction data');
      }
    }

    if (transactions.length === 0) {
      loadData();
    }
  }, [setData, setLoading, setError, transactions.length]);

  return { isLoading, error };
}
