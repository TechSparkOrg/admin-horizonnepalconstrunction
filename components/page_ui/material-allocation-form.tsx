"use client";

import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { StaffMember } from "@/api/types/staff.types";
import type { MaterialItem } from "@/api/types/material-list.types";
import type { Project } from "@/api/types/project.types";
import type { ProjectScopeEntry } from "@/api/types/resource-allocation.types";

interface MaterialAllocationFormData {
  materialId: string;
  toolType: "rent" | "company" | "incharge";
  inchargeMemberId: string;
  location: string;
  isActive: boolean;
  dateTaken: string;
  dateGiven: string;
  expectedReturnDate: string;
  notes: string;
}

interface Props {
  form: MaterialAllocationFormData;
  editingId: string | null;
  saving: boolean;
  materials: MaterialItem[];
  teamMembers: StaffMember[];
  projects: Project[];
  projectScope: ProjectScopeEntry[];
  onProjectScopeChange: (entries: ProjectScopeEntry[]) => void;
  onChange: (key: string, value: string | boolean) => void;
  onSave: () => void;
  onBack: () => void;
}

const EMPTY_SCOPE: ProjectScopeEntry = { id: "", projectId: "", budget: 0, costPer: "day", costAmount: 0, returnDate: "", status: "ongoing" };

function genId() { return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`; }

export type { MaterialAllocationFormData };

const EMPTY_FORM: MaterialAllocationFormData = {
  materialId: "",
  toolType: "rent",
  inchargeMemberId: "",
  location: "",
  isActive: true,
  dateTaken: "",
  dateGiven: "",
  expectedReturnDate: "",
  notes: "",
};

export { EMPTY_FORM };

export function MaterialAllocationForm({
  form, editingId, saving, materials, teamMembers, projects,
  projectScope, onProjectScopeChange,
  onChange, onSave, onBack,
}: Props) {

  const addScope = () => {
    onProjectScopeChange([...projectScope, { ...EMPTY_SCOPE, id: genId() }]);
  };

  const updateScope = (id: string, key: string, value: string | number) => {
    onProjectScopeChange(projectScope.map((e) => e.id === id ? { ...e, [key]: value } : e));
  };

  const removeScope = (id: string) => {
    onProjectScopeChange(projectScope.filter((e) => e.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={onBack}><ArrowLeft className="size-4" /></Button>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Material Allocation</p>
            <h1 className="text-2xl font-bold text-gray-900 leading-none">
              {editingId ? "Edit Allocation" : "New Allocation"}
            </h1>
          </div>
        </div>
        <Button onClick={onSave} disabled={!form.materialId || saving}
          className="bg-[lab(20_23.9_-60.14)] hover:bg-[lab(15_23.9_-60.14)] text-white">
          {saving && <Loader2 className="size-4 animate-spin" />}
          {saving ? "Saving\u2026" : editingId ? "Update" : "Create"}
        </Button>
      </div>

      <Tabs defaultValue="resource" className="w-full flex flex-col">
        <div>
          <TabsList className="bg-gray-100 rounded-lg p-0.5 gap-0 w-auto h-auto">
            <TabsTrigger value="resource" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[lab(20_23.9_-60.14)] data-[state=active]:shadow-sm text-gray-500 px-3 py-1.5 text-xs font-medium">Resource</TabsTrigger>
            <TabsTrigger value="timeline" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[lab(20_23.9_-60.14)] data-[state=active]:shadow-sm text-gray-500 px-3 py-1.5 text-xs font-medium">Timeline</TabsTrigger>
            <TabsTrigger value="scope" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[lab(20_23.9_-60.14)] data-[state=active]:shadow-sm text-gray-500 px-3 py-1.5 text-xs font-medium">Project Scope</TabsTrigger>
            <TabsTrigger value="notes" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[lab(20_23.9_-60.14)] data-[state=active]:shadow-sm text-gray-500 px-3 py-1.5 text-xs font-medium">Notes</TabsTrigger>
          </TabsList>
        </div>

        <div>
          <TabsContent value="resource" className="mt-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5 space-y-4">
                <p className="text-sm font-semibold text-gray-900">Resource Info</p>

                <div className="space-y-1.5">
                  <Label>Material</Label>
                  <Select value={form.materialId} onValueChange={(v) => onChange("materialId", v)}>
                    <SelectTrigger className="max-w-sm">
                      <SelectValue placeholder="Select a material" />
                    </SelectTrigger>
                    <SelectContent>
                      {materials.map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Tool Type</Label>
                  <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5 w-fit">
                    <button type="button" onClick={() => onChange("toolType", "rent")}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                        form.toolType === "rent" ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-900"
                      }`}>Rent</button>
                    <button type="button" onClick={() => onChange("toolType", "company")}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                        form.toolType === "company" ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-900"
                      }`}>Company Tools</button>
                    <button type="button" onClick={() => onChange("toolType", "incharge")}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                        form.toolType === "incharge" ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-900"
                      }`}>Incharge</button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Incharge Team Member</Label>
                  <Select value={form.inchargeMemberId} onValueChange={(v) => onChange("inchargeMemberId", v)}>
                    <SelectTrigger className="max-w-sm">
                      <SelectValue placeholder="Select member" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Location</Label>
                  <Input value={form.location} onChange={(e) => onChange("location", e.target.value)} placeholder="Site location" />
                </div>

                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5 w-fit">
                    <button type="button" onClick={() => onChange("isActive", true)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                        form.isActive ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-900"
                      }`}>Active</button>
                    <button type="button" onClick={() => onChange("isActive", false)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                        !form.isActive ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-900"
                      }`}>Inactive</button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="mt-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5 space-y-4">
                <p className="text-sm font-semibold text-gray-900">Timeline</p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label>Date Taken</Label>
                    <Input type="date" value={form.dateTaken} onChange={(e) => onChange("dateTaken", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Date Given</Label>
                    <Input type="date" value={form.dateGiven} onChange={(e) => onChange("dateGiven", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Expected Return / Next Use</Label>
                    <Input type="date" value={form.expectedReturnDate} onChange={(e) => onChange("expectedReturnDate", e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scope" className="mt-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">Project Scope</p>
                  <Button type="button" variant="outline" size="sm" onClick={addScope}>
                    <Plus className="size-3.5" /> Add Entry
                  </Button>
                </div>

                {projectScope.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-200 py-8 flex flex-col items-center justify-center gap-2 text-gray-500">
                    <span className="text-sm">No project scope entries yet</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {projectScope.map((entry) => (
                      <div key={entry.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-gray-700">Scope Entry</p>
                          <Button type="button" variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50 h-6" onClick={() => removeScope(entry.id)}>
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <Label className="text-[11px] text-gray-500">Project</Label>
                            <Select value={entry.projectId} onValueChange={(v) => updateScope(entry.id, "projectId", v)}>
                              <SelectTrigger className="w-full h-7 text-xs">
                                <SelectValue placeholder="Select project" />
                              </SelectTrigger>
                              <SelectContent>
                                {projects.map((p) => (
                                  <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px] text-gray-500">Budget</Label>
                            <Input type="number" value={entry.budget || ""} onChange={(e) => updateScope(entry.id, "budget", Number(e.target.value))} placeholder="0" className="h-7 text-xs" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px] text-gray-500">Cost Per</Label>
                            <Select value={entry.costPer} onValueChange={(v) => updateScope(entry.id, "costPer", v)}>
                              <SelectTrigger className="w-full h-7 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="day">Day</SelectItem>
                                <SelectItem value="hour">Hour</SelectItem>
                                <SelectItem value="month">Month</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px] text-gray-500">Cost Amount</Label>
                            <Input type="number" value={entry.costAmount || ""} onChange={(e) => updateScope(entry.id, "costAmount", Number(e.target.value))} placeholder="0" className="h-7 text-xs" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px] text-gray-500">Return / Next Use Date</Label>
                            <Input type="date" value={entry.returnDate} onChange={(e) => updateScope(entry.id, "returnDate", e.target.value)} className="h-7 text-xs" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px] text-gray-500">Status</Label>
                            <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5 w-fit h-7">
                              <button type="button" onClick={() => updateScope(entry.id, "status", "ongoing")}
                                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition ${
                                  entry.status === "ongoing" ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500"
                                }`}>Ongoing</button>
                              <button type="button" onClick={() => updateScope(entry.id, "status", "completed")}
                                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition ${
                                  entry.status === "completed" ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500"
                                }`}>Completed</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="mt-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5 space-y-4">
                <p className="text-sm font-semibold text-gray-900">Notes</p>
                <Textarea value={form.notes} onChange={(e) => onChange("notes", e.target.value)}
                  placeholder="Additional remarks or notes about this allocation..." rows={5} />
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
