import { Badge } from "@/components/ui/badge";

export interface BadgeOption {
  label: string;
  color: string;
  dotColor: string;
}

export interface StatusBadgeProps {
  value: string | number | boolean | null | undefined;
  map: Record<string, BadgeOption>;
  fallback?: BadgeOption;
}

export const ACTIVE_STATUS = {
  true: { label: "Active", color: "border-green-200 bg-green-50 text-green-600", dotColor: "bg-green-500" },
  false: { label: "Inactive", color: "border-gray-200 bg-gray-50 text-gray-500", dotColor: "bg-gray-400" },
} as const;

export const PUBLISH_STATUS = {
  true: { label: "Published", color: "border-green-200 bg-green-50 text-green-600", dotColor: "bg-green-500" },
  false: { label: "Draft", color: "border-amber-200 bg-amber-50 text-amber-600", dotColor: "bg-amber-500" },
} as const;

export const YES_NO_STATUS = {
  true: { label: "Yes", color: "border-green-200 bg-green-50 text-green-600", dotColor: "bg-green-500" },
  false: { label: "No", color: "border-gray-200 bg-gray-50 text-gray-500", dotColor: "bg-gray-400" },
} as const;

export function StatusBadge({ value, map, fallback }: StatusBadgeProps) {
  const option = map[String(value)] ?? fallback;
  if (!option) return null;
  return (
    <Badge
      variant="outline"
      className={`font-normal gap-1.5 ${option.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${option.dotColor}`} />
      {option.label}
    </Badge>
  );
}
