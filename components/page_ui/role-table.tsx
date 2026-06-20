"use client";

import { Shield, Pencil, Trash2 } from "lucide-react";
import type { RoleItem } from "@/api/types/permission.types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteDialog } from "@/components/global_ui/delete-dialog";

interface Props {
  items: RoleItem[];
  onEdit: (item: RoleItem) => void;
  onDelete: (id: number) => void;
  deleteId: number | null;
  setDeleteId: (id: number | null) => void;
}

const ROLE_COLORS: Record<string, string> = {
  admin: "border-red-200 bg-red-50 text-red-600",
  manager: "border-blue-200 bg-blue-50 text-blue-600",
  content_writer: "border-green-200 bg-green-50 text-green-600",
  csr: "border-purple-200 bg-purple-50 text-purple-600",
};

export function RoleTable({ items, onEdit, onDelete, deleteId, setDeleteId }: Props) {
  if (items.length === 0) {
    return (
      <Card className="bg-white border border-gray-200 rounded-xl">
        <CardContent className="p-16 text-center">
          <div className="w-12 h-12 rounded-lg bg-gray-100 mx-auto flex items-center justify-center mb-4">
            <Shield className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-900 mb-1">No roles found</p>
          <p className="text-sm text-gray-500">Create a role to get started.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-200 hover:bg-transparent">
              <TableHead className="text-gray-900 font-semibold">Role</TableHead>
              <TableHead className="text-gray-900 font-semibold">Permissions</TableHead>
              <TableHead className="text-gray-900 font-semibold">Users</TableHead>
              <TableHead className="text-gray-900 font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const colorClass = ROLE_COLORS[item.name] || "border-gray-200 bg-gray-50 text-gray-600";
              return (
                <TableRow
                  key={item.id}
                  className="border-gray-200 cursor-pointer hover:bg-gray-50"
                  onClick={() => onEdit(item)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={`font-medium ${colorClass}`}>
                        {item.name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">{item.permission_count} permissions</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">{item.user_count} {item.user_count === 1 ? "user" : "users"}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-sidebar-primary border-sidebar-primary/20 hover:bg-sidebar-primary/5"
                        onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 border-red-200 hover:bg-red-50"
                        onClick={(e) => { e.stopPropagation(); setDeleteId(item.id); }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <DeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => deleteId && onDelete(deleteId)}
        title="Delete this role?"
        description="This cannot be undone. Users assigned to this role will lose their permissions."
      />
    </>
  );
}
