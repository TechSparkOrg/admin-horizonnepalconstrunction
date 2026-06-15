export interface VastuConfig {
  id: number;
  hero: {
    title: string;
    subtitle: string;
    bgImage: string;
    badge: string;
  };
  quick_tools: {
    badge: string;
    title: string;
    description: string;
    roomToolTitle: string;
    roomToolDesc: string;
    directionToolTitle: string;
    directionToolDesc: string;
  };
  section_icons: Record<string, string>;
  section_keys: string[];
  sections: Record<string, {
    title: string;
    titleNp: string;
    content: { en: string; np: string }[];
    customTopics: {
      title: string;
      titleNp: string;
      items: { en: string; np: string }[];
    }[];
  }>;
  rooms: Record<string, {
    idealDirection: { en: string; np: string };
    facingDirection: { en: string; np: string };
    tips: { en: string; np: string }[];
    avoid: { en: string; np: string }[];
  }>;
  room_options: { id: string; label: string; labelNp: string }[];
  directions: Record<string, {
    deity: string;
    element: string;
    description: { en: string; np: string };
    recommended: { en: string; np: string }[];
    avoid: { en: string; np: string }[];
  }>;
  direction_options: { id: string; label: string; subtitle: string }[];
  created_at: string;
  updated_at: string;
}

