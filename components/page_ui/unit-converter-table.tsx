"use client";

import Image from "next/image";
import { ArrowLeftRight } from "lucide-react";
import type { UnitConversionItem, BannerImage } from "@/api/types/unit-converter.types";
import { Badge } from "@/components/ui/badge";
import { DataTable, type ColumnDef } from "@/components/global_ui/data-table";
import { StatusBadge, ACTIVE_STATUS } from "@/components/global_ui/status-badge";
import { stripHtml } from "@/lib/html-content";

function getPrimaryUrl(item: UnitConversionItem): string {
  if (item.banner_url) return item.banner_url;
  const images: BannerImage[] = item.banner_images ?? [];
  if (!images.length) return "";
  const primary = images.find((img) => img.isPrimary) ?? images[0];
  return primary.url;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + "...";
}

interface Props {
  items: UnitConversionItem[];
  onEdit: (item: UnitConversionItem) => void;
  onDelete: (slug: string) => void;
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export function UnitConverterTable({ items, onEdit, onDelete, page, totalPages, totalCount, onPageChange }: Props) {
  const columns: ColumnDef<UnitConversionItem>[] = [
    {
      header: "Image",
      render: (item) => {
        const url = getPrimaryUrl(item);
        if (!url) return <div className="size-10 rounded-md bg-gray-100" />;
        return (
          <div className="size-10 rounded-md overflow-hidden bg-gray-100 relative">
            <Image src={url} alt={item.title} fill className="object-cover" sizes="40px" />
          </div>
        );
      },
    },
    {
      header: "Name",
      render: (item) => (
        <div className="flex flex-col max-w-[220px]">
          <span className="text-sm text-gray-900 font-medium truncate">{item.title}</span>
          {item.description && (
            <span className="text-xs text-gray-500 truncate">{truncate(stripHtml(item.description), 60)}</span>
          )}
        </div>
      ),
    },
    {
      header: "Base Unit",
      render: (item) => (
        <Badge variant="outline" className="font-normal border-purple-200 bg-purple-50 text-purple-600">
          {item.base_unit}
        </Badge>
      ),
    },
    {
      header: "Conversions",
      render: (item) => <span className="text-sm text-gray-600">{item.conversions.length} rules</span>,
    },
    {
      header: "Status",
      render: (item) => <StatusBadge value={item.is_active} map={ACTIVE_STATUS} />,
    },
  ];

  return (
    <DataTable
      data={items}
      columns={columns}
      onEdit={onEdit}
      onDelete={onDelete}
      getIdentifier={(item) => item.slug}
      page={page}
      totalPages={totalPages}
      totalCount={totalCount}
      onPageChange={onPageChange}
      emptyState={{ icon: ArrowLeftRight, title: "No conversions yet", description: "Create a unit conversion rule to get started." }}
      deleteDialog={{
        title: (slug) => {
          const item = items.find((m) => m.slug === slug);
          return `Delete "${item?.title || "this conversion"}"?`;
        },
        description: (slug) => {
          const item = items.find((m) => m.slug === slug);
          return `Delete "${item?.title || "this conversion"}"? This cannot be undone.`;
        },
      }}
    />
  );
}
