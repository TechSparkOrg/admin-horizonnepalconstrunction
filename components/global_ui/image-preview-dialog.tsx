"use client";
import Image from "next/image";
import { Box, ImageIcon } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { isModelUrl, isVideoUrl } from "@/lib/media";

interface ImagePreviewDialogProps {
  url: string | null;
  onClose: () => void;
}

export function ImagePreviewDialog({ url, onClose }: ImagePreviewDialogProps) {
  const showImage = url && !isModelUrl(url) && !isVideoUrl(url);
  return (
    <Dialog open={!!url} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="!max-w-4xl p-0 overflow-hidden bg-transparent border-0 shadow-none">
        {url && (
          showImage ? (
            <Image src={url} alt="Preview" width={0} height={0} sizes="100vw" className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-lg" />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-16">
              {isModelUrl(url) ? <Box className="size-10 text-gray-400" /> : <ImageIcon className="size-10 text-gray-400" />}
              <p className="text-sm text-gray-500">Preview not available</p>
            </div>
          )
        )}
      </DialogContent>
    </Dialog>
  );
}
