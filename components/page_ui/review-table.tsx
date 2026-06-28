"use client";

import { Star, MessageSquareQuote } from "lucide-react";
import type { AdminReview } from "@/api/types/review.types";
import { DataTable, type ColumnDef } from "@/components/global_ui/data-table";
import { StatusBadge } from "@/components/global_ui/status-badge";
import { formatDate } from "@/lib/utils";

const REVIEW_STATUS = {
  pending: { label: "Pending", color: "border-amber-200 bg-amber-50 text-amber-600", dotColor: "bg-amber-500" },
  read: { label: "Read", color: "border-blue-200 bg-blue-50 text-blue-600", dotColor: "bg-blue-500" },
  published: { label: "Published", color: "border-green-200 bg-green-50 text-green-600", dotColor: "bg-green-500" },
  ignored: { label: "Ignored", color: "border-gray-200 bg-gray-50 text-gray-500", dotColor: "bg-gray-400" },
} as const;

interface Props {
  reviews: AdminReview[];
  onEdit: (item: AdminReview) => void;
  onDelete: (id: string) => void;
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

function StarDisplay({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`size-3.5 ${s <= value ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
      ))}
    </div>
  );
}

export function ReviewTable({ reviews, onEdit, onDelete, page, totalPages, totalCount, onPageChange }: Props) {
  const columns: ColumnDef<AdminReview>[] = [
    {
      header: "Name",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
            <MessageSquareQuote className="w-4 h-4 text-gray-400" />
          </div>
          <span className="text-sm text-gray-900 font-medium">{item.name}</span>
        </div>
      ),
    },
    {
      header: "Rating",
      render: (item) => <StarDisplay value={item.rating} />,
    },
    {
      header: "Description",
      render: (item) => (
        <span className="text-sm text-gray-500 line-clamp-2 max-w-xs">
          {item.description || "—"}
        </span>
      ),
    },
    {
      header: "Status",
      render: (item) => <StatusBadge value={item.status} map={REVIEW_STATUS} />,
    },
    {
      header: "Date",
      render: (item) => <span className="text-sm text-gray-500">{formatDate(item.created_at)}</span>,
    },
  ];

  return (
    <DataTable
      data={reviews}
      columns={columns}
      onEdit={onEdit}
      onDelete={onDelete}
      getIdentifier={(item) => item.id}
      page={page}
      totalPages={totalPages}
      totalCount={totalCount}
      onPageChange={onPageChange}
      emptyState={{ icon: MessageSquareQuote, title: "No reviews yet", description: "Create your first review to get started." }}
      deleteDialog={{
        title: () => "Delete this review?",
        description: () => "Are you sure you want to delete this review? This cannot be undone.",
      }}
    />
  );
}
