import { useEffect } from 'react';
import { useDashboardStore } from '@/stores/dashboardStore';
import type { TransactionData } from '@/types';

export function useTransactions() {
  const { setData, setLoading, setError, isLoading, error, transactions } = useDashboardStore();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const response = await fetch('/data/transactions.json', { cache: 'no-store' });
        
        if (!response.ok) {
          throw new Error(`Failed to load data: ${response.status}`);
        }
        
        const data: TransactionData = await response.json();
        if (data.metadata?.synthetic !== true) {
          throw new Error('Only synthetic demonstration data is allowed.');
        }
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
