# Jason Finance Dashboard

A React + TypeScript financial dashboard built with Vite, featuring interactive charts, filterable data tables, and real-time KPI calculations.

![Dashboard Preview](preview.png)

## Features

- **KPI Cards**: Total Income, Expenses, Net Position, Savings Rate
- **Interactive Charts**: Monthly trends, category breakdown, bank distribution, merchant ranking
- **Advanced Filtering**: Multi-select filters for banks, categories, transaction types, spending groups
- **Transaction Table**: Sortable, paginated table with 1,677 transactions
- **Persistent State**: Filter preferences saved to localStorage

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Tables**: TanStack Table v8
- **State Management**: Zustand
- **Date Handling**: date-fns

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── charts/          # Recharts visualizations
│   ├── filters/         # Filter bar and multi-select
│   ├── kpi/             # KPI cards and grid
│   ├── layout/          # Header and layout components
│   ├── tables/          # Transaction table
│   └── ui/              # Reusable UI primitives
├── hooks/
│   ├── useTransactions.ts   # Data fetching
│   └── useDerivedData.ts    # Memoized aggregations
├── lib/
│   ├── constants.ts     # Colors, defaults
│   ├── dataTransform.ts # Aggregation functions
│   └── formatters.ts    # Currency, date formatting
├── stores/
│   └── dashboardStore.ts    # Zustand global state
├── types/
│   └── index.ts         # TypeScript interfaces
├── App.tsx              # Main dashboard component
├── main.tsx             # Entry point
└── index.css            # Tailwind + custom styles

public/
└── data/
    └── transactions.json    # Financial data
```

## Data Format

The dashboard expects `transactions.json` in `public/data/` with this structure:

```json
{
  "transactions": [
    {
      "id": "tx_0",
      "date": "2025-12-27",
      "merchant": "Checkers Sixty60",
      "category": "Food and Drink",
      "subCategory": "Groceries",
      "spendingGroup": "Day-to-day",
      "transactionType": "Expense",
      "amount": -742.75,
      "bankName": "Discovery Bank",
      "accountType": "Credit Card",
      "payMonth": "2025-12"
    }
  ],
  "metadata": {
    "exportedAt": "2025-12-27T00:00:00",
    "totalRecords": 1677,
    "dateRange": { "start": "2025-03-03", "end": "2025-12-27" },
    "amountRange": { "min": -53000, "max": 65317.81 }
  },
  "filterOptions": {
    "categories": ["Business", "Food and Drink", ...],
    "banks": ["Discovery Bank", "Capitec Bank", ...],
    "transactionTypes": ["Expense", "Income", "Transfer", "Refund"],
    "spendingGroups": ["Day-to-day", "Recurring", ...]
  }
}
```

## Customization

### Colors

Edit `src/lib/constants.ts` to customize the color palette:

```typescript
export const CHART_COLORS = {
  income: '#22c55e',
  expense: '#ef4444',
  net: '#3b82f6',
  // ...
};
```

### Adding New Charts

1. Create component in `src/components/charts/`
2. Use `ChartContainer` wrapper for consistent styling
3. Import aggregation function from `useDerivedData` hook
4. Add to `App.tsx` layout

### Currency Formatting

Edit `src/lib/constants.ts` to change currency:

```typescript
export const CURRENCY_CONFIG = {
  locale: 'en-ZA',
  currency: 'ZAR',
  symbol: 'R'
};
```

## Updating Data

1. Export new transactions from your Excel file using the Python script
2. Replace `public/data/transactions.json`
3. Refresh the dashboard

## Performance

- **Virtual scrolling**: Ready for TanStack Virtual (optional)
- **Memoization**: All aggregations use `useMemo`
- **Lazy state**: Zustand with `persist` middleware
- **Optimized re-renders**: Granular filter updates

## License

MIT
