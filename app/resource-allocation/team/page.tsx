"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { StaffAdmin } from "@/api/services/staff.service";
import { ProjectAdmin } from "@/api/services/project.service";
import type { StaffMember } from "@/api/types/staff.types";
import type { Project } from "@/api/types/project.types";
import type { SalaryEntry, ProjectBasisEntry, ProjectAssignment } from "@/api/types/resource-allocation.types";
import { TeamAllocationForm, EMPTY_FORM } from "@/components/page_ui/team-allocation-form";
import type { TeamAllocationFormData } from "@/components/page_ui/team-allocation-form";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

type View = "list" | "form";

interface AllocationRecord {
  id: string;
  form: TeamAllocationFormData;
  salaryEntries: SalaryEntry[];
  projectBasisEntries: ProjectBasisEntry[];
  projectAssignments: ProjectAssignment[];
}

const ITEMS_PER_PAGE = 10;

export default function TeamAllocationPage() {
  const [records, setRecords] = useState<AllocationRecord[]>([]);
  const [teamMembers, setTeamMembers] = useState<StaffMember[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [view, setView] = useState<View>("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TeamAllocationFormData>(EMPTY_FORM);
  const [salaryEntries, setSalaryEntries] = useState<SalaryEntry[]>([]);
  const [projectBasisEntries, setProjectBasisEntries] = useState<ProjectBasisEntry[]>([]);
  const [projectAssignments, setProjectAssignments] = useState<ProjectAssignment[]>([]);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    Promise.all([
      StaffAdmin.search({}),
      ProjectAdmin.list(),
    ])
      .then(([staffRes, projectRes]) => {
        setTeamMembers(staffRes.results ?? []);
        setProjects(projectRes.results ?? []);
      })
      .catch(() => toast.error("Failed to load data"));
  }, []);

  const openNew = () => {
    setForm(EMPTY_FORM);
    setSalaryEntries([]);
    setProjectBasisEntries([]);
    setProjectAssignments([]);
    setEditingId(null);
    setView("form");
  };

  const openEdit = (record: AllocationRecord) => {
    setForm(record.form);
    setSalaryEntries(record.salaryEntries);
    setProjectBasisEntries(record.projectBasisEntries);
    setProjectAssignments(record.projectAssignments);
    setEditingId(record.id);
    setView("form");
  };

  const back = () => {
    setForm(EMPTY_FORM);
    setSalaryEntries([]);
    setProjectBasisEntries([]);
    setProjectAssignments([]);
    setEditingId(null);
    setView("list");
  };

  const handleChange = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const getMemberName = (id: string) => teamMembers.find((m) => m.id === id)?.name ?? id;
  const getProjectTitle = (id: string) => projects.find((p) => p.id === id)?.title ?? id;

  const save = async () => {
    if (!form.teamMemberId) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        salaryEntries,
        projectBasisEntries,
        projectAssignments,
      };
      console.log("Team allocation payload:", payload);

      if (editingId) {
        setRecords((prev) =>
          prev.map((r) => r.id === editingId ? { ...r, form, salaryEntries, projectBasisEntries, projectAssignments } : r)
        );
        toast.success("Allocation updated");
      } else {
        const newRecord: AllocationRecord = {
          id: crypto.randomUUID?.() ?? `${Date.now()}`,
          form,
          salaryEntries,
          projectBasisEntries,
          projectAssignments,
        };
        setRecords((prev) => [...prev, newRecord]);
        toast.success("Allocation created");
      }
      back();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    toast.success("Allocation deleted");
  };

  const filtered = records.filter((r) =>
    getMemberName(r.form.teamMemberId).toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="px-4">
      {view === "list" ? (
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 leading-none">Team Allocation</h1>
              <p className="text-xs text-gray-500 mt-1">Manage team member allocations</p>
            </div>
            <Button onClick={openNew} className="bg-[lab(20_23.9_-60.14)] hover:bg-[lab(15_23.9_-60.14)] text-white">
              <Plus className="w-4 h-4 mr-2" /> Add Allocation
            </Button>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <InputGroup className="flex-1 max-w-sm h-9">
              <InputGroupAddon align="inline-start">
                <Search className="size-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} placeholder="Search by member name" />
            </InputGroup>
            <p className="text-sm text-[lab(20_23.9_-60.14)] font-medium whitespace-nowrap">
              Total: {filtered.length} {filtered.length === 1 ? "item" : "items"}
            </p>
          </div>

          {paginated.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
              <p className="text-sm font-medium text-gray-900 mb-1">No allocations yet</p>
              <p className="text-sm text-gray-500">Click &quot;Add Allocation&quot; to create one.</p>
            </div>
          ) : (
            <div className="bg-white w-full rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-xs font-semibold text-gray-900 px-4 py-3">Team Member</th>
                    <th className="text-left text-xs font-semibold text-gray-900 px-4 py-3">Pay Type</th>
                    <th className="text-left text-xs font-semibold text-gray-900 px-4 py-3">User Type</th>
                    <th className="text-left text-xs font-semibold text-gray-900 px-4 py-3">Projects</th>
                    <th className="text-left text-xs font-semibold text-gray-900 px-4 py-3">Status</th>
                    <th className="text-right text-xs font-semibold text-gray-900 px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((record) => (
                    <tr key={record.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{getMemberName(record.form.teamMemberId)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                          record.form.payType === "salary" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                        }`}>
                          {record.form.payType === "salary" ? "Salary" : "Project-based"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 capitalize">{record.form.userType}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{record.projectAssignments.length + record.projectBasisEntries.length}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                          record.form.isActive ? "border border-green-200 bg-green-50 text-green-600" : "border border-gray-200 bg-gray-50 text-gray-500"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${record.form.isActive ? "bg-green-500" : "bg-gray-400"}`} />
                          {record.form.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" className="text-[lab(20_23.9_-60.14)] border-[lab(20_23.9_-60.14)]/20" onClick={() => openEdit(record)}>
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => confirmDelete(record.id)}>
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200">
                  <span className="text-sm text-gray-500">{filtered.length} total</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button key={p} onClick={() => setCurrentPage(p)}
                        className={`w-7 h-7 text-xs rounded-md ${p === currentPage ? "bg-[lab(20_23.9_-60.14)] text-white" : "text-gray-600 hover:bg-gray-100"}`}>{p}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <TeamAllocationForm
          form={form}
          editingId={editingId}
          saving={saving}
          teamMembers={teamMembers}
          projects={projects}
          salaryEntries={salaryEntries}
          onSalaryEntriesChange={setSalaryEntries}
          projectBasisEntries={projectBasisEntries}
          onProjectBasisEntriesChange={setProjectBasisEntries}
          projectAssignments={projectAssignments}
          onProjectAssignmentsChange={setProjectAssignments}
          onChange={handleChange}
          onSave={save}
          onBack={back}
        />
      )}
    </div>
  );
}
