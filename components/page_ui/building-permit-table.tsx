"use client";

import { FileText } from "lucide-react";
import type { BuildingPermitItem, BuildingPermitItemType } from "@/api/types/building-permit.types";
import { Badge } from "@/components/ui/badge";
import { DataTable, type ColumnDef } from "@/components/global_ui/data-table";
import { StatusBadge, ACTIVE_STATUS } from "@/components/global_ui/status-badge";

const TYPE_STYLES: Record<BuildingPermitItemType, { color: string; label: string }> = {
  workflow_step: { color: "border-blue-200 bg-blue-50 text-blue-600", label: "Workflow Step" },
  doc_category: { color: "border-green-200 bg-green-50 text-green-600", label: "Doc Category" },
  regulation: { color: "border-amber-200 bg-amber-50 text-amber-600", label: "Regulation" },
  municipality: { color: "border-purple-200 bg-purple-50 text-purple-600", label: "Municipality" },
};

interface Props {
  items: BuildingPermitItem[];
  onEdit: (item: BuildingPermitItem) => void;
  onDelete: (id: string) => void;

  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function getItemsCount(item: BuildingPermitItem): number {
  if (item.type === "workflow_step") return item.documents.length;
  if (item.type === "doc_category" || item.type === "regulation") return item.items.length;
  return 0;
}

export function BuildingPermitTable({ items, onEdit, onDelete, page, totalPages, onPageChange }: Props) {
  const columns: ColumnDef<BuildingPermitItem>[] = [
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
      header: "Type",
      render: (item) => {
        const typeStyle = TYPE_STYLES[item.type];
        return (
          <Badge variant="outline" className={`font-normal gap-1.5 ${typeStyle.color}`}>
            {typeStyle.label}
          </Badge>
        );
      },
    },
    {
      header: "Items",
      render: (item) => (
        <Badge variant="outline" className="font-normal border-gray-200 bg-gray-50 text-gray-600">
          {getItemsCount(item)}
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
      data={items}
      columns={columns}
      onEdit={onEdit}
      onDelete={onDelete}
      getIdentifier={(item) => item.id}
      page={page}
      totalPages={totalPages}
      onPageChange={onPageChange}
      emptyState={{ icon: FileText, title: "No items yet", description: "Add a workflow step, doc category, regulation, or municipality to get started." }}
    />
  );
}
