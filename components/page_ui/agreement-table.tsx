"use client";

import { FileText } from "lucide-react";
import type { AgreementItem } from "@/api/types/agreement.types";
import { Badge } from "@/components/ui/badge";
import { DataTable, type ColumnDef } from "@/components/global_ui/data-table";

interface Props {
  items: AgreementItem[];
  onEdit: (item: AgreementItem) => void;
  onDelete: (id: string) => void;

  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function AgreementStatusBadge({ status }: { status: string }) {
  const isCompleted = status === "completed";
  return (
    <Badge
      variant="outline"
      className={`font-normal gap-1.5 ${
        isCompleted
          ? "border-green-200 bg-green-50 text-green-600"
          : "border-amber-200 bg-amber-50 text-amber-600"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isCompleted ? "bg-green-500" : "bg-amber-500"}`} />
      {isCompleted ? "Completed" : "Draft"}
    </Badge>
  );
}

export function AgreementTable({ items, onEdit, onDelete, page, totalPages, onPageChange }: Props) {
  const columns: ColumnDef<AgreementItem>[] = [
    {
      header: "Name",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-gray-400" />
          </div>
          <span className="text-sm text-gray-900 font-medium">{item.name}</span>
        </div>
      ),
    },
    {
      header: "Client",
      render: (item) => <span className="text-sm text-gray-700">{item.client_name}</span>,
    },
    {
      header: "Template",
      render: (item) => (
        <Badge variant="outline" className="font-normal border-gray-200 bg-gray-50 text-gray-600">
          {item.template_name}
        </Badge>
      ),
    },
    {
      header: "Project",
      render: (item) => <span className="text-sm text-gray-500">{item.project_name || "—"}</span>,
    },
    {
      header: "Status",
      render: (item) => <AgreementStatusBadge status={item.status} />,
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
      onPageChange={onPageChange}
      emptyState={{ icon: FileText, title: "No agreements yet", description: "Create an agreement to get started." }}
    />
  );
}
