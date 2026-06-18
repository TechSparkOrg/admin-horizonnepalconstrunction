"use client";

import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { ProjectAdmin } from "@/api/services/project.service";
import { CategoryAdmin } from "@/api/services/category.service";
import { StaffAdmin } from "@/api/services/staff.service";
import { MaterialListAdmin } from "@/api/services/material-list.service";
import { DocumentAdmin } from "@/api/services/document.service";
import type { Category } from "@/api/types/category.types";
import type { StaffMember } from "@/api/types/staff.types";
import type { MaterialItem } from "@/api/types/material-list.types";
import type { DocumentItem } from "@/api/types/document.types";
import type { Project, Client, ProjectMilestone, SpendingRecord } from "@/api/types/project.types";
import { ProjectTable } from "@/components/page_ui/project-table";
import { ProjectForm, EMPTY_FORM } from "@/components/page_ui/project-form";
import type { ProjectFormData } from "@/components/page_ui/project-form";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { toSlug } from "@/lib/slug";

type View = "list" | "form";

const ITEMS_PER_PAGE = 10;

const EMPTY_CLIENT: Client = { id: "", name: "", location: "", contract_value: 0, profession: "", document_id: null };

function apiToForm(item: Project): ProjectFormData {
  return {
    title: item.title,
    slug: item.slug,
    category_id: item.category_id,
    description: item.description,
    status: item.status,
    pause_reason: item.pause_reason,
    priority: item.priority,
    meta_title: item.meta_title,
    meta_description: item.meta_description,
    meta_keywords: item.meta_keywords,
    is_published: item.is_published,
    author: item.author,
    author_image: item.author_image,
    author_role: item.author_role,
    authorMode: "manual",
  };
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [view, setView] = useState<View>("list");
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState<ProjectFormData>(EMPTY_FORM);
  const [client, setClient] = useState<Client>(EMPTY_CLIENT);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [spendingRecords, setSpendingRecords] = useState<SpendingRecord[]>([]);
  const [thumbnail, setThumbnail] = useState("");
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    Promise.all([
      ProjectAdmin.list({ page: currentPage, page_size: ITEMS_PER_PAGE }),
      CategoryAdmin.listProject(),
      StaffAdmin.search({}),
      MaterialListAdmin.search({}),
      DocumentAdmin.search({}),
    ])
      .then(([projectRes, catRes, staffRes, materialRes, docRes]) => {
        setProjects(projectRes.results ?? []);
        setTotal(projectRes.count ?? 0);
        setCategories(catRes.results ?? []);
        setStaffMembers(staffRes.results ?? []);
        setMaterials(materialRes.results ?? []);
        setDocuments(docRes.results ?? []);
      })
      .catch(() => toast.error("Failed to load data"));
  }, [currentPage]);

  const refetch = () =>
    ProjectAdmin.list({ page: currentPage, page_size: ITEMS_PER_PAGE })
      .then((res) => {
        setProjects(res.results ?? []);
        setTotal(res.count ?? 0);
      })
      .catch(() => toast.error("Failed to load projects"));

  const openNew = () => {
    setForm(EMPTY_FORM);
    setClient(EMPTY_CLIENT);
    setMilestones([]);
    setSpendingRecords([]);
    setThumbnail("");
    setEditingSlug(null);
    setView("form");
  };

  const openEdit = (item: Project) => {
    setForm(apiToForm(item));
    setClient(item.clients?.[0] || EMPTY_CLIENT);
    setMilestones(item.milestones);
    setSpendingRecords(item.spending_records);
    setThumbnail(item.thumbnail);
    setEditingSlug(item.slug);
    setView("form");
  };

  const back = () => {
    setForm(EMPTY_FORM);
    setClient(EMPTY_CLIENT);
    setMilestones([]);
    setSpendingRecords([]);
    setThumbnail("");
    setDeleteSlug(null);
    setView("list");
  };

  const handleChange = (key: string, value: string | boolean | null) =>
    setForm((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "title" && !editingSlug && typeof value === "string"
        ? { slug: toSlug(value) }
        : {}),
    }));

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const { authorMode, ...formData } = form;
      const payload = {
        ...formData,
        thumbnail,
        clients: client.name ? [client] : [],
        milestones,
        spending_records: spendingRecords,
      };
      if (editingSlug) {
        await ProjectAdmin.update(editingSlug, payload);
        toast.success("Project updated");
      } else {
        await ProjectAdmin.create(payload as any);
        toast.success("Project created");
      }
      await refetch();
      back();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: Record<string, string[]> } })?.response?.data;
      const text = msg
        ? Object.values(msg).flat().join(", ")
        : "Something went wrong";
      toast.error(text);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async (slug: string) => {
    try {
      await ProjectAdmin.delete(slug);
      setProjects((prev) => prev.filter((p) => p.slug !== slug));
      toast.success("Project deleted");
    } catch {
      toast.error("Failed to delete");
    }
    setDeleteSlug(null);
  };

  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  return (
    <>
      {view === "list" ? (
        <div className="px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 leading-none">Projects</h1>
              <p className="text-xs text-gray-500 mt-1">Manage projects</p>
            </div>
            <Button onClick={openNew} className="bg-[lab(20_23.9_-60.14)] hover:bg-[lab(15_23.9_-60.14)] text-white">
              <Plus className="w-4 h-4 mr-2" /> Add Project
            </Button>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <InputGroup className="flex-1 max-w-sm h-9">
              <InputGroupAddon align="inline-start">
                <Search className="size-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search"
              />
            </InputGroup>
            <p className="text-sm text-[lab(20_23.9_-60.14)] font-medium whitespace-nowrap">
              Total: {total} {total === 1 ? "item" : "items"} found.
            </p>
          </div>

          <ProjectTable
            projects={filtered}
            onEdit={openEdit}
            onDelete={confirmDelete}
            deleteSlug={deleteSlug}
            setDeleteSlug={setDeleteSlug}
            page={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      ) : (
        <div className="px-4">
          <ProjectForm
            form={form}
            editingSlug={editingSlug}
            saving={saving}
            categories={categories}
            client={client}
            onClientChange={setClient}
            milestones={milestones}
            onMilestonesChange={setMilestones}
            thumbnail={thumbnail}
            onThumbnailChange={setThumbnail}
            spendingRecords={spendingRecords}
            onSpendingRecordsChange={setSpendingRecords}
            staffMembers={staffMembers}
            materials={materials}
            documents={documents}
            onChange={handleChange}
            onSave={save}
            onBack={back}
          />
        </div>
      )}
    </>
  );
}
