"use client";

import { Users, Shield } from "lucide-react";
import type { AdminUser } from "@/api/types/admin-user.types";
import { ROLE_BADGE_STYLES, ROLE_LABELS } from "@/api/types/admin-user.types";
import {
  Table, TableBody, TableCell, TableRow,
} from "@/components/ui/table";
import { TableHeaderRow } from "@/components/global_ui/table-header-row";
import { ActionButtons } from "@/components/global_ui/action-buttons";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteDialog } from "@/components/global_ui/delete-dialog";
import { PaginationBar } from "@/components/global_ui/pagination-bar";

interface Props {
  items: AdminUser[];
  onEdit: (item: AdminUser) => void;
  onDelete: (id: string) => void;
  deleteId: string | null;
  setDeleteId: (id: string | null) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  canDelete?: boolean;
}

function Avatar({ name }: { name: string }) {
  const initial = name?.trim()?.charAt(0)?.toUpperCase() || "?";
  return (
    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 text-xs font-semibold text-gray-600">
      {initial}
    </div>
  );
}

export function AdminUserTable({ items, onEdit, onDelete, deleteId, setDeleteId, page, totalPages, onPageChange, canDelete }: Props) {
  if (items.length === 0) {
    return (
      <Card className="bg-white border border-gray-200 rounded-xl">
        <CardContent className="p-16 text-center">
          <div className="w-12 h-12 rounded-lg bg-gray-100 mx-auto flex items-center justify-center mb-4">
            <Shield className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-900 mb-1">No admin users yet</p>
          <p className="text-sm text-gray-500">Add an admin user to get started.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table>
          <TableHeaderRow columns={[
            { label: "Name" },
            { label: "Email" },
            { label: "Role" },
            { label: "Status" },
            { label: "Actions", className: "text-right" },
          ]} />
          <TableBody>
            {items.map((item) => {
              const roleBadge = item.is_superuser
                ? "border-amber-200 bg-amber-50 text-amber-700"
                : ROLE_BADGE_STYLES[item.role] ?? "border-gray-200 bg-gray-50 text-gray-600";
              const roleLabel = item.is_superuser
                ? "Superadmin"
                : ROLE_LABELS[item.role] ?? item.role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
              return (
                <TableRow
                  key={item.id}
                  className="border-gray-200 cursor-pointer hover:bg-gray-50"
                  onClick={() => onEdit(item)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar name={item.name} />
                      <span className="text-sm text-gray-900">{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">{item.email}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`font-normal ${roleBadge}`}>
                      {roleLabel}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`font-normal gap-1.5 ${
                        item.is_active
                          ? "border-green-200 bg-green-50 text-green-600"
                          : "border-gray-200 bg-gray-50 text-gray-500"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${item.is_active ? "bg-green-500" : "bg-gray-400"}`} />
                      {item.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <ActionButtons onEdit={() => onEdit(item)} onDelete={() => setDeleteId(item.id)} showDelete={canDelete} editLabel="Details" />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <PaginationBar page={page} totalPages={totalPages} onPageChange={onPageChange} />

      <DeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => deleteId && onDelete(deleteId)}
        title="Delete this admin user?"
        description="This cannot be undone."
      />
    </>
  );
}
