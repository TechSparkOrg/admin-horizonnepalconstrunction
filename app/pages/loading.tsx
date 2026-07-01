import { ListPageSkeleton } from "@/components/global_ui/skeletons";

export default function Loading() {
  return <ListPageSkeleton columnWidths={[200, 120, 60, 60, 100]} />;
}
