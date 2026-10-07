import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const demoEntries = [
  ['01', 'Demo income', 'Income', 'Income', 'Income', 6000, 'Discovery Bank', 'Current Account'],
  ['03', 'Demo housing', 'Housing', 'Essential', 'Expense', -1800, 'Discovery Bank', 'Current Account'],
  ['06', 'Demo groceries', 'Groceries', 'Day-to-day', 'Expense', -350, 'Capitec Bank', 'Current Account'],
  ['09', 'Demo subscription', 'Subscriptions', 'Recurring', 'Expense', -80, 'FNB', 'Credit Card'],
  ['12', 'Demo transport', 'Transport', 'Essential', 'Expense', -150, 'Capitec Bank', 'Current Account'],
  ['15', 'Demo leisure', 'Leisure', 'Discretionary', 'Expense', -200, 'FNB', 'Credit Card'],
  ['18', 'Demo savings', 'Savings', 'Invest-save-repay', 'Transfer', -500, 'Easy Equities', 'Tax Free Savings'],
  ['21', 'Demo refund', 'Refunds', 'Non-Expense', 'Refund', 50, 'FNB', 'Credit Card'],
];

export function createDemoData() {
  const transactions = Array.from({ length: 6 }, (_, monthIndex) => {
    const payMonth = `2000-${String(monthIndex + 1).padStart(2, '0')}`;
    return demoEntries.map(([day, merchant, category, spendingGroup, transactionType, baseAmount, bankName, accountType], entryIndex) => ({
      id: `demo-${payMonth}-${String(entryIndex + 1).padStart(2, '0')}`,
      date: `${payMonth}-${day}`,
      enhancedDescription: `SYNTHETIC DEMO: ${merchant}`,
      merchant,
      category,
      subCategory: `Demo ${category.toLowerCase()}`,
      spendingGroup,
      transactionType,
      amount: baseAmount + (transactionType === 'Expense' ? -monthIndex * 5 : 0),
      bankName,
      accountType,
      account: `DEMO-ACCOUNT-${String(entryIndex + 1).padStart(2, '0')}`,
      payMonth,
      description: `SYNTHETIC DEMO: fabricated ${category.toLowerCase()} transaction`,
    }));
  }).flat();
  const unique = field => [...new Set(transactions.map(transaction => transaction[field]))].sort();
  const amounts = transactions.map(transaction => transaction.amount);

  return {
    transactions,
    metadata: {
      synthetic: true,
      fixtureVersion: 1,
      notice: 'Fabricated demonstration data only. No real people, accounts, merchants or transactions. Bank labels are retained solely for application compatibility.',
      generator: 'scripts/generate-demo-data.mjs',
      exportedAt: '2000-07-01T00:00:00.000Z',
      totalRecords: transactions.length,
      dateRange: { start: transactions[0].date, end: transactions.at(-1).date },
      amountRange: { min: Math.min(...amounts), max: Math.max(...amounts) },
    },
    filterOptions: {
      categories: unique('category'),
      subCategories: unique('subCategory'),
      spendingGroups: unique('spendingGroup'),
      transactionTypes: unique('transactionType'),
      banks: unique('bankName'),
      accountTypes: unique('accountType'),
      payMonths: unique('payMonth'),
    },
  };
}

export function serialiseDemoData() {
  return `${JSON.stringify(createDemoData(), null, 2)}\n`;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  writeFileSync(resolve(root, 'public/data/transactions.json'), serialiseDemoData());
  console.log('Synthetic demo fixture generated.');
}
