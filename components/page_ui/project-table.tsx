"use client";

import { FolderOpen, Pencil, Trash2 } from "lucide-react";
import type { Project } from "@/api/types/project.types";
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
  projects: Project[];
  onEdit: (item: Project) => void;
  onDelete: (slug: string) => void;
  deleteSlug: string | null;
  setDeleteSlug: (slug: string | null) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const STATUS_STYLES: Record<string, string> = {
  ongoing: "border-blue-200 bg-blue-50 text-blue-600",
  completed: "border-green-200 bg-green-50 text-green-600",
  paused: "border-orange-200 bg-orange-50 text-orange-600",
};

const PRIORITY_STYLES: Record<string, string> = {
  low: "border-gray-200 bg-gray-50 text-gray-500",
  medium: "border-blue-200 bg-blue-50 text-blue-600",
  high: "border-orange-200 bg-orange-50 text-orange-600",
  top: "border-red-200 bg-red-50 text-red-600",
};

export function ProjectTable({ projects, onEdit, onDelete, deleteSlug, setDeleteSlug, page, totalPages, onPageChange }: Props) {
  if (projects.length === 0) {
    return (
      <Card className="bg-white border border-gray-200 rounded-xl">
        <CardContent className="p-16 text-center">
          <div className="w-12 h-12 rounded-lg bg-gray-100 mx-auto flex items-center justify-center mb-4">
            <FolderOpen className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-900 mb-1">No projects yet</p>
          <p className="text-sm text-gray-500">Create your first project to get started.</p>
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
              <TableHead className="text-gray-900 font-semibold">Status</TableHead>
              <TableHead className="text-gray-900 font-semibold">Priority</TableHead>
              <TableHead className="text-gray-900 font-semibold">Location</TableHead>
              <TableHead className="text-gray-900 font-semibold">Created</TableHead>
              <TableHead className="text-gray-900 font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((item) => (
              <TableRow
                key={item.slug}
                className="border-gray-200 cursor-pointer hover:bg-gray-50"
                onClick={() => onEdit(item)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                      <FolderOpen className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-sm text-gray-900">{item.title}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`font-normal gap-1.5 ${STATUS_STYLES[item.status] || STATUS_STYLES.ongoing}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      item.status === "ongoing" ? "bg-blue-500" : item.status === "completed" ? "bg-green-500" : "bg-orange-500"
                    }`} />
                    {item.status === "ongoing" ? "Ongoing" : item.status === "completed" ? "Completed" : "Paused"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`font-normal ${PRIORITY_STYLES[item.priority] || PRIORITY_STYLES.medium}`}>
                    {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-500">{item.location || "—"}</TableCell>
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
        open={!!deleteSlug}
        onOpenChange={(open) => !open && setDeleteSlug(null)}
        onConfirm={() => deleteSlug && onDelete(deleteSlug)}
        title="Delete project?"
        description="This cannot be undone."
      />
    </>
  );
}
