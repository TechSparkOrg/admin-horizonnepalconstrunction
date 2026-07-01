"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { BlogAdmin } from "@/api/services/blog.service";
import { queryKeys } from "@/api/query-keys";
import { ErrorHandler } from "@/api/ServiceHelper/errorhandler";
import { toast } from "sonner";
import type { BlogPost, BlogPostCreate } from "@/api/types/blog.types";

export function useBlogList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [...queryKeys.blogs.list(), params],
    queryFn: async () => {
      const res = await BlogAdmin.list(params);
      return { items: res.results ?? [], totalCount: res.count ?? 0 };
    },
    placeholderData: keepPreviousData,
  });
}

export function useBlogMutations() {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (slug: string) => {
      await BlogAdmin.delete(slug);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.all });
      toast.success("Blog deleted");
    },
    onError: (err) => {
      const parsed = ErrorHandler.parse(err);
      ErrorHandler.toast(parsed.message);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({
      slug,
      payload,
    }: {
      slug?: string | null;
      payload: BlogPostCreate;
    }) => {
      if (slug) {
        await BlogAdmin.update(slug, payload);
      } else {
        await BlogAdmin.create(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.all });
      toast.success("Blog saved");
    },
    onError: (err) => {
      const parsed = ErrorHandler.parse(err);
      ErrorHandler.toast(parsed.message);
    },
  });

  return { deleteMutation, saveMutation };
}
