"use client";

import { useQuery } from "@tanstack/react-query";
import { UnitConversionAdmin } from "@/api/services/unit-converter.service";
import { queryKeys } from "@/api/query-keys";

export function useUnitConverterList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.unitConverters.list(params),
    queryFn: async () => {
      const res = await UnitConversionAdmin.search(params ?? {});
      return res;
    },
    staleTime: 30_000,
    placeholderData: (previousData) => previousData,
  });
}
