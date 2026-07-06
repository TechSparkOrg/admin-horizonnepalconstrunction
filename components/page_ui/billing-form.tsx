"use client";

import { Plus, Trash2, Printer, Building2, Pencil, X } from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { FormHeader } from "@/components/global_ui/form-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FormCard } from "@/components/global_ui/form-card";
import { FormTabs } from "@/components/global_ui/form-tabs";
import { SegmentedToggle } from "@/components/global_ui/segmented-toggle";
import { SearchableSelect } from "@/components/global_ui/searchable-select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MaterialListAdmin } from "@/api/services/material-list.service";
import { StaffAdmin } from "@/api/services/staff.service";
import type { BillingFormData, BillingMaterialEntry, BillingTeamEntry, MaterialGroup, TeamGroup, TaxEntry } from "@/api/types/billing.types";
import type { ProjectListItem, Project } from "@/api/types/project.types";
import { AttributeValuePickerDialog } from "@/components/global_ui/attribute-value-picker";
import { TemplateTokensCard } from "@/components/global_ui/template-tokens-card";
import { BillingPrintDialog } from "@/components/page_ui/billing-print-dialog";
import type { BillingDataPayload } from "@/components/page_ui/billing-print-dialog";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import { useAttributeOptions } from "@/api/hooks/use-attribute-query";
import { formatCurrency, computeTaxAmount } from "@/lib/currency";
import { genId } from "@/lib/utils";
import { NumericInput } from "@/components/global_ui/numeric-input";

interface Props {
  form: BillingFormData;
  editingId: string | null;
  saving: boolean;
  projects: ProjectListItem[];
  projectDetail?: Project;
  materialGroups: MaterialGroup[];
  teamGroups: TeamGroup[];
  taxes: TaxEntry[];
  onMaterialGroupsChange: (groups: MaterialGroup[]) => void;
  onTeamGroupsChange: (groups: TeamGroup[]) => void;
  onTaxesChange: (taxes: TaxEntry[]) => void;
  onChange: (key: string, value: string | boolean) => void;
  onSave: () => void;
  onBack: () => void;
}

function materialTotal(entries: BillingMaterialEntry[]) {
  return entries.reduce((s, e) => s + e.price * e.quantity, 0);
}

function teamTotal(entries: BillingTeamEntry[]) {
  return entries.reduce((s, e) => s + e.price * e.hours_per_day * e.days, 0);
}

function slugKey(s: string) {
  return s.toLowerCase().replace(/\W+/g, "_");
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function BillingForm({
  form, editingId, saving, projects, projectDetail,
  materialGroups, teamGroups, taxes,
  onMaterialGroupsChange, onTeamGroupsChange, onTaxesChange,
  onChange, onSave, onBack,
}: Props) {
  const [printOpen, setPrintOpen] = useState(false);

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

  const { data: attributes = [] } = useAttributeOptions();
  const [pickerConfig, setPickerConfig] = useState<{
    type: "material" | "team" | "tax";
    open: boolean;
  }>({ type: "material", open: false });

  const clients = projectDetail?.clients ?? [];
  const contractValue = clients.reduce((sum, c) => sum + (c.contract_value || 0), 0);
  const selectedProject = useMemo(() => projects.find((p) => p.id === form.project_id) ?? null, [form.project_id, projects]);

  const materialsById = useMemo(() => new Map(materials.map(m => [m.id, m])), [materials]);
  const teamMembersById = useMemo(() => new Map(teamMembers.map(m => [m.id, m])), [teamMembers]);

  const groupTotals = useMemo(() => {
    const mat = new Map(materialGroups.map(g => [g.id, materialTotal(g.entries)]));
    const team = new Map(teamGroups.map(g => [g.id, teamTotal(g.entries)]));
    const mMaterials = [...mat.values()].reduce((s, v) => s + v, 0);
    const mTeam = [...team.values()].reduce((s, v) => s + v, 0);
    return { matSubtotals: mat, teamSubtotals: team, materialsGrand: mMaterials, teamGrand: mTeam };
  }, [materialGroups, teamGroups]);

  const { materialsGrand, teamGrand, matSubtotals, teamSubtotals } = groupTotals;

  const taxTotal = useMemo(() => taxes.reduce((s, t) => s + computeTaxAmount(t, materialsGrand + teamGrand), 0), [taxes, materialsGrand, teamGrand]);
  const grandTotal = useMemo(() => materialsGrand + teamGrand + taxTotal, [materialsGrand, teamGrand, taxTotal]);
  const balance = useMemo(() => contractValue - materialsGrand - teamGrand, [contractValue, materialsGrand, teamGrand]);

  const [materialOptions, teamMemberOptions, projectOptions] = useMemo(() => [
    materials.map(m => ({ value: m.id, label: m.name })),
    teamMembers.map(m => ({ value: m.id, label: m.name })),
    projects.map(p => ({ value: p.id, label: p.title })),
  ], [materials, teamMembers, projects]);

  const billingVars = useMemo<Record<string, string>>(() => ({
    title: form.title,
    project: selectedProject?.title ?? "",
    materials_total: formatCurrency(materialsGrand),
    team_total: formatCurrency(teamGrand),
    tax_total: formatCurrency(taxTotal),
    grand_total: formatCurrency(grandTotal),
    contract_value: formatCurrency(contractValue),
    balance: formatCurrency(Math.abs(balance)),
    balance_status: balance >= 0 ? "Surplus" : "Deficit",
    ...Object.fromEntries(materialGroups.map((g) => [`mat_${slugKey(g.groupLabel)}`, formatCurrency(matSubtotals.get(g.id) ?? 0)])),
    ...Object.fromEntries(teamGroups.map((g) => [`team_${slugKey(g.groupLabel)}`, formatCurrency(teamSubtotals.get(g.id) ?? 0)])),
    ...Object.fromEntries(taxes.map((t) => [`tax_${slugKey(t.label)}`, formatCurrency(computeTaxAmount(t, materialsGrand + teamGrand))])),
  }), [form.title, selectedProject, materialsGrand, teamGrand, taxTotal, grandTotal, contractValue, balance, materialGroups, teamGroups, taxes, matSubtotals, teamSubtotals]);

  const billingData = useMemo<BillingDataPayload>(() => ({
    materials: materialGroups.flatMap((g) =>
      g.entries.map((e) => ({
        name: e.material_name || "", variant: e.variant_name || "",
        price: e.price, qty: e.quantity,
        total: e.price * e.quantity, group: g.groupLabel,
      }))
    ),
    team: teamGroups.flatMap((g) =>
      g.entries.map((e) => ({
        name: e.member_name || "", role: e.role || "",
        rate: e.price, hours: e.hours_per_day, days: e.days,
        total: e.price * e.hours_per_day * e.days, group: g.groupLabel,
      }))
    ),
    taxes: taxes.map((t) => {
      const amt = computeTaxAmount(t, materialsGrand + teamGrand);
      return {
        label: t.label,
        rate_display: t.tax_type === "fixed" ? formatCurrency(t.rate) : `${t.rate}%`,
        type: t.tax_type === "fixed" ? "Fixed" : "Percent",
        amount: amt,
      };
    }),
  }), [materialGroups, teamGroups, taxes, materialsGrand, teamGrand]);

  const allRoleValues = useMemo(() => {
    return attributes.flatMap((a) => a.values.flatMap((v) => v.values)).filter(Boolean).sort();
  }, [attributes]);

  const roleValueOptions = useMemo(() => allRoleValues.map(v => ({ value: v, label: v })), [allRoleValues]);

  const [roleEditTarget, setRoleEditTarget] = useState<{ groupId: string; entryId: string } | null>(null);

  const handlePickerConfirm = useCallback((value: string) => {
    if (pickerConfig.type === "material") {
      onMaterialGroupsChange([...materialGroups, { id: genId(), groupLabel: value, entries: [] }]);
    } else if (pickerConfig.type === "team") {
      onTeamGroupsChange([...teamGroups, { id: genId(), groupLabel: value, entries: [] }]);
    } else if (pickerConfig.type === "tax") {
      onTaxesChange([...taxes, { id: genId(), label: value, rate: 0, tax_type: "percent" }]);
    }
  }, [pickerConfig.type, materialGroups, teamGroups, taxes, onMaterialGroupsChange, onTeamGroupsChange, onTaxesChange]);

  // ── Material group helpers ──────────────────────────────────────────────────
  const addMaterialEntry = useCallback((groupId: string) => {
    onMaterialGroupsChange(materialGroups.map((g) =>
      g.id === groupId
        ? { ...g, entries: [...g.entries, { id: genId(), material_id: "", material_name: "", variant_id: "", variant_name: "", price: 0, quantity: 1, total: 0 }] }
        : g
    ));
  }, [materialGroups, onMaterialGroupsChange]);

  const updateMaterialEntry = useCallback((groupId: string, entryId: string, field: string, value: string | number) => {
    onMaterialGroupsChange(materialGroups.map((g) =>
      g.id !== groupId ? g : {
        ...g,
        entries: g.entries.map((e) => {
          if (e.id !== entryId) return e;
          const updated = { ...e, [field]: value };
          if (field === "material_id") {
            const mat = materialsById.get(value as string);
            if (mat) {
              updated.material_name = mat.name;
              updated.price = mat.price_per_unit;
              updated.variant_id = "";
              updated.variant_name = "";
            }
          }
          if (field === "variant_id") {
            const mat = materialsById.get(e.material_id);
            if (mat) {
              const variant = mat.variants.find((v) => v.id === value);
              if (variant) {
                updated.variant_name = variant.market_name;
                updated.price = variant.price;
              }
            }
          }
          if (field === "price" || field === "quantity") {
            updated.total = updated.price * updated.quantity;
          }
          return updated;
        }),
      }
    ));
  }, [materialGroups, onMaterialGroupsChange, materialsById]);

  const removeMaterialEntry = useCallback((groupId: string, entryId: string) => {
    onMaterialGroupsChange(materialGroups.map((g) =>
      g.id !== groupId ? g : { ...g, entries: g.entries.filter((e) => e.id !== entryId) }
    ));
  }, [materialGroups, onMaterialGroupsChange]);

  const removeMaterialGroup = useCallback((groupId: string) => {
    onMaterialGroupsChange(materialGroups.filter((g) => g.id !== groupId));
  }, [materialGroups, onMaterialGroupsChange]);

  // ── Team group helpers ──────────────────────────────────────────────────────
  const addTeamEntry = useCallback((groupId: string) => {
    onTeamGroupsChange(teamGroups.map((g) =>
      g.id === groupId
        ? { ...g, entries: [...g.entries, { id: genId(), staff_member_id: "", member_name: "", role: "", price: 0, hours_per_day: 8, days: 1, total: 0 }] }
        : g
    ));
  }, [teamGroups, onTeamGroupsChange]);

  const updateTeamEntry = useCallback((groupId: string, entryId: string, field: string, value: string | number) => {
    onTeamGroupsChange(teamGroups.map((g) =>
      g.id !== groupId ? g : {
        ...g,
        entries: g.entries.map((e) => {
          if (e.id !== entryId) return e;
          const updated = { ...e, [field]: value };
          if (field === "staff_member_id") {
            const member = teamMembersById.get(value as string);
            if (member) {
              updated.member_name = member.name;
              updated.role = member.designation || "";
            }
          }
          if (field === "price" || field === "hours_per_day" || field === "days") {
            updated.total = updated.price * updated.hours_per_day * updated.days;
          }
          return updated;
        }),
      }
    ));
  }, [teamGroups, onTeamGroupsChange, teamMembersById]);

  const removeTeamEntry = useCallback((groupId: string, entryId: string) => {
    onTeamGroupsChange(teamGroups.map((g) =>
      g.id !== groupId ? g : { ...g, entries: g.entries.filter((e) => e.id !== entryId) }
    ));
  }, [teamGroups, onTeamGroupsChange]);

  const removeTeamGroup = useCallback((groupId: string) => {
    onTeamGroupsChange(teamGroups.filter((g) => g.id !== groupId));
  }, [teamGroups, onTeamGroupsChange]);

  // ── Tax helpers ─────────────────────────────────────────────────────────────
  const updateTax = useCallback((id: string, field: "label" | "rate" | "tax_type", value: string | number) => {
    onTaxesChange(taxes.map((t) => t.id === id ? { ...t, [field]: value } : t));
  }, [taxes, onTaxesChange]);

  const removeTax = useCallback((id: string) => {
    onTaxesChange(taxes.filter((t) => t.id !== id));
  }, [taxes, onTaxesChange]);

  return (
    <div>
      <FormHeader
        breadcrumb={editingId ? "Edit Billing" : "New Billing"}
        title={editingId ? "Edit Billing Calculation" : "New Billing Calculation"}
        onBack={onBack}
        onSave={onSave}
        saving={saving}
        saveDisabled={!form.title.trim() || saving}
        saveLabel={editingId ? "Update" : "Create"}
      />

      <Tabs defaultValue="overview" className="w-full flex flex-col">
        <div>
          <FormTabs tabs={[
            { value: "overview", label: "Overview" },
            { value: "materials", label: "Materials" },
            { value: "team", label: "Team" },
            { value: "taxes", label: "Taxes" },
          ]} />
        </div>

        <div>
          {/* ═══════════════ OVERVIEW ═══════════════ */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* ── Fields + Status ──────────────────────────── */}
            <FormCard>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Title <span className="text-red-500">*</span></Label>
                  <Input value={form.title} onChange={(e) => onChange("title", e.target.value)} placeholder="Enter billing title" />
                </div>
                <div className="space-y-1.5">
                  <Label>Project <span className="text-red-500">*</span></Label>
                  <SearchableSelect
                    options={projectOptions}
                    value={form.project_id}
                    onChange={(v) => onChange("project_id", v)}
                    placeholder="Select a project"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                <SegmentedToggle<boolean>
                  value={form.is_active}
                  onChange={(v) => onChange("is_active", v)}
                  options={[{ value: true, label: "Active" }, { value: false, label: "Inactive" }]}
                />
                <Button type="button" variant="outline" size="sm" onClick={() => setPrintOpen(true)} disabled={!editingId}>
                  <Printer className="size-3.5 mr-1.5" /> Export PDF
                </Button>
              </div>
            </FormCard>

            {/* ── Project Info ─────────────────────────────── */}
            {form.project_id && (
              <FormCard>
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="size-3.5 text-gray-400" />
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Project Info</p>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                  <div>
                    <p className="text-[10px] text-gray-400 mb-0.5">Project</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">{selectedProject?.title || "—"}</p>
                  </div>
                  {projectDetail?.status && (
                    <div>
                      <p className="text-[10px] text-gray-400 mb-0.5">Status</p>
                      <p className="text-sm font-medium text-gray-700 capitalize">{projectDetail.status}</p>
                    </div>
                  )}
                  {contractValue > 0 && (
                    <div className="lg:col-span-2">
                      <p className="text-[10px] text-gray-400 mb-0.5">Contract Value</p>
                      <p className="text-sm font-bold text-blue-700">{formatCurrency(contractValue)}</p>
                    </div>
                  )}
                </div>
                {clients.length > 0 && (
                  <div className="space-y-1.5 border-t border-gray-100 pt-3">
                    {clients.map((c, i) => (
                      <div key={c.id || i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{c.name}</p>
                          {c.location && <p className="text-xs text-gray-400">{c.location}{c.document_id ? ` · ${c.document_id}` : ""}</p>}
                        </div>
                        <p className="text-sm font-semibold text-gray-700">{formatCurrency(c.contract_value || 0)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </FormCard>
            )}

            <TemplateTokensCard materialGroups={materialGroups} teamGroups={teamGroups} taxes={taxes} billingVars={billingVars} />
          </TabsContent>

          {/* ═══════════════ MATERIALS ═══════════════ */}
          <TabsContent value="materials" className="space-y-5 mt-4">
            <FormCard>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Materials & Equipment</p>
                  <p className="text-xs text-gray-500">Group by category — pick label & value from attributes</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setPickerConfig({ type: "material", open: true })}>
                  <Plus className="size-3.5 mr-1" />
                  Add Category
                </Button>
              </div>

              {materialGroups.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 py-8 flex flex-col items-center justify-center gap-2 text-gray-500">
                  <span className="text-sm">No categories yet. Add one to start.</span>
                </div>
              ) : (
                <div className="space-y-4">
                    {materialGroups.map((group) => {
                    const subTotal = matSubtotals.get(group.id) ?? 0;
                    return (
                      <div key={group.id} className="rounded-lg border border-gray-200 overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-200">
                          <p className="text-sm font-semibold text-gray-900">{group.groupLabel}</p>
                          <div className="flex items-center gap-2">
                            <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => addMaterialEntry(group.id)}>
                              <Plus className="size-3 mr-1" /> Add Item
                            </Button>
                            <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-600" onClick={() => removeMaterialGroup(group.id)}>
                              <X className="size-3.5" />
                            </Button>
                          </div>
                        </div>
                        {group.entries.length === 0 ? (
                          <div className="px-4 py-6 text-center text-xs text-gray-400">No items in this group</div>
                        ) : (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow className="hover:bg-transparent border-gray-200">
                                  <TableHead className="text-gray-900 font-semibold text-xs">Material</TableHead>
                                  <TableHead className="text-gray-900 font-semibold text-xs">Variant</TableHead>
                                  <TableHead className="text-gray-900 font-semibold text-xs w-24">Price (Rs)</TableHead>
                                  <TableHead className="text-gray-900 font-semibold text-xs w-16">Qty</TableHead>
                                  <TableHead className="text-gray-900 font-semibold text-xs text-right w-24">Total (Rs)</TableHead>
                                  <TableHead className="w-8" />
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {group.entries.map((entry) => {
                                  const selectedMaterial = materialsById.get(entry.material_id);
                                  const variants = selectedMaterial?.variants ?? [];
                                  return (
                                    <TableRow key={entry.id} className="border-gray-100 hover:bg-gray-50">
                                      <TableCell>
                                        <SearchableSelect
                                          options={materialOptions}
                                          value={entry.material_id}
                                          onChange={(v) => updateMaterialEntry(group.id, entry.id, "material_id", v)}
                                          placeholder="Select..."
                                          triggerClassName="h-7 text-xs"
                                        />
                                      </TableCell>
                                      <TableCell>
                                        {variants.length > 0 ? (
                                          <SearchableSelect
                                            options={variants.map((v) => ({ value: v.id, label: v.market_name }))}
                                            value={entry.variant_id}
                                            onChange={(v) => updateMaterialEntry(group.id, entry.id, "variant_id", v)}
                                            placeholder="Variant..."
                                            triggerClassName="h-7 text-xs"
                                          />
                                        ) : (
                                          <span className="text-xs text-gray-400">—</span>
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        <NumericInput value={entry.price} onCommit={(n) => updateMaterialEntry(group.id, entry.id, "price", n)} className="h-7 text-xs text-right" min={0} placeholder="Price" />
                                      </TableCell>
                                      <TableCell>
                                        <NumericInput value={entry.quantity} onCommit={(n) => updateMaterialEntry(group.id, entry.id, "quantity", n)} className="h-7 text-xs text-right" min={1} placeholder="Qty" />
                                      </TableCell>
                                      <TableCell className="text-right font-medium text-gray-900 text-xs">
                                        {formatCurrency(entry.price * entry.quantity)}
                                      </TableCell>
                                      <TableCell>
                                        <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400 hover:text-red-600"
                                          onClick={() => removeMaterialEntry(group.id, entry.id)}>
                                          <Trash2 className="size-3" />
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                        <div className="flex justify-end px-3 py-1.5 border-t border-gray-200">
                          <p className="text-sm font-semibold text-gray-900">Subtotal: {formatCurrency(subTotal)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {materialGroups.length > 0 && (
                <div className="flex justify-end pt-3 border-t border-gray-200 mt-3">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Materials Grand Total</p>
                    <p className="text-base font-semibold text-gray-900">{formatCurrency(materialsGrand)}</p>
                  </div>
                </div>
              )}
            </FormCard>
          </TabsContent>

          {/* ═══════════════ TEAM ═══════════════ */}
          <TabsContent value="team" className="space-y-5 mt-4">
            <FormCard>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Team Costs</p>
                  <p className="text-xs text-gray-500">Group by role — pick label & value from attributes</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setPickerConfig({ type: "team", open: true })}>
                  <Plus className="size-3.5 mr-1" />
                  Add Role Group
                </Button>
              </div>

              {teamGroups.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 py-8 flex flex-col items-center justify-center gap-2 text-gray-500">
                  <span className="text-sm">No role groups yet. Add one to start.</span>
                </div>
              ) : (
                <div className="space-y-4">
                    {teamGroups.map((group) => {
                    const subTotal = teamSubtotals.get(group.id) ?? 0;
                    return (
                      <div key={group.id} className="rounded-lg border border-gray-200 overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-200">
                          <p className="text-sm font-semibold text-gray-900">{group.groupLabel}</p>
                          <div className="flex items-center gap-2">
                            <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => addTeamEntry(group.id)}>
                              <Plus className="size-3 mr-1" /> Add Member
                            </Button>
                            <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-600" onClick={() => removeTeamGroup(group.id)}>
                              <X className="size-3.5" />
                            </Button>
                          </div>
                        </div>
                        {group.entries.length === 0 ? (
                          <div className="px-4 py-6 text-center text-xs text-gray-400">No members in this group</div>
                        ) : (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow className="hover:bg-transparent border-gray-200">
                                  <TableHead className="text-gray-900 font-semibold text-xs">Member</TableHead>
                                  <TableHead className="text-gray-900 font-semibold text-xs">Role</TableHead>
                                  <TableHead className="text-gray-900 font-semibold text-xs w-20">Rate (Rs)</TableHead>
                                  <TableHead className="text-gray-900 font-semibold text-xs w-16">Hrs/Day</TableHead>
                                  <TableHead className="text-gray-900 font-semibold text-xs w-14">Days</TableHead>
                                  <TableHead className="text-gray-900 font-semibold text-xs text-right w-24">Total (Rs)</TableHead>
                                  <TableHead className="w-8" />
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {group.entries.map((entry) => (
                                  <TableRow key={entry.id} className="border-gray-100 hover:bg-gray-50">
                                    <TableCell>
                                      <SearchableSelect
                                        options={teamMemberOptions}
                                        value={entry.staff_member_id}
                                        onChange={(v) => updateTeamEntry(group.id, entry.id, "staff_member_id", v)}
                                        placeholder="Select..."
                                        triggerClassName="h-7 text-xs"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-1">
                                        <span className="text-xs text-gray-900 truncate max-w-[100px]">
                                          {entry.role || "\u2014"}
                                        </span>
                                        <Popover open={roleEditTarget?.entryId === entry.id && roleEditTarget?.groupId === group.id}
                                          onOpenChange={(o) => setRoleEditTarget(o ? { groupId: group.id, entryId: entry.id } : null)}>
                                          <PopoverTrigger asChild>
                                            <button type="button" className="size-5 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 shrink-0">
                                              <Pencil className="size-3" />
                                            </button>
                                          </PopoverTrigger>
                                          <PopoverContent align="start" side="bottom" className="w-56 p-2">
                                            <SearchableSelect
                                              options={roleValueOptions}
                                              value={entry.role}
                                              onChange={(v) => { updateTeamEntry(group.id, entry.id, "role", v); setRoleEditTarget(null); }}
                                              placeholder="Pick a role..."
                                              searchPlaceholder="Search roles..."
                                            />
                                          </PopoverContent>
                                        </Popover>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <NumericInput value={entry.price} onCommit={(n) => updateTeamEntry(group.id, entry.id, "price", n)} className="h-7 text-xs text-right" min={0} placeholder="Rate/hr" />
                                    </TableCell>
                                    <TableCell>
                                      <NumericInput value={entry.hours_per_day} onCommit={(n) => updateTeamEntry(group.id, entry.id, "hours_per_day", n)} className="h-7 text-xs text-right" min={1} placeholder="Hrs/day" />
                                    </TableCell>
                                    <TableCell>
                                      <NumericInput value={entry.days} onCommit={(n) => updateTeamEntry(group.id, entry.id, "days", n)} className="h-7 text-xs text-right" min={1} placeholder="Days" />
                                    </TableCell>
                                    <TableCell className="text-right font-medium text-gray-900 text-xs">
                                      {formatCurrency(entry.price * entry.hours_per_day * entry.days)}
                                    </TableCell>
                                    <TableCell>
                                      <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400 hover:text-red-600"
                                        onClick={() => removeTeamEntry(group.id, entry.id)}>
                                        <Trash2 className="size-3" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                        <div className="flex justify-end px-3 py-1.5 border-t border-gray-200">
                          <p className="text-sm font-semibold text-gray-900">Subtotal: {formatCurrency(subTotal)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {teamGroups.length > 0 && (
                <div className="flex justify-end pt-3 border-t border-gray-200 mt-3">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Team Grand Total</p>
                    <p className="text-base font-semibold text-gray-900">{formatCurrency(teamGrand)}</p>
                  </div>
                </div>
              )}
            </FormCard>
          </TabsContent>

          {/* ═══════════════ TAXES ═══════════════ */}
          <TabsContent value="taxes" className="space-y-5 mt-4">
            <FormCard>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Government & Tax Levies</p>
                  <p className="text-xs text-gray-500">% applies to (materials + team) total · ₹ is a fixed amount</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setPickerConfig({ type: "tax", open: true })}>
                  <Plus className="size-3.5 mr-1" />
                  Add Tax
                </Button>
              </div>

              {taxes.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 py-8 flex flex-col items-center justify-center gap-2 text-gray-500">
                  <span className="text-sm">No taxes added yet</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-gray-200">
                        <TableHead className="text-gray-900 font-semibold text-xs">Tax Type</TableHead>
                        <TableHead className="text-gray-900 font-semibold text-xs w-28">Mode</TableHead>
                        <TableHead className="text-gray-900 font-semibold text-xs w-28">Rate / Amount</TableHead>
                        <TableHead className="text-gray-900 font-semibold text-xs text-right w-28">Computed</TableHead>
                        <TableHead className="w-8" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {taxes.map((tax) => {
                        const isFixed = tax.tax_type === "fixed";
                        const taxAmount = isFixed ? tax.rate : (materialsGrand + teamGrand) * tax.rate / 100;
                        return (
                          <TableRow key={tax.id} className="border-gray-100 hover:bg-gray-50">
                            <TableCell>
                              <span className="text-sm font-medium text-gray-900">{tax.label}</span>
                            </TableCell>
                            <TableCell>
                              <div className="flex rounded-md border border-gray-200 overflow-hidden h-7 w-fit">
                                <button
                                  type="button"
                                  onClick={() => updateTax(tax.id, "tax_type", "percent")}
                                  className={`px-2.5 text-xs font-medium transition-colors ${!isFixed ? "bg-sidebar-primary text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
                                >%</button>
                                <button
                                  type="button"
                                  onClick={() => updateTax(tax.id, "tax_type", "fixed")}
                                  className={`px-2.5 text-xs font-medium border-l border-gray-200 transition-colors ${isFixed ? "bg-sidebar-primary text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
                                >₹</button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <NumericInput
                                value={tax.rate}
                                onCommit={(n) => updateTax(tax.id, "rate", n)}
                                className="h-7 text-xs text-right"
                                min={0}
                                placeholder={isFixed ? "Amount" : "Rate %"}
                              />
                            </TableCell>
                            <TableCell className="text-right font-medium text-gray-900 text-sm">
                              {formatCurrency(taxAmount)}
                            </TableCell>
                            <TableCell>
                              <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400 hover:text-red-600"
                                onClick={() => removeTax(tax.id)}>
                                <Trash2 className="size-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}

              {taxes.length > 0 && (
                <div className="flex justify-end pt-3 border-t border-gray-200 mt-3">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Total Taxes</p>
                    <p className="text-base font-semibold text-gray-900">{formatCurrency(taxTotal)}</p>
                  </div>
                </div>
              )}
            </FormCard>
          </TabsContent>
        </div>
      </Tabs>

      {/* ── Grand Total ─────────────────────────────────────────────────── */}
      {(materialsGrand > 0 || teamGrand > 0 || taxTotal > 0) && (
        <div className="mt-4 border-t border-gray-200 pt-3">
          <div className="flex justify-end">
            <div className="text-right space-y-0.5">
              {materialsGrand > 0 && <p className="text-xs text-gray-500">Materials: {formatCurrency(materialsGrand)}</p>}
              {teamGrand > 0 && <p className="text-xs text-gray-500">Team: {formatCurrency(teamGrand)}</p>}
              {taxTotal > 0 && <p className="text-xs text-gray-500">Taxes: {formatCurrency(taxTotal)}</p>}
              <p className="text-base font-semibold text-gray-900 pt-1">Grand Total: {formatCurrency(grandTotal)}</p>
              {contractValue > 0 && (
                <p className={`text-xs ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {balance >= 0 ? "Surplus" : "Deficit"} {formatCurrency(Math.abs(balance))}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Picker Dialog ───────────────────────────────────────────────── */}
      <AttributeValuePickerDialog
        open={pickerConfig.open}
        onOpenChange={(o) => setPickerConfig((p) => ({ ...p, open: o }))}
        onConfirm={handlePickerConfirm}
        attributes={attributes}
        title={
          pickerConfig.type === "material" ? "Add Material Category" :
          pickerConfig.type === "team" ? "Add Role Group" : "Add Tax Type"
        }
        placeholder={
          pickerConfig.type === "material" ? "Pick a category for this material group" :
          pickerConfig.type === "team" ? "Pick a role for this team group" : "Pick a tax type"
        }
      />

      {/* ── Print Dialog ────────────────────────────────────────────────── */}
      <BillingPrintDialog open={printOpen} onOpenChange={setPrintOpen} billingVars={billingVars} billingData={billingData} />
    </div>
  );
}
