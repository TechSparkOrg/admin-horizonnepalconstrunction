"use client";

import { Package } from "lucide-react";
import Image from "next/image";
import type { MaterialItem } from "@/api/types/material-list.types";
import { DataTable, type ColumnDef } from "@/components/global_ui/data-table";
import { StatusBadge } from "@/components/global_ui/status-badge";

interface Props {
  items: MaterialItem[];
  onEdit: (item: MaterialItem) => void;
  onDelete: (id: string) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function MaterialListTable({ items, onEdit, onDelete, page, totalPages, onPageChange }: Props) {
  const columns: ColumnDef<MaterialItem>[] = [
    {
      header: "Name",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
            {item.photo ? (
              <Image src={item.photo} alt={item.name} width={32} height={32} className="object-cover w-full h-full" />
            ) : (
              <Package className="w-4 h-4 text-gray-400" />
            )}
          </div>
          <span className="text-sm text-gray-900">{item.name}</span>
        </div>
      ),
    },
    {
      header: "Price / Unit",
      render: (item) => (
        <span className="text-sm text-gray-900 font-medium">
          {new Intl.NumberFormat("en-IN").format(item.price_per_unit)}
        </span>
      ),
    },
    {
      header: "Unit",
      render: (item) => <span className="text-sm text-gray-600">{item.unit_value || "\u2014"}</span>,
    },
    {
      header: "Company",
      render: (item) => <span className="text-sm text-gray-600">{item.company_value || "\u2014"}</span>,
    },
    {
      header: "Status",
      render: (item) => <StatusBadge active={item.is_active} />,
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
      emptyState={{ icon: Package, title: "No materials yet", description: "Add a material to get started." }}
      deleteDialog={{ title: "Delete this material?", description: "This cannot be undone." }}
    />
  );
}
