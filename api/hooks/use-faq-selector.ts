import { useQuery } from "@tanstack/react-query";
import { FaqAdmin } from "@/api/services/faq.service";

export function useFaqSelector() {
  return useQuery({
    queryKey: ["faq", "selector"],
    queryFn: () => FaqAdmin.selector(),
    staleTime: Infinity,
    select: (data) => data.map((f) => ({ value: f.slug, label: f.title })),
  });
}
