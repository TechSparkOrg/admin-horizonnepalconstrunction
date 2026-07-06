export type TeamPaymentType = "salary" | "commission";
export type CommissionType = "fixed" | "percentage";

export interface TeamPaymentRecord {
  id: string;
  staff_member_id: string;
  staff_member_name: string;
  payment_type: TeamPaymentType;
  commission_type: CommissionType;
  commission_percentage: string | null;
  base_amount: string | null;
  amount: number;
  date: string;
  project_name?: string;
  payment_method: string;
  transaction_id: string;
  bank_name: string;
  cheque_voucher_no: string;
  cheque_voucher_date: string | null;
  remark: string;
  entered_by: string;
  created_at: string;
}

export interface TeamPaymentFormData {
  staff_member_id: string;
  staff_member_name: string;
  payment_type: TeamPaymentType;
  commission_type: CommissionType;
  commission_percentage: string;
  base_amount: string;
  amount: string;
  date: string;
  project_id: string;
  project_name: string;
  payment_method: string;
  bank_name: string;
  transaction_id: string;
  cheque_voucher_no: string;
  cheque_voucher_date: string;
  remark: string;
  entered_by: string;
}

export const EMPTY_TEAM_PAYMENT_FORM: TeamPaymentFormData = {
  staff_member_id: "",
  staff_member_name: "",
  payment_type: "salary",
  commission_type: "fixed",
  commission_percentage: "",
  base_amount: "",
  amount: "",
  date: "",
  project_id: "",
  project_name: "",
  payment_method: "",
  bank_name: "",
  transaction_id: "",
  cheque_voucher_no: "",
  cheque_voucher_date: "",
  remark: "",
  entered_by: "",
};

export const TEAM_PAYMENT_TYPE_OPTIONS = [
  { value: "salary" as const, label: "Salary" },
  { value: "commission" as const, label: "Commission" },
];
