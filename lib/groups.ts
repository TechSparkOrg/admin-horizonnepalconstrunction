export function groupEntries<T extends { group?: string }>(
  entries: T[],
  defaultGroup = "General"
): { id: string; groupLabel: string; entries: T[] }[] {
  const map = new Map<string, T[]>();
  for (const e of entries) {
    const key = e.group || defaultGroup;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push({ ...e });
  }
  return Array.from(map.entries()).map(([groupLabel, entries], i) => ({
    id: `g-${i}`,
    groupLabel,
    entries,
  }));
}

export function ungroupEntries<T extends { group?: string }>(
  groups: { groupLabel: string; entries: T[] }[]
): (T & { group: string })[] {
  return groups.flatMap((g) =>
    g.entries.map((e) => ({ ...e, group: g.groupLabel }))
  );
}
