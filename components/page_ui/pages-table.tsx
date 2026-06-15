"use client";

import { FileText, ImageIcon, Pencil, Trash2, Eye } from "lucide-react";
import type { Page as ApiPage } from "@/api/types/page.types";
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
import { DeleteDialog } from "@/components/global_ui/delete_dailog";

interface Props {
  pages: ApiPage[];
  onEdit: (item: ApiPage) => void;
  onDelete: (slug: string) => void;
  deleteSlug: string | null;
  setDeleteSlug: (slug: string | null) => void;
}

export function PagesTable({ pages, onEdit, onDelete, deleteSlug, setDeleteSlug }: Props) {
  if (pages.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
        <div className="w-12 h-12 rounded-lg bg-gray-100 mx-auto flex items-center justify-center mb-4">
          <FileText className="w-5 h-5 text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-900 mb-1">No pages yet</p>
        <p className="text-sm text-gray-500">Create your first page to get started.</p>
      </div>
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
              <TableHead className="text-gray-900 font-semibold">Status</TableHead>
              <TableHead className="text-gray-900 font-semibold">Created</TableHead>
              <TableHead className="text-gray-900 font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.map((item) => (
              <TableRow
                key={item.slug}
                className="border-gray-200 cursor-pointer hover:bg-gray-50"
                onClick={() => onEdit(item)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                      <ImageIcon className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-sm text-gray-900">{item.title}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-500 font-mono">/{item.slug}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`font-normal gap-1.5 ${
                      item.is_published
                        ? "border-green-200 bg-green-50 text-green-600"
                        : "border-gray-200 bg-gray-50 text-gray-500"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${item.is_published ? "bg-green-500" : "bg-gray-400"}`} />
                    {item.is_published ? "Published" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {item.created_at
                    ? new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "—"}
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
                      onClick={(e) => { e.stopPropagation(); setDeleteSlug(item.slug); }}
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

      <DeleteDialog
        open={!!deleteSlug}
        onOpenChange={(open) => !open && setDeleteSlug(null)}
        onConfirm={() => deleteSlug && onDelete(deleteSlug)}
        title="Delete page?"
        description="This cannot be undone."
      />
    </>
  );
}
