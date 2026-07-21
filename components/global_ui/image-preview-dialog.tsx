"use client";
import Image from "next/image";
import { Box, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { isImageUrl, isModelUrl, isVideoUrl, isSvgUrl } from "@/lib/media";
import { ModelViewer } from "@/components/global_ui/ModelViewer";

interface ImagePreviewDialogProps {
  url: string | null;
  onClose: () => void;
}

export function ImagePreviewDialog({ url, onClose }: ImagePreviewDialogProps) {
  if (!url) return null;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="!max-w-5xl p-0 overflow-hidden border-0 shadow-2xl bg-zinc-900/95">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex size-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-center justify-center p-8 min-h-[50vh]">
          {isSvgUrl(url) && (
            <div className="relative max-w-full max-h-[80vh] w-full h-full flex items-center justify-center">
              <img src={url} alt="Preview" className="w-full h-full object-contain" />
            </div>
          )}
          {isImageUrl(url) && !isSvgUrl(url) && (
            <Image src={url} alt="Preview" width={0} height={0} sizes="100vw" className="max-w-full max-h-[80vh] w-auto h-auto object-contain" />
          )}
          {isVideoUrl(url) && (
            <video src={url} controls className="max-w-full max-h-[80vh] rounded-lg" />
          )}
          {isModelUrl(url) && (
            <div className="w-full h-[80vh]">
              <ModelViewer src={url} className="w-full h-full" cameraControls />
            </div>
          )}
          {!isImageUrl(url) && !isVideoUrl(url) && !isModelUrl(url) && (
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <Box className="size-10 text-zinc-500" />
              <p className="text-sm text-zinc-400">Preview not available</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
