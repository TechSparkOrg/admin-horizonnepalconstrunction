"use client";
import { useState } from "react";
import { FileText } from "lucide-react";
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
import type { AttributeItem, UsedIn } from "@/api/types/attribute.types";

const USED_IN_LABELS: Record<UsedIn, string> = {
  all: "All",
  services: "Services",
  blog: "Blog",
  project: "Project",
};

interface Props {
  items: AttributeItem[];
  onEdit: (item: AttributeItem) => void;
  onDelete: (id: string) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function AttributeTable({ items, onEdit, onDelete, page, totalPages, onPageChange }: Props) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <Card className="bg-white border border-gray-200 rounded-xl">
        <CardContent className="p-16 text-center">
          <div className="w-12 h-12 rounded-lg bg-gray-100 mx-auto flex items-center justify-center mb-4">
            <FileText className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-900 mb-1">No attributes yet</p>
          <p className="text-sm text-gray-500">Add an attribute type to get started.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table>
          <TableHeaderRow columns={[
            { label: "Title" },
            { label: "Slug" },
            { label: "Used In" },
            { label: "Fields" },
            { label: "Status" },
            { label: "Actions", className: "text-right" },
          ]} />
          <TableBody>
            {items.map((item) => (
              <TableRow
                key={item.id}
                className="border-gray-200 cursor-pointer hover:bg-gray-50"
                onClick={() => onEdit(item)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-sm text-gray-900">{item.title}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <code className="text-xs text-gray-500">{item.slug}</code>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-normal border-gray-200 bg-gray-50 text-gray-600">
                    {USED_IN_LABELS[item.used_in]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-normal border-gray-200 bg-gray-50 text-gray-600">
                    {item.values.length}
                  </Badge>
                </TableCell>
                <TableCell>
                  <StatusBadge value={item.is_active} map={ACTIVE_STATUS} />
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
        title="Delete this attribute?"
        description="This cannot be undone."
      />
    </>
  );
}
