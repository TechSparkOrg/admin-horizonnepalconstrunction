"use client";

import { Plus, Trash2, Printer, FileText, Eye, Building2, Users, Banknote, Pencil, Download } from "lucide-react";
import { useState, useMemo, useRef } from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { TemplateAdmin } from "@/api/services/template.service";
import type { BillingFormData, BillingMaterialEntry, BillingTeamEntry, MaterialGroup, TeamGroup, TaxEntry } from "@/api/types/billing.types";
import type { MaterialItem } from "@/api/types/material-list.types";
import type { StaffMemberListItem } from "@/api/types/staff.types";
import type { ProjectListItem, Project } from "@/api/types/project.types";
import type { TemplateItem } from "@/api/types/template.types";
import type { AttributeItem } from "@/api/types/attribute.types";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import { X } from "lucide-react";

function genId() { return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`; }

// Allows empty string while typing; commits number on blur
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

interface Props {
  form: BillingFormData;
  editingId: string | null;
  saving: boolean;
  materials: MaterialItem[];
  teamMembers: StaffMemberListItem[];
  projects: ProjectListItem[];
  projectDetail?: Project;
  attributes: AttributeItem[];
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

function formatCurrency(n: number) {
  if (n >= 10000000) return `Rs ${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `Rs ${(n / 100000).toFixed(2)} L`;
  return `Rs ${n.toLocaleString("en-IN")}`;
}

function materialTotal(entries: BillingMaterialEntry[]) {
  return entries.reduce((s, e) => s + e.price * e.quantity, 0);
}

function teamTotal(entries: BillingTeamEntry[]) {
  return entries.reduce((s, e) => s + e.price * e.hours_per_day * e.days, 0);
}

function flattenAttributeValues(attributes: AttributeItem[]): { label: string; values: string[] }[] {
  return attributes.flatMap((a) => {
    const groups = a.values.filter((v) => v.values.length > 0);
    if (groups.length === 0) return [];
    return groups.map((g) => ({
      label: g.label || a.title,
      values: g.values,
    }));
  });
}

// ─── Attribute Value Picker Dialog (reused for materials, team, taxes) ───────
interface PickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (value: string) => void;
  attributes: AttributeItem[];
  title: string;
  placeholder: string;
}

function AttributeValuePickerDialog({ open, onOpenChange, onConfirm, attributes, title, placeholder }: PickerDialogProps) {
  const attrGroups = useMemo(() => flattenAttributeValues(attributes), [attributes]);
  const [selectedLabel, setSelectedLabel] = useState("");
  const [selectedValue, setSelectedValue] = useState("");

  const currentValues = useMemo(() => {
    const group = attrGroups.find((g) => g.label === selectedLabel);
    return group?.values ?? [];
  }, [attrGroups, selectedLabel]);

  const handleConfirm = () => {
    if (!selectedValue) {
      toast.error("Pick a value first");
      return;
    }
    onConfirm(selectedValue);
    setSelectedLabel("");
    setSelectedValue("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { setSelectedLabel(""); setSelectedValue(""); } onOpenChange(o); }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{placeholder}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">Label</Label>
            <SearchableSelect
              options={attrGroups.map((g) => ({ value: g.label, label: g.label }))}
              value={selectedLabel}
              onChange={(v) => { setSelectedLabel(v); setSelectedValue(""); }}
              placeholder="Choose a label..."
              searchPlaceholder="Search labels..."
            />
          </div>
          {selectedLabel && (
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">Value</Label>
              <SearchableSelect
                options={currentValues.map((v) => ({ value: v, label: v }))}
                value={selectedValue}
                onChange={setSelectedValue}
                placeholder="Choose a value..."
                searchPlaceholder="Search values..."
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="default" size="sm" onClick={handleConfirm}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Print / Export Dialog ───────────────────────────────────────────────────
type BillingDataPayload = {
  materials: Array<{ name: string; variant: string; price: number; qty: number; total: number; group: string }>;
  team: Array<{ name: string; role: string; rate: number; hours: number; days: number; total: number; group: string }>;
  taxes: Array<{ label: string; rate_display: string; type: string; amount: number }>;
};

interface PrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  billingVars: Record<string, string>;
  billingData: BillingDataPayload;
}

function PrintExportDialog({ open, onOpenChange, billingVars, billingData }: PrintDialogProps) {
  const [printTemplateId, setPrintTemplateId] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: printTemplates = [] } = useQuery({
    queryKey: queryKeys.templates.list({}),
    queryFn: async () => (await TemplateAdmin.search({})).results ?? [],
    enabled: open,
    staleTime: 60000,
  });

  const triggerPrint = async () => {
    if (!printTemplateId) { toast.error("Select a template first"); return; }
    setLoading(true);
    try {
      const html = await TemplateAdmin.previewHtml(printTemplateId, billingVars, billingData);
      const iframe = document.createElement("iframe");
      iframe.style.cssText = "position:fixed;top:0;left:-100vw;width:210mm;height:297mm;border:0;visibility:hidden";
      document.body.appendChild(iframe);
      iframe.onload = () => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 2000);
      };
      iframe.srcdoc = html;
    } catch {
      toast.error("Failed to generate preview");
    } finally {
      setLoading(false);
    }
  };

  const selectedTemplate = printTemplates.find((t) => t.id === printTemplateId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Export as PDF</DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Choose a template — billing values and tables will be injected automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-700">Template</Label>
            <SearchableSelect
              options={printTemplates.map((t) => ({ value: t.id, label: t.title }))}
              value={printTemplateId}
              onChange={setPrintTemplateId}
              placeholder="Select a template..."
              searchPlaceholder="Search templates..."
            />
            {selectedTemplate && (
              <p className="text-[11px] text-gray-400">{selectedTemplate.attribute_name}</p>
            )}
          </div>

          <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 space-y-2">
            <p className="text-[11px] font-semibold text-gray-600">Available tokens</p>
            <div>
              <p className="text-[10px] text-gray-400 mb-1">Tables (full auto-generated)</p>
              <div className="flex flex-wrap gap-1">
                {["materials_table", "team_table", "taxes_table"].map((k) => (
                  <span key={k} className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-mono">{`{${k}}`}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 mb-1">Row tokens — place in a <code className="bg-gray-200 px-0.5 rounded">{"<td>"}</code>, row repeats per entry</p>
              <div className="flex flex-wrap gap-1">
                {[
                  "materials.name","materials.variant","materials.price","materials.qty","materials.total","materials.group",
                  "team.name","team.role","team.rate","team.hours","team.days","team.total","team.group",
                  "taxes.label","taxes.rate_display","taxes.type","taxes.amount",
                ].map((k) => (
                  <span key={k} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono">{`{${k}}`}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 mb-1">Values</p>
              <div className="flex flex-wrap gap-1">
                {Object.keys(billingVars).map((k) => (
                  <span key={k} className="text-[10px] px-1.5 py-0.5 rounded bg-sidebar-primary/10 text-sidebar-primary font-mono">{`{${k}}`}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" onClick={triggerPrint} disabled={!printTemplateId || loading}
            className="bg-sidebar-primary hover:bg-sidebar-primary/90 gap-1.5">
            {loading ? (
              <><FileText className="size-3.5 animate-pulse" /> Generating…</>
            ) : (
              <><Download className="size-3.5" /> Download PDF</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function BillingForm({
  form, editingId, saving, materials, teamMembers, projects, projectDetail, attributes,
  materialGroups, teamGroups, taxes,
  onMaterialGroupsChange, onTeamGroupsChange, onTaxesChange,
  onChange, onSave, onBack,
}: Props) {
  const [printOpen, setPrintOpen] = useState(false);
  const [pickerConfig, setPickerConfig] = useState<{
    type: "material" | "team" | "tax";
    open: boolean;
  }>({ type: "material", open: false });

  const clients = projectDetail?.clients ?? [];
  const contractValue = clients.reduce((sum, c) => sum + (c.contract_value || 0), 0);
  const materialsGrand = materialGroups.reduce((s, g) => s + materialTotal(g.entries), 0);
  const teamGrand = teamGroups.reduce((s, g) => s + teamTotal(g.entries), 0);
  const taxTotal = taxes.reduce((s, t) => {
    const amt = t.tax_type === "fixed" ? t.rate : (materialsGrand + teamGrand) * t.rate / 100;
    return s + amt;
  }, 0);
  const grandTotal = materialsGrand + teamGrand + taxTotal;
  const balance = contractValue - materialsGrand - teamGrand;
  const selectedProject = useMemo(() => projects.find((p) => p.id === form.project_id) ?? null, [form.project_id, projects]);

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
    ...Object.fromEntries(
      materialGroups.map((g) => [`mat_${g.groupLabel.toLowerCase().replace(/\W+/g, "_")}`, formatCurrency(materialTotal(g.entries))])
    ),
    ...Object.fromEntries(
      teamGroups.map((g) => [`team_${g.groupLabel.toLowerCase().replace(/\W+/g, "_")}`, formatCurrency(teamTotal(g.entries))])
    ),
    ...Object.fromEntries(
      taxes.map((t) => {
        const amt = t.tax_type === "fixed" ? t.rate : (materialsGrand + teamGrand) * t.rate / 100;
        return [`tax_${t.label.toLowerCase().replace(/\W+/g, "_")}`, formatCurrency(amt)];
      })
    ),
  }), [form.title, selectedProject, materialsGrand, teamGrand, taxTotal, grandTotal, contractValue, balance, materialGroups, teamGroups, taxes]);

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
      const amt = t.tax_type === "fixed" ? t.rate : (materialsGrand + teamGrand) * t.rate / 100;
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

  const [roleEditTarget, setRoleEditTarget] = useState<{ groupId: string; entryId: string } | null>(null);

  const handlePickerConfirm = (value: string) => {
    if (pickerConfig.type === "material") {
      onMaterialGroupsChange([
        ...materialGroups,
        { id: genId(), groupLabel: value, entries: [] },
      ]);
    } else if (pickerConfig.type === "team") {
      onTeamGroupsChange([
        ...teamGroups,
        { id: genId(), groupLabel: value, entries: [] },
      ]);
    } else if (pickerConfig.type === "tax") {
      onTaxesChange([
        ...taxes,
        { id: genId(), label: value, rate: 0, tax_type: "percent" },
      ]);
    }
  };

  // ── Material group helpers ──────────────────────────────────────────────────
  const addMaterialEntry = (groupId: string) => {
    onMaterialGroupsChange(materialGroups.map((g) =>
      g.id === groupId
        ? { ...g, entries: [...g.entries, { id: genId(), material_id: "", material_name: "", variant_id: "", variant_name: "", price: 0, quantity: 1, total: 0 }] }
        : g
    ));
  };

  const updateMaterialEntry = (groupId: string, entryId: string, field: string, value: string | number) => {
    onMaterialGroupsChange(materialGroups.map((g) =>
      g.id !== groupId ? g : {
        ...g,
        entries: g.entries.map((e) => {
          if (e.id !== entryId) return e;
          const updated = { ...e, [field]: value };
          if (field === "material_id") {
            const mat = materials.find((m) => m.id === value);
            if (mat) {
              updated.material_name = mat.name;
              updated.price = mat.price_per_unit;
              updated.variant_id = "";
              updated.variant_name = "";
            }
          }
          if (field === "variant_id") {
            const mat = materials.find((m) => m.id === e.material_id);
            if (mat) {
              const variant = mat.variants.find((v) => v.id === value);
              if (variant) {
                updated.variant_name = variant.market_name;
                updated.price = variant.price;
              }
            }
          }
          if (field === "price" || field === "quantity") {
            updated.total = Number(updated.price) * Number(updated.quantity);
          }
          return updated;
        }),
      }
    ));
  };

  const removeMaterialEntry = (groupId: string, entryId: string) => {
    onMaterialGroupsChange(materialGroups.map((g) =>
      g.id !== groupId ? g : { ...g, entries: g.entries.filter((e) => e.id !== entryId) }
    ));
  };

  const removeMaterialGroup = (groupId: string) => {
    onMaterialGroupsChange(materialGroups.filter((g) => g.id !== groupId));
  };

  // ── Team group helpers ──────────────────────────────────────────────────────
  const addTeamEntry = (groupId: string) => {
    onTeamGroupsChange(teamGroups.map((g) =>
      g.id === groupId
        ? { ...g, entries: [...g.entries, { id: genId(), staff_member_id: "", member_name: "", role: "", price: 0, hours_per_day: 8, days: 1, total: 0 }] }
        : g
    ));
  };

  const updateTeamEntry = (groupId: string, entryId: string, field: string, value: string | number) => {
    onTeamGroupsChange(teamGroups.map((g) =>
      g.id !== groupId ? g : {
        ...g,
        entries: g.entries.map((e) => {
          if (e.id !== entryId) return e;
          const updated = { ...e, [field]: value };
          if (field === "staff_member_id") {
            const member = teamMembers.find((m) => m.id === value);
            if (member) {
              updated.member_name = member.name;
              updated.role = member.designation || "";
            }
          }
          if (field === "price" || field === "hours_per_day" || field === "days") {
            updated.total = Number(updated.price) * Number(updated.hours_per_day) * Number(updated.days);
          }
          return updated;
        }),
      }
    ));
  };

  const removeTeamEntry = (groupId: string, entryId: string) => {
    onTeamGroupsChange(teamGroups.map((g) =>
      g.id !== groupId ? g : { ...g, entries: g.entries.filter((e) => e.id !== entryId) }
    ));
  };

  const removeTeamGroup = (groupId: string) => {
    onTeamGroupsChange(teamGroups.filter((g) => g.id !== groupId));
  };

  // ── Tax helpers ─────────────────────────────────────────────────────────────
  const updateTax = (id: string, field: "label" | "rate" | "tax_type", value: string | number) => {
    onTaxesChange(taxes.map((t) => t.id === id ? { ...t, [field]: value } : t));
  };

  const removeTax = (id: string) => {
    onTaxesChange(taxes.filter((t) => t.id !== id));
  };

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
                    options={projects.map((p) => ({ value: p.id, label: p.title }))}
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

            {/* ── Billing Summary ──────────────────────────── */}
            {(materialsGrand > 0 || teamGrand > 0 || taxTotal > 0) && (
              <FormCard>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Billing Summary</p>
                <div className="space-y-0">
                  {/* Material group subtotals */}
                  {materialGroups.filter((g) => materialTotal(g.entries) > 0).map((g) => (
                    <div key={g.id} className="flex justify-between items-center py-1.5">
                      <span className="text-xs text-gray-500 flex items-center gap-1.5">
                        <Building2 className="size-3 text-gray-300" />{g.groupLabel}
                      </span>
                      <span className="text-xs font-medium text-gray-700">{formatCurrency(materialTotal(g.entries))}</span>
                    </div>
                  ))}
                  {materialsGrand > 0 && (
                    <div className="flex justify-between items-center py-1.5 border-t border-gray-100">
                      <span className="text-sm font-semibold text-gray-800">Materials Total</span>
                      <span className="text-sm font-bold text-gray-900">{formatCurrency(materialsGrand)}</span>
                    </div>
                  )}
                  {/* Team group subtotals */}
                  {teamGroups.filter((g) => teamTotal(g.entries) > 0).map((g) => (
                    <div key={g.id} className="flex justify-between items-center py-1.5">
                      <span className="text-xs text-gray-500 flex items-center gap-1.5">
                        <Users className="size-3 text-gray-300" />{g.groupLabel}
                      </span>
                      <span className="text-xs font-medium text-gray-700">{formatCurrency(teamTotal(g.entries))}</span>
                    </div>
                  ))}
                  {teamGrand > 0 && (
                    <div className="flex justify-between items-center py-1.5 border-t border-gray-100">
                      <span className="text-sm font-semibold text-gray-800">Team Total</span>
                      <span className="text-sm font-bold text-gray-900">{formatCurrency(teamGrand)}</span>
                    </div>
                  )}
                  {/* Individual taxes */}
                  {taxes.map((t) => {
                    const amt = t.tax_type === "fixed" ? t.rate : (materialsGrand + teamGrand) * t.rate / 100;
                    if (amt === 0) return null;
                    return (
                      <div key={t.id} className="flex justify-between items-center py-1.5">
                        <span className="text-xs text-gray-500 flex items-center gap-1.5">
                          <Banknote className="size-3 text-gray-300" />
                          {t.label} {t.tax_type === "fixed" ? "(Fixed)" : `(${t.rate}%)`}
                        </span>
                        <span className="text-xs font-medium text-gray-700">{formatCurrency(amt)}</span>
                      </div>
                    );
                  })}
                  {taxTotal > 0 && (
                    <div className="flex justify-between items-center py-1.5 border-t border-gray-100">
                      <span className="text-sm font-semibold text-gray-800">Tax Total</span>
                      <span className="text-sm font-bold text-gray-900">{formatCurrency(taxTotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-3 border-t-2 border-gray-200">
                    <span className="text-base font-bold text-gray-900">Grand Total</span>
                    <span className="text-base font-bold text-gray-900">{formatCurrency(grandTotal)}</span>
                  </div>
                  {contractValue > 0 && (
                    <div className={`flex justify-between items-center px-3 py-2 rounded-lg mt-1 ${balance >= 0 ? "bg-green-50" : "bg-red-50"}`}>
                      <div>
                        <p className={`text-xs font-semibold ${balance >= 0 ? "text-green-700" : "text-red-700"}`}>
                          Budget {balance >= 0 ? "Surplus" : "Deficit"}
                        </p>
                        <p className="text-[10px] text-gray-400">Contract: {formatCurrency(contractValue)} − Costs: {formatCurrency(grandTotal)}</p>
                      </div>
                      <span className={`text-sm font-bold ${balance >= 0 ? "text-green-700" : "text-red-700"}`}>
                        {formatCurrency(Math.abs(balance))}
                      </span>
                    </div>
                  )}
                </div>
              </FormCard>
            )}

            {/* ── Template Token Reference ──────────────────── */}
            <FormCard>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Template Tokens</p>
              <p className="text-xs text-gray-400 mb-3">Use these in billing templates — values update live as you fill in data.</p>
              <div className="space-y-3">
                {/* Table block tokens */}
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Tables — auto-generated full tables</p>
                  <p className="text-[10px] text-gray-400 mb-1.5">Place once in template; backend renders all rows with headers, subtotals, and pagination.</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { k: "materials_table", label: "All material rows" },
                      { k: "team_table", label: "All team entries" },
                      { k: "taxes_table", label: "All tax rows" },
                    ].map(({ k, label }) => (
                      <span key={k} title={label} className="text-[11px] px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-mono">{`{${k}}`}</span>
                    ))}
                  </div>
                </div>
                {/* Row template tokens */}
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Row Template Tokens</p>
                  <p className="text-[10px] text-gray-400 mb-1.5">Design your own table in the template editor. Place these in a <code className="bg-gray-100 px-0.5 rounded">{"<td>"}</code> — the row auto-repeats for each entry.</p>
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap gap-1">
                      {["materials.name","materials.variant","materials.price","materials.qty","materials.total","materials.group"].map((k) => (
                        <span key={k} className="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 font-mono">{`{${k}}`}</span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {["team.name","team.role","team.rate","team.hours","team.days","team.total","team.group"].map((k) => (
                        <span key={k} className="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 font-mono">{`{${k}}`}</span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {["taxes.label","taxes.rate_display","taxes.type","taxes.amount"].map((k) => (
                        <span key={k} className="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 font-mono">{`{${k}}`}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Basic</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(["title", "project", "balance_status"] as const).map((k) => (
                      <span key={k} className="text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-mono">{`{${k}}`}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Financials</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(["materials_total", "team_total", "tax_total", "grand_total", "contract_value", "balance"] as const).map((k) => (
                      <span key={k} className="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono">{`{${k}}`}</span>
                    ))}
                  </div>
                </div>
                {materialGroups.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Materials by Group</p>
                    <div className="flex flex-wrap gap-1.5">
                      {materialGroups.map((g) => {
                        const k = `mat_${g.groupLabel.toLowerCase().replace(/\W+/g, "_")}`;
                        return <span key={k} className="text-[11px] px-2 py-0.5 rounded bg-green-50 text-green-700 font-mono">{`{${k}}`}</span>;
                      })}
                    </div>
                  </div>
                )}
                {teamGroups.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Team by Group</p>
                    <div className="flex flex-wrap gap-1.5">
                      {teamGroups.map((g) => {
                        const k = `team_${g.groupLabel.toLowerCase().replace(/\W+/g, "_")}`;
                        return <span key={k} className="text-[11px] px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-mono">{`{${k}}`}</span>;
                      })}
                    </div>
                  </div>
                )}
                {taxes.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Taxes</p>
                    <div className="flex flex-wrap gap-1.5">
                      {taxes.map((t) => {
                        const k = `tax_${t.label.toLowerCase().replace(/\W+/g, "_")}`;
                        return <span key={k} className="text-[11px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-mono">{`{${k}}`}</span>;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </FormCard>
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
                <div className="rounded-lg border border-dashed border-gray-200 py-10 flex flex-col items-center justify-center gap-2 text-gray-500">
                  <span className="text-sm">No categories yet. Add one to start.</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {materialGroups.map((group) => {
                    const subTotal = materialTotal(group.entries);
                    return (
                      <div key={group.id} className="rounded-lg border border-gray-200 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
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
                                  const selectedMaterial = materials.find((m) => m.id === entry.material_id);
                                  const variants = selectedMaterial?.variants ?? [];
                                  return (
                                    <TableRow key={entry.id} className="border-gray-100 hover:bg-gray-50">
                                      <TableCell>
                                        <SearchableSelect
                                          options={materials.map((m) => ({ value: m.id, label: m.name }))}
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
                        <div className="flex justify-end px-4 py-2 bg-gray-50 border-t border-gray-200">
                          <p className="text-sm font-semibold text-gray-900">Subtotal: {formatCurrency(subTotal)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {materialGroups.length > 0 && (
                <div className="flex justify-end pt-4 border-t border-gray-200 mt-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Materials Grand Total</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(materialsGrand)}</p>
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
                <div className="rounded-lg border border-dashed border-gray-200 py-10 flex flex-col items-center justify-center gap-2 text-gray-500">
                  <span className="text-sm">No role groups yet. Add one to start.</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {teamGroups.map((group) => {
                    const subTotal = teamTotal(group.entries);
                    return (
                      <div key={group.id} className="rounded-lg border border-gray-200 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
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
                                        options={teamMembers.map((m) => ({ value: m.id, label: m.name }))}
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
                                              options={allRoleValues.map((v) => ({ value: v, label: v }))}
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
                        <div className="flex justify-end px-4 py-2 bg-gray-50 border-t border-gray-200">
                          <p className="text-sm font-semibold text-gray-900">Subtotal: {formatCurrency(subTotal)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {teamGroups.length > 0 && (
                <div className="flex justify-end pt-4 border-t border-gray-200 mt-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Team Grand Total</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(teamGrand)}</p>
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
                <div className="rounded-lg border border-dashed border-gray-200 py-10 flex flex-col items-center justify-center gap-2 text-gray-500">
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
                <div className="flex justify-end pt-4 border-t border-gray-200 mt-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Total Taxes</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(taxTotal)}</p>
                  </div>
                </div>
              )}
            </FormCard>
          </TabsContent>
        </div>
      </Tabs>

      {/* ── Grand Total ─────────────────────────────────────────────────── */}
      {(materialsGrand > 0 || teamGrand > 0 || taxTotal > 0) && (
        <div className="mt-6 border-t border-gray-200 pt-4">
          <div className="flex justify-end">
            <div className="text-right space-y-1">
              {materialsGrand > 0 && <p className="text-xs text-gray-500">Materials: {formatCurrency(materialsGrand)}</p>}
              {teamGrand > 0 && <p className="text-xs text-gray-500">Team: {formatCurrency(teamGrand)}</p>}
              {taxTotal > 0 && <p className="text-xs text-gray-500">Taxes: {formatCurrency(taxTotal)}</p>}
              <p className="text-xl font-bold text-gray-900 mt-1">Grand Total: {formatCurrency(grandTotal)}</p>
              {contractValue > 0 && (
                <p className={`text-xs font-medium ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                  Budget Balance: {balance >= 0 ? "Surplus" : "Deficit"} of {formatCurrency(Math.abs(balance))}
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
      <PrintExportDialog open={printOpen} onOpenChange={setPrintOpen} billingVars={billingVars} billingData={billingData} />
    </div>
  );
}
