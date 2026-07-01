import { ListPageSkeleton } from "@/components/global_ui/skeletons";

export default function Loading() {
  return <ListPageSkeleton columnWidths={[180, 120, 60, 60, 140, 40, 80]} />;
}
