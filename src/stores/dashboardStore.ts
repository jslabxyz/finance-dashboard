import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Transaction, FilterState, TransactionData } from '@/types';
import { DEFAULT_FILTERS } from '@/lib/constants';

// Keys for localStorage
const USER_TRANSACTIONS_KEY = 'jason-finance-user-transactions';
const DELETED_TRANSACTIONS_KEY = 'jason-finance-deleted-transactions';

interface DashboardState {
  // Data
  transactions: Transaction[];
  filterOptions: TransactionData['filterOptions'] | null;
  metadata: TransactionData['metadata'] | null;
  isLoading: boolean;
  error: string | null;

  // Filters
  filters: FilterState;

  // UI State
  selectedCategory: string | null;
  selectedMonth: string | null;
  tablePageIndex: number;
  isSidebarOpen: boolean;
  editingTransaction: Transaction | null;
  isTransactionModalOpen: boolean;

  // Actions
  setData: (data: TransactionData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
  setSelectedCategory: (category: string | null) => void;
  setSelectedMonth: (month: string | null) => void;
  setTablePageIndex: (index: number) => void;
  toggleSidebar: () => void;
  
  // Transaction CRUD
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  openTransactionModal: (transaction?: Transaction) => void;
  closeTransactionModal: () => void;
}

// Helper to load user transactions from localStorage
function loadUserTransactions(): Transaction[] {
  try {
    const stored = localStorage.getItem(USER_TRANSACTIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Helper to save user transactions to localStorage
function saveUserTransactions(transactions: Transaction[]) {
  localStorage.setItem(USER_TRANSACTIONS_KEY, JSON.stringify(transactions));
}

// Helper to load deleted transaction IDs
function loadDeletedIds(): Set<string> {
  try {
    const stored = localStorage.getItem(DELETED_TRANSACTIONS_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

// Helper to save deleted transaction IDs
function saveDeletedIds(ids: Set<string>) {
  localStorage.setItem(DELETED_TRANSACTIONS_KEY, JSON.stringify([...ids]));
}

// Generate unique ID for new transactions
function generateId(): string {
  return `tx_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      // Initial state
      transactions: [],
      filterOptions: null,
      metadata: null,
      isLoading: true,
      error: null,
      filters: DEFAULT_FILTERS,
      selectedCategory: null,
      selectedMonth: null,
      tablePageIndex: 0,
      isSidebarOpen: false,
      editingTransaction: null,
      isTransactionModalOpen: false,

      // Actions
      setData: (data) => {
        // Merge with user transactions and filter out deleted ones
        const userTransactions = loadUserTransactions();
        const deletedIds = loadDeletedIds();
        
        // Filter out deleted transactions from original data
        const filteredOriginal = data.transactions.filter(tx => !deletedIds.has(tx.id));
        
        // Create a map of user-modified transactions by ID
        const userModifiedMap = new Map(
          userTransactions
            .filter(tx => !tx.id.startsWith('tx_user_')) // These are edits to existing
            .map(tx => [tx.id, tx])
        );
        
        // Apply user modifications to original transactions
        const mergedOriginal = filteredOriginal.map(tx => 
          userModifiedMap.has(tx.id) ? userModifiedMap.get(tx.id)! : tx
        );
        
        // Add new user transactions (ones with tx_user_ prefix)
        const newUserTransactions = userTransactions.filter(tx => tx.id.startsWith('tx_user_'));
        
        const allTransactions = [...newUserTransactions, ...mergedOriginal];
        
        set({
          transactions: allTransactions,
          filterOptions: data.filterOptions,
          metadata: data.metadata,
          isLoading: false,
          error: null,
          filters: {
            ...DEFAULT_FILTERS,
            dateRange: data.metadata.dateRange,
            amountRange: data.metadata.amountRange
          }
        });
      },

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error, isLoading: false }),

      updateFilter: (key, value) => set((state) => ({
        filters: { ...state.filters, [key]: value },
        tablePageIndex: 0
      })),

      resetFilters: () => set((state) => ({
        filters: state.metadata ? {
          ...DEFAULT_FILTERS,
          dateRange: state.metadata.dateRange,
          amountRange: state.metadata.amountRange
        } : DEFAULT_FILTERS,
        selectedCategory: null,
        selectedMonth: null,
        tablePageIndex: 0
      })),

      setSelectedCategory: (category) => set({ selectedCategory: category }),

      setSelectedMonth: (month) => set({ selectedMonth: month }),

      setTablePageIndex: (index) => set({ tablePageIndex: index }),

      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

      // Transaction CRUD
      addTransaction: (transactionData) => {
        const newTransaction: Transaction = {
          ...transactionData,
          id: generateId()
        };
        
        // Save to localStorage
        const userTransactions = loadUserTransactions();
        userTransactions.push(newTransaction);
        saveUserTransactions(userTransactions);
        
        // Update state
        set((state) => ({
          transactions: [newTransaction, ...state.transactions]
        }));
      },

      updateTransaction: (id, updates) => {
        const state = get();
        const transaction = state.transactions.find(tx => tx.id === id);
        if (!transaction) return;
        
        const updatedTransaction = { ...transaction, ...updates };
        
        // Save to localStorage
        const userTransactions = loadUserTransactions();
        const existingIndex = userTransactions.findIndex(tx => tx.id === id);
        if (existingIndex >= 0) {
          userTransactions[existingIndex] = updatedTransaction;
        } else {
          userTransactions.push(updatedTransaction);
        }
        saveUserTransactions(userTransactions);
        
        // Update state
        set((state) => ({
          transactions: state.transactions.map(tx =>
            tx.id === id ? updatedTransaction : tx
          )
        }));
      },

      deleteTransaction: (id) => {
        // Add to deleted IDs
        const deletedIds = loadDeletedIds();
        deletedIds.add(id);
        saveDeletedIds(deletedIds);
        
        // Remove from user transactions if it's there
        const userTransactions = loadUserTransactions();
        const filtered = userTransactions.filter(tx => tx.id !== id);
        saveUserTransactions(filtered);
        
        // Update state
        set((state) => ({
          transactions: state.transactions.filter(tx => tx.id !== id)
        }));
      },

      openTransactionModal: (transaction) => set({
        editingTransaction: transaction || null,
        isTransactionModalOpen: true
      }),

      closeTransactionModal: () => set({
        editingTransaction: null,
        isTransactionModalOpen: false
      })
    }),
    {
      name: 'jason-finance-dashboard',
      partialize: (state) => ({
        filters: state.filters,
        isSidebarOpen: state.isSidebarOpen
      })
    }
  )
);
