"use client";

import { useState, useMemo } from "react";
import { Calculator, Search } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import { BillingAdmin } from "@/api/services/billing.service";
import { ProjectAdmin } from "@/api/services/project.service";
import dynamic from "next/dynamic";
import { genId } from "@/lib/utils";
import { groupEntries, ungroupEntries } from "@/lib/groups";
import type {
  BillingCalculation, BillingFormData,
  MaterialGroup, TeamGroup, TaxEntry,
} from "@/api/types/billing.types";
const BillingForm = dynamic(() => import("@/components/page_ui/billing-form").then((m) => m.BillingForm), { ssr: false });
import { PageHeader } from "@/components/global_ui/page-header";
import { DataTable } from "@/components/global_ui/data-table";
import { StatusBadge, ACTIVE_STATUS } from "@/components/global_ui/status-badge";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import type { ColumnDef } from "@/components/global_ui/data-table";
import { useDebounce } from "@/api/hooks/use-debounce";

type View = "list" | "form";

const ITEMS_PER_PAGE = 10;

const EMPTY_FORM: BillingFormData = {
  title: "", project_id: "", is_active: true,
  materials_title: "", team_title: "",
};

export function _Client() {
  const queryClient = useQueryClient();

  const [view, setView] = useState<View>("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BillingFormData>(EMPTY_FORM);
  const [materialGroups, setMaterialGroups] = useState<MaterialGroup[]>([]);
  const [teamGroups, setTeamGroups] = useState<TeamGroup[]>([]);
  const [taxes, setTaxes] = useState<TaxEntry[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedSearch = useDebounce(search, 300);

  const listParams = useMemo(() => ({
    search: debouncedSearch || undefined,
    page: currentPage,
    page_size: ITEMS_PER_PAGE,
  }), [debouncedSearch, currentPage]);

  const { data: billingData } = useQuery({
    queryKey: queryKeys.billing.list(listParams),
    queryFn: () => BillingAdmin.list(listParams),
    placeholderData: (prev) => prev,
  });

  const records = billingData?.results ?? [];
  const total = billingData?.count ?? 0;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const { data: projects = [] } = useQuery({
    queryKey: queryKeys.projects.list({}),
    queryFn: async () => (await ProjectAdmin.list()).results ?? [],
    staleTime: Infinity,
  });

  const selectedProject = useMemo(() => {
    if (!form.project_id) return null;
    return projects.find((p) => p.id === form.project_id) ?? null;
  }, [form.project_id, projects]);

  const { data: projectDetail } = useQuery({
    queryKey: queryKeys.projects.detail(selectedProject?.slug ?? ""),
    queryFn: () => ProjectAdmin.adminGet(selectedProject?.slug ?? ""),
    enabled: view === "form" && !!selectedProject?.slug,
    staleTime: 30000,
  });

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setMaterialGroups([]);
    setTeamGroups([]);
    setTaxes([]);
    setEditingId(null);
  };

  const invalidateBilling = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.billing.all, refetchType: "active" });

  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => BillingAdmin.create(payload),
    onSuccess: () => { toast.success("Billing calculation created"); invalidateBilling(); },
    onError: () => { toast.error("Something went wrong"); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => BillingAdmin.update(id, data),
    onSuccess: () => { toast.success("Billing calculation updated"); invalidateBilling(); },
    onError: () => { toast.error("Something went wrong"); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => BillingAdmin.delete(id),
    onSuccess: () => { toast.success("Billing calculation deleted"); invalidateBilling(); },
    onError: () => { toast.error("Failed to delete"); },
  });

  const saving = createMutation.isPending || updateMutation.isPending;

  const openNew = () => {
    resetForm();
    setView("form");
  };

  const openEdit = (item: BillingCalculation) => {
    BillingAdmin.adminGet(item.id).then((detail) => {
      setForm({
        title: detail.title,
        project_id: detail.project_id,
        is_active: detail.is_active,
        materials_title: detail.materials_title || "",
        team_title: detail.team_title || "",
      });
      setMaterialGroups(groupEntries(detail.material_entries ?? []));
      setTeamGroups(groupEntries(detail.team_entries ?? []));
      setTaxes(detail.taxes?.map((t) => ({ ...t, id: genId() })) ?? []);
      setEditingId(item.id);
      setView("form");
    }).catch(() => toast.error("Failed to load billing details"));
  };

  const back = () => {
    resetForm();
    setView("list");
  };

  const handleChange = (key: string, value: string | boolean) => {
    if (key === "project_id") {
      setMaterialGroups([]);
      setTeamGroups([]);
      setTaxes([]);
    }
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    if (!form.title) { toast.error("Title is required"); return; }
    const payload: Record<string, unknown> = {
      ...form,
      material_entries: ungroupEntries(materialGroups),
      team_entries: ungroupEntries(teamGroups),
      taxes,
    };
    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    back();
  };

  const confirmDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const columns: ColumnDef<BillingCalculation>[] = [
    {
      header: "Title",
      render: (item) => <span className="text-sm text-gray-900 font-medium">{item.title}</span>,
    },
    {
      header: "Project",
      render: (item) => <span className="text-sm text-gray-500">{item.project_title || "—"}</span>,
    },
    {
      header: "Materials",
      render: (item) => <span className="text-sm text-gray-500">{item.material_count ?? item.material_entries?.length ?? 0} items</span>,
    },
    {
      header: "Team",
      render: (item) => <span className="text-sm text-gray-500">{item.team_count ?? item.team_entries?.length ?? 0} members</span>,
    },
    {
      header: "Status",
      render: (item) => <StatusBadge value={item.is_active} map={ACTIVE_STATUS} />,
    },
    {
      header: "Grand Total",
      render: (item) => {
        const t = item.grand_total;
        const fmt = t >= 100000 ? `Rs ${(t / 100000).toFixed(2)} L` : `Rs ${t.toLocaleString("en-IN")}`;
        return <span className="text-sm font-semibold text-gray-900">{fmt}</span>;
      },
    },
  ];

  return (
    <>
      {view === "list" ? (
        <PageHeader title="Billing Calculations" subtitle="Manage project cost estimates" actionLabel="Add Calculation" onAction={openNew}>
          <div className="flex items-center gap-3 mb-4">
            <InputGroup className="flex-1 max-w-sm h-9">
              <InputGroupAddon align="inline-start">
                <Search className="size-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Search by title..."
              />
            </InputGroup>
            <p className="text-sm text-sidebar-primary font-medium whitespace-nowrap">
              Total: {total} {total === 1 ? "item" : "items"} found.
            </p>
          </div>

          <DataTable
            data={records}
            columns={columns}
            onEdit={openEdit}
            onDelete={confirmDelete}
            getIdentifier={(item) => item.id}
            page={currentPage}
            totalPages={totalPages}
            totalCount={total}
            onPageChange={setCurrentPage}
            emptyState={{
              icon: Calculator,
              title: "No billing calculations yet",
              description: "Create your first estimate to get started.",
            }}
            deleteDialog={{
              title: (id) => `Delete "${records.find((r) => r.id === id)?.title || "this calculation"}"?`,
              description: (id) => `Are you sure you want to delete "${records.find((r) => r.id === id)?.title || "this calculation"}"? This cannot be undone.`,
            }}
          />
        </PageHeader>
      ) : (
        <div className="px-4">
          <BillingForm
            form={form}
            editingId={editingId}
            saving={saving}
            projects={projects}
            projectDetail={projectDetail ?? undefined}
            materialGroups={materialGroups}
            teamGroups={teamGroups}
            taxes={taxes}
            onMaterialGroupsChange={setMaterialGroups}
            onTeamGroupsChange={setTeamGroups}
            onTaxesChange={setTaxes}
            onChange={handleChange}
            onSave={save}
            onBack={back}
          />
        </div>
      )}
    </>
  );
}
