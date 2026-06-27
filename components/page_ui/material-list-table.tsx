"use client";

import { Package } from "lucide-react";
import Image from "next/image";
import type { MaterialItem, BannerImage } from "@/api/types/material-list.types";
import { DataTable, type ColumnDef } from "@/components/global_ui/data-table";
import { StatusBadge, ACTIVE_STATUS } from "@/components/global_ui/status-badge";
import { stripHtml } from "@/lib/html-content";

function getPrimaryBannerUrl(item: MaterialItem): string {
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

function priceRange(item: MaterialItem): string {
  const prices = (item.variants ?? []).map((v) => v.price).filter((p) => p > 0);
  if (prices.length === 0)
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "NPR",
      maximumFractionDigits: 0,
    }).format(item.price_per_unit);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "NPR",
      maximumFractionDigits: 0,
    }).format(n);
  return min === max ? fmt(min) : `${fmt(min)} – ${fmt(max)}`;
}

interface Props {
  items: MaterialItem[];
  onEdit: (item: MaterialItem) => void;
  onDelete: (slug: string) => void;
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export function MaterialListTable({
  items,
  onEdit,
  onDelete,
  page,
  totalPages,
  totalCount,
  onPageChange,
}: Props) {
  const columns: ColumnDef<MaterialItem>[] = [
    {
      header: "Image",
      render: (item) => {
        const url = getPrimaryBannerUrl(item) || item.logo;
        if (!url)
          return (
            <div className="size-10 rounded-md bg-gray-100 flex items-center justify-center">
              <Package className="size-4 text-gray-400" />
            </div>
          );
        return (
          <div className="size-10 rounded-md overflow-hidden bg-gray-100 relative">
            <Image
              src={url}
              alt={item.name}
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>
        );
      },
    },
    {
      header: "Name",
      render: (item) => (
        <div className="flex flex-col max-w-[220px]">
          <span className="text-sm text-gray-900 font-medium truncate">
            {item.name}
          </span>
          {item.description && (
            <span className="text-xs text-gray-500 truncate">
              {truncate(stripHtml(item.description), 60)}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Variants",
      render: (item) => {
        const count = (item.variants ?? []).length;
        return (
          <span className="text-sm text-gray-600">
            {count} {count === 1 ? "variant" : "variants"}
          </span>
        );
      },
    },
    {
      header: "Price Range",
      render: (item) => (
        <span className="text-sm text-gray-900 font-medium">
          {priceRange(item)}
        </span>
      ),
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
      emptyState={{
        icon: Package,
        title: "No materials yet",
        description: "Add a material to get started.",
      }}
      deleteDialog={{
        title: (slug) => {
          const item = items.find((m) => m.slug === slug);
          return `Delete "${item?.name || "this material"}"?`;
        },
        description: (slug) => {
          const item = items.find((m) => m.slug === slug);
          return `Delete "${item?.name || "this material"}"? This cannot be undone.`;
        },
      }}
    />
  );
}
