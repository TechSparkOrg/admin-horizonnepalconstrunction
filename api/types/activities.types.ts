export interface ActivityItem {
  id: string;
  entity_type: string;
  title: string;
  description: string;
  created_at: string;
}

export interface ActivityListResponse {
  results: ActivityItem[];
}

export const ENTITY_COLORS: Record<string, string> = {
  project: "bg-blue-400",
  review: "bg-amber-400",
  inquiry: "bg-emerald-400",
  blog: "bg-rose-400",
  media: "bg-orange-400",
  staff: "bg-violet-400",
  material: "bg-cyan-400",
  template: "bg-gray-400",
  billing: "bg-indigo-400",
  category: "bg-pink-400",
  attribute: "bg-teal-400",
  faq: "bg-yellow-400",
  page: "bg-sky-400",
  building_permit: "bg-lime-400",
  vastu: "bg-fuchsia-400",
  calculator: "bg-stone-400",
  model_3d: "bg-purple-400",
  document: "bg-red-400",
  private_document: "bg-rose-500",
  emi_bank: "bg-green-400",
  vendor: "bg-amber-500",
  agreement: "bg-blue-500",
  resource_allocation: "bg-violet-500",
  accounting_expense: "bg-red-500",
  accounting_income: "bg-green-500",
  team_payment: "bg-indigo-500",
};

export const ENTITY_LABELS: Record<string, string> = {
  project: "Project",
  review: "Review",
  inquiry: "Inquiry",
  blog: "Blog",
  media: "Media",
  staff: "Staff",
  material: "Material",
  template: "Template",
  billing: "Billing",
  category: "Category",
  attribute: "Attribute",
  faq: "FAQ",
  page: "Page",
  building_permit: "Permit",
  vastu: "Vastu",
  calculator: "Calculator",
  model_3d: "3D Model",
  document: "Document",
  private_document: "Private Doc",
  emi_bank: "EMI Bank",
  vendor: "Vendor",
  agreement: "Agreement",
  resource_allocation: "Allocation",
  accounting_expense: "Expense",
  accounting_income: "Income",
  team_payment: "Team Payment",
};
