import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  type SortingState,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { useTransactionsStore, usePeopleStore } from "../../store";
import type {
  Transaction,
  PaymentMethod,
  TransactionType,
  TransactionStatus,
} from "../../types";

const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: "Cash",
  mpesa: "M-Pesa",
  credit: "Credit",
  bank: "Bank",
  mobile_money: "Mobile Money",
  other: "Other",
};

const transactionTypeLabels: Record<TransactionType, string> = {
  sale: "Sale",
  expense: "Expense",
  purchase: "Purchase",
  income: "Income",
  refund: "Refund",
};

const statusLabels: Record<TransactionStatus, string> = {
  draft: "Draft",
  confirmed: "Confirmed",
  reconciled: "Reconciled",
};

const statusColors: Record<TransactionStatus, string> = {
  draft: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  reconciled: "bg-blue-100 text-blue-800",
};

export function TransactionsTable() {
  const { transactions, deleteTransaction, deleteManyTransactions } =
    useTransactionsStore();
  const { getPersonById } = usePeopleStore();
  const [sorting, setSorting] = useState<SortingState>([
    { id: "date", desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const columns = useMemo<ColumnDef<Transaction>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="w-4 h-4 rounded border-border"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="w-4 h-4 rounded border-border"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => (
          <span className="text-sm">
            {new Date(row.original.date).toLocaleDateString()}
          </span>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
          <span
            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
              row.original.type === "sale"
                ? "bg-green-100 text-green-800"
                : row.original.type === "expense"
                  ? "bg-red-100 text-red-800"
                  : row.original.type === "purchase"
                    ? "bg-orange-100 text-orange-800"
                    : "bg-gray-100 text-gray-800"
            }`}
          >
            {transactionTypeLabels[row.original.type]}
          </span>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <span className="text-sm text-foreground">
            {row.original.description}
          </span>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
          <span
            className={`text-sm font-medium ${
              row.original.type === "sale" || row.original.type === "income"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {new Intl.NumberFormat("en-KE", {
              style: "currency",
              currency: "KES",
            }).format(row.original.amount)}
          </span>
        ),
      },
      {
        accessorKey: "paymentMethod",
        header: "Payment Method",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {paymentMethodLabels[row.original.paymentMethod]}
          </span>
        ),
      },
      {
        accessorKey: "personName",
        header: "Person",
        cell: ({ row }) => {
          const person = row.original.personId
            ? getPersonById(row.original.personId)
            : null;
          return (
            <span className="text-sm text-foreground">
              {person?.name || row.original.personName || "-"}
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <span
            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
              statusColors[row.original.status]
            }`}
          >
            {statusLabels[row.original.status]}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleView(row.original)}
              className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              title="View"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleEdit(row.original)}
              className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(row.original.id)}
              className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-destructive transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
        enableSorting: false,
      },
    ],
    [],
  );

  const table = useReactTable({
    data: transactions,
    columns,
    state: {
      sorting,
      globalFilter,
      rowSelection,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
  });

  const selectedRows = table.getSelectedRowModel().rows;

  const handleView = (transaction: Transaction) => {
    console.log("View transaction:", transaction);
  };

  const handleEdit = (transaction: Transaction) => {
    console.log("Edit transaction:", transaction);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      deleteTransaction(id);
    }
  };

  const handleBulkDelete = () => {
    const ids = selectedRows.map((row) => row.original.id);
    if (
      confirm(`Are you sure you want to delete ${ids.length} transactions?`)
    ) {
      deleteManyTransactions(ids);
      setRowSelection({});
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search transactions..."
            className="px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {selectedRows.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedRows.length} selected
              </span>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 text-sm bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-sm font-medium text-muted-foreground"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : (
                      <button
                        onClick={header.column.getToggleSortingHandler()}
                        className={`flex items-center gap-1 hover:text-foreground transition-colors ${
                          header.column.getCanSort() ? "cursor-pointer" : ""
                        }`}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {header.column.getCanSort() && (
                          <span className="ml-1">
                            {header.column.getIsSorted() === "asc" ? (
                              <ArrowUp className="w-3 h-3" />
                            ) : header.column.getIsSorted() === "desc" ? (
                              <ArrowDown className="w-3 h-3" />
                            ) : (
                              <ArrowUpDown className="w-3 h-3 opacity-50" />
                            )}
                          </span>
                        )}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No transactions found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={`border-b border-border hover:bg-accent/50 transition-colors ${
                    row.getIsSelected() ? "bg-accent" : ""
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="p-2 rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-2 rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-2 rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="p-2 rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Showing {table.getRowModel().rows.length} of {transactions.length}{" "}
            transactions
          </span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="px-3 py-1.5 bg-background border border-input rounded-md text-sm"
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
