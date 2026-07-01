"use client";

import { FileText } from "lucide-react";
import type { TemplateItem } from "@/api/types/template.types";
import { DataTable, type ColumnDef } from "@/components/global_ui/data-table";
import { StatusBadge, ACTIVE_STATUS } from "@/components/global_ui/status-badge";
import { formatDate } from "@/lib/utils";

interface Props {
  items: TemplateItem[];
  onEdit: (item: TemplateItem) => void;
  onDelete: (id: string) => void;
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

export function TemplateTable({ items, onEdit, onDelete, page, totalPages, totalCount, onPageChange, hasNext, hasPrevious }: Props) {
  const columns: ColumnDef<TemplateItem>[] = [
    {
      header: "Title",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-gray-400" />
          </div>
          <span className="text-sm text-gray-900">{item.title}</span>
        </div>
      ),
    },
    {
      header: "Status",
      render: (item) => <StatusBadge value={item.is_active} map={ACTIVE_STATUS} />,
    },
    {
      header: "Created",
      render: (item) => <span className="text-sm text-gray-500">{formatDate(item.created_at)}</span>,
    },
  ];

  return (
    <DataTable
      data={items}
      columns={columns}
      onEdit={onEdit}
      onDelete={onDelete}
      getIdentifier={(item) => item.id}
      page={page}
      totalPages={totalPages}
      totalCount={totalCount}
      onPageChange={onPageChange}
      hasNext={hasNext}
      hasPrevious={hasPrevious}
      emptyState={{ icon: FileText, title: "No templates yet", description: "Add a template to get started." }}
      deleteDialog={{
        title: (id) => {
          const item = items.find((t) => t.id === id);
          return `Delete "${item?.title || "this template"}"?`;
        },
        description: (id) => {
          const item = items.find((t) => t.id === id);
          return `Delete "${item?.title || "this template"}"? This cannot be undone.`;
        },
      }}
    />
  );
}
