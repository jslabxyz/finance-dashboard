import { useTransactions } from '@/hooks/useTransactions';
import { useDerivedData } from '@/hooks/useDerivedData';
import { useDashboardStore } from '@/stores/dashboardStore';

// Layout
import { DashboardHeader } from '@/components/layout/DashboardHeader';

// KPI
import { KPIGrid } from '@/components/kpi/KPIGrid';

// Charts
import { MonthlyTrendChart } from '@/components/charts/MonthlyTrendChart';
import { CategoryBreakdown } from '@/components/charts/CategoryBreakdown';
import { BankDistribution } from '@/components/charts/BankDistribution';
import { SpendingGroupChart } from '@/components/charts/SpendingGroupChart';
import { MerchantRanking } from '@/components/charts/MerchantRanking';

// Filters
import { FilterBar } from '@/components/filters/FilterBar';

// Tables
import { TransactionTable } from '@/components/tables/TransactionTable';

// Transaction Modal
import { TransactionModal } from '@/components/transactions/TransactionModal';

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 animate-pulse">
      <div className="h-12 bg-gray-200 rounded w-64 mb-4" />
      <div className="h-6 bg-gray-200 rounded w-48 mb-8" />
      <div className="grid grid-cols-6 gap-4 mb-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-28 bg-gray-200 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="h-80 bg-gray-200 rounded-xl" />
        <div className="h-80 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}

// Error display
function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-red-100 max-w-md">
        <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Data</h2>
        <p className="text-gray-600">{message}</p>
        <p className="text-sm text-gray-500 mt-4">
          Make sure <code className="bg-gray-100 px-1 rounded">transactions.json</code> is in the{' '}
          <code className="bg-gray-100 px-1 rounded">public/data/</code> folder.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const { isLoading, error } = useTransactions();
  const { 
    kpis, 
    monthlyData, 
    expenseCategoryData, 
    bankData, 
    merchantData, 
    spendingGroupData,
    filteredTransactions,
    momChange
  } = useDerivedData();
  const { setSelectedCategory, setSelectedMonth } = useDashboardStore();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TransactionModal />
      <div className="max-w-[1600px] mx-auto p-6">
        <DashboardHeader />
        
        <FilterBar />

        {/* KPI Cards */}
        <section className="mb-8">
          <KPIGrid kpis={kpis} momChange={momChange} />
        </section>

        {/* Charts Row 1: Monthly Trend & Category Breakdown */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <MonthlyTrendChart 
            data={monthlyData} 
            onMonthClick={setSelectedMonth}
          />
          <CategoryBreakdown 
            data={expenseCategoryData}
            onCategoryClick={setSelectedCategory}
          />
        </section>

        {/* Charts Row 2: Bank Distribution & Spending Groups */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <BankDistribution data={bankData} />
          <SpendingGroupChart data={spendingGroupData} />
        </section>

        {/* Merchant Ranking */}
        <section className="mb-6">
          <MerchantRanking data={merchantData} />
        </section>

        {/* Transaction Table */}
        <section>
          <TransactionTable data={filteredTransactions} />
        </section>
      </div>
    </div>
  );
}
