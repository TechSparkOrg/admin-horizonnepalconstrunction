"use client";

import { useQuery } from "@tanstack/react-query";
import { CategoryAdmin } from "@/api/services/category.service";
import { queryKeys } from "@/api/query-keys";

export function useCategoryOptions(type: "services" | "faq") {
  return useQuery({
    queryKey: queryKeys.referenceData.categories(type),
    queryFn: async () => {
      const res = type === "services"
        ? await CategoryAdmin.listServices({ page_size: 10 })
        : await CategoryAdmin.listFaq({ page_size: 10 });
      return (res.results ?? []).map((c) => ({ value: c.id, label: c.name }));
    },
    staleTime: 5 * 60_000,
  });
}
