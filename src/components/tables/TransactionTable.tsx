import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type SortingState,
  type ColumnDef
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, Pencil, Trash2, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { CHART_COLORS } from '@/lib/constants';
import { useDashboardStore } from '@/stores/dashboardStore';
import type { Transaction } from '@/types';
import { cn } from '@/lib/utils';

interface TransactionTableProps {
  data: Transaction[];
  pageSize?: number;
  onRowClick?: (transaction: Transaction) => void;
}

export function TransactionTable({ 
  data, 
  pageSize = 20,
  onRowClick 
}: TransactionTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'date', desc: true }
  ]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { openTransactionModal, deleteTransaction } = useDashboardStore();

  const columns = useMemo<ColumnDef<Transaction>[]>(() => [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-gray-600 whitespace-nowrap">
          {formatDate(row.original.date)}
        </span>
      ),
      size: 100
    },
    {
      accessorKey: 'merchant',
      header: 'Merchant',
      cell: ({ row }) => (
        <div className="max-w-[200px]">
          <p className="font-medium text-gray-900 truncate">{row.original.merchant}</p>
          <p className="text-xs text-gray-500 truncate">{row.original.description}</p>
        </div>
      ),
      size: 200
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <div>
          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
            {row.original.category}
          </span>
        </div>
      ),
      size: 150
    },
    {
      accessorKey: 'transactionType',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.original.transactionType;
        const color = CHART_COLORS.transactionTypes[type] || '#6b7280';
        return (
          <span 
            className="inline-flex px-2 py-1 text-xs font-medium rounded-full"
            style={{ 
              backgroundColor: `${color}20`, 
              color 
            }}
          >
            {type}
          </span>
        );
      },
      size: 100
    },
    {
      accessorKey: 'bankName',
      header: 'Bank',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">{row.original.bankName}</span>
      ),
      size: 120
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        const amount = row.original.amount;
        return (
          <span className={cn(
            'font-semibold whitespace-nowrap',
            amount >= 0 ? 'text-green-600' : 'text-red-600'
          )}>
            {formatCurrency(amount)}
          </span>
        );
      },
      size: 120
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const tx = row.original;
        const isDeleting = deleteConfirm === tx.id;
        
        if (isDeleting) {
          return (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTransaction(tx.id);
                  setDeleteConfirm(null);
                }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2"
              >
                Confirm
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteConfirm(null);
                }}
                className="px-2"
              >
                Cancel
              </Button>
            </div>
          );
        }
        
        return (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openTransactionModal(tx);
              }}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Edit transaction"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeleteConfirm(tx.id);
              }}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete transaction"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      },
      size: 80
    }
  ], [deleteConfirm, deleteTransaction, openTransactionModal]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize }
    }
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <CardTitle>Transactions</CardTitle>
          <span className="text-sm text-gray-500">
            {data.length.toLocaleString()} records
          </span>
        </div>
        <Button onClick={() => openTransactionModal()} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Transaction
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-y border-gray-100">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder ? null : (
                        <button
                          className="flex items-center gap-1 hover:text-gray-700"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getIsSorted() === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : header.column.getIsSorted() === 'desc' ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronsUpDown className="h-4 w-4 opacity-30" />
                          )}
                        </button>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-100">
              {table.getRowModel().rows.map(row => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  className={cn(
                    'hover:bg-gray-50 transition-colors',
                    onRowClick && 'cursor-pointer'
                  )}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
