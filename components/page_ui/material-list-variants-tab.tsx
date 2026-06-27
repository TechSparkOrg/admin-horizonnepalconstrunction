"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MediaPickerDialog } from "@/components/global_ui/media-handler-picker";
import type { PickerMediaItem } from "@/components/global_ui/media-handler-picker";
import type { VariantItem } from "@/api/types/material-list.types";

interface Props {
  variants: VariantItem[];
  onChange: (key: string, value: VariantItem[]) => void;
}

export function MaterialListVariantsTab({ variants, onChange }: Props) {
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);

  const addVariant = () => {
    onChange("variants", [
      ...variants,
      { id: crypto.randomUUID(), img: "", price: 0, market_name: "" },
    ]);
  };

  const updateVariant = (id: string, field: keyof VariantItem, value: string | number) => {
    onChange(
      "variants",
      variants.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const removeVariant = (id: string) => {
    onChange("variants", variants.filter((v) => v.id !== id));
  };

  const openMediaPicker = (id: string) => {
    setEditingVariantId(id);
    setMediaPickerOpen(true);
  };

  const handleMediaSelect = (item: PickerMediaItem) => {
    if (editingVariantId) {
      updateVariant(editingVariantId, "img", item.url);
      setEditingVariantId(null);
    }
    setMediaPickerOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900">Variants</p>
        <Button type="button" variant="outline" size="sm" onClick={addVariant}>
          <Plus className="size-4" />
          Add Variant
        </Button>
      </div>

      {variants.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 py-10 flex flex-col items-center justify-center gap-2 text-gray-500">
          <ImagePlus className="size-6" />
          <span className="text-sm">No variants added yet</span>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200 hover:bg-transparent">
                <TableHead className="text-gray-900 font-semibold">Image</TableHead>
                <TableHead className="text-gray-900 font-semibold">Market Name</TableHead>
                <TableHead className="text-gray-900 font-semibold">Price (NPR)</TableHead>
                <TableHead className="text-gray-900 font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variants.map((v) => (
                <TableRow key={v.id} className="border-gray-200 hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="size-10 rounded-md overflow-hidden bg-gray-100 relative shrink-0">
                        {v.img ? (
                          <Image
                            src={v.img}
                            alt={v.market_name || "Variant"}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : (
                          <div className="w-full h-full grid place-items-center">
                            <ImagePlus className="size-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => openMediaPicker(v.id)}
                      >
                        {v.img ? "Change" : "Add Image"}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input
                      value={v.market_name}
                      onChange={(e) => updateVariant(v.id, "market_name", e.target.value)}
                      placeholder="e.g. Premium"
                      className="h-8 text-sm max-w-[180px]"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-500 font-medium">Rs.</span>
                      <Input
                        type="number"
                        min={0}
                        step="1"
                        value={v.price || ""}
                        onChange={(e) =>
                          updateVariant(
                            v.id,
                            "price",
                            e.target.value === "" ? 0 : parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="0"
                        className="h-8 text-sm max-w-[110px]"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-red-500 border-red-200 hover:bg-red-50"
                      onClick={() => removeVariant(v.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {mediaPickerOpen && (
        <MediaPickerDialog
          open={mediaPickerOpen}
          onOpenChange={(o) => {
            setMediaPickerOpen(o);
            if (!o) setEditingVariantId(null);
          }}
          onSelect={(item) => handleMediaSelect(item)}
        />
      )}
    </div>
  );
}
