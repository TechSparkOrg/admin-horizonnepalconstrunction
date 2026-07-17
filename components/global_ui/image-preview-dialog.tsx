"use client";
import Image from "next/image";
import { Box, ImageIcon } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { isImageUrl, isModelUrl, isVideoUrl, isSvgUrl } from "@/lib/media";
import { ModelViewer } from "@/components/global_ui/ModelViewer";

interface ImagePreviewDialogProps {
  url: string | null;
  onClose: () => void;
}

export function ImagePreviewDialog({ url, onClose }: ImagePreviewDialogProps) {
  return (
    <Dialog open={!!url} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="!max-w-4xl p-0 overflow-hidden bg-transparent border-0 shadow-none">
        {url && isSvgUrl(url) && (
          <img src={url} alt="Preview" className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-lg" />
        )}
        {url && isImageUrl(url) && !isSvgUrl(url) && (
          <Image src={url} alt="Preview" width={0} height={0} sizes="100vw" className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-lg" />
        )}
        {url && isVideoUrl(url) && (
          <video src={url} controls className="max-w-full max-h-[85vh] rounded-lg" />
        )}
        {url && isModelUrl(url) && (
          <div className="w-full h-[85vh]">
            <ModelViewer src={url} className="w-full h-full" cameraControls />
          </div>
        )}
        {url && !isImageUrl(url) && !isVideoUrl(url) && !isModelUrl(url) && (
          <div className="flex flex-col items-center justify-center gap-2 py-16">
            <Box className="size-10 text-gray-400" />
            <p className="text-sm text-gray-500">Preview not available</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
