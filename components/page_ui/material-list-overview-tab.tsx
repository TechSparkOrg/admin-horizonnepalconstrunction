"use client";

import { useState } from "react";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/global_ui/searchable-select";
import { MediaPickerDialog } from "@/components/global_ui/media-handler-picker";
import { RichEditor } from "@/components/page_ui/rich-editor";
import { useVendorOptions } from "@/api/hooks/use-vendor-query";
import type { PickerMediaItem } from "@/components/global_ui/media-handler-picker";
import { toSlug } from "@/lib/slug";

interface Option {
  value: string;
  label: string;
}

interface Props {
  name: string;
  slug: string;
  pricePerUnit: number | "";
  description: string;
  unitValue: string;
  companyId: string | null;
  logo: string;
  editingId: string | null;
  onChange: (key: string, value: string | boolean | number | null) => void;
}

export function MaterialListOverviewTab({
  name,
  slug,
  pricePerUnit,
  description,
  companyId,
  logo,
  editingId,
  onChange,
}: Props) {
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const { data: vendors = [] } = useVendorOptions();

  const handleLogoSelect = async (item: PickerMediaItem) => {
    onChange("logo", item.url);
    setMediaPickerOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            value={name}
            onChange={(e) => {
              onChange("name", e.target.value);
              if (!editingId) onChange("slug", toSlug(e.target.value));
            }}
            placeholder="Material name"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Slug</Label>
          <div className="flex rounded-md border border-gray-200 overflow-hidden">
            <span className="px-3 flex items-center text-xs text-gray-500 bg-gray-100 border-r border-gray-200 shrink-0">
              /material/
            </span>
            <Input
              value={slug}
              onChange={(e) => onChange("slug", e.target.value)}
              placeholder="material-slug"
              className="border-0 rounded-none font-mono focus-visible:ring-0"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Price Per Unit</Label>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={pricePerUnit}
            onChange={(e) =>
              onChange(
                "pricePerUnit",
                e.target.value === "" ? "" : parseFloat(e.target.value)
              )
            }
            placeholder="0.00"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Company</Label>
          <SearchableSelect
            options={[
              { value: "", label: "None" },
              ...vendors,
            ]}
            value={companyId ?? ""}
            onChange={(v) => onChange("companyId", v || null)}
            placeholder="Select a vendor"
            searchPlaceholder="Search vendors..."
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Logo</Label>
        <div className="flex items-start gap-4">
          {logo ? (
            <div className="relative w-24 h-24 rounded-lg border border-gray-200 overflow-hidden group shrink-0">
              <Image
                src={logo}
                alt={name || "Logo"}
                fill
                className="object-cover"
                sizes="96px"
              />
              <button
                type="button"
                onClick={() => onChange("logo", "")}
                className="absolute top-1 right-1 w-6 h-6 grid place-items-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
              >
                <X className="size-3" />
              </button>
            </div>
          ) : (
            <div className="w-24 h-24 rounded-lg border border-dashed border-gray-200 grid place-items-center text-gray-400 shrink-0">
              <ImagePlus className="size-5" />
            </div>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setMediaPickerOpen(true)}
          >
            <ImagePlus className="size-3.5" />
            Choose Logo
          </Button>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Description</Label>
        <RichEditor
          value={description}
          onChange={(html) => onChange("description", html)}
          minHeight={200}
        />
      </div>

      {mediaPickerOpen && (
        <MediaPickerDialog
          open={mediaPickerOpen}
          onOpenChange={(o) => {
            setMediaPickerOpen(o);
          }}
          mode="image"
          defaultCategory="Images"
          onSelect={(item) => handleLogoSelect(item)}
        />
      )}
    </div>
  );
}
