"use client";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteDialog } from "@/components/global_ui/delete-dialog";
import { EmptyState } from "@/components/global_ui/empty-state";
import { PaginationBar } from "@/components/global_ui/pagination-bar";
import { ActionButtons } from "@/components/global_ui/action-buttons";

export interface ColumnDef<T> {
  header: string;
  render: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (identifier: string) => void;
  getIdentifier: (item: T) => string;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  emptyState: {
    icon: LucideIcon;
    title: string;
    description: string;
  };
  deleteDialog?: {
    title: string | ((id: string) => string);
    description: string | ((id: string) => string);
  };
  getDepth?: (item: T) => number;
  totalCount?: number;
  hideDeleteDialog?: boolean;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export function DataTable<T>({
  data,
  columns,
  onEdit,
  onDelete,
  getIdentifier,
  page,
  totalPages,
  onPageChange,
  emptyState,
  deleteDialog,
  getDepth,
  totalCount,
  hideDeleteDialog = false,
  hasNext,
  hasPrevious,
}: DataTableProps<T>) {
  const [deleteIdentifier, setDeleteIdentifier] = useState<string | null>(null);

  const dialogTitle = deleteIdentifier && typeof deleteDialog?.title === "function"
    ? deleteDialog.title(deleteIdentifier)
    : typeof deleteDialog?.title === "function"
      ? "Delete this item?"
      : (deleteDialog?.title ?? "Delete this item?") as string;
  const dialogDesc = deleteIdentifier && typeof deleteDialog?.description === "function"
    ? deleteDialog.description(deleteIdentifier)
    : typeof deleteDialog?.description === "function"
      ? "This cannot be undone."
      : (deleteDialog?.description ?? "This cannot be undone.") as string;

  if (data.length === 0) return <EmptyState {...emptyState} />;

  const pagination = totalCount !== undefined ? (
    <div className="flex items-center justify-between px-4 py-1 border-t border-gray-200">
      <span className="text-sm text-gray-500">{totalCount} {totalCount === 1 ? "item" : "items"} total</span>
      <PaginationBar page={page} totalPages={totalPages} onPageChange={onPageChange} hasNext={hasNext} hasPrevious={hasPrevious} />
    </div>
  ) : null;

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-200 hover:bg-transparent">
              {columns.map((col, i) => (
                <TableHead key={i} className={`text-gray-900 font-semibold ${col.className ?? ""}`}>
                  {col.header}
                </TableHead>
              ))}
              {(onEdit || onDelete) && (
                <TableHead className="text-gray-900 font-semibold text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow
                key={getIdentifier(item)}
                className={`border-gray-200 ${onEdit ? "cursor-pointer hover:bg-gray-50" : "hover:bg-transparent"}`}
                onClick={() => onEdit?.(item)}
              >
                {columns.map((col, i) => (
                  <TableCell key={i} className={col.className ?? ""} style={i === 0 && getDepth ? { paddingLeft: `${getDepth(item) * 24 + 16}px` } : undefined}>
                    {col.render(item)}
                  </TableCell>
                ))}
                {(onEdit || onDelete) && (
                  <TableCell>
                    <ActionButtons
                      onEdit={onEdit ? () => onEdit(item) : undefined}
                      onDelete={onDelete ? (hideDeleteDialog ? () => onDelete(getIdentifier(item)) : () => setDeleteIdentifier(getIdentifier(item))) : undefined}
                    />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {pagination}
      </div>

      {!pagination && (totalPages > 1 || hasNext || hasPrevious) && (
        <div className="mt-6"><PaginationBar page={page} totalPages={totalPages} onPageChange={onPageChange} hasNext={hasNext} hasPrevious={hasPrevious} /></div>
      )}

      {!hideDeleteDialog && (
        <DeleteDialog
          open={!!deleteIdentifier}
          onOpenChange={(o) => !o && setDeleteIdentifier(null)}
          onConfirm={() => deleteIdentifier && onDelete?.(deleteIdentifier)}
          title={dialogTitle}
          description={dialogDesc}
        />
      )}
    </>
  );
}
