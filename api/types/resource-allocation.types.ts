export interface SalaryEntry {
  id: string;
  amount: number;
  effective_date: string;
  status: "paid" | "unpaid";
}

export interface ProjectBasisEntry {
  id: string;
  project_id: string;
  budget_plan: number;
  payment_condition: string;
  progress_rate: number;
  status: "completed" | "ongoing";
  workers_under: number;
}

export interface ProjectAssignment {
  id: string;
  project_id: string;
  status: "completed" | "ongoing";
}

export interface TeamAllocation {
  id: string;
  staff_member_id: string;
  user_type: "core" | "remote";
  pay_type: "salary" | "project-based";
  is_active: boolean;
  salary_entries: SalaryEntry[];
  project_basis_entries: ProjectBasisEntry[];
  project_assignments: ProjectAssignment[];
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectScopeEntry {
  id: string;
  project_id: string;
  budget: number;
  cost_per: "day" | "hour" | "month";
  cost_amount: number;
  return_date: string;
  status: "completed" | "ongoing";
}

interface MaterialAllocation {
  id: string;
  material_id: string;
  tool_type: "rent" | "company" | "incharge";
  incharge_member_id: string;
  location: string;
  is_active: boolean;
  date_taken: string;
  date_given: string;
  expected_return_date: string;
  project_scope: ProjectScopeEntry[];
  notes: string;
}
