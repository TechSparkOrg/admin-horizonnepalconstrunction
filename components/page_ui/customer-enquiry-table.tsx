"use client";

import { Mail } from "lucide-react";
import type { ConsultationSubmission } from "@/api/types/consultation.types";
import { DataTable, type ColumnDef } from "@/components/global_ui/data-table";
import { formatDate } from "@/lib/utils";

interface Props {
  enquiries: ConsultationSubmission[];
  onViewDetails: (item: ConsultationSubmission) => void;
  onDelete: (id: string) => void;
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export function CustomerEnquiryTable({ enquiries, onViewDetails, onDelete, page, totalPages, totalCount, onPageChange }: Props) {
  const columns: ColumnDef<ConsultationSubmission>[] = [
    {
      header: "Name",
      render: (item) => <span className="text-sm text-gray-900 font-medium">{item.name}</span>,
    },
    {
      header: "Phone",
      render: (item) => <span className="text-sm text-gray-600">{item.phone}</span>,
    },
    {
      header: "Service",
      render: (item) => <span className="text-sm text-gray-500">{item.service || "—"}</span>,
    },
    {
      header: "Date",
      render: (item) => <span className="text-sm text-gray-500">{formatDate(item.created_at)}</span>,
    },
  ];

  return (
    <DataTable
      data={enquiries}
      columns={columns}
      onEdit={onViewDetails}
      onDelete={onDelete}
      getIdentifier={(item) => item.id}
      page={page}
      totalPages={totalPages}
      totalCount={totalCount}
      onPageChange={onPageChange}
      emptyState={{ icon: Mail, title: "No enquiries yet", description: "Customer enquiries will appear here once submitted." }}
      deleteDialog={{
        title: () => "Delete this enquiry?",
        description: () => "Are you sure you want to delete this enquiry? This cannot be undone.",
      }}
    />
  );
}
