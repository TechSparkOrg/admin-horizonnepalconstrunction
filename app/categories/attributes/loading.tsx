import { FilterableTableSkeleton } from "@/components/global_ui/skeletons";

export default function Loading() {
  return <FilterableTableSkeleton columnWidths={[160, 200, 60, 80]} rows={5} />;
}
