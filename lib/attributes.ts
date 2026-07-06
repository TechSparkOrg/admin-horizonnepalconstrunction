import type { AttributeItem } from "@/api/types/attribute.types";

export function flattenAttributeValues(attributes: AttributeItem[]): { label: string; values: string[] }[] {
  return attributes.flatMap((a) => {
    const groups = a.values.filter((v) => v.values.length > 0);
    if (groups.length === 0) return [];
    return groups.map((g) => ({
      label: g.label || a.title,
      values: g.values,
    }));
  });
}
