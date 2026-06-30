"use client";

import Image from "next/image";
import { ImageIcon } from "lucide-react";
import type { MediaItem } from "@/api/types/media.types";
import { formatDate } from "@/lib/dates";
import { DataTable, type ColumnDef } from "@/components/global_ui/data-table";
import { StatusBadge, ACTIVE_STATUS } from "@/components/global_ui/status-badge";

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

export function BannerMediaTable({ items, page, totalPages, totalCount, onPageChange, onEdit, onDelete, groupLabel }: Props) {
  const columns: ColumnDef<MediaItem>[] = [
    {
      header: "Preview",
      render: (item) => (
        <div className="size-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
          {item.url ? (
            <Image src={item.url} alt={item.alt} width={40} height={40} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="size-4 text-gray-400" />
          )}
        </div>
      ),
    },
    {
      header: "Name",
      render: (item) => (
        <span className="text-sm text-gray-900 max-w-[240px] truncate block">
          {item.title || item.alt || item.url?.split("/").pop() || "Untitled"}
        </span>
      ),
    },
    {
      header: "Status",
      render: (item) => <StatusBadge value={item.is_active} map={ACTIVE_STATUS} />,
    },
    {
      header: "Created",
      render: (item) => <span className="text-sm text-gray-500">{formatDate(item.created_at)}</span>,
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
      totalCount={totalCount}
      hideDeleteDialog
      emptyState={{
        icon: ImageIcon,
        title: `No ${groupLabel.toLowerCase()} yet`,
        description: `Click "Add ${groupLabel === "Images" ? "Image" : groupLabel === "Videos" ? "Video" : groupLabel === "Banners" ? "Banner" : "Model"}" to upload your first one.`,
      }}
    />
  );
}
