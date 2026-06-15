import type { Category } from "@/api/types/category.types";

export function buildTree(flat: Category[]): Category[] {
  const map = new Map<string, Category>();
  for (const c of flat) {
    map.set(c.id, { ...c, children: [] });
  }
  const roots: Category[] = [];
  for (const c of flat) {
    const node = map.get(c.id)!;
    if (c.parent_id && map.has(c.parent_id)) {
      map.get(c.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}
