# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server (hot reload)
npm run build    # TypeScript check + Vite production build
npm run lint     # ESLint
npm run preview  # Preview production build locally
npm run data:generate # Regenerate invented demonstration fixtures
npm run check:data    # Reject altered fixtures and private exports
```

## Architecture

### Data Flow Pattern

The app follows a unidirectional data flow:

1. **Data Loading** (`useTransactions` hook) — Fetches synthetic `/data/transactions.json` on mount without cache reuse, rejects data without synthetic provenance, and merges only demo-storage modifications
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

Only generated synthetic demonstration data may live in `public/data/transactions.json`. Never commit financial exports or paste their records into source, documentation, or tests. Public assets are directly downloadable. Update the invented fixture generator, regenerate the fixture, and run the safety guard before building or committing. Metadata must include `synthetic: true` and `fixtureVersion`.

Required fields per transaction are defined in `src/types/index.ts`, including `enhancedDescription`, `account`, and `description`. Use visibly invented demo labels. Do not derive fixture values from genuine records. Raw exports must remain outside this repository. Existing personal browser-storage keys are deliberately not read or erased by the demo.

### Currency

Configured for South African Rand (ZAR) in `src/lib/constants.ts` — change `CURRENCY_CONFIG` to adapt for other locales.
