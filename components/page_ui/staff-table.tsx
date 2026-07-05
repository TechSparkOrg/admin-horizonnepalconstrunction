"use client";

import { Users } from "lucide-react";
import Image from "next/image";
import type { StaffMemberListItem } from "@/api/types/staff.types";
import { STAFF_TYPE_STYLES } from "@/api/types/staff.types";
import { Badge } from "@/components/ui/badge";
import { DataTable, type ColumnDef } from "@/components/global_ui/data-table";
import { StatusBadge, ACTIVE_STATUS } from "@/components/global_ui/status-badge";

interface Props {
  items: StaffMemberListItem[];
  onEdit: (item: StaffMemberListItem) => void;
  onDelete: (id: string) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function StaffTable({ items, onEdit, onDelete, page, totalPages, onPageChange }: Props) {
  const columns: ColumnDef<StaffMemberListItem>[] = [
    {
      header: "Name",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
            {item.photo ? (
              <Image src={item.photo} alt={item.name} width={32} height={32} className="object-cover w-full h-full" />
            ) : (
              <Users className="w-4 h-4 text-gray-400" />
            )}
          </div>
          <span className="text-sm text-gray-900">{item.name}</span>
        </div>
      ),
    },
    {
      header: "Email",
      render: (item) => <span className="text-sm text-gray-600">{item.email}</span>,
    },
    {
      header: "Role",
      render: (item) => <span className="text-sm text-gray-600">{item.designation || "\u2014"}</span>,
    },
    {
      header: "Department",
      render: (item) => <span className="text-sm text-gray-600">{item.department || "\u2014"}</span>,
    },
    {
      header: "Type",
      render: (item) => {
        const typeStyle = STAFF_TYPE_STYLES[item.type];
        return (
          <Badge variant="outline" className={`font-normal ${typeStyle.color}`}>
            {typeStyle.label}
          </Badge>
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
      data={items}
      columns={columns}
      onEdit={onEdit}
      onDelete={onDelete}
      getIdentifier={(item) => item.id}
      page={page}
      totalPages={totalPages}
      onPageChange={onPageChange}
      emptyState={{ icon: Users, title: "No staff members yet", description: "Add a staff member to get started." }}
    />
  );
}
