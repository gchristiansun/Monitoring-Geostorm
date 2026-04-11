import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";

type DataTableProps<T> = {
  data: T[];
  columns: ColumnDef<T, any>[];
  loading?: boolean;
};

export default function DataTable<T>({
  data,
  columns,
  loading = false,
}: DataTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (loading) {
    return <p className="text-center">Loading...</p>;
  }

  return (
    <>
      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-[var(--border)]">
          <thead className="bg-[var(--popover)] text-[var(--card-foreground)]">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="p-2 border border-[var(--border)] text-left text-sm font-semibold text-[var(--foreground)]"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center p-4 text-[var(--muted-foreground)]">
                  No data available
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-2 border border-[var(--border)] text-[var(--foreground)] text-sm">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="px-3 py-1 bg-[rgb(74,93,249)] text-white rounded disabled:opacity-50"
        >
          Previous
        </button>

        <span className="text-sm">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </span>

        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="px-3 py-1 bg-[rgb(74,93,249)] text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </>
  );
}