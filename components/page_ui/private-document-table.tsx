"use client";

import Image from "next/image";
import { FileText } from "lucide-react";
import type { PrivateDocument } from "@/api/types/private-document.types";
import { Badge } from "@/components/ui/badge";
import { DataTable, type ColumnDef } from "@/components/global_ui/data-table";
import { StatusBadge, ACTIVE_STATUS } from "@/components/global_ui/status-badge";

interface Props {
  items: PrivateDocument[];
  onEdit: (item: PrivateDocument) => void;
  onDelete: (id: string) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PrivateDocumentTable({ items, onEdit, onDelete, page, totalPages, onPageChange }: Props) {
  const columns: ColumnDef<PrivateDocument>[] = [
    {
      header: "Image",
      render: (item) => {
        const firstDoc = item.documents?.[0];
        return (
          <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
            {firstDoc?.image ? (
              <Image src={firstDoc.image} alt="" width={40} height={40} className="object-cover w-full h-full" />
            ) : (
              <FileText className="w-4 h-4 text-gray-400" />
            )}
          </div>
        );
      },
    },
    {
      header: "Name",
      render: (item) => <span className="text-sm text-gray-900 font-medium">{item.title}</span>,
    },
    {
      header: "Project",
      render: (item) => <span className="text-sm text-gray-500">{item.project_name || "\u2014"}</span>,
    },
    {
      header: "Documents",
      render: (item) => (
        <Badge variant="outline" className="font-normal border-gray-200 bg-gray-50 text-gray-600">
          {item.documents?.length ?? 0} docs
        </Badge>
      ),
    },
    {
      header: "Proposals",
      render: (item) => (
        <Badge variant="outline" className="font-normal border-gray-200 bg-gray-50 text-gray-600">
          {item.proposals?.length ?? 0} props
        </Badge>
      ),
    },
    {
      header: "Status",
      render: (item) => (
        <StatusBadge value={item.status === "active"} map={ACTIVE_STATUS} />
      ),
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
      emptyState={{ icon: FileText, title: "No documents yet", description: "Create a document to get started." }}
    />
  );
}
