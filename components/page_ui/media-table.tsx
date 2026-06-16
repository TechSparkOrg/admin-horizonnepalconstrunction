"use client";

import Image from "next/image";
import { ImageIcon, Box, Boxes, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import type { MediaItem } from "@/api/types/media.types";
import { isVideoUrl, isModelUrl } from "@/lib/media";

interface Props {
  items: MediaItem[];
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onEdit: (item: MediaItem) => void;
  onDelete: (id: string) => void;
  groupLabel: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function groupBadge(group: string) {
  const colors: Record<string, string> = {
    Images: "bg-blue-50 text-blue-600",
    Videos: "bg-purple-50 text-purple-600",
    "3D Models": "bg-green-50 text-green-600",
  };
  return colors[group] || "bg-gray-50 text-gray-600";
}

export function MediaTable({ items, page, totalPages, totalCount, onPageChange, onEdit, onDelete, groupLabel }: Props) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
        <div className="w-12 h-12 rounded-lg bg-gray-100 mx-auto flex items-center justify-center mb-4">
          <ImageIcon className="w-5 h-5 text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-900 mb-1">No {groupLabel.toLowerCase()} yet</p>
        <p className="text-sm text-gray-500">Click &quot;Add {groupLabel === "Images" ? "Image" : groupLabel === "Videos" ? "Video" : groupLabel === "Banners" ? "Banner" : "Model"}&quot; to upload your first one.</p>
      </div>
    );
  }

  return (
    <div className="bg-white w-full rounded-xl border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-200 hover:bg-transparent">
            <TableHead className="text-gray-900 font-semibold w-12">Preview</TableHead>
            <TableHead className="text-gray-900 font-semibold">Name</TableHead>
            <TableHead className="text-gray-900 font-semibold">Group</TableHead>
            <TableHead className="text-gray-900 font-semibold">Status</TableHead>
            <TableHead className="text-gray-900 font-semibold">Created</TableHead>
            <TableHead className="text-gray-900 font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="border-gray-200 cursor-pointer hover:bg-gray-50" onClick={() => onEdit(item)}>
              <TableCell className="py-2">
                <div className="size-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                  {item.url.match(/\.(jpe?g|png|webp|gif|svg|bmp|ico|tiff?)/i) ? (
                    <Image src={item.url} alt={item.alt} width={40} height={40} className="w-full h-full object-cover" />
                  ) : isVideoUrl(item.url) ? (
                    <video src={item.url} className="w-full h-full object-cover" muted />
                  ) : isModelUrl(item.url) ? (
                    <Boxes className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Box className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </TableCell>
              <TableCell className="text-sm text-gray-900 max-w-[240px] truncate">
                {item.title || item.alt || item.url.split("/").pop() || "Untitled"}
              </TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${groupBadge(item.group_title)}`}>
                  {item.group_title || "—"}
                </span>
              </TableCell>
              <TableCell>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                  item.is_active !== false
                    ? "border border-green-200 bg-green-50 text-green-600"
                    : "border border-gray-200 bg-gray-50 text-gray-500"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${item.is_active !== false ? "bg-green-500" : "bg-gray-400"}`} />
                  {item.is_active !== false ? "Active" : "Inactive"}
                </span>
              </TableCell>
              <TableCell className="text-sm text-gray-500">{formatDate(item.created_at)}</TableCell>
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
                    onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
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

      {totalPages > 0 && (
        <div className="flex w-full items-center justify-between px-4 py-1 border-t border-gray-200">
          <span className="text-sm text-gray-500">
            {totalCount} {totalCount === 1 ? "item" : "items"} total
          </span>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => onPageChange(page - 1)}
                  className={page <= 1 ? "pointer-events-none opacity-40" : "cursor-pointer"}
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
                  onClick={() => onPageChange(page + 1)}
                  className={page >= totalPages ? "pointer-events-none opacity-40" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
