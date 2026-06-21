export const queryKeys = {
  blogs: {
    all: ["blogs"] as const,
    list: (params?: Record<string, unknown>) => ["blogs", "list", params] as const,
    detail: (slug: string) => ["blogs", "detail", slug] as const,
  },
  projects: {
    all: ["projects"] as const,
    list: (params?: Record<string, unknown>) => ["projects", "list", params] as const,
    detail: (slug: string) => ["projects", "detail", slug] as const,
  },
  media: {
    all: ["media"] as const,
    list: (params?: Record<string, unknown>) => ["media", "list", params] as const,
  },
  categories: {
    all: ["categories"] as const,
    list: (type: string) => ["categories", "list", type] as const,
  },
  attributes: {
    all: ["attributes"] as const,
    list: (params?: Record<string, unknown>) => ["attributes", "list", params] as const,
  },
  staff: {
    all: ["staff"] as const,
    list: (params?: Record<string, unknown>) => ["staff", "list", params] as const,
  },
  settings: {
    all: ["settings"] as const,
  },
  referenceData: {
    projects: ["reference", "projects"] as const,
    staff: ["reference", "staff"] as const,
    categories: (type: string) => ["reference", "categories", type] as const,
  },
};
