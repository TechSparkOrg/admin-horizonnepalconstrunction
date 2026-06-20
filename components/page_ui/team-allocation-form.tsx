"use client";

import { useMemo } from "react";
import { Plus, Trash2, Check, Users, Wifi } from "lucide-react";
import { FormHeader } from "@/components/global_ui/form-header";
import { FormTabs } from "@/components/global_ui/form-tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { StaffMember } from "@/api/types/staff.types";
import type { Project } from "@/api/types/project.types";
import type { SalaryEntry, ProjectBasisEntry, ProjectAssignment } from "@/api/types/resource-allocation.types";

interface TeamAllocationFormData {
  staff_member_id: string;
  user_type: "core" | "remote";
  pay_type: "salary" | "project-based";
  is_active: boolean;
  notes: string;
}

interface Props {
  form: TeamAllocationFormData;
  editingId: string | null;
  saving: boolean;
  teamMembers: StaffMember[];
  projects: Project[];
  salaryEntries: SalaryEntry[];
  onSalaryEntriesChange: (entries: SalaryEntry[]) => void;
  projectBasisEntries: ProjectBasisEntry[];
  onProjectBasisEntriesChange: (entries: ProjectBasisEntry[]) => void;
  projectAssignments: ProjectAssignment[];
  onProjectAssignmentsChange: (entries: ProjectAssignment[]) => void;
  onChange: (key: string, value: string | boolean) => void;
  onSave: () => void;
  onBack: () => void;
}

const EMPTY_SALARY: SalaryEntry = { id: "", amount: 0, effective_date: "", status: "unpaid" };
const EMPTY_PROJECT_BASIS: ProjectBasisEntry = { id: "", project_id: "", budget_plan: 0, payment_condition: "", progress_rate: 0, status: "ongoing", workers_under: 0 };
const EMPTY_ASSIGNMENT: ProjectAssignment = { id: "", project_id: "", status: "ongoing" };

let _tid = 0;
function genId() { return crypto.randomUUID?.() ?? `tid-${++_tid}`; }

export type { TeamAllocationFormData };

const EMPTY_FORM: TeamAllocationFormData = {
  staff_member_id: "",
  user_type: "core",
  pay_type: "salary",
  is_active: true,
  notes: "",
};

export { EMPTY_FORM };

export function TeamAllocationForm({
  form, editingId, saving, teamMembers, projects,
  salaryEntries, onSalaryEntriesChange,
  projectBasisEntries, onProjectBasisEntriesChange,
  projectAssignments, onProjectAssignmentsChange,
  onChange, onSave, onBack,
}: Props) {

  const addSalaryEntry = () => {
    onSalaryEntriesChange([...salaryEntries, { ...EMPTY_SALARY, id: genId() }]);
  };

  const updateSalaryEntry = (id: string, key: string, value: string | number) => {
    onSalaryEntriesChange(salaryEntries.map((e) => e.id === id ? { ...e, [key]: value } : e));
  };

  const removeSalaryEntry = (id: string) => {
    onSalaryEntriesChange(salaryEntries.filter((e) => e.id !== id));
  };

  const addProjectBasisEntry = () => {
    onProjectBasisEntriesChange([...projectBasisEntries, { ...EMPTY_PROJECT_BASIS, id: genId() }]);
  };

  const updateProjectBasisEntry = (id: string, key: string, value: string | number) => {
    onProjectBasisEntriesChange(projectBasisEntries.map((e) => e.id === id ? { ...e, [key]: value } : e));
  };

  const removeProjectBasisEntry = (id: string) => {
    onProjectBasisEntriesChange(projectBasisEntries.filter((e) => e.id !== id));
  };

  const addAssignment = () => {
    onProjectAssignmentsChange([...projectAssignments, { ...EMPTY_ASSIGNMENT, id: genId() }]);
  };

  const updateAssignment = (id: string, key: string, value: string) => {
    onProjectAssignmentsChange(projectAssignments.map((e) => e.id === id ? { ...e, [key]: value } : e));
  };

  const removeAssignment = (id: string) => {
    onProjectAssignmentsChange(projectAssignments.filter((e) => e.id !== id));
  };

  const filteredMembers = useMemo(
    () => teamMembers.filter((m) => m.type === form.user_type),
    [teamMembers, form.user_type]
  );

  const handleUserTypeChange = (type: "core" | "remote") => {
    const currentMember = teamMembers.find((m) => m.id === form.staff_member_id);
    if (currentMember && currentMember.type !== type) {
      onChange("staff_member_id", "");
    }
    onChange("user_type", type);
  };

  return (
    <div>
      <FormHeader
        breadcrumb="Team Allocation"
        title={editingId ? "Edit Allocation" : "New Allocation"}
        onBack={onBack}
        onSave={onSave}
        saving={saving}
        saveDisabled={!form.staff_member_id || saving}
        saveLabel={editingId ? "Update" : "Create"}
      />

      <Tabs defaultValue="member" className="w-full flex flex-col">
        <div>
          <FormTabs tabs={[{"value":"member","label":"Member"},{"value":"compensation","label":"Compensation"},{"value":"assignments","label":"Assignments"},{"value":"notes","label":"Notes"}]} />
        </div>

        <div>
          <TabsContent value="member" className="mt-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5 space-y-5">
                <p className="text-sm font-semibold text-gray-900">Member Info</p>

                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">User Type</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => handleUserTypeChange("core")}
                      className={`relative flex items-center gap-3 p-4 rounded-xl border-2 transition text-left ${
                        form.user_type === "core"
                          ? "border-sidebar-primary bg-sidebar-primary/5"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}>
                      <div className={`size-10 rounded-lg flex items-center justify-center ${
                        form.user_type === "core" ? "bg-sidebar-primary text-white" : "bg-gray-100 text-gray-500"
                      }`}>
                        <Users className="size-5" />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${form.user_type === "core" ? "text-sidebar-primary" : "text-gray-900"}`}>Core Team</p>
                        <p className="text-[11px] text-gray-500">On-site employees</p>
                      </div>
                      {form.user_type === "core" && (
                        <div className="absolute top-2 right-2 size-5 rounded-full bg-sidebar-primary flex items-center justify-center">
                          <Check className="size-3 text-white" />
                        </div>
                      )}
                    </button>

                    <button type="button" onClick={() => handleUserTypeChange("remote")}
                      className={`relative flex items-center gap-3 p-4 rounded-xl border-2 transition text-left ${
                        form.user_type === "remote"
                          ? "border-sidebar-primary bg-sidebar-primary/5"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}>
                      <div className={`size-10 rounded-lg flex items-center justify-center ${
                        form.user_type === "remote" ? "bg-sidebar-primary text-white" : "bg-gray-100 text-gray-500"
                      }`}>
                        <Wifi className="size-5" />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${form.user_type === "remote" ? "text-sidebar-primary" : "text-gray-900"}`}>Remote User</p>
                        <p className="text-[11px] text-gray-500">Off-site workers</p>
                      </div>
                      {form.user_type === "remote" && (
                        <div className="absolute top-2 right-2 size-5 rounded-full bg-sidebar-primary flex items-center justify-center">
                          <Check className="size-3 text-white" />
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Team Member</Label>
                  <Select value={form.staff_member_id} onValueChange={(v) => onChange("staff_member_id", v)}>
                    <SelectTrigger className="max-w-sm">
                      <SelectValue placeholder={`Select ${form.user_type === "core" ? "core" : "remote"} member`} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredMembers.map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-400">{filteredMembers.length} {form.user_type === "core" ? "core" : "remote"} member{filteredMembers.length !== 1 ? "s" : ""} available</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">Pay Type</Label>
                    <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5 w-fit">
                      <button type="button" onClick={() => onChange("pay_type", "salary")}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                          form.pay_type === "salary" ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-900"
                        }`}>Salary</button>
                      <button type="button" onClick={() => onChange("pay_type", "project-based")}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                          form.pay_type === "project-based" ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-900"
                        }`}>Project-based</button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">Status</Label>
                    <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5 w-fit">
                      <button type="button" onClick={() => onChange("is_active", true)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                          form.is_active ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-900"
                        }`}>Active</button>
                      <button type="button" onClick={() => onChange("is_active", false)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                          !form.is_active ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-900"
                        }`}>Inactive</button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compensation" className="mt-4">
            {form.pay_type === "salary" ? (
              <Card className="bg-white border border-gray-200 rounded-xl">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">Salary Entries</p>
                    <Button type="button" variant="outline" size="sm" onClick={addSalaryEntry}>
                      <Plus className="size-3.5" /> Add Entry
                    </Button>
                  </div>

                  {salaryEntries.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-gray-200 py-8 flex flex-col items-center justify-center gap-2 text-gray-500">
                      <span className="text-sm">No salary entries yet</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {salaryEntries.map((entry) => (
                        <div key={entry.id} className="flex items-end gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 flex-wrap">
                          <div className="space-y-1 w-28">
                            <Label className="text-[11px] text-gray-500">Amount</Label>
                            <Input type="number" value={entry.amount || ""} onChange={(e) => updateSalaryEntry(entry.id, "amount", Number(e.target.value))} placeholder="0" className="h-7 text-xs" />
                          </div>
                          <div className="space-y-1 w-36">
                            <Label className="text-[11px] text-gray-500">Effective Date</Label>
                            <Input type="date" value={entry.effective_date} onChange={(e) => updateSalaryEntry(entry.id, "effective_date", e.target.value)} className="h-7 text-xs" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px] text-gray-500">Status</Label>
                            <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5 w-fit h-7">
                              <button type="button" onClick={() => updateSalaryEntry(entry.id, "status", "paid")}
                                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition ${
                                  entry.status === "paid" ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500"
                                }`}>Paid</button>
                              <button type="button" onClick={() => updateSalaryEntry(entry.id, "status", "unpaid")}
                                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition ${
                                  entry.status === "unpaid" ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500"
                                }`}>Unpaid</button>
                            </div>
                          </div>
                          <Button type="button" variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => removeSalaryEntry(entry.id)}>
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white border border-gray-200 rounded-xl">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">Project-Based Entries</p>
                    <Button type="button" variant="outline" size="sm" onClick={addProjectBasisEntry}>
                      <Plus className="size-3.5" /> Add Entry
                    </Button>
                  </div>

                  {projectBasisEntries.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-gray-200 py-8 flex flex-col items-center justify-center gap-2 text-gray-500">
                      <span className="text-sm">No project-based entries yet</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {projectBasisEntries.map((entry) => (
                        <div key={entry.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-gray-700">Entry</p>
                            <Button type="button" variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50 h-6" onClick={() => removeProjectBasisEntry(entry.id)}>
                              <Trash2 className="size-3" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <Label className="text-[11px] text-gray-500">Project</Label>
                              <Select value={entry.project_id} onValueChange={(v) => updateProjectBasisEntry(entry.id, "project_id", v)}>
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
                              <Label className="text-[11px] text-gray-500">Budget Plan</Label>
                              <Input type="number" value={entry.budget_plan || ""} onChange={(e) => updateProjectBasisEntry(entry.id, "budget_plan", Number(e.target.value))} placeholder="0" className="h-7 text-xs" />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[11px] text-gray-500">Progress Rate (%)</Label>
                              <Input type="number" min={0} max={100} value={entry.progress_rate || ""} onChange={(e) => updateProjectBasisEntry(entry.id, "progress_rate", Number(e.target.value))} placeholder="0" className="h-7 text-xs" />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[11px] text-gray-500">Workers Under</Label>
                              <Input type="number" value={entry.workers_under || ""} onChange={(e) => updateProjectBasisEntry(entry.id, "workers_under", Number(e.target.value))} placeholder="0" className="h-7 text-xs" />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[11px] text-gray-500">Status</Label>
                              <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5 w-fit h-7">
                                <button type="button" onClick={() => updateProjectBasisEntry(entry.id, "status", "ongoing")}
                                  className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition ${
                                    entry.status === "ongoing" ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500"
                                  }`}>Ongoing</button>
                                <button type="button" onClick={() => updateProjectBasisEntry(entry.id, "status", "completed")}
                                  className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition ${
                                    entry.status === "completed" ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500"
                                  }`}>Completed</button>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px] text-gray-500">Payment Condition</Label>
                            <Textarea value={entry.payment_condition} onChange={(e) => updateProjectBasisEntry(entry.id, "payment_condition", e.target.value)} placeholder="Describe payment terms..." rows={2} className="text-xs" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="assignments" className="mt-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">Allocated Projects</p>
                  <Button type="button" variant="outline" size="sm" onClick={addAssignment}>
                    <Plus className="size-3.5" /> Add Project
                  </Button>
                </div>

                {projectAssignments.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-200 py-8 flex flex-col items-center justify-center gap-2 text-gray-500">
                    <span className="text-sm">No projects assigned yet</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {projectAssignments.map((a) => (
                      <div key={a.id} className="flex items-end gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 flex-wrap">
                        <div className="space-y-1 min-w-40 flex-1">
                          <Label className="text-[11px] text-gray-500">Project</Label>
                          <Select value={a.project_id} onValueChange={(v) => updateAssignment(a.id, "project_id", v)}>
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
                          <Label className="text-[11px] text-gray-500">Status</Label>
                          <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5 w-fit h-7">
                            <button type="button" onClick={() => updateAssignment(a.id, "status", "ongoing")}
                              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition ${
                                a.status === "ongoing" ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500"
                              }`}>Ongoing</button>
                            <button type="button" onClick={() => updateAssignment(a.id, "status", "completed")}
                              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition ${
                                a.status === "completed" ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500"
                              }`}>Completed</button>
                          </div>
                        </div>
                        <Button type="button" variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => removeAssignment(a.id)}>
                          <Trash2 className="size-3.5" />
                        </Button>
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
