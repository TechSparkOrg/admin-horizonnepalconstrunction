"use client";

import { ArrowLeftRight } from "lucide-react";
import type { UnitConversionItem } from "@/api/types/unit-converter.types";
import { Badge } from "@/components/ui/badge";
import { DataTable, type ColumnDef } from "@/components/global_ui/data-table";
import { StatusBadge, ACTIVE_STATUS } from "@/components/global_ui/status-badge";

interface Props {
  items: UnitConversionItem[];
  onEdit: (item: UnitConversionItem) => void;
  onDelete: (id: string) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function UnitConverterTable({ items, onEdit, onDelete, page, totalPages, onPageChange }: Props) {
  const columns: ColumnDef<UnitConversionItem>[] = [
    {
      header: "Title",
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-sm text-gray-900 font-medium">{item.title}</span>
          <span className="text-xs text-gray-500">{item.field_label}</span>
        </div>
      ),
    },
    {
      header: "Base Unit",
      render: (item) => (
        <Badge variant="outline" className="font-normal border-purple-200 bg-purple-50 text-purple-600">
          {item.base_unit}
        </Badge>
      ),
    },
    {
      header: "Conversions",
      render: (item) => <span className="text-sm text-gray-600">{item.conversions.length} rules</span>,
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
      emptyState={{ icon: ArrowLeftRight, title: "No conversions yet", description: "Create a unit conversion rule to get started." }}
    />
  );
}
