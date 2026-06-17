export interface SalaryEntry {
  id: string;
  amount: number;
  effectiveDate: string;
  status: "paid" | "unpaid";
}

export interface ProjectBasisEntry {
  id: string;
  projectId: string;
  budgetPlan: number;
  paymentCondition: string;
  progressRate: number;
  status: "completed" | "ongoing";
  workersUnder: number;
}

export interface ProjectAssignment {
  id: string;
  projectId: string;
  status: "completed" | "ongoing";
}

export interface TeamAllocation {
  id: string;
  teamMemberId: string;
  userType: "core" | "remote";
  payType: "salary" | "project-based";
  isActive: boolean;
  salaryEntries: SalaryEntry[];
  projectBasisEntries: ProjectBasisEntry[];
  projectAssignments: ProjectAssignment[];
  notes: string;
}

export interface ProjectScopeEntry {
  id: string;
  projectId: string;
  budget: number;
  costPer: "day" | "hour" | "month";
  costAmount: number;
  returnDate: string;
  status: "completed" | "ongoing";
}

export interface MaterialAllocation {
  id: string;
  materialId: string;
  toolType: "rent" | "company" | "incharge";
  inchargeMemberId: string;
  location: string;
  isActive: boolean;
  dateTaken: string;
  dateGiven: string;
  expectedReturnDate: string;
  projectScope: ProjectScopeEntry[];
  notes: string;
}
