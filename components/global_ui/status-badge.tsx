import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  active: boolean | undefined | null;
  activeLabel?: string;
  inactiveLabel?: string;
}

export function StatusBadge({
  active,
  activeLabel = "Active",
  inactiveLabel = "Inactive",
}: StatusBadgeProps) {
  const isActive = !!active;
  return (
    <Badge
      variant="outline"
      className={`font-normal gap-1.5 ${
        isActive
          ? "border-green-200 bg-green-50 text-green-600"
          : "border-gray-200 bg-gray-50 text-gray-500"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-gray-400"}`} />
      {isActive ? activeLabel : inactiveLabel}
    </Badge>
  );
}
