const resource = <T extends string>(name: T) => ({
  all: [name] as const,
  list: (params?: Record<string, unknown>) => [name, "list", params] as const,
  detail: (slug: string) => [name, "detail", slug] as const,
});

export const queryKeys = {
  blogs: resource("blogs"),
  projects: resource("projects"),
  media: resource("media"),
  categories: {
    all: ["categories"] as const,
    list: (type: string) => ["categories", "list", type] as const,
  },
  attributes: resource("attributes"),
  staff: resource("staff"),
  vendors: resource("vendors"),
  banks: resource("banks"),
  settings: {
    all: ["settings"] as const,
  },
  unitConverters: resource("unit-converters"),
  materialList: resource("material-list"),
  billing: resource("billing"),
  templates: resource("templates"),
  accounting: resource("accounting"),
  teamAccounting: resource("team-accounting"),
  referenceData: {
    categories: (type: string) => ["reference", "categories", type] as const,
  },
};
