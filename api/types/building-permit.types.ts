export interface WorkflowStep {
  num: number;
  title: { en: string; np: string };
  desc: { en: string; np: string };
  duration: string;
  docs: string[];
}

export interface DocCategory {
  label: { en: string; np: string };
  items: { en: string; np: string }[];
}

export interface Regulation {
  title: { en: string; np: string };
  items: { en: string; np: string }[];
}

export interface Municipality {
  name: string;
  district: string;
  phone: string;
}

export interface BuildingPermitConfig {
  id: number;
  workflow_steps: WorkflowStep[];
  doc_categories: DocCategory[];
  regulations: Regulation[];
  municipalities: Municipality[];
  created_at: string;
  updated_at: string;
}

export type BuildingPermitConfigUpdate = Partial<Omit<BuildingPermitConfig, 'id' | 'created_at' | 'updated_at'>>;
