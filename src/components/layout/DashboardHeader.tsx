import { useDashboardStore } from '@/stores/dashboardStore';
import { formatDate } from '@/lib/formatters';
import { Calendar, RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function DashboardHeader() {
  const { metadata, filters } = useDashboardStore();

  const handleExport = () => {
    // Export functionality would go here
    console.log('Export triggered');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <header className="mb-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Financial Dashboard
          </h1>
          <p className="mt-1 text-sm font-medium text-amber-700">
            Synthetic demonstration data. Do not enter personal financial records.
          </p>
          <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(filters.dateRange.start)} — {formatDate(filters.dateRange.end)}
            </span>
            {metadata && (
              <span>
                Last updated: {new Date(metadata.exportedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>
    </header>
  );
}
