"use client";

import { useState, useMemo, useCallback } from "react";
import { Plus, Printer, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { FormCard } from "@/components/global_ui/form-card";
import { FormTabs } from "@/components/global_ui/form-tabs";
import { DataTable, ColumnDef } from "@/components/global_ui/data-table";
import { TeamEntryDialog } from "@/components/page_ui/team-entry-dialog";
import { TeamPrintDialog } from "@/components/page_ui/team-print-dialog";
import { formatCurrency } from "@/lib/currency";
import type { TeamPaymentRecord, TeamPaymentFormData, TeamPaymentType } from "@/api/types/team-accounting.types";
import { EMPTY_TEAM_PAYMENT_FORM, TEAM_PAYMENT_TYPE_OPTIONS } from "@/api/types/team-accounting.types";
import type { StaffMemberListItem, StaffMember } from "@/api/types/staff.types";

const PAYMENT_TYPE_STYLES: Record<TeamPaymentType, { color: string; bg: string }> = {
  salary: { color: "text-blue-700", bg: "bg-blue-50" },
  commission: { color: "text-purple-700", bg: "bg-purple-50" },
};

interface Props {
  staff: StaffMemberListItem | null;
  staffDetail: StaffMember | null;
  records: TeamPaymentRecord[];
  onSave: (form: TeamPaymentFormData, editingId: string | null) => void;
  onDelete: (id: string) => void;
}

export function TeamAccountingForm({ staff, staffDetail, records, onSave, onDelete }: Props) {
  const [tab, setTab] = useState("overview");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TeamPaymentFormData>(EMPTY_TEAM_PAYMENT_FORM);
  const [printOpen, setPrintOpen] = useState(false);

  const salaries = useMemo(() => records.filter((r) => r.payment_type === "salary"), [records]);
  const commissions = useMemo(() => records.filter((r) => r.payment_type === "commission"), [records]);
  const totalSalary = useMemo(() => salaries.reduce((s, r) => s + r.amount, 0), [salaries]);
  const totalCommission = useMemo(() => commissions.reduce((s, r) => s + r.amount, 0), [commissions]);

  const salaryAmount = staffDetail?.salary_amount ? Number(staffDetail.salary_amount) : 0;

  const openNew = useCallback(() => {
    setEditingId(null);
    setForm({
      ...EMPTY_TEAM_PAYMENT_FORM,
      staff_member_id: staff?.id ?? "",
      staff_member_name: staff?.name ?? "",
      date: new Date().toISOString().slice(0, 10),
      amount: String(salaryAmount > 0 ? salaryAmount : ""),
    });
    setDialogOpen(true);
  }, [staff, salaryAmount]);

  const openEdit = useCallback((record: TeamPaymentRecord) => {
    setEditingId(record.id);
    setForm({
      staff_member_id: record.staff_member_id,
      staff_member_name: record.staff_member_name,
      payment_type: record.payment_type,
      commission_type: record.commission_type ?? "fixed",
      commission_percentage: record.commission_percentage ?? "",
      base_amount: record.base_amount ?? "",
      amount: String(record.amount),
      date: record.date,
      project_id: "",
      project_name: record.project_name ?? "",
      payment_method: record.payment_method,
      bank_name: record.bank_name,
      transaction_id: record.transaction_id,
      cheque_voucher_no: record.cheque_voucher_no,
      cheque_voucher_date: record.cheque_voucher_date ?? "",
      remark: record.remark,
      entered_by: record.entered_by,
    });
    setDialogOpen(true);
  }, []);

  const handleFormChange = useCallback((key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = useCallback(() => {
    onSave(form, editingId);
    setDialogOpen(false);
  }, [onSave, form, editingId]);

  const openPrint = useCallback(() => {
    setPrintOpen(true);
  }, []);

  const columns: ColumnDef<TeamPaymentRecord>[] = useMemo(() => [
    { header: "Date", render: (r) => <span className="text-xs text-muted-foreground">{r.date}</span> },
    {
      header: "Type",
      render: (r) => {
        const s = PAYMENT_TYPE_STYLES[r.payment_type];
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${s.bg} ${s.color}`}>
            {TEAM_PAYMENT_TYPE_OPTIONS.find((o) => o.value === r.payment_type)?.label ?? r.payment_type}
          </span>
        );
      },
    },
    {
      header: "Project",
      render: (r) => <span className="text-xs text-muted-foreground">{r.project_name || "\u2014"}</span>,
    },
    { header: "Amount (Rs)", className: "text-right", render: (r) => <span className="font-medium">{formatCurrency(r.amount)}</span> },
    { header: "Method", render: (r) => <span className="text-xs text-muted-foreground">{r.payment_method || "\u2014"}</span> },
  ], []);

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full flex flex-col">
      <div>
        <FormTabs tabs={[
          { value: "overview", label: "Overview" },
          { value: "records", label: "Records" },
        ]} />
      </div>

      <TabsContent value="overview" className="mt-3 space-y-3">
        {staff && (
          <FormCard>
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="size-4 text-muted-foreground" />
              <p className="text-sm font-semibold">{staff.name}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] text-muted-foreground">Designation</p>
                <p className="text-sm font-medium">{staff.designation || "\u2014"}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Salary</p>
                <p className="text-sm font-medium">{salaryAmount > 0 ? formatCurrency(salaryAmount) : "\u2014"}</p>
              </div>
            </div>
          </FormCard>
        )}

        <div className="grid grid-cols-2 gap-3">
          <FormCard>
            <p className="text-xs text-muted-foreground">Total Salary Paid</p>
            <p className="text-lg font-bold text-blue-700">{formatCurrency(totalSalary)}</p>
          </FormCard>
          <FormCard>
            <p className="text-xs text-muted-foreground">Total Commission Paid</p>
            <p className="text-lg font-bold text-purple-700">{formatCurrency(totalCommission)}</p>
          </FormCard>
        </div>
        <FormCard>
          <p className="text-lg font-bold">Total Payments</p>
          <p className="text-xs text-muted-foreground mb-2">All payments for {staff?.name}</p>
          <p className="text-2xl font-bold">{formatCurrency(totalSalary + totalCommission)}</p>
        </FormCard>
      </TabsContent>

      <TabsContent value="records" className="mt-3">
        <FormCard>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Payment Records</p>
            <Button type="button" variant="outline" size="sm" onClick={openNew}>
              <Plus className="size-3.5 mr-1" />Add Payment
            </Button>
          </div>
          <DataTable
            data={records}
            columns={columns}
            onEdit={openEdit}
            onDelete={onDelete}
            onPrint={openPrint}
            getIdentifier={(r) => r.id}
            page={1}
            totalPages={1}
            onPageChange={() => {}}
            emptyState={{ icon: Briefcase, title: "No payments recorded", description: "Add a salary or commission payment to get started." }}
            iconOnlyActions
            bare
          />
          {records.length > 0 && (
            <div className="flex justify-end pt-2 border-t border-border">
              <div className="text-right">
                <p className="text-[11px] text-muted-foreground">Total</p>
                <p className="text-base font-bold">{formatCurrency(totalSalary + totalCommission)}</p>
              </div>
            </div>
          )}
        </FormCard>
      </TabsContent>

      <TeamEntryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        form={form}
        onChange={handleFormChange}
        onSave={handleSave}
        editingId={editingId}
        salaryAmount={salaryAmount}
      />

      <TeamPrintDialog open={printOpen} onOpenChange={setPrintOpen} />
    </Tabs>
  );
}
