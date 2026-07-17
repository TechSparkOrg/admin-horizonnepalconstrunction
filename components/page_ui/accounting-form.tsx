"use client";

import { Plus, Printer, ReceiptText, PiggyBank, Search } from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { FormCard } from "@/components/global_ui/form-card";
import { FormTabs } from "@/components/global_ui/form-tabs";
import { DataTable, ColumnDef } from "@/components/global_ui/data-table";
import { useAuthStore } from "@/app/store/auth-store";
import { EntryDialog } from "@/components/page_ui/entry-dialog";
import { EntryPrintDialog } from "@/components/page_ui/accounting-print-dialog";
import type { AccountingEntry, AccountingEntryFormData, AccountingMaterialEntry, EntryType } from "@/api/types/accounting.types";
import { EMPTY_ENTRY_FORM } from "@/api/types/accounting.types";
import type { Project } from "@/api/types/project.types";
import type { Bank } from "@/api/types/emi.types";
import type { MaterialItem } from "@/api/types/material-list.types";
import type { Vendor } from "@/api/types/vendor.types";
import { formatCurrency } from "@/lib/currency";

interface Props {
  entries: AccountingEntry[];
  project?: Project | null;
  banks: Bank[];
  materials: MaterialItem[];
  vendors: Vendor[];
  onEntrySave: (form: AccountingEntryFormData, editingId: string | null) => void;
  onEntryDelete: (id: string) => void;
}

export function AccountingForm({ entries, project, banks, materials, vendors, onEntrySave, onEntryDelete }: Props) {
  const user = useAuthStore((s) => s.user);
  const [tab, setTab] = useState("overview");
  const [entryDialogOpen, setEntryDialogOpen] = useState(false);
  const [entryType, setEntryType] = useState<EntryType>("expense");
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [entryForm, setEntryForm] = useState<AccountingEntryFormData>(EMPTY_ENTRY_FORM);
  const [printTarget, setPrintTarget] = useState<AccountingEntry | null>(null);
  const [printMode, setPrintMode] = useState<"entry" | "overall">("entry");
  const [printOpen, setPrintOpen] = useState(false);
  const [search, setSearch] = useState("");

  const clients = project?.clients ?? [];
  const contractValue = clients.reduce((s, c) => s + (c.contract_value || 0), 0);

  const filterFn = useCallback((e: AccountingEntry) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.description?.toLowerCase().includes(q) ||
      e.vendor_name?.toLowerCase().includes(q) ||
      e.vendor_id?.toLowerCase().includes(q) ||
      e.payment_method?.toLowerCase().includes(q) ||
      e.payment_type?.toLowerCase().includes(q) ||
      e.bank_name?.toLowerCase().includes(q) ||
      e.entered_by?.toLowerCase().includes(q) ||
      e.transaction_id?.toLowerCase().includes(q) ||
      e.cheque_voucher_no?.toLowerCase().includes(q) ||
      e.remark?.toLowerCase().includes(q) ||
      String(e.amount).includes(q) ||
      e.date?.includes(q)
    );
  }, [search]);

  const expenses = useMemo(() => entries.filter((e) => e.type === "expense").filter(filterFn), [entries, filterFn]);
  const incomes = useMemo(() => entries.filter((e) => e.type === "income").filter(filterFn), [entries, filterFn]);
  const totalExpense = useMemo(() => entries.filter((e) => e.type === "expense").reduce((s, e) => s + e.amount, 0), [entries]);
  const totalIncome = useMemo(() => entries.filter((e) => e.type === "income").reduce((s, e) => s + e.amount, 0), [entries]);
  const netBalance = totalIncome - totalExpense;

  const overallVars = useMemo(() => ({
    project: project?.title ?? "",
    project_status: project?.status ?? "",
    contract_value: String(contractValue),
    total_income: String(totalIncome),
    total_expense: String(totalExpense),
    net_balance: String(netBalance),
    income_count: String(incomes.length),
    expense_count: String(expenses.length),
  }), [project, contractValue, totalIncome, totalExpense, netBalance, incomes, expenses]);

  const openNewEntry = useCallback((type: EntryType) => {
    setEntryType(type);
    setEditingEntryId(null);
    setEntryForm({
      ...EMPTY_ENTRY_FORM,
      type,
      expense_category: type === "income" ? "" : EMPTY_ENTRY_FORM.expense_category,
      date: new Date().toISOString().slice(0, 10),
      entered_by: user?.name || "",
    });
    setEntryDialogOpen(true);
  }, [user]);

  const openEditEntry = useCallback((entry: AccountingEntry) => {
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
  }, [user]);

  const handleEntryFormChange = useCallback((key: string, value: string) => {
    setEntryForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleMaterialEntriesChange = useCallback((entries: AccountingMaterialEntry[]) => {
    setEntryForm((prev) => ({ ...prev, material_entries: entries }));
  }, []);

  const handleEntrySave = useCallback(() => {
    onEntrySave(entryForm, editingEntryId);
    setEntryDialogOpen(false);
  }, [onEntrySave, entryForm, editingEntryId]);

  const openPrint = useCallback((entry: AccountingEntry) => {
    setPrintTarget(entry);
    setPrintMode("entry");
    setPrintOpen(true);
  }, []);

  const expenseColumns: ColumnDef<AccountingEntry>[] = useMemo(() => [
    { header: "Date", render: (e) => <span className="text-xs text-muted-foreground">{e.date}</span> },
    {
      header: "Items",
      render: (e) => {
        const items = e.material_entries ?? [];
        return items.length > 0 ? (
          <div className="text-xs text-foreground/80">
            {items.map((m) => (
              <div key={m.id} className="leading-tight">{m.material_name} &times;{m.quantity}</div>
            ))}
          </div>
        ) : (
          <span className="text-sm">{e.description || "—"}</span>
        );
      },
    },
    { header: "Paid To", render: (e) => <span className="text-xs font-medium">{e.vendor_name || "—"}</span> },
    { header: "Amount (Rs)", className: "text-right", render: (e) => <span className="text-red-600 text-sm font-medium">{formatCurrency(e.amount)}</span> },
    { header: "Method", render: (e) => <span className="text-xs text-muted-foreground">{e.payment_method || "—"}</span> },
    { header: "Entered By", render: (e) => <span className="text-xs text-muted-foreground">{e.entered_by || "—"}</span> },
  ], []);

  const incomeColumns: ColumnDef<AccountingEntry>[] = useMemo(() => [
    { header: "Date", render: (e) => <span className="text-xs text-muted-foreground">{e.date}</span> },
    { header: "Entered By", render: (e) => <span className="text-xs text-muted-foreground">{e.entered_by || "—"}</span> },
    { header: "Amount (Rs)", render: (e) => <span className="text-green-600 text-sm font-medium">{formatCurrency(e.amount)}</span> },
    { header: "Type", render: (e) => <span className="text-xs font-medium capitalize">{e.payment_type || "—"}</span> },
    { header: "Method", render: (e) => <span className="text-xs text-muted-foreground">{e.payment_method || "—"}</span> },
    { header: "Bank", render: (e) => <span className="text-xs text-muted-foreground">{e.bank_name || "—"}</span> },
    {
      header: "Cheque",
      render: (e) => (
        <div className="text-xs text-muted-foreground">
          {e.cheque_voucher_no || "—"}
          {e.cheque_voucher_date && <span className="opacity-60 ml-1">({e.cheque_voucher_date})</span>}
        </div>
      ),
    },
  ], []);

  return (
    <div>
      <Tabs value={tab} onValueChange={setTab} className="w-full flex flex-col">
        <FormTabs tabs={[
          { value: "overview", label: "Overview" },
          { value: "expenses", label: "Expenses" },
          { value: "incomes", label: "Incomes" },
        ]} />

        <TabsContent value="overview" className="mt-3">
          {project ? (
            <FormCard>
              <div className="grid grid-cols-2 gap-x-6 gap-y-0.5">
                <div>
                  <p className="text-[11px] text-muted-foreground">Project</p>
                  <p className="text-sm font-medium">{project.title}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Status</p>
                  <p className="text-sm font-medium capitalize">{project.status}</p>
                </div>
              </div>

              <div className="border-t border-border grid grid-cols-3 gap-4 pt-3">
                <div>
                  <p className="text-[11px] text-muted-foreground">Income</p>
                  <p className="text-base font-bold text-green-600">{formatCurrency(totalIncome)}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Expenses</p>
                  <p className="text-base font-bold text-red-600">{formatCurrency(totalExpense)}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Net Balance</p>
                  <p className={`text-base font-bold ${netBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(Math.abs(netBalance))}
                  </p>
                </div>
              </div>

              {clients.length > 0 && (
                <div className="border-t border-border pt-3 space-y-1.5">
                  <p className="text-[11px] text-muted-foreground">Clients</p>
                  {clients.map((c, i) => (
                    <div key={c.id || i} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{c.name}</p>
                        {c.location && <p className="text-xs text-muted-foreground">{c.location}</p>}
                      </div>
                      <p className="text-sm font-semibold">{formatCurrency(c.contract_value || 0)}</p>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-1.5 border-t border-border/60">
                    <p className="text-xs text-muted-foreground">Total Contract Value</p>
                    <p className="text-sm font-bold">{formatCurrency(contractValue)}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end border-t border-border pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => { setPrintMode("overall"); setPrintOpen(true); }}>
                  <Printer className="size-3.5 mr-1.5" />
                  Print Report
                </Button>
              </div>
            </FormCard>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-12 text-muted-foreground">
              <p className="text-sm">Select a project to view financial overview.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="expenses" className="mt-3">
          <FormCard>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Expenses</p>
              <Button type="button" variant="outline" size="sm" onClick={() => openNewEntry("expense")}>
                <Plus className="size-3.5 mr-1" />Add
              </Button>
            </div>
            <div className="relative my-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search entries..."
                className="pl-8 h-8 text-xs"
              />
            </div>
            <DataTable
              data={expenses}
              columns={expenseColumns}
              onEdit={openEditEntry}
              onDelete={onEntryDelete}
              onPrint={openPrint}
              getIdentifier={(e) => e.id}
              page={1}
              totalPages={1}
              onPageChange={() => {}}
              emptyState={{ icon: ReceiptText, title: "No expense entries", description: "Add one to get started." }}
              iconOnlyActions
              bare
            />
            {expenses.length > 0 && (
              <div className="flex justify-end pt-2 border-t border-border">
                <div className="text-right">
                  <p className="text-[11px] text-muted-foreground">Total</p>
                  <p className="text-base font-bold text-red-600">{formatCurrency(totalExpense)}</p>
                </div>
              </div>
            )}
          </FormCard>
        </TabsContent>

        <TabsContent value="incomes" className="mt-3">
          <FormCard>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Incomes</p>
              <Button type="button" variant="outline" size="sm" onClick={() => openNewEntry("income")}>
                <Plus className="size-3.5 mr-1" />Add
              </Button>
            </div>
            <div className="relative my-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search entries..."
                className="pl-8 h-8 text-xs"
              />
            </div>
            <DataTable
              data={incomes}
              columns={incomeColumns}
              onEdit={openEditEntry}
              onDelete={onEntryDelete}
              onPrint={openPrint}
              getIdentifier={(e) => e.id}
              page={1}
              totalPages={1}
              onPageChange={() => {}}
              emptyState={{ icon: PiggyBank, title: "No income entries", description: "Add one to get started." }}
              iconOnlyActions
              bare
            />
            {incomes.length > 0 && (
              <div className="flex justify-end pt-2 border-t border-border">
                <div className="text-right">
                  <p className="text-[11px] text-muted-foreground">Total</p>
                  <p className="text-base font-bold text-green-600">{formatCurrency(totalIncome)}</p>
                </div>
              </div>
            )}
          </FormCard>
        </TabsContent>
      </Tabs>

      <EntryDialog
        open={entryDialogOpen}
        onOpenChange={setEntryDialogOpen}
        entryType={entryType}
        form={entryForm}
        onChange={handleEntryFormChange}
        onMaterialEntriesChange={handleMaterialEntriesChange}
        onSave={handleEntrySave}
        banks={banks}
        materials={materials}
        vendors={vendors}
      />

      <EntryPrintDialog
        open={printOpen}
        onOpenChange={setPrintOpen}
        mode={printMode}
        entry={printTarget}
        overallVars={overallVars}
        project={project}
      />
    </div>
  );
}
