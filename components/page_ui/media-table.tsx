"use client";

import Image from "next/image";
import { ImageIcon, Box, Boxes } from "lucide-react";
import type { MediaItem } from "@/api/types/media.types";
import { isVideoUrl, isModelUrl } from "@/lib/media";
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

function GroupBadge({ group }: { group: string }) {
  const colors: Record<string, string> = {
    Images: "bg-blue-50 text-blue-600",
    Videos: "bg-purple-50 text-purple-600",
    "3D Models": "bg-green-50 text-green-600",
  };
  const cls = colors[group] || "bg-gray-50 text-gray-600";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${cls}`}>
      {group || "—"}
    </span>
  );
}

export function MediaTable({ items, page, totalPages, totalCount, onPageChange, onEdit, onDelete, groupLabel }: Props) {
  const columns: ColumnDef<MediaItem>[] = [
    {
      header: "Preview",
      className: "w-12",
      render: (item) => (
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
      ),
    },
    {
      header: "Name",
      render: (item) => (
        <span className="text-sm text-gray-900 max-w-[240px] truncate block">
          {item.title || item.alt || item.url.split("/").pop() || "Untitled"}
        </span>
      ),
    },
    {
      header: "Group",
      render: (item) => <GroupBadge group={item.group_title} />,
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
      emptyState={{
        icon: ImageIcon,
        title: `No ${groupLabel.toLowerCase()} yet`,
        description: `Click "Add ${groupLabel === "Images" ? "Image" : groupLabel === "Videos" ? "Video" : groupLabel === "Banners" ? "Banner" : "Model"}" to upload your first one.`,
      }}
    />
  );
}
