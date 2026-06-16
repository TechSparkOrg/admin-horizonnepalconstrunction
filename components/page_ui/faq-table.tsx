"use client";

import { HelpCircle, Pencil, Trash2 } from "lucide-react";
import type { FaqGroup } from "@/api/types/faq.types";
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
import { DeleteDialog } from "@/components/global_ui/delete_dailog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

interface Props {
  groups: FaqGroup[];
  onEdit: (item: FaqGroup) => void;
  onDelete: (id: string) => void;
  deleteId: string | null;
  setDeleteId: (id: string | null) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function FaqTable({ groups, onEdit, onDelete, deleteId, setDeleteId, page, totalPages, onPageChange }: Props) {
  if (groups.length === 0) {
    return (
      <Card className="bg-white border border-gray-200 rounded-xl">
        <CardContent className="p-16 text-center">
          <div className="w-12 h-12 rounded-lg bg-gray-100 mx-auto flex items-center justify-center mb-4">
            <HelpCircle className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-900 mb-1">No FAQs yet</p>
          <p className="text-sm text-gray-500">Create your first FAQ group to get started.</p>
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
              <TableHead className="text-gray-900 font-semibold">Title</TableHead>
              <TableHead className="text-gray-900 font-semibold">Slug</TableHead>
              <TableHead className="text-gray-900 font-semibold">Category</TableHead>
              <TableHead className="text-gray-900 font-semibold">Items</TableHead>
              <TableHead className="text-gray-900 font-semibold">Status</TableHead>
              <TableHead className="text-gray-900 font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map((item) => (
              <TableRow
                key={item.id}
                className="border-gray-200 cursor-pointer hover:bg-gray-50"
                onClick={() => onEdit(item)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                      <HelpCircle className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-sm text-gray-900">{item.title}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-500 font-mono">/{item.slug}</TableCell>
                <TableCell className="text-sm text-gray-500">{item.category_id || "—"}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-normal border-gray-200 bg-gray-50 text-gray-600">
                    {item.items.length}
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
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[lab(20_23.9_-60.14)] border-[lab(20_23.9_-60.14)]/20 hover:bg-[lab(20_23.9_-60.14)]/5"
                      onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Details
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
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => onPageChange(Math.max(1, page - 1))}
                  className={page === 1 ? "pointer-events-none opacity-40" : "cursor-pointer"}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink
                    isActive={p === page}
                    onClick={() => onPageChange(p)}
                    className="cursor-pointer"
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                  className={page === totalPages ? "pointer-events-none opacity-40" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <DeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => deleteId && onDelete(deleteId)}
        title="Delete FAQ group?"
        description="This will also remove all questions inside it."
      />
    </>
  );
}
