"use client";

import { FolderOpen, Pencil, Trash2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import type { Category } from "@/api/types/category.types";

interface Props {
  categories: Category[];
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onEdit: (cat: Category) => void;
  onDelete: (id: string) => void;
  showTypeColumn?: boolean;
}

function Row({
  cat,
  onEdit,
  onDelete,
  depth = 0,
  showTypeColumn,
}: {
  cat: Category;
  onEdit: (cat: Category) => void;
  onDelete: (id: string) => void;
  depth?: number;
  showTypeColumn?: boolean;
}) {
  const hasChildren = cat.children && cat.children.length > 0;

  return (
    <>
      <TableRow className="border-gray-200 cursor-pointer hover:bg-gray-50" onClick={() => onEdit(cat)}>
        <TableCell className="py-2">
          <div
            className="flex items-center gap-3"
            style={{ paddingLeft: `${depth * 24}px` }}
          >
            {depth > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
            {cat.image ? (
              <img
                src={cat.image}
                alt={cat.name}
                className="w-8 h-8 rounded-lg object-cover border border-gray-200 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                <FolderOpen className="w-4 h-4 text-gray-400" />
              </div>
            )}
            <span className="text-sm text-gray-900">{cat.name}</span>
          </div>
        </TableCell>
        <TableCell className="text-sm text-gray-500 font-mono">{cat.slug}</TableCell>
        {showTypeColumn !== false && (
          <TableCell>
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                cat.type === "public"
                  ? "bg-blue-50 text-blue-600"
                  : "bg-amber-50 text-amber-600"
              }`}
            >
              {cat.type === "public" ? "Public" : "Internal"}
            </span>
          </TableCell>
        )}
        <TableCell>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
              cat.is_active !== false
                ? "border border-green-200 bg-green-50 text-green-600"
                : "border border-gray-200 bg-gray-50 text-gray-500"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${cat.is_active !== false ? "bg-green-500" : "bg-gray-400"}`} />
            {cat.is_active !== false ? "Active" : "Inactive"}
          </span>
        </TableCell>
        <TableCell className="text-sm text-gray-500 max-w-[220px] truncate">
          {(cat.description ? cat.description.replace(/<[^>]*>/g, "") : "—") || "—"}
        </TableCell>
        <TableCell className="text-sm text-gray-500 text-center">
          {cat.children?.length ?? 0}
        </TableCell>
        <TableCell>
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-[lab(20_23.9_-60.14)] border-[lab(20_23.9_-60.14)]/20 hover:bg-[lab(20_23.9_-60.14)]/5"
              onClick={(e) => { e.stopPropagation(); onEdit(cat); }}
            >
              <Pencil className="w-3.5 h-3.5" />
              Details
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-500 border-red-200 hover:bg-red-50"
              onClick={(e) => { e.stopPropagation(); onDelete(cat.id); }}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </Button>
          </div>
        </TableCell>
      </TableRow>
      {hasChildren &&
        cat.children.map((child) => (
          <Row key={child.id} cat={child} onEdit={onEdit} onDelete={onDelete} depth={depth + 1} />
        ))}
    </>
  );
}

export function CategoryTable({ categories, page, totalPages, totalCount, onPageChange, onEdit, onDelete, showTypeColumn = true }: Props) {
  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
        <div className="w-12 h-12 rounded-lg bg-gray-100 mx-auto flex items-center justify-center mb-4">
          <FolderOpen className="w-5 h-5 text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-900 mb-1">No categories yet</p>
        <p className="text-sm text-gray-500">Click &quot;Add Category&quot; to create your first one.</p>
      </div>
    );
  }

  return (
    <div className="bg-white w-full rounded-xl border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-200 hover:bg-transparent">
            <TableHead className="text-gray-900 font-semibold">Name</TableHead>
            <TableHead className="text-gray-900 font-semibold">Slug</TableHead>
            {showTypeColumn !== false && <TableHead className="text-gray-900 font-semibold">Type</TableHead>}
            <TableHead className="text-gray-900 font-semibold">Status</TableHead>
            <TableHead className="text-gray-900 font-semibold">Description</TableHead>
            <TableHead className="text-gray-900 font-semibold text-center">Sub</TableHead>
            <TableHead className="text-gray-900 font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((cat) => (
            <Row key={cat.id} cat={cat} onEdit={onEdit} onDelete={onDelete} showTypeColumn={showTypeColumn} />
          ))}
        </TableBody>
      </Table>

      {totalPages > 0 && (
        <div className="flex w-full items-center justify-between px-4 py-1 border-t border-gray-200">
          <span className="text-sm text-gray-500">
            {totalCount} {totalCount === 1 ? "item" : "items"} total
          </span>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => onPageChange(page - 1)}
                  className={page <= 1 ? "pointer-events-none opacity-40" : "cursor-pointer"}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink
                    isActive={p === page}
                    onClick={() => onPageChange(p)}
                    className="cursor-pointer"
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => onPageChange(page + 1)}
                  className={page >= totalPages ? "pointer-events-none opacity-40" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
