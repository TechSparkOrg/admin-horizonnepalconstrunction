"use client";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ImagePreviewDialogProps {
  url: string | null;
  onClose: () => void;
}

export function ImagePreviewDialog({ url, onClose }: ImagePreviewDialogProps) {
  return (
    <Dialog open={!!url} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="!max-w-4xl p-0 overflow-hidden bg-transparent border-0 shadow-none">
        {url && (
          <Image src={url} alt="Preview" width={0} height={0} sizes="100vw" className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-lg" />
        )}
      </DialogContent>
    </Dialog>
  );
}
