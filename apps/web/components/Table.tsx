'use client';

import { cn } from '@/lib/utils';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
  cellClassName?: string;
  render?: (value: any, row: T, index: number) => React.ReactNode;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  className?: string;
  onRowClick?: (row: T, index: number) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  rowKey?: keyof T | ((row: T, index: number) => string);
  hoverable?: boolean;
  striped?: boolean;
  bordered?: boolean;
  compact?: boolean;
}

type SortDirection = 'asc' | 'desc' | null;

export function Table<T extends Record<string, any>>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No data available',
  emptyIcon,
  className = '',
  onRowClick,
  onSort,
  sortColumn,
  sortDirection,
  rowKey = 'id',
  hoverable = true,
  striped = false,
  bordered = true,
  compact = false,
}: TableProps<T>) {
  const getRowKey = (row: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(row, index);
    }
    return String(row[rowKey] ?? index);
  };

  const handleSort = (column: Column<T>) => {
    if (!column.sortable || !onSort) return;

    const columnKey = String(column.key);
    let newDirection: 'asc' | 'desc' = 'asc';

    if (sortColumn === columnKey) {
      if (sortDirection === 'asc') {
        newDirection = 'desc';
      } else if (sortDirection === 'desc') {
        // Toggle back to no sort
        return;
      }
    }

    onSort(columnKey, newDirection);
  };

  const getSortIcon = (column: Column<T>) => {
    if (!column.sortable) return null;

    const columnKey = String(column.key);
    if (sortColumn !== columnKey) {
      return <ArrowUpDown className="h-4 w-4 text-baobab-400" />;
    }

    if (sortDirection === 'asc') {
      return <ArrowUp className="h-4 w-4 text-acacia-600" />;
    }

    if (sortDirection === 'desc') {
      return <ArrowDown className="h-4 w-4 text-acacia-600" />;
    }

    return <ArrowUpDown className="h-4 w-4 text-baobab-400" />;
  };

  return (
    <div className={cn('w-full overflow-x-auto scrollbar-thin', className)}>
      <table
        className={cn(
          'w-full min-w-full',
          bordered && 'border border-baobab-200',
          compact ? 'text-sm' : 'text-base'
        )}
      >
        {/* Header */}
        <thead
          className={cn(
            'bg-savanna-50',
            bordered && 'border-b border-baobab-200'
          )}
        >
          <tr>
            {columns.map((column, index) => (
              <th
                key={String(column.key) || index}
                className={cn(
                  'px-4 md:px-6 py-3 text-left text-xs font-medium text-baobab-600 uppercase tracking-wider whitespace-nowrap',
                  column.sortable && onSort && 'cursor-pointer hover:bg-savanna-100 transition-colors',
                  column.headerClassName
                )}
                onClick={() => handleSort(column)}
              >
                <div className="flex items-center gap-2">
                  {column.header}
                  {getSortIcon(column)}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody
          className={cn(
            'divide-y',
            bordered && 'divide-baobab-200',
            striped && 'bg-white even:bg-savanna-50'
          )}
        >
          {isLoading ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 md:px-6 py-8 text-center"
              >
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="animate-spin w-8 h-8 border-4 border-acacia-600 border-t-transparent rounded-full"></div>
                  <p className="text-sm text-baobab-600">Loading...</p>
                </div>
              </td>
            </tr>
          ) : data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr
                key={getRowKey(row, rowIndex)}
                className={cn(
                  hoverable && onRowClick && 'cursor-pointer hover:bg-savanna-50 transition-colors',
                  hoverable && !onRowClick && 'hover:bg-savanna-50 transition-colors'
                )}
                onClick={() => onRowClick?.(row, rowIndex)}
              >
                {columns.map((column, colIndex) => {
                  const value = row[column.key as keyof T];
                  return (
                    <td
                      key={String(column.key) || colIndex}
                      className={cn(
                        'px-4 md:px-6 py-4',
                        column.cellClassName
                      )}
                    >
                      {column.render ? (
                        column.render(value, row, rowIndex)
                      ) : (
                        <span className="text-baobab-900">{String(value ?? '')}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 md:px-6 py-12 text-center"
              >
                <div className="flex flex-col items-center justify-center space-y-3">
                  {emptyIcon && (
                    <div className="text-baobab-300">
                      {emptyIcon}
                    </div>
                  )}
                  <p className="text-baobab-500">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// Table Header component for convenience
export function TableHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <thead className={cn('bg-savanna-50 border-b border-baobab-200', className)}>
      {children}
    </thead>
  );
}

// Table Body component for convenience
export function TableBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <tbody className={cn('divide-y divide-baobab-200', className)}>
      {children}
    </tbody>
  );
}

// Table Row component for convenience
export function TableRow({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <tr
      className={cn(
        'hover:bg-savanna-50 transition-colors',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

// Table Cell component for convenience
export function TableCell({ children, className = '', align = 'left' }: { children: React.ReactNode; className?: string; align?: 'left' | 'center' | 'right' }) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align];

  return (
    <td className={cn('px-4 md:px-6 py-4', alignClass, className)}>
      {children}
    </td>
  );
}

// Table Head component for convenience
export function TableHead({ children, className = '', sortable = false, onSort }: { children: React.ReactNode; className?: string; sortable?: boolean; onSort?: () => void }) {
  return (
    <th
      className={cn(
        'px-4 md:px-6 py-3 text-left text-xs font-medium text-baobab-600 uppercase tracking-wider whitespace-nowrap',
        sortable && onSort && 'cursor-pointer hover:bg-savanna-100 transition-colors',
        className
      )}
      onClick={sortable ? onSort : undefined}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortable && <ArrowUpDown className="h-4 w-4 text-baobab-400" />}
      </div>
    </th>
  );
}
