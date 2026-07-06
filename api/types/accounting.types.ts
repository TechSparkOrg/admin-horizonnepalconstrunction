export type EntryType = "income" | "expense";
export type ExpenseCategory = "material" | "team" | "vendor";
export type PaidBy = "salary" | "commission";

export interface AccountingMaterialEntry {
  id: string;
  material_id: string;
  material_name: string;
  variant_id: string;
  variant_name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface AccountingTeamEntry {
  id: string;
  staff_member_id: string;
  member_name: string;
  role: string;
  rate: number;
  hours: number;
  days: number;
  total: number;
  paid_by: PaidBy;
}

export interface AccountingEntry {
  id: string;
  project_id: string;
  type: EntryType;
  expense_category: ExpenseCategory | "";
  vendor_id: string;
  vendor_name: string;
  transaction_id: string;
  description: string;
  amount: number;
  material_entries: AccountingMaterialEntry[];
  team_entries: AccountingTeamEntry[];
  date: string;
  payment_method: string;
  payment_type: string;
  bank_name: string;
  cheque_voucher_no: string;
  cheque_voucher_date: string | null;
  remark: string;
  entered_by: string;
  created_at: string;
  updated_at: string;
}

export interface AccountingEntryFormData {
  type: EntryType;
  expense_category: ExpenseCategory | "";
  vendor_id: string;
  vendor_name: string;
  transaction_id: string;
  description: string;
  amount: string;
  material_entries: AccountingMaterialEntry[];
  team_entries: AccountingTeamEntry[];
  date: string;
  payment_method: string;
  payment_type: string;
  bank_name: string;
  cheque_voucher_no: string;
  cheque_voucher_date: string;
  remark: string;
  entered_by: string;
}

export interface DashboardDataPoint {
  date: string;
  income: number;
  expense: number;
}

export interface ProjectAccountingSummary {
  project_id: string;
  project_title: string;
  total_income: number;
  total_expense: number;
  net_balance: number;
  entry_count: number;
}

export function genId() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

export function materialEntriesTotal(entries: AccountingMaterialEntry[]) {
  return entries.reduce((s, e) => s + e.quantity * e.unit_price, 0);
}

export function teamEntriesTotal(entries: AccountingTeamEntry[]) {
  return entries.reduce((s, e) => s + e.rate * e.hours * e.days, 0);
}

export const ENTRY_TYPE_OPTIONS = [
  { value: "income" as const, label: "Income" },
  { value: "expense" as const, label: "Expense" },
];

export const EXPENSE_CATEGORY_OPTIONS = [
  { value: "material" as const, label: "Material" },
  { value: "team" as const, label: "Team" },
  { value: "vendor" as const, label: "Vendor" },
];

export const PAID_BY_OPTIONS = [
  { value: "salary" as const, label: "Salary" },
  { value: "commission" as const, label: "Commission" },
];

export const EXPENSE_CATEGORY_STYLES: Record<ExpenseCategory, { color: string; bg: string; label: string }> = {
  material: { color: "text-blue-700", bg: "bg-blue-50", label: "Material" },
  team: { color: "text-purple-700", bg: "bg-purple-50", label: "Team" },
  vendor: { color: "text-green-700", bg: "bg-green-50", label: "Vendor" },
};

export const EMPTY_ENTRY_FORM: AccountingEntryFormData = {
  type: "expense",
  expense_category: "material",
  vendor_id: "",
  vendor_name: "",
  transaction_id: "",
  description: "",
  amount: "",
  material_entries: [],
  team_entries: [],
  date: "",
  payment_method: "",
  payment_type: "",
  bank_name: "",
  cheque_voucher_no: "",
  cheque_voucher_date: "",
  remark: "",
  entered_by: "",
};
