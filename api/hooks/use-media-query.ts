"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MediaService } from "@/api/services/media.service";
import { queryKeys } from "@/api/query-keys";
import { ErrorHandler } from "@/api/ServiceHelper/errorhandler";
import { toast } from "sonner";
import type { MediaItem, MediaItemUpdate } from "@/api/types/media.types";

export function useMediaList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.media.list(params),
    queryFn: async () => {
      const res = await MediaService.list(params);
      return { items: res.results ?? [], totalCount: res.count ?? 0 };
    },
  });
}

export function useMediaMutations() {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await MediaService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.media.all });
      toast.success("Media deleted");
    },
    onError: (err) => {
      const parsed = ErrorHandler.parse(err);
      ErrorHandler.toast(parsed.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: MediaItemUpdate }) => {
      await MediaService.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.media.all });
      toast.success("Media updated");
    },
    onError: (err) => {
      const parsed = ErrorHandler.parse(err);
      ErrorHandler.toast(parsed.message);
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async ({
      file,
      metadata,
    }: {
      file: File;
      metadata?: Record<string, unknown>;
    }) => {
      return await MediaService.uploadImage(file, metadata);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.media.all });
    },
    onError: (err) => {
      const parsed = ErrorHandler.parse(err);
      ErrorHandler.toast(parsed.message);
    },
  });

  return { deleteMutation, updateMutation, uploadMutation };
}
