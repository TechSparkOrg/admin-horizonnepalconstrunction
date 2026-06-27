"use client";

import { useQuery } from "@tanstack/react-query";
import { MaterialListAdmin } from "@/api/services/material-list.service";
import { queryKeys } from "@/api/query-keys";

export function useMaterialList(params: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.materialList.list(params),
    queryFn: async () => {
      const res = await MaterialListAdmin.search(params);
      return { items: res.results ?? [], total: res.count ?? 0 };
    },
    staleTime: 30_000,
    placeholderData: (previousData) => previousData,
  });
}
