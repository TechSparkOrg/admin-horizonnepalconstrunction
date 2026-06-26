"use client";

import { FileText } from "lucide-react";
import Image from "next/image";
import type { BlogPost } from "@/api/types/blog.types";
import { DataTable, type ColumnDef } from "@/components/global_ui/data-table";
import { StatusBadge, PUBLISH_STATUS } from "@/components/global_ui/status-badge";
import { formatDate } from "@/lib/utils";

interface Props {
  blogs: BlogPost[];
  onEdit: (item: BlogPost) => void;
  onDelete: (slug: string) => void;
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export function BlogTable({ blogs, onEdit, onDelete, page, totalPages, totalCount, onPageChange }: Props) {
  const columns: ColumnDef<BlogPost>[] = [
    {
      header: "Title",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
            {item.image ? (
              <Image src={item.image} alt={item.title} width={40} height={40} className="object-cover size-full" />
            ) : item.banner_images?.[0]?.url ? (
              <Image src={item.banner_images[0].url} alt={item.title} width={40} height={40} className="object-cover size-full" />
            ) : (
              <FileText className="size-4 text-gray-400" />
            )}
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
        <StatusBadge value={item.is_published} map={PUBLISH_STATUS} />
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
      totalCount={totalCount}
      onPageChange={onPageChange}
      emptyState={{ icon: FileText, title: "No blogs yet", description: "Create your first blog to get started." }}
      deleteDialog={{
        title: (slug) => {
          const item = blogs.find((b) => b.slug === slug);
          return `Delete "${item?.title || "this blog"}"?`;
        },
        description: (slug) => {
          const item = blogs.find((b) => b.slug === slug);
          return `Are you sure you want to delete "${item?.title || "this blog"}"? This cannot be undone.`;
        },
      }}
    />
  );
}
