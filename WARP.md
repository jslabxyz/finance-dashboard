# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server (hot reload)
npm run build    # TypeScript check + Vite production build
npm run lint     # ESLint
npm run preview  # Preview production build locally
```

## Architecture

### Data Flow Pattern

The app follows a unidirectional data flow:

1. **Data Loading** (`useTransactions` hook) — Fetches `/data/transactions.json` on mount, merges with user modifications from localStorage
2. **Global State** (`dashboardStore.ts`) — Zustand store holds transactions, filters, and UI state; persists filters to localStorage
3. **Derived Data** (`useDerivedData` hook) — All aggregations (KPIs, monthly, category, bank, merchant) computed via `useMemo` from filtered transactions
4. **Rendering** — Components receive derived data as props, no direct store access in chart components

### State Management

- **Zustand with persist middleware** — Filter preferences survive page refresh
- **User transaction layer** — CRUD operations stored in localStorage, merged with original data on load
- Deleted transaction IDs tracked separately to filter out from original dataset

### Adding New Features

**New chart:**
1. Create component in `src/components/charts/`
2. Add aggregation function to `src/lib/dataTransform.ts`
3. Add memoized call in `useDerivedData` hook
4. Add component to `App.tsx` layout

**New filter:**
1. Add field to `FilterState` type in `src/types/index.ts`
2. Add default value in `DEFAULT_FILTERS` in `src/lib/constants.ts`
3. Add filter logic in `filterTransactions()` in `src/lib/dataTransform.ts`
4. Add UI control in `FilterBar.tsx`

### Path Aliases

`@/*` maps to `./src/*` — use `@/components`, `@/hooks`, `@/lib`, etc.

### Data Format

Transaction data lives in `public/data/transactions.json`. Required fields per transaction: `id`, `date`, `merchant`, `category`, `subCategory`, `spendingGroup`, `transactionType`, `amount`, `bankName`, `accountType`, `payMonth`.

### Currency

Configured for South African Rand (ZAR) in `src/lib/constants.ts` — change `CURRENCY_CONFIG` to adapt for other locales.
