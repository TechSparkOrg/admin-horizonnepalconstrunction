"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { MaterialListAdmin } from "@/api/services/material-list.service";
import { StaffAdmin } from "@/api/services/staff.service";
import { ProjectAdmin } from "@/api/services/project.service";
import type { MaterialItem } from "@/api/types/material-list.types";
import type { StaffMember } from "@/api/types/staff.types";
import type { Project } from "@/api/types/project.types";
import type { ProjectScopeEntry } from "@/api/types/resource-allocation.types";
import { MaterialAllocationForm, EMPTY_FORM } from "@/components/page_ui/material-allocation-form";
import type { MaterialAllocationFormData } from "@/components/page_ui/material-allocation-form";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

type View = "list" | "form";

interface AllocationRecord {
  id: string;
  form: MaterialAllocationFormData;
  projectScope: ProjectScopeEntry[];
}

const ITEMS_PER_PAGE = 10;

export default function MaterialAllocationPage() {
  const [records, setRecords] = useState<AllocationRecord[]>([]);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [teamMembers, setTeamMembers] = useState<StaffMember[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [view, setView] = useState<View>("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MaterialAllocationFormData>(EMPTY_FORM);
  const [projectScope, setProjectScope] = useState<ProjectScopeEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    Promise.all([
      MaterialListAdmin.search({}),
      StaffAdmin.search({}),
      ProjectAdmin.list(),
    ])
      .then(([matRes, staffRes, projRes]) => {
        setMaterials(matRes.results ?? []);
        setTeamMembers(staffRes.results ?? []);
        setProjects(projRes.results ?? []);
      })
      .catch(() => toast.error("Failed to load data"));
  }, []);

  const openNew = () => {
    setForm(EMPTY_FORM);
    setProjectScope([]);
    setEditingId(null);
    setView("form");
  };

  const openEdit = (record: AllocationRecord) => {
    setForm(record.form);
    setProjectScope(record.projectScope);
    setEditingId(record.id);
    setView("form");
  };

  const back = () => {
    setForm(EMPTY_FORM);
    setProjectScope([]);
    setEditingId(null);
    setView("list");
  };

  const handleChange = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const getMaterialName = (id: string) => materials.find((m) => m.id === id)?.name ?? id;
  const getMemberName = (id: string) => teamMembers.find((m) => m.id === id)?.name ?? id;

  const save = async () => {
    if (!form.materialId) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        projectScope,
      };
      console.log("Material allocation payload:", payload);

      if (editingId) {
        setRecords((prev) =>
          prev.map((r) => r.id === editingId ? { ...r, form, projectScope } : r)
        );
        toast.success("Allocation updated");
      } else {
        const newRecord: AllocationRecord = {
          id: crypto.randomUUID?.() ?? `mid-${Date.now()}`,
          form,
          projectScope,
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

  const toolTypeLabel: Record<string, string> = {
    rent: "Rent",
    company: "Company",
    incharge: "Incharge",
  };

  const filtered = records.filter((r) =>
    getMaterialName(r.form.materialId).toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="px-4">
      {view === "list" ? (
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 leading-none">Material Allocation</h1>
              <p className="text-xs text-gray-500 mt-1">Manage material and tool allocations</p>
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
              <InputGroupInput value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} placeholder="Search by material name" />
            </InputGroup>
            <p className="text-sm text-sidebar-primary font-medium whitespace-nowrap">
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
                    <th className="text-left text-xs font-semibold text-gray-900 px-4 py-3">Material</th>
                    <th className="text-left text-xs font-semibold text-gray-900 px-4 py-3">Tool Type</th>
                    <th className="text-left text-xs font-semibold text-gray-900 px-4 py-3">Incharge</th>
                    <th className="text-left text-xs font-semibold text-gray-900 px-4 py-3">Location</th>
                    <th className="text-left text-xs font-semibold text-gray-900 px-4 py-3">Projects</th>
                    <th className="text-left text-xs font-semibold text-gray-900 px-4 py-3">Status</th>
                    <th className="text-right text-xs font-semibold text-gray-900 px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((record) => (
                    <tr key={record.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{getMaterialName(record.form.materialId)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                          record.form.toolType === "rent" ? "bg-orange-50 text-orange-600" :
                          record.form.toolType === "company" ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"
                        }`}>{toolTypeLabel[record.form.toolType]}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{record.form.inchargeMemberId ? getMemberName(record.form.inchargeMemberId) : "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-[120px] truncate">{record.form.location || "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{record.projectScope.length}</td>
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
                  <span className="text-sm text-gray-500">{filtered.length} total</span>
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
        <MaterialAllocationForm
          form={form}
          editingId={editingId}
          saving={saving}
          materials={materials}
          teamMembers={teamMembers}
          projects={projects}
          projectScope={projectScope}
          onProjectScopeChange={setProjectScope}
          onChange={handleChange}
          onSave={save}
          onBack={back}
        />
      )}
    </div>
  );
}
