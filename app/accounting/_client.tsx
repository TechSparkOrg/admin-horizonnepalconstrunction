"use client";

import { useState, useMemo } from "react";
import { Wallet } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import { ProjectAdmin } from "@/api/services/project.service";
import { AccountingAdmin } from "@/api/services/accounting.service";
import { MaterialListAdmin } from "@/api/services/material-list.service";
import { EmiBankAdmin } from "@/api/services/emi.service";
import { VendorAdmin } from "@/api/services/vendor.service";
import { AccountingForm } from "@/components/page_ui/accounting-form";
import { PageHeader } from "@/components/global_ui/page-header";
import { SearchableSelect } from "@/components/global_ui/searchable-select";
import type { AccountingEntryFormData } from "@/api/types/accounting.types";
import type { Bank } from "@/api/types/emi.types";
import type { MaterialItem } from "@/api/types/material-list.types";
import type { Vendor } from "@/api/types/vendor.types";

export function _Client() {
  const queryClient = useQueryClient();
  const [projectId, setProjectId] = useState("");

  const { data: projects = [] } = useQuery({
    queryKey: queryKeys.projects.all,
    queryFn: async () => (await ProjectAdmin.list()).results ?? [],
    staleTime: 60000,
  });

  const selectedProject = useMemo(() => {
    if (!projectId) return null;
    return projects.find((p) => p.id === projectId) ?? null;
  }, [projectId, projects]);

  const { data: projectDetail } = useQuery({
    queryKey: queryKeys.projects.detail(selectedProject?.slug ?? ""),
    queryFn: () => ProjectAdmin.adminGet(selectedProject?.slug ?? ""),
    enabled: !!selectedProject?.slug,
    staleTime: 30000,
  });

  const { data: entries = [] } = useQuery({
    queryKey: queryKeys.accounting.list({ project_id: projectId }),
    queryFn: async () => {
      if (!projectId) return [];
      const res = await AccountingAdmin.list({ project_id: projectId });
      return res.results ?? [];
    },
    enabled: !!projectId,
  });

  const { data: banks = [] } = useQuery<Bank[]>({
    queryKey: ["accounting", "banks"],
    queryFn: async () => (await EmiBankAdmin.search({})).results ?? [],
    staleTime: Infinity,
    gcTime: 600_000,
  });

  const { data: materials = [] } = useQuery<MaterialItem[]>({
    queryKey: queryKeys.materialList.all,
    queryFn: async () => (await MaterialListAdmin.search({})).results ?? [],
    staleTime: Infinity,
    gcTime: 600_000,
  });

  const { data: vendors = [] } = useQuery<Vendor[]>({
    queryKey: queryKeys.vendors.all,
    queryFn: async () => (await VendorAdmin.search({})).results ?? [],
    staleTime: Infinity,
    gcTime: 600_000,
  });

  const invalidateEntries = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.accounting.list({ project_id: projectId }), refetchType: "active" });

  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => AccountingAdmin.create(payload),
    onSuccess: () => { toast.success("Entry created"); invalidateEntries(); },
    onError: () => toast.error("Failed to create entry"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => AccountingAdmin.update(id, payload),
    onSuccess: () => { toast.success("Entry updated"); invalidateEntries(); },
    onError: () => toast.error("Failed to update entry"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => AccountingAdmin.delete(id),
    onSuccess: () => { toast.success("Entry deleted"); invalidateEntries(); },
    onError: () => toast.error("Failed to delete entry"),
  });

  const handleEntrySave = (form: AccountingEntryFormData, editingId: string | null) => {
    if (!projectId) { toast.error("Select a project first"); return; }
    if (!form.date) { toast.error("Date is required"); return; }
    if (form.type === "income" && !form.amount) { toast.error("Amount is required"); return; }
    if (form.type === "expense" && form.material_entries.length === 0) { toast.error("Add at least one material item"); return; }

    const payload: Record<string, unknown> = {
      ...form,
      amount: form.type === "expense" ? 0 : Number(form.amount),
      cheque_voucher_date: form.cheque_voucher_date || null,
      project_id: projectId,
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEntryDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const projectOptions = useMemo(
    () => projects.map((p) => ({ value: p.id, label: p.title })),
    [projects]
  );

  return (
    <PageHeader
      title="Accounting"
      subtitle={selectedProject ? `Financial records for ${selectedProject.title}` : "Select a project to manage financial entries"}
    >
      <div className="mb-5 max-w-sm">
        <SearchableSelect
          options={projectOptions}
          value={projectId}
          onChange={setProjectId}
          placeholder="Select project..."
          searchPlaceholder="Search projects..."
        />
      </div>

      {!projectId && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-16 text-muted-foreground">
          <Wallet className="size-7 opacity-40" />
          <p className="text-sm">Select a project to view its financial records</p>
        </div>
      )}

      {projectId && (
        <AccountingForm
          entries={entries}
          project={projectDetail ?? null}
          banks={banks}
          materials={materials}
          vendors={vendors}
          onEntrySave={handleEntrySave}
          onEntryDelete={handleEntryDelete}
        />
      )}
    </PageHeader>
  );
}
