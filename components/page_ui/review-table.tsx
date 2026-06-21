"use client";

import { MessageSquareQuote } from "lucide-react";
import type { ReviewGroup } from "@/api/types/review.types";
import { Badge } from "@/components/ui/badge";
import { DataTable, type ColumnDef } from "@/components/global_ui/data-table";
import { StatusBadge, ACTIVE_STATUS } from "@/components/global_ui/status-badge";

interface Props {
  groups: ReviewGroup[];
  onEdit: (item: ReviewGroup) => void;
  onDelete: (id: string) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function ReviewTable({ groups, onEdit, onDelete, page, totalPages, onPageChange }: Props) {
  const columns: ColumnDef<ReviewGroup>[] = [
    {
      header: "Title",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
            <MessageSquareQuote className="w-4 h-4 text-gray-400" />
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
      header: "Items",
      render: (item) => (
        <Badge variant="outline" className="font-normal border-gray-200 bg-gray-50 text-gray-600">
          {item.items.length}
        </Badge>
      ),
    },
    {
      header: "Status",
      render: (item) => <StatusBadge value={item.is_active} map={ACTIVE_STATUS} />,
    },
  ];

  return (
    <DataTable
      data={groups}
      columns={columns}
      onEdit={onEdit}
      onDelete={onDelete}
      getIdentifier={(item) => item.id}
      page={page}
      totalPages={totalPages}
      onPageChange={onPageChange}
      emptyState={{ icon: MessageSquareQuote, title: "No reviews yet", description: "Create your first review group to get started." }}
      deleteDialog={{ title: "Delete review group?", description: "This will also remove all reviews inside it." }}
    />
  );
}
