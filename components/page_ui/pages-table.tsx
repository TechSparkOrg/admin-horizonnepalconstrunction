"use client";

import { FileText } from "lucide-react";
import type { PageListItem } from "@/api/types/page.types";
import { formatDate } from "@/lib/dates";
import { Badge } from "@/components/ui/badge";
import { DataTable, type ColumnDef } from "@/components/global_ui/data-table";

interface Props {
  pages: PageListItem[];
  onEdit: (item: PageListItem) => void;
  onDelete: (slug: string) => void;
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export function PagesTable({ pages, onEdit, onDelete, page, totalPages, totalCount, onPageChange }: Props) {
  const columns: ColumnDef<PageListItem>[] = [
    {
      header: "Title",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
            <FileText className="w-4 h-4 text-gray-400" />
          </div>
          <span className="text-sm text-gray-900">{item.title}</span>
        </div>
      ),
    },
    {
      header: "Slug",
      render: (item) => <span className="text-sm text-gray-500 font-mono">/{item.slug}</span>,
    },
    {
      header: "Status",
      render: (item) => (
        <Badge
          variant="outline"
          className={`font-normal gap-1.5 ${
            item.is_published
              ? "border-green-200 bg-green-50 text-green-600"
              : "border-gray-200 bg-gray-50 text-gray-500"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${item.is_published ? "bg-green-500" : "bg-gray-400"}`} />
          {item.is_published ? "Published" : "Draft"}
        </Badge>
      ),
    },
    {
      header: "Created",
      render: (item) => <span className="text-sm text-gray-500">{item.created_at ? formatDate(item.created_at) : "—"}</span>,
    },
  ];

  return (
    <DataTable
      data={pages}
      columns={columns}
      onEdit={onEdit}
      onDelete={onDelete}
      getIdentifier={(item) => item.slug}
      page={page}
      totalPages={totalPages}
      totalCount={totalCount}
      onPageChange={onPageChange}
      emptyState={{ icon: FileText, title: "No pages yet", description: "Create your first page to get started." }}
      deleteDialog={{
        title: (slug) => {
          const item = pages.find((p) => p.slug === slug);
          return `Delete "${item?.title || "this page"}"?`;
        },
        description: (slug) => {
          const item = pages.find((p) => p.slug === slug);
          return `Are you sure you want to delete "${item?.title || "this page"}"? This cannot be undone.`;
        },
      }}
    />
  );
}
