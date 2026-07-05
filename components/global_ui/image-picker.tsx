"use client";
import { useState } from "react";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MediaPickerDialog } from "@/components/global_ui/media-handler-picker";
import type { PickerMediaItem } from "@/components/global_ui/media-handler-picker";

interface ImagePickerProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImagePicker({ value, onChange, label = "Image" }: ImagePickerProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (item: PickerMediaItem) => {
    onChange(item.url);
    setOpen(false);
  };

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex items-start gap-4">
        {value ? (
          <div className="relative w-32 h-24 rounded-lg border border-gray-200 overflow-hidden group shrink-0">
            <Image src={value} alt="" fill className="object-cover" sizes="128px" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-1 right-1 w-6 h-6 grid place-items-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
            >
              <X className="size-3" />
            </button>
          </div>
        ) : (
          <div className="w-32 h-24 rounded-lg border border-dashed border-gray-200 grid place-items-center text-gray-400 shrink-0">
            <span className="text-[11px]">No image</span>
          </div>
        )}
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
          <ImagePlus className="size-3.5" /> Choose Image
        </Button>
      </div>
      {open && (
        <MediaPickerDialog
          open={open}
          onOpenChange={setOpen}
          mode="image"
          defaultCategory="Images"
          title={`Choose ${label.toLowerCase()}`}
          onSelect={handleSelect}
        />
      )}
    </div>
  );
}
