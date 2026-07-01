"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { StaffAdmin } from "@/api/services/staff.service";
import { ProjectAdmin } from "@/api/services/project.service";
import { TeamAllocationAdmin } from "@/api/services/resource-allocation.service";
import type { StaffMember } from "@/api/types/staff.types";
import type { Project } from "@/api/types/project.types";
import type { TeamAllocation, SalaryEntry, ProjectBasisEntry, ProjectAssignment } from "@/api/types/resource-allocation.types";
import dynamic from "next/dynamic";
import type { TeamAllocationFormData } from "@/components/page_ui/team-allocation-form";
const TeamAllocationForm = dynamic(() => import("@/components/page_ui/team-allocation-form").then((m) => m.TeamAllocationForm), { ssr: false });
const EMPTY_FORM: TeamAllocationFormData = { staff_member_id: "", user_type: "core", pay_type: "salary", is_active: true, notes: "" };
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

type View = "list" | "form";

const ITEMS_PER_PAGE = 10;

export function _Client() {
  const [allocations, setAllocations] = useState<TeamAllocation[]>([]);
  const [total, setTotal] = useState(0);
  const [view, setView] = useState<View>("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TeamAllocationFormData>(EMPTY_FORM);
  const [salaryEntries, setSalaryEntries] = useState<SalaryEntry[]>([]);
  const [projectBasisEntries, setProjectBasisEntries] = useState<ProjectBasisEntry[]>([]);
  const [projectAssignments, setProjectAssignments] = useState<ProjectAssignment[]>([]);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const searchParams = useMemo(() => ({
    search: debouncedSearch || undefined,
    page: currentPage,
    page_size: ITEMS_PER_PAGE,
  }), [debouncedSearch, currentPage]);

  const { data: teamMembers = [] } = useQuery({
    queryKey: ["team-allocation", "staff"],
    queryFn: async () => (await StaffAdmin.search({})).results ?? [],
    enabled: view === "form",
    staleTime: Infinity,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["team-allocation", "projects"],
    queryFn: async () => (await ProjectAdmin.list()).results ?? [],
    enabled: view === "form",
    staleTime: Infinity,
  });

  useEffect(() => {
    TeamAllocationAdmin.list(searchParams)
      .then((res) => {
        setAllocations(res.results ?? []);
        setTotal(res.count ?? 0);
      })
      .catch(() => toast.error("Failed to load allocations"));
  }, [searchParams]);

  const refetch = () =>
    TeamAllocationAdmin.list(searchParams)
      .then((res) => {
        setAllocations(res.results ?? []);
        setTotal(res.count ?? 0);
      })
      .catch(() => toast.error("Failed to load allocations"));

  const openNew = () => {
    setForm(EMPTY_FORM);
    setSalaryEntries([]);
    setProjectBasisEntries([]);
    setProjectAssignments([]);
    setEditingId(null);
    setView("form");
  };

  const openEdit = (item: TeamAllocation) => {
    setForm({
      staff_member_id: item.staff_member_id,
      user_type: item.user_type,
      pay_type: item.pay_type,
      is_active: item.is_active,
      notes: item.notes,
    });
    setSalaryEntries(item.salary_entries);
    setProjectBasisEntries(item.project_basis_entries);
    setProjectAssignments(item.project_assignments);
    setEditingId(item.id);
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
    if (!form.staff_member_id) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        salary_entries: salaryEntries,
        project_basis_entries: projectBasisEntries,
        project_assignments: projectAssignments,
      };

      if (editingId) {
        await TeamAllocationAdmin.update(editingId, payload);
        toast.success("Allocation updated");
      } else {
        await TeamAllocationAdmin.create(payload);
        toast.success("Allocation created");
      }
      await refetch();
      back();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async (id: string) => {
    try {
      await TeamAllocationAdmin.delete(id);
      setAllocations((prev) => prev.filter((a) => a.id !== id));
      toast.success("Allocation deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div className="px-4">
      {view === "list" ? (
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 leading-none">Team Allocation</h1>
              <p className="text-xs text-gray-500 mt-1">Manage team member allocations</p>
            </div>
            <Button onClick={openNew} className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-white">
              <Plus className="w-4 h-4 mr-2" /> Add Allocation
            </Button>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <InputGroup className="flex-1 max-w-sm h-9">
              <InputGroupAddon align="inline-start">
                <Search className="size-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput value={search} onChange={(e) => handleSearchChange(e.target.value)} placeholder="Search by member name" />
            </InputGroup>
            <p className="text-sm text-sidebar-primary font-medium whitespace-nowrap">
              Total: {total} {total === 1 ? "item" : "items"}
            </p>
          </div>

          {allocations.length === 0 ? (
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
                  {allocations.map((record) => (
                    <tr key={record.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{getMemberName(record.staff_member_id)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                          record.pay_type === "salary" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                        }`}>
                          {record.pay_type === "salary" ? "Salary" : "Project-based"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 capitalize">{record.user_type}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{record.project_assignments.length + record.project_basis_entries.length}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                          record.is_active ? "border border-green-200 bg-green-50 text-green-600" : "border border-gray-200 bg-gray-50 text-gray-500"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${record.is_active ? "bg-green-500" : "bg-gray-400"}`} />
                          {record.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" className="text-sidebar-primary border-sidebar-primary/20" onClick={() => openEdit(record)}>
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
                  <span className="text-sm text-gray-500">{total} total</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button key={p} onClick={() => setCurrentPage(p)}
                        className={`w-7 h-7 text-xs rounded-md ${p === currentPage ? "bg-sidebar-primary text-white" : "text-gray-600 hover:bg-gray-100"}`}>{p}</button>
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
