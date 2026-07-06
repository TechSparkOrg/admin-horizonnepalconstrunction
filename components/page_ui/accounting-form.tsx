"use client";

import { Plus, Trash2, Printer, Eye, Building2, Users, Banknote, Wallet, ArrowUpRight, ArrowDownRight, X } from "lucide-react";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { FormCard } from "@/components/global_ui/form-card";
import { FormTabs } from "@/components/global_ui/form-tabs";
import { SearchableSelect } from "@/components/global_ui/searchable-select";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { StaffAdmin } from "@/api/services/staff.service";
import { TemplateAdmin } from "@/api/services/template.service";
import { MaterialListAdmin } from "@/api/services/material-list.service";
import { EmiBankAdmin } from "@/api/services/emi.service";
import { VendorAdmin } from "@/api/services/vendor.service";
import { useAuthStore } from "@/app/store/auth-store";
import type { AccountingEntry, AccountingEntryFormData, AccountingMaterialEntry, AccountingTeamEntry, ExpenseCategory, EntryType } from "@/api/types/accounting.types";
import { EXPENSE_CATEGORY_OPTIONS, EXPENSE_CATEGORY_STYLES, EMPTY_ENTRY_FORM, PAID_BY_OPTIONS, genId, materialEntriesTotal, teamEntriesTotal } from "@/api/types/accounting.types";
import type { Project } from "@/api/types/project.types";
import type { StaffMemberListItem } from "@/api/types/staff.types";

function formatCurrency(n: number) {
  if (n >= 10000000) return `Rs ${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `Rs ${(n / 100000).toFixed(2)} L`;
  return `Rs ${n.toLocaleString("en-IN")}`;
}

function NumericInput({ value, onCommit, className, min = 0, placeholder = "Enter value" }: {
  value: number; onCommit: (n: number) => void;
  className?: string; min?: number; placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState("");
  const displayed = editing ? text : (value === 0 ? "" : String(value));
  return (
    <Input
      type="text"
      inputMode="decimal"
      className={className}
      value={displayed}
      placeholder={placeholder}
      onChange={(e) => {
        const v = e.target.value;
        if (v === "" || /^-?\d*\.?\d*$/.test(v)) setText(v);
      }}
      onFocus={(e) => { setEditing(true); setText(value === 0 ? "" : String(value)); e.target.select(); }}
      onBlur={() => {
        setEditing(false);
        const n = parseFloat(text);
        onCommit(isNaN(n) ? 0 : Math.max(min, n));
      }}
    />
  );
}

// ─── Entry Dialog ──────────────────────────────────────────────────────
interface EntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entryType: EntryType;
  form: AccountingEntryFormData;
  onChange: (key: string, value: string) => void;
  onMaterialEntriesChange: (entries: AccountingMaterialEntry[]) => void;
  onTeamEntriesChange: (entries: AccountingTeamEntry[]) => void;
  onSave: () => void;
}

function EntryDialog({ open, onOpenChange, entryType, form, onChange, onMaterialEntriesChange, onTeamEntriesChange, onSave }: EntryDialogProps) {
  const isExpense = entryType === "expense";
  const title = isExpense ? "New Expense" : "New Income";
  const user = useAuthStore((s) => s.user);

  const { data: materials = [] } = useQuery({
    queryKey: ["accounting", "materials"],
    queryFn: async () => (await MaterialListAdmin.search({})).results ?? [],
    enabled: open && isExpense && form.expense_category === "material",
    staleTime: 60000,
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ["accounting", "team-members"],
    queryFn: async () => (await StaffAdmin.search({})).results ?? [],
    enabled: open && isExpense && form.expense_category === "team",
    staleTime: 60000,
  });

  const { data: banks = [] } = useQuery({
    queryKey: ["accounting", "banks"],
    queryFn: async () => (await EmiBankAdmin.search({})).results ?? [],
    enabled: open,
    staleTime: 60000,
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ["accounting", "vendors"],
    queryFn: async () => (await VendorAdmin.search({})).results ?? [],
    enabled: open && isExpense && (form.expense_category === "material" || form.expense_category === "vendor"),
    staleTime: 60000,
  });

  const showBank = form.payment_method === "cheque" || form.payment_method === "bank_transfer";
  const showCheque = form.payment_method === "cheque";
  const showTransactionId = form.payment_method === "bank_transfer";

  const materialAmount = materialEntriesTotal(form.material_entries);
  const teamAmount = teamEntriesTotal(form.team_entries);

  // ── Material line items ──
  const handleSelectMaterial = (materialId: string) => {
    const mat = materials.find((m) => m.id === materialId);
    if (!mat) return;
    const entry: AccountingMaterialEntry = {
      id: genId(), material_id: mat.id, material_name: mat.name,
      variant_id: "", variant_name: "",
      quantity: 1, unit_price: mat.price_per_unit, total: mat.price_per_unit,
    };
    onMaterialEntriesChange([...form.material_entries, entry]);
  };

  const updateMaterialEntry = (id: string, field: string, value: number | string) => {
    onMaterialEntriesChange(form.material_entries.map((e) => {
      if (e.id !== id) return e;
      const updated = { ...e, [field]: field === "quantity" || field === "unit_price" ? Number(value) : value };
      if (field === "quantity" || field === "unit_price") {
        updated.total = updated.quantity * updated.unit_price;
      }
      return updated;
    }));
  };

  const removeMaterialEntry = (id: string) => {
    onMaterialEntriesChange(form.material_entries.filter((e) => e.id !== id));
  };

  // ── Team line items ──
  const handleSelectTeamMember = (staffId: string) => {
    const member = teamMembers.find((m) => m.id === staffId) as StaffMemberListItem | undefined;
    if (!member) return;
    const entry: AccountingTeamEntry = {
      id: genId(), staff_member_id: member.id, member_name: member.name,
      role: member.designation || "", rate: 0, hours: 8, days: 1, total: 0,
      paid_by: "salary",
    };
    onTeamEntriesChange([...form.team_entries, entry]);
  };

  const updateTeamEntry = (id: string, field: string, value: number | string) => {
    onTeamEntriesChange(form.team_entries.map((e) => {
      if (e.id !== id) return e;
      const updated = { ...e, [field]: value };
      if (field === "rate" || field === "hours" || field === "days") {
        updated.total = Number(updated.rate) * Number(updated.hours) * Number(updated.days);
      }
      return updated;
    }));
  };

  const removeTeamEntry = (id: string) => {
    onTeamEntriesChange(form.team_entries.filter((e) => e.id !== id));
  };

  const computedTotal = form.expense_category === "material" ? materialAmount
    : form.expense_category === "team" ? teamAmount
    : Number(form.amount || 0);

  const canSave = form.date && (
    isExpense
      ? form.expense_category === "material"
        ? form.material_entries.length > 0
        : form.expense_category === "team"
          ? form.team_entries.length > 0
          : computedTotal > 0
      : computedTotal > 0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{isExpense ? "Record an expense entry" : "Record an income entry"}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {isExpense && (
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">Category</Label>
              <SearchableSelect
                options={EXPENSE_CATEGORY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                value={form.expense_category}
                onChange={(v) => {
                  onChange("expense_category", v);
                  onChange("description", "");
                  onChange("amount", "");
                }}
                placeholder="Select category..."
              />
            </div>
          )}
          {!isExpense && (
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">Payment Type</Label>
              <SearchableSelect
                options={[
                  { value: "advance", label: "Advance" },
                  { value: "milestone", label: "Milestone" },
                  { value: "final", label: "Final" },
                  { value: "partial", label: "Partial" },
                ]}
                value={form.payment_type}
                onChange={(v) => onChange("payment_type", v)}
                placeholder="Select payment type..."
              />
            </div>
          )}

          {/* ══════════════ MATERIAL ══════════════ */}
          {isExpense && form.expense_category === "material" && (
            <div className="space-y-3">
              {/* ── Material Items (always shown) ── */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-gray-500">Material Items</Label>
                  <SearchableSelect
                    options={materials.map((m) => ({ value: m.id, label: `${m.name} — Rs ${m.price_per_unit}` }))}
                    value=""
                    onChange={handleSelectMaterial}
                    placeholder="Add material..."
                    searchPlaceholder="Search materials..."
                    triggerClassName="h-7 text-xs w-[200px]"
                  />
                </div>
                {form.material_entries.length === 0 ? (
                  <p className="text-xs text-gray-400 py-2">No items added yet</p>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-gray-200">
                          <TableHead className="text-gray-900 font-semibold text-xs">Material</TableHead>
                          <TableHead className="text-gray-900 font-semibold text-xs w-20">Qty</TableHead>
                          <TableHead className="text-gray-900 font-semibold text-xs w-24">Unit Price (Rs)</TableHead>
                          <TableHead className="text-gray-900 font-semibold text-xs text-right w-24">Total (Rs)</TableHead>
                          <TableHead className="w-8" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {form.material_entries.map((entry) => (
                          <TableRow key={entry.id} className="border-gray-100 hover:bg-gray-50">
                            <TableCell>
                              <span className="text-xs text-gray-900 font-medium">{entry.material_name}</span>
                            </TableCell>
                            <TableCell>
                              <NumericInput value={entry.quantity} onCommit={(n) => updateMaterialEntry(entry.id, "quantity", n)} className="h-7 text-xs text-right" min={1} placeholder="Qty" />
                            </TableCell>
                            <TableCell>
                              <NumericInput value={entry.unit_price} onCommit={(n) => updateMaterialEntry(entry.id, "unit_price", n)} className="h-7 text-xs text-right" min={0} placeholder="Price" />
                            </TableCell>
                            <TableCell className="text-right font-medium text-gray-900 text-xs">
                              {formatCurrency(entry.quantity * entry.unit_price)}
                            </TableCell>
                            <TableCell>
                              <button type="button" onClick={() => removeMaterialEntry(entry.id)}
                                className="size-7 flex items-center justify-center rounded text-red-400 hover:text-red-600 hover:bg-red-50">
                                <X className="size-3" />
                              </button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                {form.material_entries.length > 0 && (
                  <div className="flex justify-end">
                    <p className="text-sm font-bold text-gray-900">Total: {formatCurrency(materialAmount)}</p>
                  </div>
                )}
              </div>

              {/* ── Paid To ── */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-500">Paid To</Label>
                <SearchableSelect
                  options={vendors.map((v) => ({ value: v.id, label: v.name }))}
                  value={form.vendor_id}
                  onChange={(id) => {
                    const v = vendors.find((v) => v.id === id);
                    onChange("vendor_id", id);
                    onChange("vendor_name", v?.name || "");
                  }}
                  placeholder="Pick a vendor..."
                  searchPlaceholder="Search vendors..."
                />
                <div className="relative">
                  <span className="absolute left-0 top-0 text-xs text-gray-400 -mt-1.5 px-2 bg-white">or type manually</span>
                  <Input
                    value={form.vendor_name}
                    onChange={(e) => {
                      onChange("vendor_name", e.target.value);
                      if (!e.target.value) onChange("vendor_id", "");
                    }}
                    placeholder="Type vendor name if not in list above"
                    className="pt-3"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ══════════════ TEAM ══════════════ */}
          {isExpense && form.expense_category === "team" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-gray-500">Team Members</Label>
                <SearchableSelect
                  options={teamMembers.map((m) => ({ value: m.id, label: m.name }))}
                  value=""
                  onChange={handleSelectTeamMember}
                  placeholder="Add member..."
                  searchPlaceholder="Search members..."
                  triggerClassName="h-7 text-xs w-[200px]"
                />
              </div>
              {form.team_entries.length === 0 ? (
                <p className="text-xs text-gray-400 py-2">No members added yet</p>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-gray-200">
                        <TableHead className="text-gray-900 font-semibold text-xs">Member</TableHead>
                        <TableHead className="text-gray-900 font-semibold text-xs">Role</TableHead>
                        <TableHead className="text-gray-900 font-semibold text-xs w-20">Rate/hr</TableHead>
                        <TableHead className="text-gray-900 font-semibold text-xs w-14">Hrs</TableHead>
                        <TableHead className="text-gray-900 font-semibold text-xs w-14">Days</TableHead>
                        <TableHead className="text-gray-900 font-semibold text-xs text-right w-24">Total (Rs)</TableHead>
                        <TableHead className="text-gray-900 font-semibold text-xs w-20">Paid By</TableHead>
                        <TableHead className="w-8" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {form.team_entries.map((entry) => (
                        <TableRow key={entry.id} className="border-gray-100 hover:bg-gray-50">
                          <TableCell>
                            <span className="text-xs text-gray-900 font-medium">{entry.member_name}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-gray-500">{entry.role || "\u2014"}</span>
                          </TableCell>
                          <TableCell>
                            <NumericInput value={entry.rate} onCommit={(n) => updateTeamEntry(entry.id, "rate", n)} className="h-7 text-xs text-right" min={0} placeholder="Rate" />
                          </TableCell>
                          <TableCell>
                            <NumericInput value={entry.hours} onCommit={(n) => updateTeamEntry(entry.id, "hours", n)} className="h-7 text-xs text-right" min={1} placeholder="Hrs" />
                          </TableCell>
                          <TableCell>
                            <NumericInput value={entry.days} onCommit={(n) => updateTeamEntry(entry.id, "days", n)} className="h-7 text-xs text-right" min={1} placeholder="Days" />
                          </TableCell>
                          <TableCell className="text-right font-medium text-gray-900 text-xs">
                            {formatCurrency(entry.rate * entry.hours * entry.days)}
                          </TableCell>
                          <TableCell>
                            <div className="flex rounded-md border border-gray-200 overflow-hidden h-7 w-fit">
                              {PAID_BY_OPTIONS.map((opt) => (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() => updateTeamEntry(entry.id, "paid_by", opt.value)}
                                  className={`px-2 text-xs font-medium transition-colors ${
                                    entry.paid_by === opt.value
                                      ? "bg-sidebar-primary text-white"
                                      : "bg-white text-gray-500 hover:bg-gray-50"
                                  }`}
                                >{opt.label}</button>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <button type="button" onClick={() => removeTeamEntry(entry.id)}
                              className="size-7 flex items-center justify-center rounded text-red-400 hover:text-red-600 hover:bg-red-50">
                              <X className="size-3" />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              {form.team_entries.length > 0 && (
                <div className="flex justify-end">
                  <p className="text-sm font-bold text-gray-900">Total: {formatCurrency(teamAmount)}</p>
                </div>
              )}
            </div>
          )}

          {/* ══════════════ VENDOR ══════════════ */}
          {isExpense && form.expense_category === "vendor" && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">Description</Label>
                <Input value={form.description} onChange={(e) => onChange("description", e.target.value)} placeholder="Brief description" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">Amount (Rs) <span className="text-red-500">*</span></Label>
                <Input type="number" value={form.amount} onChange={(e) => onChange("amount", e.target.value)} placeholder="0.00" min={0} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-gray-500">Paid To</Label>
                <SearchableSelect
                  options={vendors.map((v) => ({ value: v.id, label: v.name }))}
                  value={form.vendor_id}
                  onChange={(id) => {
                    const v = vendors.find((v) => v.id === id);
                    onChange("vendor_id", id);
                    onChange("vendor_name", v?.name || "");
                  }}
                  placeholder="Pick a vendor..."
                  searchPlaceholder="Search vendors..."
                />
                <div className="relative">
                  <span className="absolute left-0 top-0 text-xs text-gray-400 -mt-1.5 px-2 bg-white">or type manually</span>
                  <Input
                    value={form.vendor_name}
                    onChange={(e) => {
                      onChange("vendor_name", e.target.value);
                      if (!e.target.value) onChange("vendor_id", "");
                    }}
                    placeholder="Type vendor name if not in list above"
                    className="pt-3"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ══════════════ INCOME / fallback ══════════════ */}
          {!isExpense && (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">Description</Label>
                <Input value={form.description} onChange={(e) => onChange("description", e.target.value)} placeholder="Brief description" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">Amount (Rs) <span className="text-red-500">*</span></Label>
                <Input type="number" value={form.amount} onChange={(e) => onChange("amount", e.target.value)} placeholder="0.00" min={0} />
              </div>
            </>
          )}

          {/* ── Date ── */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">Date <span className="text-red-500">*</span></Label>
            <Input type="date" value={form.date} onChange={(e) => onChange("date", e.target.value)} />
          </div>

          {/* ── Payment Method ── */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">Payment Method</Label>
            <SearchableSelect
              options={[
                { value: "cash", label: "Cash" },
                { value: "bank_transfer", label: "Bank Transfer" },
                { value: "cheque", label: "Cheque" },
                { value: "online", label: "Online Payment" },
                { value: "other", label: "Other" },
              ]}
              value={form.payment_method}
              onChange={(v) => {
                onChange("payment_method", v);
                onChange("transaction_id", "");
                if (v === "cash" || v === "online" || v === "other") {
                  onChange("bank_name", "");
                  onChange("cheque_voucher_no", "");
                  onChange("cheque_voucher_date", "");
                }
              }}
              placeholder="Select method..."
            />
          </div>

          {showBank && (
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">Bank Name</Label>
              <SearchableSelect
                options={banks.map((b) => ({ value: b.name, label: b.name }))}
                value={form.bank_name}
                onChange={(v) => onChange("bank_name", v)}
                placeholder="Select bank..."
                searchPlaceholder="Search banks..."
              />
            </div>
          )}

          {showTransactionId && (
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">Transaction ID</Label>
              <Input value={form.transaction_id} onChange={(e) => onChange("transaction_id", e.target.value)} placeholder="Enter bank transaction ID" />
            </div>
          )}

          {showCheque && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">Cheque / Voucher No.</Label>
                <Input value={form.cheque_voucher_no} onChange={(e) => onChange("cheque_voucher_no", e.target.value)} placeholder="No." />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">Cheque / Voucher Date</Label>
                <Input type="date" value={form.cheque_voucher_date} onChange={(e) => onChange("cheque_voucher_date", e.target.value)} />
              </div>
            </div>
          )}

          {/* ── Entered By (read-only) ── */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">Entered By</Label>
            <Input value={user?.name || ""} disabled className="bg-gray-50 text-gray-500 font-medium" />
          </div>

          {/* ── Remark ── */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">Remark</Label>
            <Input value={form.remark} onChange={(e) => onChange("remark", e.target.value)} placeholder="Optional remark" />
          </div>

          {/* ── Computed amount display ── */}
          {computedTotal > 0 && (
            <div className="flex justify-end pt-2 border-t border-gray-100">
              <p className="text-base font-bold text-gray-900">
                Total Amount: {formatCurrency(computedTotal)}
              </p>
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

// ─── Entry Print Dialog ────────────────────────────────────────────────
interface EntryPrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: AccountingEntry | null;
  project?: Project | null;
}

function EntryPrintDialog({ open, onOpenChange, entry, project }: EntryPrintDialogProps) {
  const [templateId, setTemplateId] = useState("");

  const { data: templates = [] } = useQuery({
    queryKey: ["accounting", "print-templates"],
    queryFn: async () => (await TemplateAdmin.search({})).results ?? [],
    enabled: open,
    staleTime: 60000,
  });

  const handlePrint = async () => {
    if (!templateId) { toast.error("Select a template first"); return; }
    if (!entry) return;
    try {
      const materialLines = (entry.material_entries ?? []).map((e) =>
        `${e.material_name} ×${e.quantity} @ Rs ${e.unit_price} = Rs ${e.total}`
      ).join("\n");
      const teamLines = (entry.team_entries ?? []).map((e) =>
        `${e.member_name} (${e.role}) — ${e.hours}h × ${e.days}d × Rs ${e.rate} = Rs ${e.total} [${e.paid_by}]`
      ).join("\n");
      const vars: Record<string, string> = {
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
        material_count: String(entry.material_entries?.length ?? 0),
        team_count: String(entry.team_entries?.length ?? 0),
        material_items: materialLines,
        team_items: teamLines,
      };
      const html = await TemplateAdmin.previewHtml(templateId, vars);
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.top = "0";
      iframe.style.left = "-100vw";
      iframe.style.width = "210mm";
      iframe.style.height = "297mm";
      iframe.style.border = "0";
      document.body.appendChild(iframe);
      iframe.onload = () => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 1000);
      };
      iframe.srcdoc = html;
    } catch {
      toast.error("Failed to generate preview");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Print Entry</DialogTitle>
          <DialogDescription>
            {entry?.type === "expense" ? "Expense" : "Income"} &mdash; {entry?.description || "No description"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 space-y-1 text-sm">
            <p><span className="text-gray-500">Amount:</span> <span className="font-semibold">{entry ? formatCurrency(entry.amount) : ""}</span></p>
            <p><span className="text-gray-500">Date:</span> {entry?.date}</p>
            {entry?.payment_method && <p><span className="text-gray-500">Method:</span> {entry.payment_method}</p>}
            {entry?.bank_name && <p><span className="text-gray-500">Bank:</span> {entry.bank_name}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">Template</Label>
            <SearchableSelect
              options={templates.map((t) => ({ value: t.id, label: t.title }))}
              value={templateId}
              onChange={setTemplateId}
              placeholder="Select a template..."
              searchPlaceholder="Search templates..."
            />
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

// ─── Main Component ─────────────────────────────────────────────────────
interface Props {
  entries: AccountingEntry[];
  project?: Project | null;
  saving: boolean;
  onEntrySave: (form: AccountingEntryFormData, editingId: string | null) => void;
  onEntryDelete: (id: string) => void;
}

export function AccountingForm({ entries, project, saving, onEntrySave, onEntryDelete }: Props) {
  const user = useAuthStore((s) => s.user);
  const [tab, setTab] = useState("overview");
  const [entryDialogOpen, setEntryDialogOpen] = useState(false);
  const [entryType, setEntryType] = useState<EntryType>("expense");
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [entryForm, setEntryForm] = useState<AccountingEntryFormData>(EMPTY_ENTRY_FORM);
  const [printTarget, setPrintTarget] = useState<AccountingEntry | null>(null);
  const [printOpen, setPrintOpen] = useState(false);

  const clients = project?.clients ?? [];
  const contractValue = clients.reduce((s, c) => s + (c.contract_value || 0), 0);

  const expenses = useMemo(() => entries.filter((e) => e.type === "expense"), [entries]);
  const incomes = useMemo(() => entries.filter((e) => e.type === "income"), [entries]);
  const totalExpense = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const totalIncome = useMemo(() => incomes.reduce((s, e) => s + e.amount, 0), [incomes]);
  const netBalance = totalIncome - totalExpense;

  const openNewEntry = (type: EntryType) => {
    setEntryType(type);
    setEditingEntryId(null);
    setEntryForm({
      ...EMPTY_ENTRY_FORM,
      type,
      date: new Date().toISOString().slice(0, 10),
      entered_by: user?.name || "",
    });
    setEntryDialogOpen(true);
  };

  const openEditEntry = (entry: AccountingEntry) => {
    setEntryType(entry.type);
    setEditingEntryId(entry.id);
    setEntryForm({
      type: entry.type,
      expense_category: entry.expense_category,
      vendor_id: entry.vendor_id || "",
      vendor_name: entry.vendor_name || "",
      transaction_id: entry.transaction_id || "",
      description: entry.description,
      amount: String(entry.amount),
      material_entries: entry.material_entries ?? [],
      team_entries: entry.team_entries ?? [],
      date: entry.date,
      payment_method: entry.payment_method,
      payment_type: entry.payment_type,
      bank_name: entry.bank_name,
      cheque_voucher_no: entry.cheque_voucher_no,
      cheque_voucher_date: entry.cheque_voucher_date ?? "",
      remark: entry.remark,
      entered_by: entry.entered_by || user?.name || "",
    });
    setEntryDialogOpen(true);
  };

  const handleEntryFormChange = (key: string, value: string) => {
    setEntryForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleMaterialEntriesChange = (entries: AccountingMaterialEntry[]) => {
    setEntryForm((prev) => ({ ...prev, material_entries: entries }));
  };

  const handleTeamEntriesChange = (entries: AccountingTeamEntry[]) => {
    setEntryForm((prev) => ({ ...prev, team_entries: entries }));
  };

  const handleEntrySave = () => {
    onEntrySave(entryForm, editingEntryId);
    setEntryDialogOpen(false);
  };

  const openPrint = (entry: AccountingEntry) => {
    setPrintTarget(entry);
    setPrintOpen(true);
  };

  const handleOverallPrint = async () => {
    const vars: Record<string, string> = {
      project: project?.title ?? "",
      project_status: project?.status ?? "",
      contract_value: String(contractValue),
      total_income: String(totalIncome),
      total_expense: String(totalExpense),
      net_balance: String(netBalance),
      income_count: String(incomes.length),
      expense_count: String(expenses.length),
    };
    const templates = await TemplateAdmin.search({}).catch(() => ({ results: [] }));
    if (!templates.results?.length) { toast.error("No templates available"); return; }
    try {
      const html = await TemplateAdmin.previewHtml(templates.results[0].id, vars);
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed"; iframe.style.top = "0"; iframe.style.left = "-100vw";
      iframe.style.width = "210mm"; iframe.style.height = "297mm"; iframe.style.border = "0";
      document.body.appendChild(iframe);
      iframe.onload = () => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 1000);
      };
      iframe.srcdoc = html;
    } catch {
      toast.error("Failed to generate overview report");
    }
  };

  const categoryBadge = (cat: ExpenseCategory | "") => {
    if (!cat) return null;
    const s = EXPENSE_CATEGORY_STYLES[cat];
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${s.bg} ${s.color}`}>
        {s.label}
      </span>
    );
  };

  return (
    <div>
      <Tabs value={tab} onValueChange={setTab} className="w-full flex flex-col">
        <div>
          <FormTabs tabs={[
            { value: "overview", label: "Overview" },
            { value: "expenses", label: "Expenses" },
            { value: "incomes", label: "Incomes" },
          ]} />
        </div>

        <div>
          {/* ═══════════════ OVERVIEW ═══════════════ */}
          <TabsContent value="overview" className="space-y-5 mt-4">
            {project && (
              <>
                <FormCard>
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 className="size-4 text-gray-500" />
                    <p className="text-sm font-semibold text-gray-900">Project Details</p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-gray-500">Project</Label>
                      <p className="text-sm font-medium text-gray-900">{project.title}</p>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-gray-500">Status</Label>
                      <p className="text-sm font-medium text-gray-900 capitalize">{project.status}</p>
                    </div>
                  </div>
                </FormCard>

                {clients.length > 0 && (
                  <FormCard>
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="size-4 text-gray-500" />
                      <p className="text-sm font-semibold text-gray-900">Clients</p>
                    </div>
                    <div className="space-y-2">
                      {clients.map((c, i) => (
                        <div key={c.id || i} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{c.name}</p>
                            <p className="text-xs text-gray-500">{c.location}{c.document_id ? ` · ${c.document_id}` : ""}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">{formatCurrency(c.contract_value || 0)}</p>
                            <p className="text-[10px] text-gray-400">Contract Value</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-100 pt-4 mt-2">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-100">
                        <div className="flex items-center gap-2">
                          <Banknote className="size-4 text-blue-600" />
                          <p className="text-sm font-semibold text-blue-900">Total Contract Value</p>
                        </div>
                        <p className="text-lg font-bold text-blue-700">{formatCurrency(contractValue)}</p>
                      </div>
                    </div>
                  </FormCard>
                )}

                <FormCard>
                  <div className="flex items-center gap-2 mb-4">
                    <Wallet className="size-4 text-gray-500" />
                    <p className="text-sm font-semibold text-gray-900">Financial Summary</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-100">
                      <div className="flex items-center gap-2">
                        <ArrowUpRight className="size-4 text-green-600" />
                        <p className="text-sm font-semibold text-green-900">Total Income</p>
                      </div>
                      <p className="text-lg font-bold text-green-700">{formatCurrency(totalIncome)}</p>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100">
                      <div className="flex items-center gap-2">
                        <ArrowDownRight className="size-4 text-red-600" />
                        <p className="text-sm font-semibold text-red-900">Total Expenses</p>
                      </div>
                      <p className="text-lg font-bold text-red-700">{formatCurrency(totalExpense)}</p>
                    </div>
                    <div className="border-t border-gray-100 pt-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">Net Balance</p>
                        <p className={`text-lg font-bold ${netBalance >= 0 ? "text-green-700" : "text-red-700"}`}>
                          {formatCurrency(Math.abs(netBalance))}
                          <span className="text-xs ml-1">{netBalance >= 0 ? "(Surplus)" : "(Deficit)"}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </FormCard>

                <div className="flex justify-end">
                  <Button type="button" variant="outline" size="sm" onClick={handleOverallPrint}>
                    <Printer className="size-3.5 mr-1.5" />
                    Print Overall Report
                  </Button>
                </div>
              </>
            )}

            {!project && (
              <FormCard>
                <div className="py-10 text-center text-sm text-gray-400">
                  Select a project above to view financial overview.
                </div>
              </FormCard>
            )}
          </TabsContent>

          {/* ═══════════════ EXPENSES ═══════════════ */}
          <TabsContent value="expenses" className="space-y-5 mt-4">
            <FormCard>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Expense Records</p>
                  <p className="text-xs text-gray-500">Material, team, and vendor expenses</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => openNewEntry("expense")}>
                  <Plus className="size-3.5 mr-1" />
                  Add Expense
                </Button>
              </div>

              {expenses.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 py-10 text-center text-sm text-gray-400">
                  No expense entries yet. Add one to start.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-gray-200">
                        <TableHead className="text-gray-900 font-semibold text-xs">Date</TableHead>
                        <TableHead className="text-gray-900 font-semibold text-xs">Category</TableHead>
                        <TableHead className="text-gray-900 font-semibold text-xs">Description / Items</TableHead>
                        <TableHead className="text-gray-900 font-semibold text-xs text-right">Amount (Rs)</TableHead>
                        <TableHead className="text-gray-900 font-semibold text-xs">Method</TableHead>
                        <TableHead className="w-20" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenses.map((entry) => {
                        const materialCount = entry.material_entries?.length ?? 0;
                        const teamCount = entry.team_entries?.length ?? 0;
                        const hasItems = materialCount > 0 || teamCount > 0;
                        return (
                        <TableRow key={entry.id} className="border-gray-100 hover:bg-gray-50">
                          <TableCell><span className="text-xs text-gray-600">{entry.date}</span></TableCell>
                          <TableCell>{categoryBadge(entry.expense_category as ExpenseCategory)}</TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-900">{entry.description || "\u2014"}</span>
                            {hasItems && (
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                {materialCount > 0 && <span className="text-blue-600">{materialCount} material item{materialCount > 1 ? "s" : ""}</span>}
                                {materialCount > 0 && teamCount > 0 && <span className="text-gray-300 mx-1">·</span>}
                                {teamCount > 0 && <span className="text-purple-600">{teamCount} team member{teamCount > 1 ? "s" : ""}</span>}
                              </p>
                            )}
                            {entry.remark && !hasItems && <p className="text-[10px] text-gray-400">{entry.remark}</p>}
                          </TableCell>
                          <TableCell className="text-right font-medium text-red-600 text-sm">
                            {formatCurrency(entry.amount)}
                          </TableCell>
                          <TableCell><span className="text-xs text-gray-500">{entry.payment_method || "\u2014"}</span></TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <button type="button" onClick={() => openEditEntry(entry)}
                                className="size-7 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100">
                                <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              </button>
                              <button type="button" onClick={() => openPrint(entry)}
                                className="size-7 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100">
                                <Printer className="size-3" />
                              </button>
                              <button type="button" onClick={() => onEntryDelete(entry.id)}
                                className="size-7 flex items-center justify-center rounded text-red-300 hover:text-red-600 hover:bg-red-50">
                                <Trash2 className="size-3" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}

              {expenses.length > 0 && (
                <div className="flex justify-end pt-4 border-t border-gray-200 mt-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Total Expenses</p>
                    <p className="text-lg font-bold text-red-700">{formatCurrency(totalExpense)}</p>
                  </div>
                </div>
              )}
            </FormCard>
          </TabsContent>

          {/* ═══════════════ INCOMES ═══════════════ */}
          <TabsContent value="incomes" className="space-y-5 mt-4">
            <FormCard>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Income Records</p>
                  <p className="text-xs text-gray-500">Payment received from clients</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => openNewEntry("income")}>
                  <Plus className="size-3.5 mr-1" />
                  Add Income
                </Button>
              </div>

              {incomes.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 py-10 text-center text-sm text-gray-400">
                  No income entries yet. Add one to start.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-gray-200">
                        <TableHead className="text-gray-900 font-semibold text-xs">Date</TableHead>
                        <TableHead className="text-gray-900 font-semibold text-xs">Amount (Rs)</TableHead>
                        <TableHead className="text-gray-900 font-semibold text-xs">Method</TableHead>
                        <TableHead className="text-gray-900 font-semibold text-xs">Type</TableHead>
                        <TableHead className="text-gray-900 font-semibold text-xs">Bank</TableHead>
                        <TableHead className="text-gray-900 font-semibold text-xs">Cheque / Voucher</TableHead>
                        <TableHead className="text-gray-900 font-semibold text-xs">Remark</TableHead>
                        <TableHead className="text-gray-900 font-semibold text-xs">Entered By</TableHead>
                        <TableHead className="w-20" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {incomes.map((entry) => (
                        <TableRow key={entry.id} className="border-gray-100 hover:bg-gray-50">
                          <TableCell><span className="text-xs text-gray-600">{entry.date}</span></TableCell>
                          <TableCell className="font-medium text-green-700 text-sm">
                            {formatCurrency(entry.amount)}
                          </TableCell>
                          <TableCell><span className="text-xs text-gray-500">{entry.payment_method || "\u2014"}</span></TableCell>
                          <TableCell>
                            <span className="text-xs font-medium text-gray-700 capitalize">{entry.payment_type || "\u2014"}</span>
                          </TableCell>
                          <TableCell><span className="text-xs text-gray-500">{entry.bank_name || "\u2014"}</span></TableCell>
                          <TableCell>
                            <div className="text-xs text-gray-600">
                              {entry.cheque_voucher_no || "\u2014"}
                              {entry.cheque_voucher_date && <span className="text-gray-400 ml-1">({entry.cheque_voucher_date})</span>}
                            </div>
                          </TableCell>
                          <TableCell><span className="text-xs text-gray-500">{entry.remark || "\u2014"}</span></TableCell>
                          <TableCell><span className="text-xs text-gray-500">{entry.entered_by || "\u2014"}</span></TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <button type="button" onClick={() => openEditEntry(entry)}
                                className="size-7 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100">
                                <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              </button>
                              <button type="button" onClick={() => openPrint(entry)}
                                className="size-7 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100">
                                <Printer className="size-3" />
                              </button>
                              <button type="button" onClick={() => onEntryDelete(entry.id)}
                                className="size-7 flex items-center justify-center rounded text-red-300 hover:text-red-600 hover:bg-red-50">
                                <Trash2 className="size-3" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {incomes.length > 0 && (
                <div className="flex justify-end pt-4 border-t border-gray-200 mt-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Total Income</p>
                    <p className="text-lg font-bold text-green-700">{formatCurrency(totalIncome)}</p>
                  </div>
                </div>
              )}
            </FormCard>
          </TabsContent>
        </div>
      </Tabs>

      {/* Entry Dialog */}
      <EntryDialog
        open={entryDialogOpen}
        onOpenChange={setEntryDialogOpen}
        entryType={entryType}
        form={entryForm}
        onChange={handleEntryFormChange}
        onMaterialEntriesChange={handleMaterialEntriesChange}
        onTeamEntriesChange={handleTeamEntriesChange}
        onSave={handleEntrySave}
      />

      {/* Print Dialog */}
      <EntryPrintDialog
        open={printOpen}
        onOpenChange={setPrintOpen}
        entry={printTarget}
        project={project}
      />
    </div>
  );
}
