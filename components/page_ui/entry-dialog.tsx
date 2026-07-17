"use client";

import { X } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { SearchableSelect } from "@/components/global_ui/searchable-select";
import { NumericInput } from "@/components/global_ui/numeric-input";
import { useAuthStore } from "@/app/store/auth-store";
import type { AccountingEntryFormData, AccountingMaterialEntry, EntryType } from "@/api/types/accounting.types";
import { EMPTY_ENTRY_FORM, genId, materialEntriesTotal } from "@/api/types/accounting.types";
import type { Bank } from "@/api/types/emi.types";
import type { MaterialItem } from "@/api/types/material-list.types";
import type { Vendor } from "@/api/types/vendor.types";
import { formatCurrency } from "@/lib/currency";

const PAYMENT_METHOD_OPTIONS = [
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cheque", label: "Cheque" },
  { value: "online", label: "Online Payment" },
  { value: "other", label: "Other" },
];

const INCOME_PAYMENT_TYPE_OPTIONS = [
  { value: "advance", label: "Advance" },
  { value: "milestone", label: "Milestone" },
  { value: "final", label: "Final" },
  { value: "partial", label: "Partial" },
];

interface EntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entryType: EntryType;
  form: AccountingEntryFormData;
  onChange: (key: string, value: string) => void;
  onMaterialEntriesChange: (entries: AccountingMaterialEntry[]) => void;
  onSave: () => void;
  banks: Bank[];
  materials: MaterialItem[];
  vendors: Vendor[];
}

export function EntryDialog({ open, onOpenChange, entryType, form, onChange, onMaterialEntriesChange, onSave, banks, materials, vendors }: EntryDialogProps) {
  const isExpense = entryType === "expense";
  const title = isExpense ? "New Expense" : "New Income";
  const user = useAuthStore((s) => s.user);

  const materialsById = useMemo(() => new Map(materials.map((m) => [m.id, m])), [materials]);
  const vendorsById = useMemo(() => new Map(vendors.map((v) => [v.id, v])), [vendors]);

  const materialOptions = useMemo(
    () => materials.map((m) => ({ value: m.id, label: `${m.name} — Rs ${m.price_per_unit}` })),
    [materials]
  );

  const vendorOptions = useMemo(
    () => vendors.map((v) => ({ value: v.id, label: v.name })),
    [vendors]
  );

  const bankOptions = useMemo(
    () => banks.map((b) => ({ value: b.name, label: b.name })),
    [banks]
  );

  const showBank = form.payment_method === "cheque" || form.payment_method === "bank_transfer";
  const showCheque = form.payment_method === "cheque";
  const showTransactionId = form.payment_method === "bank_transfer";

  const materialAmount = materialEntriesTotal(form.material_entries);

  const handleSelectMaterial = (materialId: string) => {
    const mat = materialsById.get(materialId);
    if (!mat) return;
    const entry: AccountingMaterialEntry = {
      id: genId(), material_id: mat.id, material_name: mat.name,
      variant_id: "", variant_name: "",
      quantity: 1, unit_price: mat.price_per_unit, total: mat.price_per_unit,
    };
    onMaterialEntriesChange([...form.material_entries, entry]);
  };

  const updateMaterialEntry = (id: string, field: string, value: number) => {
    onMaterialEntriesChange(form.material_entries.map((e) => {
      if (e.id !== id) return e;
      const quantity = field === "quantity" ? value : e.quantity;
      const unitPrice = field === "unit_price" ? value : e.unit_price;
      return { ...e, [field]: value, total: quantity * unitPrice };
    }));
  };

  const removeMaterialEntry = (id: string) => {
    onMaterialEntriesChange(form.material_entries.filter((e) => e.id !== id));
  };

  const handleVendorChange = (id: string) => {
    const v = vendorsById.get(id);
    onChange("vendor_id", id);
    onChange("vendor_name", v?.name || "");
  };

  const canSave = form.date && (
    isExpense
      ? form.material_entries.length > 0
      : Number(form.amount || 0) > 0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{isExpense ? "Record an expense entry" : "Record an income entry"}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {!isExpense && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Payment Type</Label>
              <SearchableSelect
                options={INCOME_PAYMENT_TYPE_OPTIONS}
                value={form.payment_type}
                onChange={(v) => onChange("payment_type", v)}
                placeholder="Select payment type..."
              />
            </div>
          )}

          {isExpense && (
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Material Items</Label>
                  <SearchableSelect
                    options={materialOptions}
                    value=""
                    onChange={handleSelectMaterial}
                    placeholder="Add material..."
                    searchPlaceholder="Search materials..."
                    triggerClassName="h-7 text-xs w-[200px]"
                  />
                </div>
                {form.material_entries.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">No items added yet</p>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-border">
                          <TableHead className="font-semibold text-xs">Material</TableHead>
                          <TableHead className="font-semibold text-xs w-20">Qty</TableHead>
                          <TableHead className="font-semibold text-xs w-24">Unit Price (Rs)</TableHead>
                          <TableHead className="font-semibold text-xs text-right w-24">Total (Rs)</TableHead>
                          <TableHead className="w-8" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {form.material_entries.map((entry) => (
                          <TableRow key={entry.id} className="border-border/60 hover:bg-muted/40">
                            <TableCell>
                              <span className="text-xs font-medium">{entry.material_name}</span>
                            </TableCell>
                            <TableCell>
                              <NumericInput value={entry.quantity} onCommit={(n) => updateMaterialEntry(entry.id, "quantity", n)} className="h-7 text-xs text-right" min={1} placeholder="Qty" />
                            </TableCell>
                            <TableCell>
                              <NumericInput value={entry.unit_price} onCommit={(n) => updateMaterialEntry(entry.id, "unit_price", n)} className="h-7 text-xs text-right" min={0} placeholder="Price" />
                            </TableCell>
                            <TableCell className="text-right font-medium text-xs">
                              {formatCurrency(entry.quantity * entry.unit_price)}
                            </TableCell>
                            <TableCell>
                              <button type="button" onClick={() => removeMaterialEntry(entry.id)}
                                className="size-7 flex items-center justify-center rounded text-red-400 hover:text-red-600 hover:bg-red-500/10">
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
                    <p className="text-sm font-bold">Total: {formatCurrency(materialAmount)}</p>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Paid To</Label>
                <SearchableSelect
                  options={vendorOptions}
                  value={form.vendor_id}
                  onChange={handleVendorChange}
                  placeholder="Pick a vendor..."
                  searchPlaceholder="Search vendors..."
                />
                <div className="flex items-center gap-2">
                  <div className="flex-1 border-t border-border/60" />
                  <span className="text-[11px] text-muted-foreground">or type manually</span>
                  <div className="flex-1 border-t border-border/60" />
                </div>
                <Input
                  value={form.vendor_name}
                  onChange={(e) => {
                    onChange("vendor_name", e.target.value);
                    if (!e.target.value) onChange("vendor_id", "");
                  }}
                  placeholder="Vendor name"
                />
              </div>
            </div>
          )}

          {!isExpense && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Amount (Rs) <span className="text-red-500">*</span></Label>
              <Input type="number" value={form.amount} onChange={(e) => onChange("amount", e.target.value)} placeholder="0.00" min={0} />
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Date <span className="text-red-500">*</span></Label>
            <Input type="date" value={form.date} onChange={(e) => onChange("date", e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Payment Method</Label>
            <SearchableSelect
              options={PAYMENT_METHOD_OPTIONS}
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

          {showCheque && (
            <div className="grid grid-cols-2 gap-4">
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

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Entered By</Label>
            <Input value={form.entered_by || user?.name || ""} disabled className="bg-muted/40 text-muted-foreground font-medium" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Remark</Label>
            <Input value={form.remark} onChange={(e) => onChange("remark", e.target.value)} placeholder="Optional remark" />
          </div>

          {materialAmount > 0 && (
            <div className="flex justify-end pt-2 border-t border-border/60">
              <p className="text-base font-bold">
                Total Amount: {formatCurrency(materialAmount)}
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
