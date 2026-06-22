"use client";

import { Compass } from "lucide-react";
import type { VastuItem, VastuItemType } from "@/api/types/vastu.types";
import { Badge } from "@/components/ui/badge";
import { DataTable, type ColumnDef } from "@/components/global_ui/data-table";
import { StatusBadge, ACTIVE_STATUS } from "@/components/global_ui/status-badge";

const TYPE_STYLES: Record<VastuItemType, { color: string; label: string }> = {
  section: { color: "border-blue-200 bg-blue-50 text-blue-600", label: "Section" },
  room: { color: "border-purple-200 bg-purple-50 text-purple-600", label: "Room" },
  direction: { color: "border-amber-200 bg-amber-50 text-amber-600", label: "Direction" },
};

interface Props {
  items: VastuItem[];
  onEdit: (item: VastuItem) => void;
  onDelete: (id: string) => void;
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export function VastuTable({ items, onEdit, onDelete, page, totalPages, totalCount, onPageChange }: Props) {
  const columns: ColumnDef<VastuItem>[] = [
    {
      header: "Title",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
            <Compass className="w-4 h-4 text-gray-400" />
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
          {item.content_list.length}
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
      totalCount={totalCount}
      onPageChange={onPageChange}
      emptyState={{ icon: Compass, title: "No items yet", description: "Add a section, room, or direction to get started." }}
      deleteDialog={{
        title: (id) => {
          const item = items.find((i) => i.id === id);
          return `Delete "${item?.title || "this item"}"?`;
        },
        description: (id) => {
          const item = items.find((i) => i.id === id);
          return `Are you sure you want to delete "${item?.title || "this item"}"? This cannot be undone.`;
        },
      }}
    />
  );
}
