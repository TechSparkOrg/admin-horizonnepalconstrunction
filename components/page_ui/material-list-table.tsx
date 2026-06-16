"use client";

import { Package, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import type { MaterialItem, UnitType } from "@/api/types/material-list.types";
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

const TYPE_STYLES: Record<UnitType, { color: string; label: string }> = {
  weight: { color: "border-blue-200 bg-blue-50 text-blue-600", label: "Weight" },
  volume: { color: "border-green-200 bg-green-50 text-green-600", label: "Volume" },
  dimension: { color: "border-amber-200 bg-amber-50 text-amber-600", label: "Dimension" },
};

interface Props {
  items: MaterialItem[];
  onEdit: (item: MaterialItem) => void;
  onDelete: (id: string) => void;
  deleteId: string | null;
  setDeleteId: (id: string | null) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function MaterialListTable({ items, onEdit, onDelete, deleteId, setDeleteId, page, totalPages, onPageChange }: Props) {
  if (items.length === 0) {
    return (
      <Card className="bg-white border border-gray-200 rounded-xl">
        <CardContent className="p-16 text-center">
          <div className="w-12 h-12 rounded-lg bg-gray-100 mx-auto flex items-center justify-center mb-4">
            <Package className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-900 mb-1">No materials yet</p>
          <p className="text-sm text-gray-500">Add a material to get started.</p>
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
              <TableHead className="text-gray-900 font-semibold">Name</TableHead>
              <TableHead className="text-gray-900 font-semibold">Price / Unit</TableHead>
              <TableHead className="text-gray-900 font-semibold">Type</TableHead>
              <TableHead className="text-gray-900 font-semibold">Unit</TableHead>
              <TableHead className="text-gray-900 font-semibold">Company</TableHead>
              <TableHead className="text-gray-900 font-semibold">Status</TableHead>
              <TableHead className="text-gray-900 font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const typeStyle = TYPE_STYLES[item.unit_type];
              return (
                <TableRow
                  key={item.id}
                  className="border-gray-200 cursor-pointer hover:bg-gray-50"
                  onClick={() => onEdit(item)}
                >
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-900 font-medium">
                      {new Intl.NumberFormat("en-IN").format(item.price_per_unit)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`font-normal gap-1.5 ${typeStyle.color}`}>
                      {typeStyle.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">{item.unit}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">{item.company || "\u2014"}</span>
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
              );
            })}
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
        title="Delete this material?"
        description="This cannot be undone."
      />
    </>
  );
}
