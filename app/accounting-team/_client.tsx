"use client";

import { useState, useMemo } from "react";
import { Users } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import { StaffAdmin } from "@/api/services/staff.service";
import { TeamAccountingAdmin } from "@/api/services/team-accounting.service";
import { TeamAccountingForm } from "@/components/page_ui/team-accounting-form";
import { PageHeader } from "@/components/global_ui/page-header";
import { SearchableSelect } from "@/components/global_ui/searchable-select";
import { FormCard } from "@/components/global_ui/form-card";
import type { TeamPaymentFormData } from "@/api/types/team-accounting.types";

export function _Client() {
  const queryClient = useQueryClient();
  const [staffId, setStaffId] = useState("");

  const { data: staffList = [] } = useQuery({
    queryKey: queryKeys.staff.all,
    queryFn: async () => (await StaffAdmin.search({})).results ?? [],
    staleTime: 60000,
  });

  const { data: staffDetail } = useQuery({
    queryKey: queryKeys.staff.detail(staffId),
    queryFn: () => StaffAdmin.adminGet(staffId),
    enabled: !!staffId,
    staleTime: 30000,
  });

  const selectedStaff = useMemo(() => {
    if (!staffId) return null;
    return staffList.find((s) => s.id === staffId) ?? null;
  }, [staffId, staffList]);

  const { data: records = [] } = useQuery({
    queryKey: queryKeys.teamAccounting.list({ staff_member_id: staffId }),
    queryFn: async () => {
      if (!staffId) return [];
      const res = await TeamAccountingAdmin.list({ staff_member_id: staffId });
      return res.results ?? [];
    },
    enabled: !!staffId,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.teamAccounting.all, refetchType: "active" });

  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => TeamAccountingAdmin.create(payload),
    onSuccess: () => { toast.success("Payment recorded"); invalidate(); },
    onError: () => toast.error("Failed to create payment record"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => TeamAccountingAdmin.update(id, payload),
    onSuccess: () => { toast.success("Payment updated"); invalidate(); },
    onError: () => toast.error("Failed to update payment record"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => TeamAccountingAdmin.delete(id),
    onSuccess: () => { toast.success("Payment deleted"); invalidate(); },
    onError: () => toast.error("Failed to delete payment record"),
  });

  const handleSave = (form: TeamPaymentFormData, editingId: string | null) => {
    if (!staffId) { toast.error("Select a staff member first"); return; }
    if (!form.date) { toast.error("Date is required"); return; }
    if (!form.amount || Number(form.amount) <= 0) { toast.error("Amount is required"); return; }
    if (form.payment_type === "commission" && form.commission_type === "percentage" && (!form.commission_percentage || !form.base_amount)) {
      toast.error("Enter both percentage and base amount"); return;
    }

    const payload: Record<string, unknown> = {
      ...form,
      amount: Number(form.amount),
      staff_member_id: staffId,
      staff_member_name: selectedStaff?.name ?? "",
      project_id: form.project_id || null,
      cheque_voucher_date: form.cheque_voucher_date || null,
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const staffOptions = useMemo(
    () => staffList.map((s) => ({ value: s.id, label: s.name })),
    [staffList]
  );

  return (
    <PageHeader
      title="Team Accounting"
      subtitle={selectedStaff ? `Payments for ${selectedStaff.name}` : "Select a staff member to manage salary & commission"}
    >
      <div className="mb-5 max-w-sm">
        <SearchableSelect
          options={staffOptions}
          value={staffId}
          onChange={setStaffId}
          placeholder="Select staff member..."
          searchPlaceholder="Search staff..."
        />
      </div>

      {!staffId && (
        <FormCard>
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
            <Users className="size-7 opacity-40" />
            <p className="text-sm">Select a staff member to view their payment records</p>
          </div>
        </FormCard>
      )}

      {staffId && (
        <TeamAccountingForm
          staff={selectedStaff}
          staffDetail={staffDetail ?? null}
          records={records}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </PageHeader>
  );
}
