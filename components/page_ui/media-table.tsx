"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageIcon, Box, Eye } from "lucide-react";
import type { MediaItem } from "@/api/types/media.types";
import { isVideoUrl, isModelUrl, isImageUrl } from "@/lib/media";
import { ModelViewer } from "@/components/global_ui/ModelViewer";
import { formatDate } from "@/lib/dates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type ColumnDef } from "@/components/global_ui/data-table";
import { UsageDetailPanel } from "@/components/page_ui/usage-detail-panel";
import { ImagePreviewDialog } from "@/components/global_ui/image-preview-dialog";

interface Props {
  items: MediaItem[];
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onEdit?: (item: MediaItem) => void;
  onDelete?: (id: string) => void;
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
    <Badge variant="outline" className={`rounded-md font-medium border-0 ${cls}`}>
      {group || "—"}
    </Badge>
  );
}

export function MediaTable({ items, page, totalPages, totalCount, onPageChange, onEdit, onDelete, groupLabel }: Props) {
  const [viewUrl, setViewUrl] = useState<string | null>(null);

  const columns: ColumnDef<MediaItem>[] = [
    {
      header: "Preview",
      render: (item) => (
        <div className="size-11 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
          {isImageUrl(item.url) ? (
            <Image src={item.url} alt={item.alt} width={44} height={44} className="w-full h-full object-cover" />
          ) : isVideoUrl(item.url) ? (
            <video src={item.url} className="w-full h-full object-cover" muted />
          ) : isModelUrl(item.url) ? (
            <ModelViewer src={item.url} className="w-full h-full" cameraControls={false} autoRotate={false} />
          ) : (
            <Box className="w-5 h-5 text-gray-400" />
          )}
        </div>
      ),
    },
    {
      header: "Group",
      render: (item) => <GroupBadge group={item.group_title} />,
    },
    {
      header: "Used In",
      render: (item) => (
        <UsageDetailPanel
          mediaId={item.id}
          usageTags={item.usage_tags}
        />
      ),
    },
    {
      header: "Created",
      render: (item) => <span className="text-sm text-gray-500">{formatDate(item.created_at)}</span>,
    },
    {
      header: "",
      className: "text-right",
      render: (item) => (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(e) => { e.stopPropagation(); setViewUrl(item.url); }}
          className="text-sidebar-primary border-sidebar-primary/20 hover:bg-sidebar-primary/5 gap-1.5"
        >
          <Eye className="size-3.5" />
          View
        </Button>
      ),
    },
  ];

  return (
    <>
      <DataTable
        data={items}
        columns={columns}
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
      <ImagePreviewDialog url={viewUrl} onClose={() => setViewUrl(null)} />
    </>
  );
}
