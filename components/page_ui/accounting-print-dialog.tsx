"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { TemplateAdmin } from "@/api/services/template.service";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { SearchableSelect } from "@/components/global_ui/searchable-select";
import { TemplateTokensCard } from "@/components/global_ui/template-tokens-card";
import { formatCurrency } from "@/lib/currency";
import { printHtml } from "@/lib/print";
import { ACCOUNTING_INCOME_SECTIONS, ACCOUNTING_EXPENSE_SECTIONS, ACCOUNTING_OVERALL_SECTIONS } from "@/lib/template-tokens";
import type { AccountingEntry } from "@/api/types/accounting.types";
import type { Project } from "@/api/types/project.types";
import type { TokenSection } from "@/lib/template-tokens";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "entry" | "overall";
  entry: AccountingEntry | null;
  overallVars?: Record<string, string>;
  project?: Project | null;
}

export function EntryPrintDialog({ open, onOpenChange, mode = "entry", entry, overallVars, project }: Props) {
  const [templateId, setTemplateId] = useState("");

  const { data: templates = [] } = useQuery({
    queryKey: ["accounting", "print-templates"],
    queryFn: async () => (await TemplateAdmin.search({})).results ?? [],
    enabled: open,
    staleTime: 60000,
  });

  const tokenSections: TokenSection[] = mode === "overall"
    ? ACCOUNTING_OVERALL_SECTIONS
    : entry?.type === "income"
      ? ACCOUNTING_INCOME_SECTIONS
      : ACCOUNTING_EXPENSE_SECTIONS;

  const handlePrint = async () => {
    if (!templateId) { toast.error("Select a template first"); return; }
    try {
      let vars: Record<string, string>;
      if (mode === "overall") {
        vars = overallVars ?? {};
      } else {
        if (!entry) return;
        const materialLines = (entry.material_entries ?? []).map((e) =>
          `${e.material_name} \u00d7${e.quantity} @ Rs ${e.unit_price} = Rs ${e.total}`
        ).join("\n");
        vars = {
          type: entry.type === "expense" ? "Expense" : "Income",
          amount: String(entry.amount),
          description: entry.description,
          date: entry.date,
          payment_method: entry.payment_method,
          payment_type: entry.payment_type,
          bank_name: entry.bank_name,
          cheque_no: entry.cheque_voucher_no,
          cheque_date: entry.cheque_voucher_date ?? "",
          remark: entry.remark,
          entered_by: entry.entered_by,
          project: project?.title ?? "",
          project_status: project?.status ?? "",
          category: entry.expense_category || "",
          vendor_name: entry.vendor_name ?? "",
          transaction_id: entry.transaction_id ?? "",
          material_count: String(entry.material_entries?.length ?? 0),
          material_items: materialLines,
        };
      }
      const html = await TemplateAdmin.previewHtml(templateId, vars);
      printHtml(html);
    } catch {
      toast.error("Failed to generate preview");
    }
  };

  const title = mode === "overall" ? "Print Overall Report" : "Print Entry";
  const description = mode === "overall"
    ? "Financial summary for selected project"
    : `${entry?.type === "expense" ? "Expense" : "Income"} \u2014 ${entry?.description || "No description"}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {mode === "entry" && entry && (
            <div className="rounded-lg bg-muted/40 border border-border p-3 space-y-1 text-sm">
              <p><span className="text-muted-foreground">Amount:</span> <span className="font-semibold">{formatCurrency(entry.amount)}</span></p>
              <p><span className="text-muted-foreground">Date:</span> {entry.date}</p>
              {entry.payment_method && <p><span className="text-muted-foreground">Method:</span> {entry.payment_method}</p>}
              {entry.bank_name && <p><span className="text-muted-foreground">Bank:</span> {entry.bank_name}</p>}
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Template</Label>
            <SearchableSelect
              options={templates.map((t) => ({ value: t.id, label: t.title }))}
              value={templateId}
              onChange={setTemplateId}
              placeholder="Select a template..."
              searchPlaceholder="Search templates..."
            />
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
            <p className="text-[11px] font-semibold text-muted-foreground mb-2">Available tokens</p>
            <TemplateTokensCard sections={tokenSections} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="default" size="sm" onClick={handlePrint} disabled={!templateId}>
            <Eye className="size-3.5 mr-1" /> Preview & Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
