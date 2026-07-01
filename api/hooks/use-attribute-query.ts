"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { AttributeAdmin } from "@/api/services/attribute.service";
import { queryKeys } from "@/api/query-keys";
import { ErrorHandler } from "@/api/ServiceHelper/errorhandler";
import { toast } from "sonner";
import type { AttributeItem } from "@/api/types/attribute.types";

export function useAttributeOptions() {
  return useQuery({
    queryKey: queryKeys.attributes.all,
    queryFn: async () => {
      const res = await AttributeAdmin.search({ page_size: 10, used_in: "all,staff" });
      return res.results ?? [];
    },
    staleTime: Infinity,
  });
}

export function useAttributeList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.attributes.list(params),
    queryFn: async () => {
      const res = await AttributeAdmin.search(
        (params ?? {}) as { search?: string; page?: number; page_size?: number }
      );
      return { items: res.results ?? [], totalCount: res.count ?? 0 };
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });
}

export function useAttributeMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      await AttributeAdmin.create(data as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attributes.all });
      toast.success("Attribute created");
    },
    onError: (err) => {
      const parsed = ErrorHandler.parse(err);
      ErrorHandler.toast(parsed.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      await AttributeAdmin.update(id, data as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attributes.all });
      toast.success("Attribute updated");
    },
    onError: (err) => {
      const parsed = ErrorHandler.parse(err);
      ErrorHandler.toast(parsed.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await AttributeAdmin.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attributes.all });
      toast.success("Attribute deleted");
    },
    onError: (err) => {
      const parsed = ErrorHandler.parse(err);
      ErrorHandler.toast(parsed.message);
    },
  });

  return { createMutation, updateMutation, deleteMutation };
}
