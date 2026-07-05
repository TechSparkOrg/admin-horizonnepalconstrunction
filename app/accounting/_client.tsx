"use client";

import { useState, useMemo, useEffect } from "react";
import { Wallet } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { ProjectAdmin } from "@/api/services/project.service";
import { AccountingAdmin } from "@/api/services/accounting.service";
import { AccountingForm } from "@/components/page_ui/accounting-form";
import { PageHeader } from "@/components/global_ui/page-header";
import { SearchableSelect } from "@/components/global_ui/searchable-select";
import { FormCard } from "@/components/global_ui/form-card";
import type { AccountingEntry, AccountingEntryFormData } from "@/api/types/accounting.types";

export function _Client() {
  const [projectId, setProjectId] = useState("");
  const [entries, setEntries] = useState<AccountingEntry[]>([]);
  const [saving, setSaving] = useState(false);

  const { data: projects = [] } = useQuery({
    queryKey: ["accounting", "projects"],
    queryFn: async () => (await ProjectAdmin.list()).results ?? [],
    staleTime: 60000,
  });

  const selectedProject = useMemo(() => {
    if (!projectId) return null;
    return projects.find((p) => p.id === projectId) ?? null;
  }, [projectId, projects]);

  const { data: projectDetail } = useQuery({
    queryKey: ["accounting", "project-detail", selectedProject?.slug],
    queryFn: async () => {
      if (!selectedProject?.slug) return null;
      return await ProjectAdmin.adminGet(selectedProject.slug);
    },
    enabled: !!selectedProject?.slug,
    staleTime: 30000,
  });

  useEffect(() => {
    if (!projectId) { setEntries([]); return; }
    AccountingAdmin.list({ project_id: projectId })
      .then((res) => setEntries(res.results ?? []))
      .catch(() => setEntries([]));
  }, [projectId]);

  const refreshEntries = () => {
    if (!projectId) return;
    AccountingAdmin.list({ project_id: projectId })
      .then((res) => setEntries(res.results ?? []))
      .catch(() => toast.error("Failed to load entries"));
  };

  const handleEntrySave = async (form: AccountingEntryFormData, editingId: string | null) => {
    if (!projectId) { toast.error("Select a project first"); return; }
    if (!form.amount || !form.date) { toast.error("Amount and date are required"); return; }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        ...form,
        amount: Number(form.amount),
        project_id: projectId,
      };
      if (editingId) {
        await AccountingAdmin.update(editingId, payload);
        toast.success("Entry updated");
      } else {
        await AccountingAdmin.create(payload);
        toast.success("Entry created");
      }
      refreshEntries();
    } catch {
      toast.error("Failed to save entry");
    } finally {
      setSaving(false);
    }
  };

  const handleEntryDelete = async (id: string) => {
    try {
      await AccountingAdmin.delete(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      toast.success("Entry deleted");
    } catch {
      toast.error("Failed to delete entry");
    }
  };

  return (
    <PageHeader
      title="Accounting"
      subtitle={selectedProject ? `Financial records for ${selectedProject.title}` : "Select a project to manage financial entries"}
    >
      <div className="mb-6 max-w-md">
        <SearchableSelect
          options={projects.map((p) => ({ value: p.id, label: p.title }))}
          value={projectId}
          onChange={setProjectId}
          placeholder="Select a project..."
          searchPlaceholder="Search projects..."
        />
      </div>

      {!projectId && (
        <FormCard>
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-gray-400">
            <Wallet className="size-10" />
            <p className="text-sm">Select a project above to view its financial records</p>
          </div>
        </FormCard>
      )}

      {projectId && (
        <AccountingForm
          entries={entries}
          project={projectDetail ?? null}
          saving={saving}
          onEntrySave={handleEntrySave}
          onEntryDelete={handleEntryDelete}
        />
      )}
    </PageHeader>
  );
}
