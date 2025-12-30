import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Save, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useDashboardStore } from '@/stores/dashboardStore';
import type { Transaction, SpendingGroup, TransactionType, BankName, AccountType } from '@/types';

// Form field options
const SPENDING_GROUPS: SpendingGroup[] = [
  'Day-to-day', 'Recurring', 'Transfer', 'Income', 
  'Invest-save-repay', 'Discretionary', 'Non-Expense', 'Exceptions', 'Essential'
];

const TRANSACTION_TYPES: TransactionType[] = ['Expense', 'Income', 'Transfer', 'Refund'];

const BANKS: BankName[] = ['Discovery Bank', 'Capitec Bank', 'Easy Equities', 'FNB'];

const ACCOUNT_TYPES: AccountType[] = [
  'Current Account', 'Credit Card', 'Tax Free Savings', 'Retirement Fund', 'Trading Account'
];

interface FormData {
  date: string;
  merchant: string;
  description: string;
  enhancedDescription: string;
  category: string;
  subCategory: string;
  spendingGroup: SpendingGroup;
  transactionType: TransactionType;
  amount: string;
  bankName: BankName;
  accountType: AccountType;
  account: string;
}

const defaultFormData: FormData = {
  date: new Date().toISOString().split('T')[0],
  merchant: '',
  description: '',
  enhancedDescription: '',
  category: 'Uncategorised',
  subCategory: 'Uncategorised',
  spendingGroup: 'Day-to-day',
  transactionType: 'Expense',
  amount: '',
  bankName: 'Discovery Bank',
  accountType: 'Current Account',
  account: ''
};

export function TransactionModal() {
  const { 
    isTransactionModalOpen, 
    editingTransaction, 
    closeTransactionModal,
    addTransaction,
    updateTransaction,
    filterOptions
  } = useDashboardStore();

  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const isEditing = !!editingTransaction;
  const categories = filterOptions?.categories || ['Uncategorised'];
  const subCategories = filterOptions?.subCategories || ['Uncategorised'];

  // Reset form when modal opens/closes or editing transaction changes
  useEffect(() => {
    if (isTransactionModalOpen) {
      if (editingTransaction) {
        setFormData({
          date: editingTransaction.date,
          merchant: editingTransaction.merchant,
          description: editingTransaction.description,
          enhancedDescription: editingTransaction.enhancedDescription,
          category: editingTransaction.category,
          subCategory: editingTransaction.subCategory,
          spendingGroup: editingTransaction.spendingGroup,
          transactionType: editingTransaction.transactionType,
          amount: Math.abs(editingTransaction.amount).toString(),
          bankName: editingTransaction.bankName,
          accountType: editingTransaction.accountType,
          account: editingTransaction.account
        });
      } else {
        setFormData(defaultFormData);
      }
      setErrors({});
    }
  }, [isTransactionModalOpen, editingTransaction]);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.merchant.trim()) newErrors.merchant = 'Merchant is required';
    if (!formData.amount || isNaN(parseFloat(formData.amount))) {
      newErrors.amount = 'Valid amount is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    const amount = parseFloat(formData.amount);
    // Make amount negative for expenses, positive for income/refunds
    const signedAmount = formData.transactionType === 'Expense' || 
                         (formData.transactionType === 'Transfer' && amount > 0)
      ? -Math.abs(amount)
      : Math.abs(amount);

    // Derive payMonth from date
    const payMonth = formData.date.substring(0, 7);

    const transactionData: Omit<Transaction, 'id'> = {
      date: formData.date,
      merchant: formData.merchant.trim(),
      description: formData.description.trim() || formData.merchant.trim(),
      enhancedDescription: formData.enhancedDescription.trim() || formData.merchant.trim(),
      category: formData.category,
      subCategory: formData.subCategory,
      spendingGroup: formData.spendingGroup,
      transactionType: formData.transactionType,
      amount: signedAmount,
      bankName: formData.bankName,
      accountType: formData.accountType,
      account: formData.account.trim() || `${formData.bankName} ${formData.accountType}`,
      payMonth
    };

    if (isEditing && editingTransaction) {
      updateTransaction(editingTransaction.id, transactionData);
    } else {
      addTransaction(transactionData);
    }

    closeTransactionModal();
  };

  return (
    <Dialog.Root open={isTransactionModalOpen} onOpenChange={(open) => !open && closeTransactionModal()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-50">
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              {isEditing ? 'Edit Transaction' : 'Add Transaction'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Row 1: Date and Amount */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (R) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.amount ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
              </div>
            </div>

            {/* Row 2: Merchant and Transaction Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Merchant *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Checkers, Uber, Netflix"
                  value={formData.merchant}
                  onChange={(e) => handleChange('merchant', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.merchant ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.merchant && <p className="text-red-500 text-xs mt-1">{errors.merchant}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction Type
                </label>
                <select
                  value={formData.transactionType}
                  onChange={(e) => handleChange('transactionType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {TRANSACTION_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 3: Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                placeholder="Optional description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Row 4: Category and Sub Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sub Category
                </label>
                <select
                  value={formData.subCategory}
                  onChange={(e) => handleChange('subCategory', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {subCategories.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 5: Spending Group */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Spending Group
              </label>
              <select
                value={formData.spendingGroup}
                onChange={(e) => handleChange('spendingGroup', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SPENDING_GROUPS.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>

            {/* Row 6: Bank and Account Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank
                </label>
                <select
                  value={formData.bankName}
                  onChange={(e) => handleChange('bankName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {BANKS.map(bank => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Type
                </label>
                <select
                  value={formData.accountType}
                  onChange={(e) => handleChange('accountType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ACCOUNT_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 7: Account identifier */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account
              </label>
              <input
                type="text"
                placeholder="e.g., Discovery Bank *7519"
                value={formData.account}
                onChange={(e) => handleChange('account', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Leave blank to auto-generate</p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={closeTransactionModal}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Transaction
                  </>
                )}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
