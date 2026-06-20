"use client";

import Image from "next/image";
import { Building2 } from "lucide-react";
import type { Bank } from "@/api/types/emi.types";
import { DataTable, type ColumnDef } from "@/components/global_ui/data-table";

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
            <Image src={item.logo} alt={item.name} fill className="object-cover" />
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
    />
  );
}
