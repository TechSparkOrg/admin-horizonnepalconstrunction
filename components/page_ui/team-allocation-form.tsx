"use client";

import { useMemo } from "react";
import { ArrowLeft, Loader2, Plus, Trash2, Check, Users, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { StaffMember } from "@/api/types/staff.types";
import type { Project } from "@/api/types/project.types";
import type { SalaryEntry, ProjectBasisEntry, ProjectAssignment } from "@/api/types/resource-allocation.types";

interface TeamAllocationFormData {
  teamMemberId: string;
  userType: "core" | "remote";
  payType: "salary" | "project-based";
  isActive: boolean;
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

const EMPTY_SALARY: SalaryEntry = { id: "", amount: 0, effectiveDate: "", status: "unpaid" };
const EMPTY_PROJECT_BASIS: ProjectBasisEntry = { id: "", projectId: "", budgetPlan: 0, paymentCondition: "", progressRate: 0, status: "ongoing", workersUnder: 0 };
const EMPTY_ASSIGNMENT: ProjectAssignment = { id: "", projectId: "", status: "ongoing" };

function genId() { return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`; }

export type { TeamAllocationFormData };

const EMPTY_FORM: TeamAllocationFormData = {
  teamMemberId: "",
  userType: "core",
  payType: "salary",
  isActive: true,
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
    () => teamMembers.filter((m) => m.type === form.userType),
    [teamMembers, form.userType]
  );

  const handleUserTypeChange = (type: "core" | "remote") => {
    const currentMember = teamMembers.find((m) => m.id === form.teamMemberId);
    if (currentMember && currentMember.type !== type) {
      onChange("teamMemberId", "");
    }
    onChange("userType", type);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={onBack}><ArrowLeft className="size-4" /></Button>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Team Allocation</p>
            <h1 className="text-2xl font-bold text-gray-900 leading-none">
              {editingId ? "Edit Allocation" : "New Allocation"}
            </h1>
          </div>
        </div>
        <Button onClick={onSave} disabled={!form.teamMemberId || saving}
          className="bg-[lab(20_23.9_-60.14)] hover:bg-[lab(15_23.9_-60.14)] text-white">
          {saving && <Loader2 className="size-4 animate-spin" />}
          {saving ? "Saving\u2026" : editingId ? "Update" : "Create"}
        </Button>
      </div>

      <Tabs defaultValue="member" className="w-full flex flex-col">
        <div>
          <TabsList className="bg-gray-100 rounded-lg p-0.5 gap-0 w-auto h-auto">
            <TabsTrigger value="member" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[lab(20_23.9_-60.14)] data-[state=active]:shadow-sm text-gray-500 px-3 py-1.5 text-xs font-medium">Member</TabsTrigger>
            <TabsTrigger value="compensation" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[lab(20_23.9_-60.14)] data-[state=active]:shadow-sm text-gray-500 px-3 py-1.5 text-xs font-medium">Compensation</TabsTrigger>
            <TabsTrigger value="assignments" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[lab(20_23.9_-60.14)] data-[state=active]:shadow-sm text-gray-500 px-3 py-1.5 text-xs font-medium">Assignments</TabsTrigger>
            <TabsTrigger value="notes" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[lab(20_23.9_-60.14)] data-[state=active]:shadow-sm text-gray-500 px-3 py-1.5 text-xs font-medium">Notes</TabsTrigger>
          </TabsList>
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
                        form.userType === "core"
                          ? "border-[lab(20_23.9_-60.14)] bg-[lab(20_23.9_-60.14)]/5"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}>
                      <div className={`size-10 rounded-lg flex items-center justify-center ${
                        form.userType === "core" ? "bg-[lab(20_23.9_-60.14)] text-white" : "bg-gray-100 text-gray-500"
                      }`}>
                        <Users className="size-5" />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${form.userType === "core" ? "text-[lab(20_23.9_-60.14)]" : "text-gray-900"}`}>Core Team</p>
                        <p className="text-[11px] text-gray-500">On-site employees</p>
                      </div>
                      {form.userType === "core" && (
                        <div className="absolute top-2 right-2 size-5 rounded-full bg-[lab(20_23.9_-60.14)] flex items-center justify-center">
                          <Check className="size-3 text-white" />
                        </div>
                      )}
                    </button>

                    <button type="button" onClick={() => handleUserTypeChange("remote")}
                      className={`relative flex items-center gap-3 p-4 rounded-xl border-2 transition text-left ${
                        form.userType === "remote"
                          ? "border-[lab(20_23.9_-60.14)] bg-[lab(20_23.9_-60.14)]/5"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}>
                      <div className={`size-10 rounded-lg flex items-center justify-center ${
                        form.userType === "remote" ? "bg-[lab(20_23.9_-60.14)] text-white" : "bg-gray-100 text-gray-500"
                      }`}>
                        <Wifi className="size-5" />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${form.userType === "remote" ? "text-[lab(20_23.9_-60.14)]" : "text-gray-900"}`}>Remote User</p>
                        <p className="text-[11px] text-gray-500">Off-site workers</p>
                      </div>
                      {form.userType === "remote" && (
                        <div className="absolute top-2 right-2 size-5 rounded-full bg-[lab(20_23.9_-60.14)] flex items-center justify-center">
                          <Check className="size-3 text-white" />
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Team Member</Label>
                  <Select value={form.teamMemberId} onValueChange={(v) => onChange("teamMemberId", v)}>
                    <SelectTrigger className="max-w-sm">
                      <SelectValue placeholder={`Select ${form.userType === "core" ? "core" : "remote"} member`} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredMembers.map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-400">{filteredMembers.length} {form.userType === "core" ? "core" : "remote"} member{filteredMembers.length !== 1 ? "s" : ""} available</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">Pay Type</Label>
                    <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5 w-fit">
                      <button type="button" onClick={() => onChange("payType", "salary")}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                          form.payType === "salary" ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-900"
                        }`}>Salary</button>
                      <button type="button" onClick={() => onChange("payType", "project-based")}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                          form.payType === "project-based" ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-900"
                        }`}>Project-based</button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">Status</Label>
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compensation" className="mt-4">
            {form.payType === "salary" ? (
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
                            <Input type="date" value={entry.effectiveDate} onChange={(e) => updateSalaryEntry(entry.id, "effectiveDate", e.target.value)} className="h-7 text-xs" />
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
                              <Select value={entry.projectId} onValueChange={(v) => updateProjectBasisEntry(entry.id, "projectId", v)}>
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
                              <Input type="number" value={entry.budgetPlan || ""} onChange={(e) => updateProjectBasisEntry(entry.id, "budgetPlan", Number(e.target.value))} placeholder="0" className="h-7 text-xs" />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[11px] text-gray-500">Progress Rate (%)</Label>
                              <Input type="number" min={0} max={100} value={entry.progressRate || ""} onChange={(e) => updateProjectBasisEntry(entry.id, "progressRate", Number(e.target.value))} placeholder="0" className="h-7 text-xs" />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[11px] text-gray-500">Workers Under</Label>
                              <Input type="number" value={entry.workersUnder || ""} onChange={(e) => updateProjectBasisEntry(entry.id, "workersUnder", Number(e.target.value))} placeholder="0" className="h-7 text-xs" />
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
                            <Textarea value={entry.paymentCondition} onChange={(e) => updateProjectBasisEntry(entry.id, "paymentCondition", e.target.value)} placeholder="Describe payment terms..." rows={2} className="text-xs" />
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
                          <Select value={a.projectId} onValueChange={(v) => updateAssignment(a.id, "projectId", v)}>
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
