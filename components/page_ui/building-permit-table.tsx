"use client";

import { FileText } from "lucide-react";
import type { BuildingPermit } from "@/api/types/building-permit.types";
import { DataTable, type ColumnDef } from "@/components/global_ui/data-table";
import { StatusBadge, ACTIVE_STATUS } from "@/components/global_ui/status-badge";

interface Props {
  items: BuildingPermit[];
  onEdit: (item: BuildingPermit) => void;
  onDelete: (id: string) => void;
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export function BuildingPermitTable({ items, onEdit, onDelete, page, totalPages, totalCount, onPageChange }: Props) {
  const columns: ColumnDef<BuildingPermit>[] = [
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
      render: (item) => <span className="text-xs text-gray-500 font-mono">/{item.slug}</span>,
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
      totalCount={totalCount}
      onPageChange={onPageChange}
      emptyState={{ icon: FileText, title: "No building permit yet", description: "Add a building permit to get started." }}
      deleteDialog={{
        title: (id) => {
          const item = items.find((i) => i.id === id);
          return `Delete "${item?.title || "this building permit"}"?`;
        },
        description: (id) => {
          const item = items.find((i) => i.id === id);
          return `Are you sure you want to delete "${item?.title || "this building permit"}"? All workflow steps, regulations, municipality data, and banners inside it will be removed.`;
        },
      }}
    />
  );
}
