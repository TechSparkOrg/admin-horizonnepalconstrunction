"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { VendorAdmin } from "@/api/services/vendor.service";
import { queryKeys } from "@/api/query-keys";
import { ErrorHandler } from "@/api/ServiceHelper/errorhandler";
import { toast } from "sonner";

export function useVendorList(params: { search?: string; page?: number; page_size?: number }) {
  return useQuery({
    queryKey: queryKeys.vendors.list(params),
    queryFn: async () => {
      const res = await VendorAdmin.search(params);
      return { items: res.results ?? [], total: res.count ?? 0 };
    },
  });
}

export function useVendorOptions() {
  return useQuery({
    queryKey: queryKeys.vendors.list({ page_size: 10 }),
    queryFn: async () => {
      const res = await VendorAdmin.search({ page_size: 10 });
      return (res.results ?? []).map((v) => ({ value: v.id, label: v.name }));
    },
    staleTime: 5 * 60_000,
  });
}

export function useVendorMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.vendors.all });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await VendorAdmin.delete(id);
    },
    onSuccess: () => {
      invalidate();
      toast.success("Vendor deleted");
    },
    onError: (err) => {
      const parsed = ErrorHandler.parse(err);
      ErrorHandler.toast(parsed.message);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id?: string | null;
      payload: Parameters<typeof VendorAdmin.create>[0];
    }) => {
      if (id) {
        await VendorAdmin.update(id, payload);
      } else {
        await VendorAdmin.create(payload);
      }
    },
    onSuccess: () => {
      invalidate();
      toast.success("Vendor saved");
    },
    onError: (err) => {
      const parsed = ErrorHandler.parse(err);
      ErrorHandler.toast(parsed.message);
    },
  });

  return { deleteMutation, saveMutation };
}
