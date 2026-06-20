"use client";

import { useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { useProjectStore } from "@/api/zustand/use-project-store";
import { ProjectTable } from "@/components/page_ui/project-table";
import { ProjectForm } from "@/components/page_ui/project-form";
import { PageHeader } from "@/components/global_ui/page-header";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

export default function AdminProjectsPage() {
  const {
    projects, total, currentPage, search, view, editingSlug, saving,
    form, client, milestones, spendingRecords, thumbnail,
    categories, staffMembers, materials, documents,
    fetchAll, refetch, setSearch, setPage,
    openNew, openEdit, back, setFormField, setClient,
    setMilestones, setThumbnail, setSpendingRecords,
    save, confirmDelete,
  } = useProjectStore();

  useEffect(() => { fetchAll(); }, []);

  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(total / 10);

  return (
    <>
      {view === "list" ? (
        <PageHeader title="Projects" subtitle="Manage projects" actionLabel="Add Project" onAction={openNew}>
          <div className="flex items-center gap-3 mb-4">
            <InputGroup className="flex-1 max-w-sm h-9">
              <InputGroupAddon align="inline-start">
                <Search className="size-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
              />
            </InputGroup>
            <p className="text-sm text-sidebar-primary font-medium whitespace-nowrap">
              Total: {total} {total === 1 ? "item" : "items"} found.
            </p>
          </div>

          <ProjectTable
            projects={filtered}
            onEdit={openEdit}
            onDelete={confirmDelete}
            page={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </PageHeader>
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
            onChange={setFormField}
            onSave={save}
            onBack={back}
          />
        </div>
      )}
    </>
  );
}
