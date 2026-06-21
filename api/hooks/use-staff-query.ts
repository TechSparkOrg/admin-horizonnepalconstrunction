"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StaffAdmin } from "@/api/services/staff.service";
import { queryKeys } from "@/api/query-keys";
import { ErrorHandler } from "@/api/ServiceHelper/errorhandler";
import { toast } from "sonner";
import type { StaffMember } from "@/api/types/staff.types";

interface StaffListParams {
  search?: string;
  type?: string;
  page?: number;
  page_size?: number;
}

export function useStaffList(params: StaffListParams) {
  return useQuery({
    queryKey: queryKeys.staff.list(params as Record<string, unknown>),
    queryFn: async () => {
      const res = await StaffAdmin.search(params);
      return { items: res.results ?? [], total: res.count ?? 0 };
    },
  });
}

export function useStaffMutations() {
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id?: string | null;
      payload: Record<string, unknown>;
    }) => {
      if (id) {
        return StaffAdmin.update(id, payload);
      } else {
        return StaffAdmin.create(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
      toast.success("Staff member saved");
    },
    onError: (err) => {
      const parsed = ErrorHandler.parse(err);
      ErrorHandler.toast(parsed.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await StaffAdmin.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
      toast.success("Staff member deleted");
    },
    onError: (err) => {
      const parsed = ErrorHandler.parse(err);
      ErrorHandler.toast(parsed.message);
    },
  });

  return { saveMutation, deleteMutation };
}
