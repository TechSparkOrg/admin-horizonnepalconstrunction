export function formatCurrency(n: number): string {
  return `Rs ${n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function computeTaxAmount(tax: { tax_type?: string; rate: number }, base: number): number {
  return tax.tax_type === "fixed" ? tax.rate : base * tax.rate / 100;
}
