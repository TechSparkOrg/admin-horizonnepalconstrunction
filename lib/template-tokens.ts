export interface TokenSection {
  heading: string;
  description?: string;
  variant: "purple" | "blue" | "green" | "amber" | "gray";
  tokens: string[];
}

export const ACCOUNTING_INCOME_SECTIONS: TokenSection[] = [
  { heading: "Entry Details", variant: "gray", tokens: ["type", "amount", "description", "date"] },
  { heading: "Payment", variant: "blue", tokens: ["payment_method", "payment_type", "bank_name", "cheque_no", "cheque_date", "transaction_id"] },
  { heading: "Meta", variant: "gray", tokens: ["remark", "entered_by", "project", "project_status"] },
];

export const ACCOUNTING_EXPENSE_SECTIONS: TokenSection[] = [
  { heading: "Entry Details", variant: "gray", tokens: ["type", "amount", "description", "date"] },
  { heading: "Payment", variant: "blue", tokens: ["payment_method", "payment_type", "bank_name", "cheque_no", "cheque_date", "transaction_id"] },
  { heading: "Category", variant: "green", tokens: ["category", "vendor_name"] },
  { heading: "Items", variant: "purple", tokens: ["material_count", "material_items"] },
  { heading: "Meta", variant: "gray", tokens: ["remark", "entered_by", "project", "project_status"] },
];

export const ACCOUNTING_OVERALL_SECTIONS: TokenSection[] = [
  { heading: "Project", variant: "blue", tokens: ["project", "project_status"] },
  { heading: "Financials", variant: "green", tokens: ["contract_value", "total_income", "total_expense", "net_balance"] },
  { heading: "Counts", variant: "gray", tokens: ["income_count", "expense_count"] },
];

export const BILLING_SECTIONS: TokenSection[] = [
  {
    heading: "Tables",
    description: "Auto-generated full tables — place once, backend renders all rows",
    variant: "purple",
    tokens: ["materials_table", "team_table", "taxes_table"],
  },
  {
    heading: "Row Template Tokens",
    description: "Place in a <td> — row auto-repeats per entry",
    variant: "blue",
    tokens: [
      "materials.name", "materials.variant", "materials.price", "materials.qty", "materials.total", "materials.group",
      "team.name", "team.role", "team.rate", "team.hours", "team.days", "team.total", "team.group",
      "taxes.label", "taxes.rate_display", "taxes.type", "taxes.amount",
    ],
  },
  { heading: "Basic", variant: "gray", tokens: ["title", "project", "balance_status"] },
  { heading: "Financials", variant: "green", tokens: ["materials_total", "team_total", "tax_total", "grand_total", "contract_value", "balance"] },
];

export const TEAM_PAYMENT_SECTIONS: TokenSection[] = [
  { heading: "Payment", variant: "blue", tokens: ["staff_name", "payment_type", "amount", "date"] },
  { heading: "Payment Method", variant: "gray", tokens: ["payment_method", "bank_name", "cheque_no", "cheque_date"] },
  { heading: "Meta", variant: "gray", tokens: ["remark", "entered_by"] },
];

export function getBillingSections(
  materialGroups: { groupLabel: string }[],
  teamGroups: { groupLabel: string }[],
  taxes: { label: string }[],
): TokenSection[] {
  const sections: TokenSection[] = [...BILLING_SECTIONS];
  if (materialGroups.length > 0) {
    sections.push({
      heading: "Materials by Group",
      variant: "amber",
      tokens: materialGroups.map((g) => `mat_${g.groupLabel.toLowerCase().replace(/\W+/g, "_")}`),
    });
  }
  if (teamGroups.length > 0) {
    sections.push({
      heading: "Team by Group",
      variant: "purple",
      tokens: teamGroups.map((g) => `team_${g.groupLabel.toLowerCase().replace(/\W+/g, "_")}`),
    });
  }
  if (taxes.length > 0) {
    sections.push({
      heading: "Taxes",
      variant: "amber",
      tokens: taxes.map((t) => `tax_${t.label.toLowerCase().replace(/\W+/g, "_")}`),
    });
  }
  return sections;
}
