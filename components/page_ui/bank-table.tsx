"use client";

import Image from "next/image";
import { Building2, Clock } from "lucide-react";
import type { Bank } from "@/api/types/emi.types";
import { DataTable, type ColumnDef } from "@/components/global_ui/data-table";
import { StatusBadge, ACTIVE_STATUS } from "@/components/global_ui/status-badge";

interface Props {
  banks: Bank[];
  onEdit: (item: Bank) => void;
  onDelete: (id: string) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function BankTable({ banks, onEdit, onDelete, page, totalPages, onPageChange }: Props) {
  const columns: ColumnDef<Bank>[] = [
    {
      header: "Logo",
      render: (item) => (
        <div className="size-9 rounded-lg overflow-hidden bg-gray-100 relative shrink-0">
          {item.logo ? (
            <Image src={item.logo} alt={item.name}  width={40} height={40} className="object-cover size-full"/>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Building2 className="size-4 text-gray-400" />
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Name",
      render: (item) => <span className="text-sm text-gray-900 font-medium">{item.name}</span>,
    },
    {
      header: "Slug",
      render: (item) => <span className="text-sm text-gray-500 font-mono">/{item.slug}</span>,
    },
    {
      header: "Code",
      render: (item) => <span className="text-sm font-mono text-gray-700">{item.code}</span>,
    },
    {
      header: "Tenure",
      render: (item) => {
        const count = item.tenure_options?.length ?? 0;
        return (
          <span className="text-sm text-gray-600 flex items-center gap-1">
            <Clock className="size-3.5 text-gray-400" />
            {count === 0 ? "—" : `${count} plan${count > 1 ? "s" : ""}`}
          </span>
        );
      },
    },
    {
      header: "Status",
      render: (item) => <StatusBadge value={item.is_active} map={ACTIVE_STATUS} />,
    },
  ];

  return (
      <DataTable
        data={banks}
        columns={columns}
        onEdit={onEdit}
        onDelete={onDelete}
        getIdentifier={(item) => item.id}
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        emptyState={{ icon: Building2, title: "No banks yet", description: "Add your first bank to get started." }}
        hideDeleteDialog
      />
  );
}
