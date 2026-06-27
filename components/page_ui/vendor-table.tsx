"use client";

import { Building2 } from "lucide-react";
import Image from "next/image";
import type { Vendor } from "@/api/types/vendor.types";
import { DataTable, type ColumnDef } from "@/components/global_ui/data-table";
import { StatusBadge, ACTIVE_STATUS } from "@/components/global_ui/status-badge";

interface Props {
  items: Vendor[];
  onEdit: (item: Vendor) => void;
  onDelete: (id: string) => void;
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export function VendorTable({ items, onEdit, onDelete, page, totalPages, totalCount, onPageChange }: Props) {
  const getVendorName = (slug: string) => items.find((v) => v.slug === slug)?.name || "this vendor";

  const columns: ColumnDef<Vendor>[] = [
    {
      header: "Vendor",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
            {item.logo ? (
              <Image src={item.logo} alt={item.name} width={32} height={32} className="object-cover w-full h-full" />
            ) : (
              <Building2 className="w-4 h-4 text-gray-400" />
            )}
          </div>
          <span className="text-sm text-gray-900 font-medium">{item.name}</span>
        </div>
      ),
    },
    {
      header: "Phone",
      render: (item) => <span className="text-sm text-gray-600">{item.phone || "\u2014"}</span>,
    },
    {
      header: "Email",
      render: (item) => <span className="text-sm text-gray-600">{item.email || "\u2014"}</span>,
    },
    {
      header: "Location",
      render: (item) => <span className="text-sm text-gray-600">{item.location || "\u2014"}</span>,
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
      getIdentifier={(item) => item.slug}
      page={page}
      totalPages={totalPages}
      totalCount={totalCount}
      onPageChange={onPageChange}
      emptyState={{ icon: Building2, title: "No vendors yet", description: "Add a vendor to get started." }}
      deleteDialog={{
        title: (id) => `Delete "${getVendorName(id)}"?`,
        description: (id) => `Delete "${getVendorName(id)}"? This cannot be undone.`,
      }}
    />
  );
}
