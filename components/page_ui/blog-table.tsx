"use client";

import { FileText } from "lucide-react";
import type { BlogPost } from "@/api/types/blog.types";
import { DataTable, type ColumnDef } from "@/components/global_ui/data-table";
import { StatusBadge } from "@/components/global_ui/status-badge";
import { formatDate } from "@/lib/utils";

interface Props {
  blogs: BlogPost[];
  onEdit: (item: BlogPost) => void;
  onDelete: (slug: string) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function BlogTable({ blogs, onEdit, onDelete, page, totalPages, onPageChange }: Props) {
  const columns: ColumnDef<BlogPost>[] = [
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
        <StatusBadge active={item.is_published} activeLabel="Published" inactiveLabel="Draft" />
      ),
    },
    {
      header: "Created",
      render: (item) => <span className="text-sm text-gray-500">{formatDate(item.created_at)}</span>,
    },
  ];

  return (
    <DataTable
      data={blogs}
      columns={columns}
      onEdit={onEdit}
      onDelete={onDelete}
      getIdentifier={(item) => item.slug}
      page={page}
      totalPages={totalPages}
      onPageChange={onPageChange}
      emptyState={{ icon: FileText, title: "No blogs yet", description: "Create your first blog to get started." }}
      deleteDialog={{ title: "Delete blog?", description: "This cannot be undone." }}
    />
  );
}
