"use client";

import { useState, useMemo, useEffect } from "react";
import { Calculator, Search } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import { BillingAdmin } from "@/api/services/billing.service";
import { MaterialListAdmin } from "@/api/services/material-list.service";
import { StaffAdmin } from "@/api/services/staff.service";
import { ProjectAdmin } from "@/api/services/project.service";
import dynamic from "next/dynamic";
import type {
  BillingCalculation, BillingFormData,
  BillingMaterialEntry, BillingTeamEntry,
  MaterialGroup, TeamGroup, TaxEntry,
} from "@/api/types/billing.types";
import type { ProjectListItem, Project } from "@/api/types/project.types";
const BillingForm = dynamic(() => import("@/components/page_ui/billing-form").then((m) => m.BillingForm), { ssr: false });
import { PageHeader } from "@/components/global_ui/page-header";
import { DataTable } from "@/components/global_ui/data-table";
import { StatusBadge, ACTIVE_STATUS } from "@/components/global_ui/status-badge";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import type { ColumnDef } from "@/components/global_ui/data-table";
import { useAttributeOptions } from "@/api/hooks/use-attribute-query";
import { useDebounce } from "@/api/hooks/use-debounce";

type View = "list" | "form";

const ITEMS_PER_PAGE = 10;

const EMPTY_FORM: BillingFormData = {
  title: "", project_id: "", is_active: true,
  materials_title: "", team_title: "",
};

function genId() { return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`; }

function ungroupMaterials(groups: MaterialGroup[]): BillingMaterialEntry[] {
  return groups.flatMap((g) => g.entries.map((e) => ({ ...e, group: g.groupLabel })));
}

function ungroupTeam(groups: TeamGroup[]): BillingTeamEntry[] {
  return groups.flatMap((g) => g.entries.map((e) => ({ ...e, group: g.groupLabel })));
}

function groupMaterials(entries: BillingMaterialEntry[]): MaterialGroup[] {
  const map = new Map<string, BillingMaterialEntry[]>();
  for (const e of entries) {
    const key = e.group || "General";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push({ ...e });
  }
  return Array.from(map.entries()).map(([groupLabel, entries], i) => ({ id: `g-${i}`, groupLabel, entries }));
}

function groupTeam(entries: BillingTeamEntry[]): TeamGroup[] {
  const map = new Map<string, BillingTeamEntry[]>();
  for (const e of entries) {
    const key = e.group || "General";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push({ ...e });
  }
  return Array.from(map.entries()).map(([groupLabel, entries], i) => ({ id: `g-${i}`, groupLabel, entries }));
}

export function _Client() {
  const queryClient = useQueryClient();

  const [view, setView] = useState<View>("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BillingFormData>(EMPTY_FORM);
  const [materialGroups, setMaterialGroups] = useState<MaterialGroup[]>([]);
  const [teamGroups, setTeamGroups] = useState<TeamGroup[]>([]);
  const [taxes, setTaxes] = useState<TaxEntry[]>([]);
  const [saving, setSaving] = useState(false);
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

  const { data: materials = [] } = useQuery({
    queryKey: queryKeys.materialList.list({}),
    queryFn: async () => (await MaterialListAdmin.search({})).results ?? [],
    staleTime: Infinity,
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: queryKeys.staff.list({}),
    queryFn: async () => (await StaffAdmin.search({})).results ?? [],
    staleTime: Infinity,
  });

  const { data: projects = [] } = useQuery({
    queryKey: queryKeys.projects.list({}),
    queryFn: async () => (await ProjectAdmin.list()).results ?? [],
    staleTime: Infinity,
  });

  const { data: attributes = [] } = useAttributeOptions();

  const selectedProject = useMemo(() => {
    if (!form.project_id) return null;
    return projects.find((p) => p.id === form.project_id) ?? null;
  }, [form.project_id, projects]);

  const { data: projectDetail } = useQuery({
    queryKey: queryKeys.projects.detail(selectedProject?.slug ?? ""),
    queryFn: () => ProjectAdmin.adminGet(selectedProject!.slug),
    enabled: view === "form" && !!selectedProject?.slug,
    staleTime: 30000,
  });

  // ponytail: preload BillingForm chunk while user browses list
  useEffect(() => { import("@/components/page_ui/billing-form"); }, []);

  const invalidateBilling = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.billing.all, refetchType: "active" });

  const openNew = () => {
    setForm(EMPTY_FORM);
    setMaterialGroups([]);
    setTeamGroups([]);
    setTaxes([]);
    setEditingId(null);
    setView("form");
  };

  const openEdit = (item: BillingCalculation) => {
    setForm(EMPTY_FORM);
    setMaterialGroups([]);
    setTeamGroups([]);
    setTaxes([]);
    setEditingId(item.id);
    setView("form");
    BillingAdmin.adminGet(item.id).then((detail) => {
      setForm({
        title: detail.title,
        project_id: detail.project_id,
        is_active: detail.is_active,
        materials_title: detail.materials_title || "",
        team_title: detail.team_title || "",
      });
      setMaterialGroups(groupMaterials(detail.material_entries ?? []));
      setTeamGroups(groupTeam(detail.team_entries ?? []));
      setTaxes(detail.taxes?.map((t) => ({ ...t, id: genId() })) ?? []);
    }).catch(() => toast.error("Failed to load billing details"));
  };

  const back = () => {
    setForm(EMPTY_FORM);
    setMaterialGroups([]);
    setTeamGroups([]);
    setTaxes([]);
    setEditingId(null);
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
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        ...form,
        material_entries: ungroupMaterials(materialGroups),
        team_entries: ungroupTeam(teamGroups),
        taxes,
      };
      if (editingId) {
        await BillingAdmin.update(editingId, payload);
        toast.success("Billing calculation updated");
      } else {
        await BillingAdmin.create(payload);
        toast.success("Billing calculation created");
      }
      await invalidateBilling();
      back();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async (id: string) => {
    try {
      await BillingAdmin.delete(id);
      await invalidateBilling();
      toast.success("Billing calculation deleted");
    } catch {
      toast.error("Failed to delete");
    }
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
        const t = item.material_total + item.team_total + (item.tax_total || 0);
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
            materials={materials}
            teamMembers={teamMembers}
            projects={projects}
            projectDetail={projectDetail ?? undefined}
            attributes={attributes}
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
