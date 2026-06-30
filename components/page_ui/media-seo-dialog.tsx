"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SeoFields } from "@/components/global_ui/seo-fields";
import { MediaService } from "@/api/services/media.service";
import { toast } from "sonner";

interface Props {
  mediaId: string | null;
  onClose: () => void;
}

export function MediaSeoDialog({ mediaId, onClose }: Props) {
  const queryClient = useQueryClient();

  const [alt, setAlt] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");

  const updateMutation = useMutation({
    mutationFn: async () => {
      await MediaService.update(mediaId!, {
        alt,
        meta_title: metaTitle,
        meta_description: metaDescription,
        keywords: metaKeywords,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      toast.success("Media updated");
      onClose();
    },
    onError: () => {
      toast.error("Failed to update media");
    },
  });

  return (
    <Dialog open={!!mediaId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="!max-w-lg" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Edit Media</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs text-gray-500">Alt Text</Label>
            <Input value={alt} onChange={(e) => setAlt(e.target.value)} className="h-8 text-sm rounded-md" />
          </div>

          <SeoFields
            metaTitle={metaTitle}
            metaDescription={metaDescription}
            metaKeywords={metaKeywords}
            onMetaTitleChange={setMetaTitle}
            onMetaDescriptionChange={setMetaDescription}
            onMetaKeywordsChange={setMetaKeywords}
          />

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-8 text-xs rounded-md">
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending}
              className="h-8 text-xs rounded-md bg-sidebar-primary hover:bg-sidebar-primary/90"
            >
              {updateMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
