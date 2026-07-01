"use client";

import { Eye, Plus, Trash2, Upload, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FormHeader } from "@/components/global_ui/form-header";
import { FormTabs } from "@/components/global_ui/form-tabs";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichEditor } from "@/components/page_ui/rich-editor";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { SeoFields } from "@/components/global_ui/seo-fields";
import { MediaPickerDialog } from "@/components/global_ui/media-handler-picker";
import type { PickerMediaItem } from "@/components/global_ui/media-handler-picker";
import Image from "next/image";
import type { BilingualPair } from "@/api/types/building-permit.types";
import type { BuildingPermit } from "@/api/types/building-permit.types";

interface DocItem {
  name: string;
  imageUrl: string;
}

interface WorkflowStep {
  name: string;
  description: BilingualPair;
  duration: string;
  requiredDocs: DocItem[];
}

interface RegulationListItem {
  name: string;
  items: BilingualPair[];
}

interface MunicipalityItem {
  district: string;
  phone: string;
  location: string;
}

interface BannerItem {
  url: string;
  name: string;
}

interface BuildingPermitFormData {
  title: string;
  slug: string;
  isActive: boolean;
  workflowSteps: WorkflowStep[];
  regulationItems: RegulationListItem[];
  municipalityItems: MunicipalityItem[];
  banners: BannerItem[];
  metaTitle: string;
  metaKeywords: string;
  metaDescription: string;
}

interface Props {
  form: BuildingPermitFormData;
  editingId: string | null;
  saving: boolean;
  onChange: (key: string, value: unknown) => void;
  onSave: () => void;
  onBack: () => void;
}

const EMPTY_PAIR = (): BilingualPair => ({ en: "", np: "" });

const EMPTY_STEP = (): WorkflowStep => ({
  name: "",
  description: { en: "", np: "" },
  duration: "",
  requiredDocs: [],
});

const EMPTY: BuildingPermitFormData = {
  title: "",
  slug: "",
  isActive: true,
  workflowSteps: [],
  regulationItems: [],
  municipalityItems: [],
  banners: [],
  metaTitle: "",
  metaKeywords: "",
  metaDescription: "",
};

export { EMPTY, EMPTY_STEP };
export type { BuildingPermitFormData, WorkflowStep };

// ─── Shared: String List Editor ──────────────────────────────

function StringListEditor({ items = [], onChange, label, placeholder }: {
  items?: string[];
  onChange: (items: string[]) => void;
  label: string;
  placeholder?: string;
}) {
  const safeItems = items ?? [];
  const add = () => onChange([...safeItems, ""]);
  const remove = (i: number) => onChange(safeItems.filter((_, idx) => idx !== i));
  const update = (i: number, value: string) => {
    onChange(safeItems.map((item, idx) => (idx === i ? value : item)));
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-gray-900">{label}</p>
      {safeItems.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 py-6 flex items-center justify-center text-sm text-gray-400">No items added yet</div>
      ) : (
        <div className="space-y-2">
          {safeItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input value={item} onChange={(e) => update(i, e.target.value)} placeholder={placeholder || `Item ${i + 1}`} className="text-sm flex-1" />
              <Button type="button" variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50 h-9 w-9 p-0 shrink-0" onClick={() => remove(i)}>
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
      <Button type="button" variant="outline" size="sm" onClick={add} className="w-full">
        <Plus className="size-4" /> Add {placeholder || "item"}
      </Button>
    </div>
  );
}

// ─── Shared: Bilingual List Editor ───────────────────────────

function BilingualListEditor({ items, onChange, label }: {
  items: BilingualPair[];
  onChange: (items: BilingualPair[]) => void;
  label: string;
}) {
  const add = () => onChange([...items, EMPTY_PAIR()]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i: number, field: "en" | "np", value: string) => {
    onChange(items.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus className="size-4" /> Add
        </Button>
      </div>
      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 py-8 flex items-center justify-center text-sm text-gray-400">No items added yet</div>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Item {i + 1}</span>
                <Button type="button" variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50 h-7" onClick={() => remove(i)}>
                  <Trash2 className="size-3" />
                </Button>
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-gray-500">English</Label>
                <Textarea value={item.en} onChange={(e) => update(i, "en", e.target.value)} placeholder="English text" rows={2} className="text-sm resize-none" />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-gray-500">नेपाली</Label>
                <Textarea value={item.np} onChange={(e) => update(i, "np", e.target.value)} placeholder="नेपाली पाठ" rows={2} className="text-sm resize-none" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Workflow Content ────────────────────────────────────────

function WorkflowStepsEditor({ items, onChange }: {
  items: WorkflowStep[];
  onChange: (items: WorkflowStep[]) => void;
}) {
  const add = () => onChange([...items, EMPTY_STEP()]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const update = <K extends keyof WorkflowStep>(i: number, field: K, value: WorkflowStep[K]) => {
    onChange(items.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900">Workflow Steps</p>
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus className="size-4" /> Add Step
        </Button>
      </div>
      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 py-8 flex items-center justify-center text-sm text-gray-400">No steps added yet</div>
      ) : (
        <div className="space-y-4">
          {items.map((step, i) => (
            <StepCard key={i} step={step} index={i} onUpdate={update} onRemove={remove} />
          ))}
        </div>
      )}
    </div>
  );
}

function StepCard({ step, index, onUpdate, onRemove }: {
  step: WorkflowStep;
  index: number;
  onUpdate: <K extends keyof WorkflowStep>(i: number, field: K, value: WorkflowStep[K]) => void;
  onRemove: (i: number) => void;
}) {
  const i = index;

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Step {i + 1}</span>
        <Button type="button" variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50 h-7" onClick={() => onRemove(i)}>
          <Trash2 className="size-3" />
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">Name</Label>
          <Input value={step.name} onChange={(e) => onUpdate(i, "name", e.target.value)} placeholder="e.g. Submit Application" className="text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">Duration</Label>
          <Input value={step.duration} onChange={(e) => onUpdate(i, "duration", e.target.value)} placeholder="e.g. 2-3 weeks" className="text-sm" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-[11px] text-gray-500">Description (English)</Label>
          <RichEditor value={step.description.en} onChange={(html) => onUpdate(i, "description", { ...step.description, en: html })} minHeight={100} />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] text-gray-500">Description (नेपाली)</Label>
          <Textarea value={step.description.np} onChange={(e) => onUpdate(i, "description", { ...step.description, np: e.target.value })} placeholder="नेपाली विवरण" rows={3} className="text-sm resize-none" />
        </div>
      </div>
      <RequiredDocsEditor
        items={step.requiredDocs}
        onChange={(docs) => onUpdate(i, "requiredDocs", docs)}
      />
    </div>
  );
}

function RequiredDocsEditor({ items, onChange }: {
  items: DocItem[];
  onChange: (items: DocItem[]) => void;
}) {
  const add = () => onChange([...items, { name: "", imageUrl: "" }]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-gray-900">Required Documents</p>
      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 py-6 flex items-center justify-center text-sm text-gray-400">No documents added yet</div>
      ) : (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Name</TableHead>
                <TableHead className="w-28">Preview</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((doc, i) => (
                <RequiredDocRow key={i} doc={doc} index={i} items={items} onChange={onChange} onRemove={remove} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <Button type="button" variant="outline" size="sm" onClick={add} className="w-full">
        <Plus className="size-4" /> Add Document
      </Button>
    </div>
  );
}

function RequiredDocRow({ doc, index, items, onChange, onRemove }: {
  doc: DocItem;
  index: number;
  items: DocItem[];
  onChange: (items: DocItem[]) => void;
  onRemove: (i: number) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const update = (field: keyof DocItem, value: string) => {
    onChange(items.map((d, i) => (i === index ? { ...d, [field]: value } : d)));
  };

  return (
    <>
      <TableRow>
        <TableCell>
          <Input value={doc.name} onChange={(e) => update("name", e.target.value)} placeholder="Document name" className="text-sm h-8 max-w-52" />
        </TableCell>
        <TableCell>
          {doc.imageUrl ? (
            <div className="relative size-10 rounded border border-gray-200 overflow-hidden group">
              <Image src={doc.imageUrl} alt="" width={40} height={40} className="size-full object-cover" />
              <button type="button" onClick={() => update("imageUrl", "")}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition grid place-items-center">
                <X className="size-3.5 text-white" />
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => setPickerOpen(true)}
              className="size-10 rounded border border-dashed border-gray-300 grid place-items-center text-gray-400 hover:border-gray-400 transition">
              <Upload className="size-4" />
            </button>
          )}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            {doc.imageUrl && (
              <Button type="button" variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => window.open(doc.imageUrl, "_blank")}>
                <Eye className="size-3.5" />
              </Button>
            )}
            <Button type="button" variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50 h-8 w-8 p-0" onClick={() => onRemove(index)}>
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
      {pickerOpen && (
        <MediaPickerDialog
          open={pickerOpen}
          onOpenChange={(o) => { if (!o) setPickerOpen(false); }}
          mode="image"
          defaultCategory="Images"
          onSelect={(item) => { update("imageUrl", item.url); setPickerOpen(false); }}
        />
      )}
    </>
  );
}

// ─── Regulation Content ──────────────────────────────────────

function RegulationListEditor({ items, onChange }: {
  items: RegulationListItem[];
  onChange: (items: RegulationListItem[]) => void;
}) {
  const add = () => onChange([...items, { name: "", items: [] }]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const updateName = (i: number, name: string) => {
    onChange(items.map((item, idx) => (idx === i ? { ...item, name } : item)));
  };
  const updateSubItems = (i: number, subItems: BilingualPair[]) => {
    onChange(items.map((item, idx) => (idx === i ? { ...item, items: subItems } : item)));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900">Regulation Items</p>
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus className="size-4" /> Add Regulation
        </Button>
      </div>
      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 py-8 flex items-center justify-center text-sm text-gray-400">No regulations added yet</div>
      ) : (
        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Regulation {i + 1}</span>
                <Button type="button" variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50 h-7" onClick={() => remove(i)}>
                  <Trash2 className="size-3" />
                </Button>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">Name</Label>
                <Input value={item.name} onChange={(e) => updateName(i, e.target.value)} placeholder="Regulation name" className="text-sm" />
              </div>
              <BilingualListEditor items={item.items} onChange={(sub) => updateSubItems(i, sub)} label="Sub-items" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Municipality Content ────────────────────────────────────

function MunicipalityListEditor({ items, onChange }: {
  items: MunicipalityItem[];
  onChange: (items: MunicipalityItem[]) => void;
}) {
  const add = () => onChange([...items, { district: "", phone: "", location: "" }]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const update = <K extends keyof MunicipalityItem>(i: number, field: K, value: string) => {
    onChange(items.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900">Municipality Items</p>
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus className="size-4" /> Add Municipality
        </Button>
      </div>
      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 py-8 flex items-center justify-center text-sm text-gray-400">No municipalities added yet</div>
      ) : (
        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Municipality {i + 1}</span>
                <Button type="button" variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50 h-7" onClick={() => remove(i)}>
                  <Trash2 className="size-3" />
                </Button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-500">District</Label>
                  <Input value={item.district} onChange={(e) => update(i, "district", e.target.value)} placeholder="District name" className="text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-500">Phone</Label>
                  <Input value={item.phone} onChange={(e) => update(i, "phone", e.target.value)} placeholder="Phone number" className="text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-500">Location</Label>
                  <Input value={item.location} onChange={(e) => update(i, "location", e.target.value)} placeholder="Location/address" className="text-sm" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Banner Editor ───────────────────────────────────────────

function BannerEditor({ items, onChange }: {
  items: BannerItem[];
  onChange: (items: BannerItem[]) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900">Banner Images</p>
        <Button type="button" variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
          <Plus className="size-4" /> Add Banner
        </Button>
      </div>
      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 py-8 flex items-center justify-center text-sm text-gray-400">No banners added yet</div>
      ) : (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-20">Preview</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((banner, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="relative size-14 rounded border border-gray-200 overflow-hidden">
                      <Image src={banner.url} alt={banner.name} width={56} height={56} className="size-full object-cover" />
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-700">{banner.name || "Banner"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button type="button" variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => window.open(banner.url, "_blank")}>
                        <Eye className="size-3.5" />
                      </Button>
                      <Button type="button" variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50 h-8 w-8 p-0" onClick={() => remove(i)}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {pickerOpen && (
        <MediaPickerDialog
          open={pickerOpen}
          onOpenChange={(o) => { if (!o) setPickerOpen(false); }}
          mode="image"
          defaultCategory="Images"
          onSelect={(item) => {
            onChange([...items, { url: item.url, name: item.name }]);
            setPickerOpen(false);
          }}
        />
      )}
    </div>
  );
}

// ─── Main Form ───────────────────────────────────────────────

export function BuildingPermitForm({ form, editingId, saving, onChange, onSave, onBack }: Props) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div>
      <FormHeader
        breadcrumb="Building Permit"
        title={editingId ? form.title || "Edit Building Permit" : "New Building Permit"}
        onBack={onBack}
        onSave={onSave}
        saving={saving}
        saveDisabled={!form.title.trim() || saving}
        saveLabel={editingId ? "Update" : "Create"}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col">
        <div>
          <FormTabs tabs={[
            { value: "overview", label: "Overview" },
            { value: "workflow", label: "Workflow Content" },
            { value: "regulation", label: "Regulation Content" },
            { value: "municipality", label: "Municipality Content" },
            { value: "banner", label: "Banner" },
            { value: "seo", label: "SEO" },
          ]} />
        </div>

        <div>
          <TabsContent value="overview" className="mt-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Title</Label>
                  <Input value={form.title} onChange={(e) => onChange("title", e.target.value)} placeholder="Item title" />
                </div>
                <div className="space-y-1.5">
                  <Label>Slug</Label>
                  <div className="flex rounded-md border border-gray-200 overflow-hidden">
                    <span className="px-3 flex items-center text-xs text-gray-500 bg-gray-100 border-r border-gray-200 shrink-0">/</span>
                    <Input value={form.slug} onChange={(e) => onChange("slug", e.target.value)} placeholder="item-slug" className="border-0 rounded-none font-mono focus-visible:ring-0" />
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5 w-fit">
                  <button type="button" onClick={() => onChange("isActive", true)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${form.isActive ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-900"}`}>
                    Active
                  </button>
                  <button type="button" onClick={() => onChange("isActive", false)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${!form.isActive ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-900"}`}>
                    Inactive
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="workflow" className="mt-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <WorkflowStepsEditor
                items={form.workflowSteps}
                onChange={(items) => onChange("workflowSteps", items)}
              />
            </div>
          </TabsContent>

          <TabsContent value="regulation" className="mt-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <RegulationListEditor
                items={form.regulationItems}
                onChange={(items) => onChange("regulationItems", items)}
              />
            </div>
          </TabsContent>

          <TabsContent value="municipality" className="mt-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <MunicipalityListEditor
                items={form.municipalityItems}
                onChange={(items) => onChange("municipalityItems", items)}
              />
            </div>
          </TabsContent>

          <TabsContent value="banner" className="mt-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <BannerEditor
                items={form.banners}
                onChange={(items) => onChange("banners", items)}
              />
            </div>
          </TabsContent>

          <TabsContent value="seo" className="mt-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <SeoFields
                metaTitle={form.metaTitle}
                metaDescription={form.metaDescription}
                metaKeywords={form.metaKeywords}
                onChange={onChange}
              />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
