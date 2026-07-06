"use client";

import { useMemo, useCallback } from "react";
import { SearchableSelect } from "@/components/global_ui/searchable-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import { ProjectAdmin } from "@/api/services/project.service";
import { EmiBankAdmin } from "@/api/services/emi.service";
import { useAuthStore } from "@/app/store/auth-store";
import { formatCurrency } from "@/lib/currency";
import type { TeamPaymentFormData } from "@/api/types/team-accounting.types";
import { TEAM_PAYMENT_TYPE_OPTIONS } from "@/api/types/team-accounting.types";

const PAYMENT_METHOD_OPTIONS = [
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cheque", label: "Cheque" },
  { value: "online", label: "Online Payment" },
];

const COMMISSION_TYPE_OPTIONS = [
  { value: "fixed", label: "Fixed" },
  { value: "percentage", label: "Percentage" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: TeamPaymentFormData;
  onChange: (key: string, value: string) => void;
  onSave: () => void;
  editingId: string | null;
  salaryAmount: number;
}

export function TeamEntryDialog({ open, onOpenChange, form, onChange, onSave, editingId, salaryAmount }: Props) {
  const user = useAuthStore((s) => s.user);

  const { data: projects = [] } = useQuery({
    queryKey: queryKeys.projects.all,
    queryFn: async () => (await ProjectAdmin.list()).results ?? [],
    staleTime: 60000,
  });

  const projectOptions = useMemo(
    () => projects.map((p) => ({ value: p.id, label: p.title })),
    [projects]
  );

  const { data: banks = [] } = useQuery({
    queryKey: ["accounting", "banks"],
    queryFn: async () => (await EmiBankAdmin.search({})).results ?? [],
    staleTime: 60000,
  });

  const bankOptions = useMemo(
    () => banks.map((b) => ({ value: b.name, label: b.name })),
    [banks]
  );

  const handleTypeChange = useCallback((type: string) => {
    onChange("payment_type", type);
    if (type === "salary") {
      onChange("amount", salaryAmount > 0 ? String(salaryAmount) : "");
      onChange("project_id", "");
      onChange("project_name", "");
    } else {
      onChange("amount", "");
      onChange("commission_type", "fixed");
    }
  }, [onChange, salaryAmount]);

  const isPercentage = form.commission_type === "percentage";
  const computedAmount = isPercentage
    ? (Number(form.base_amount || 0) * Number(form.commission_percentage || 0)) / 100
    : Number(form.amount || 0);
  const displayAmount = isPercentage ? computedAmount : Number(form.amount || 0);

  const showBank = form.payment_method === "cheque" || form.payment_method === "bank_transfer";
  const showCheque = form.payment_method === "cheque";
  const showTransactionId = form.payment_method === "bank_transfer";
  const isCommission = form.payment_type === "commission";

  const canSave = form.date && displayAmount > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>{editingId ? "Edit Payment" : "New Payment"}</DialogTitle>
          <DialogDescription>Record a salary or commission payment</DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-2">

          {/* Type row */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Payment Type</Label>
              <div className="flex rounded-md border border-border overflow-hidden h-8 w-fit">
                {TEAM_PAYMENT_TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleTypeChange(opt.value)}
                    className={`px-3 text-xs font-medium transition-colors ${
                      form.payment_type === opt.value
                        ? "bg-sidebar-primary text-white"
                        : "bg-white text-muted-foreground hover:bg-gray-50"
                    }`}
                  >{opt.label}</button>
                ))}
              </div>
            </div>

            {isCommission && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Commission Type</Label>
                <div className="flex rounded-md border border-border overflow-hidden h-8 w-fit">
                  {COMMISSION_TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onChange("commission_type", opt.value);
                        if (opt.value === "fixed") {
                          onChange("commission_percentage", "");
                          onChange("base_amount", "");
                        }
                      }}
                      className={`px-3 text-xs font-medium transition-colors ${
                        form.commission_type === opt.value
                          ? "bg-sidebar-primary text-white"
                          : "bg-white text-muted-foreground hover:bg-gray-50"
                      }`}
                    >{opt.label}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Amount / Date row */}
          <div className="grid grid-cols-3 gap-4">
            {isPercentage ? (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Percentage (%) <span className="text-red-500">*</span></Label>
                  <Input type="number" value={form.commission_percentage} onChange={(e) => onChange("commission_percentage", e.target.value)} placeholder="e.g. 2" min={0} step="0.01" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Base Amount (Rs) <span className="text-red-500">*</span></Label>
                  <Input type="number" value={form.base_amount} onChange={(e) => onChange("base_amount", e.target.value)} placeholder="e.g. 500000" min={0} />
                </div>
              </>
            ) : (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Amount (Rs) <span className="text-red-500">*</span>
                  {form.payment_type === "salary" && salaryAmount > 0 && (
                    <span className="text-muted-foreground font-normal ml-1">(Salary: {formatCurrency(salaryAmount)})</span>
                  )}
                </Label>
                <Input type="number" value={form.amount} onChange={(e) => onChange("amount", e.target.value)} placeholder="0.00" min={0} />
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Date <span className="text-red-500">*</span></Label>
              <Input type="date" value={form.date} onChange={(e) => onChange("date", e.target.value)} />
            </div>
            {isCommission && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Project</Label>
                <SearchableSelect
                  options={projectOptions}
                  value={form.project_id}
                  onChange={(v) => {
                    const project = projects.find((p) => p.id === v);
                    onChange("project_id", v);
                    onChange("project_name", project?.title ?? "");
                  }}
                  placeholder="Select project..."
                  searchPlaceholder="Search projects..."
                />
              </div>
            )}
          </div>

          {/* Payment Details card */}
          <div className="rounded-lg border border-border p-4 space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Payment Details</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Payment Method</Label>
                <SearchableSelect
                  options={PAYMENT_METHOD_OPTIONS}
                  value={form.payment_method}
                  onChange={(v) => {
                    onChange("payment_method", v);
                    if (v === "cash" || v === "online") {
                      onChange("bank_name", "");
                      onChange("transaction_id", "");
                      onChange("cheque_voucher_no", "");
                      onChange("cheque_voucher_date", "");
                    } else if (v === "bank_transfer") {
                      onChange("cheque_voucher_no", "");
                      onChange("cheque_voucher_date", "");
                    } else if (v === "cheque") {
                      onChange("transaction_id", "");
                    }
                  }}
                  placeholder="Select method..."
                />
              </div>

              {showBank && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Bank Name</Label>
                  <SearchableSelect
                    options={bankOptions}
                    value={form.bank_name}
                    onChange={(v) => onChange("bank_name", v)}
                    placeholder="Select bank..."
                    searchPlaceholder="Search banks..."
                  />
                </div>
              )}

              {showTransactionId && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Transaction ID</Label>
                  <Input value={form.transaction_id} onChange={(e) => onChange("transaction_id", e.target.value)} placeholder="Enter bank transaction ID" />
                </div>
              )}

              {(showCheque || (showBank && !showTransactionId)) && (
                <div />
              )}
            </div>

            {showCheque && (
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Cheque / Voucher No.</Label>
                  <Input value={form.cheque_voucher_no} onChange={(e) => onChange("cheque_voucher_no", e.target.value)} placeholder="No." />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Cheque / Voucher Date</Label>
                  <Input type="date" value={form.cheque_voucher_date} onChange={(e) => onChange("cheque_voucher_date", e.target.value)} />
                </div>
              </div>
            )}
          </div>

          {/* Meta card */}
          <div className="rounded-lg border border-border p-4 space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Meta</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Entered By</Label>
                <Input value={user?.name || ""} disabled className="bg-gray-50 text-muted-foreground font-medium" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Remark</Label>
                <Input value={form.remark} onChange={(e) => onChange("remark", e.target.value)} placeholder="Optional remark" />
              </div>
            </div>
          </div>

          {/* Total */}
          {displayAmount > 0 && (
            <div className="flex justify-end pt-2 border-t border-border">
              <div className="text-right">
                {isPercentage && (
                  <p className="text-[11px] text-muted-foreground">{form.commission_percentage}% of {formatCurrency(Number(form.base_amount || 0))}</p>
                )}
                <p className="text-base font-bold">{formatCurrency(displayAmount)}</p>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="default" size="sm" onClick={onSave} disabled={!canSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
