import { useDashboardStore } from '@/stores/dashboardStore';
import { useDerivedData } from '@/hooks/useDerivedData';
import { Button } from '@/components/ui/Button';
import { X, Filter, RotateCcw } from 'lucide-react';

export function FilterBar() {
  const { filters, updateFilter, resetFilters } = useDashboardStore();
  const { filterOptions, totalCount, filteredCount } = useDerivedData();

  const hasActiveFilters = 
    filters.banks.length > 0 ||
    filters.categories.length > 0 ||
    filters.transactionTypes.length > 0 ||
    filters.spendingGroups.length > 0 ||
    filters.searchQuery !== '';

  if (!filterOptions) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <span className="font-medium text-gray-700">Filters</span>
          <span className="text-sm text-gray-500">
            ({filteredCount.toLocaleString()} of {totalCount.toLocaleString()} transactions)
          </span>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search transactions..."
            value={filters.searchQuery}
            onChange={(e) => updateFilter('searchQuery', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Banks */}
        <MultiSelect
          label="Banks"
          options={filterOptions.banks}
          selected={filters.banks}
          onChange={(value) => updateFilter('banks', value)}
        />

        {/* Categories */}
        <MultiSelect
          label="Categories"
          options={filterOptions.categories}
          selected={filters.categories}
          onChange={(value) => updateFilter('categories', value)}
        />

        {/* Transaction Types */}
        <MultiSelect
          label="Types"
          options={filterOptions.transactionTypes}
          selected={filters.transactionTypes}
          onChange={(value) => updateFilter('transactionTypes', value)}
        />

        {/* Spending Groups */}
        <MultiSelect
          label="Groups"
          options={filterOptions.spendingGroups}
          selected={filters.spendingGroups}
          onChange={(value) => updateFilter('spendingGroups', value)}
        />
      </div>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
          {filters.banks.map(bank => (
            <FilterChip
              key={bank}
              label={bank}
              onRemove={() => updateFilter('banks', filters.banks.filter(b => b !== bank))}
            />
          ))}
          {filters.categories.map(cat => (
            <FilterChip
              key={cat}
              label={cat}
              onRemove={() => updateFilter('categories', filters.categories.filter(c => c !== cat))}
            />
          ))}
          {filters.transactionTypes.map(type => (
            <FilterChip
              key={type}
              label={type}
              onRemove={() => updateFilter('transactionTypes', filters.transactionTypes.filter(t => t !== type))}
            />
          ))}
          {filters.spendingGroups.map(group => (
            <FilterChip
              key={group}
              label={group}
              onRemove={() => updateFilter('spendingGroups', filters.spendingGroups.filter(g => g !== group))}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Multi-select dropdown component
interface MultiSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (value: string[]) => void;
}

function MultiSelect({ label, options, selected, onChange }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(s => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-2 border rounded-lg text-sm flex items-center gap-2 ${
          selected.length > 0 
            ? 'border-blue-500 bg-blue-50 text-blue-700' 
            : 'border-gray-200 text-gray-700 hover:bg-gray-50'
        }`}
      >
        {label}
        {selected.length > 0 && (
          <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
            {selected.length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[200px] max-h-[300px] overflow-y-auto">
            {options.map(option => (
              <label
                key={option}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => toggle(option)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 truncate">{option}</span>
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Filter chip component
interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
      {label}
      <button
        onClick={onRemove}
        className="hover:bg-blue-200 rounded-full p-0.5"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

import { useState } from 'react';
