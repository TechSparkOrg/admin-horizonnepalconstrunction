"use client";
import { memo, useMemo, useState } from "react";
import { FolderOpen, ChevronRight } from "lucide-react";
import {
  Table, TableBody, TableCell, TableRow,
} from "@/components/ui/table";
import { TableHeaderRow } from "@/components/global_ui/table-header-row";
import { ActionButtons } from "@/components/global_ui/action-buttons";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteDialog } from "@/components/global_ui/delete-dialog";
import { StatusBadge, ACTIVE_STATUS } from "@/components/global_ui/status-badge";
import { PaginationBar } from "@/components/global_ui/pagination-bar";
import type { Category } from "@/api/types/category.types";

interface FlatCategory extends Category { _depth: number; }

function flattenTree(cats: Category[], depth = 0): FlatCategory[] {
  return cats.flatMap((c) => [{ ...c, _depth: depth }, ...(c.children ? flattenTree(c.children, depth + 1) : [])]);
}

function TypeBadge({ type }: { type: string }) {
  return (
    <Badge variant="outline" className={`font-normal ${type === "public" ? "border-blue-200 bg-blue-50 text-blue-600" : "border-amber-200 bg-amber-50 text-amber-600"}`}>
      {type === "public" ? "Public" : "Internal"}
    </Badge>
  );
}

interface Props {
  categories: Category[];
  page: number;
  totalPages: number;
  totalCount?: number;
  onPageChange: (page: number) => void;
  onEdit: (cat: Category) => void;
  onDelete: (id: string) => void;
  showTypeColumn?: boolean;
}

export const CategoryTable = memo(function CategoryTable({
  categories, page, totalPages, onPageChange, onEdit, onDelete, showTypeColumn = true,
}: Props) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const flatData = useMemo(() => flattenTree(categories), [categories]);

  if (flatData.length === 0) {
    return (
      <Card className="bg-white border border-gray-200 rounded-xl">
        <CardContent className="p-16 text-center">
          <div className="w-12 h-12 rounded-lg bg-gray-100 mx-auto flex items-center justify-center mb-4">
            <FolderOpen className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-900 mb-1">No categories yet</p>
          <p className="text-sm text-gray-500">Click "Add Category" to create your first one.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table>
          <TableHeaderRow columns={[
            { label: "Name" },
            { label: "Slug" },
            ...(showTypeColumn ? [{ label: "Type" }] : []),
            { label: "Status" },
            { label: "Description" },
            { label: "Sub", className: "text-center" },
            { label: "Actions", className: "text-right" },
          ]} />
          <TableBody>
            {flatData.map((item) => (
              <TableRow
                key={item.id}
                className="border-gray-200 cursor-pointer hover:bg-gray-50"
                onClick={() => onEdit(item)}
              >
                <TableCell style={{ paddingLeft: `${item._depth * 24 + 16}px` }}>
                  <div className="flex items-center gap-3">
                    {item._depth > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover border border-gray-200 shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <FolderOpen className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                    <span className="text-sm text-gray-900">{item.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-500 font-mono">{item.slug}</span>
                </TableCell>
                {showTypeColumn && (
                  <TableCell>
                    <TypeBadge type={item.type} />
                  </TableCell>
                )}
                <TableCell>
                  <StatusBadge value={item.is_active} map={ACTIVE_STATUS} />
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-500 truncate max-w-[220px] block">
                    {item.description?.replace(/<[^>]*>/g, "") || "—"}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-sm text-gray-500">{item.children?.length ?? 0}</span>
                </TableCell>
                <TableCell>
                  <ActionButtons onEdit={() => onEdit(item)} onDelete={() => setDeleteId(item.id)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <PaginationBar page={page} totalPages={totalPages} onPageChange={onPageChange} />

      <DeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => deleteId && onDelete(deleteId)}
        title="Delete this category?"
        description="This cannot be undone."
      />
    </>
  );
});
