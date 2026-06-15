"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { TeamAdmin } from "@/api/services/team.service";
import type { TeamMember } from "@/api/types/team.types";
import { TeamList } from "@/components/page_ui/team-list";
import { TeamForm } from "@/components/page_ui/team-form";

const emptyForm = {
  name: "", initials: "", role: "", specialisation: "",
  experience: "", email: "", linkedin: "",
};

function makeInitials(name: string): string {
  return name.split(" ").filter(Boolean).map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

type View = "list" | "form";

export default function AdminTeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [view, setView] = useState<View>("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    TeamAdmin.list().then((res) => setMembers(res.results ?? [])).catch(() => toast.error("Failed to load team"));
  }, []);

  const openNew = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
    setView("form");
  };

  const openEdit = (item: TeamMember) => {
    const { id, ...rest } = item;
    setForm(rest);
    setEditingId(id);
    setView("form");
  };

  const back = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
    setView("list");
  };

  const handleChange = (key: string, value: string) =>
    setForm((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "name" && !editingId ? { initials: makeInitials(value) } : {}),
    }));

  const save = async () => {
    if (!form.name.trim() || !form.role.trim()) return;
    setSaving(true);
    const initials = form.initials.trim() || makeInitials(form.name);
    const payload = { ...form, initials };
    try {
      if (editingId) {
        const updated = await TeamAdmin.update(editingId, payload);
        setMembers((prev) => prev.map((m) => (m.id === editingId ? updated : m)));
        toast.success("Member updated");
      } else {
        const created = await TeamAdmin.create(payload);
        setMembers((prev) => [...prev, created]);
        toast.success("Member created");
      }
      back();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async (id: string) => {
    try {
      await TeamAdmin.delete(id);
      setMembers((prev) => prev.filter((m) => m.id !== id));
      toast.success("Member removed");
    } catch {
      toast.error("Failed to delete");
    }
    setDeleteId(null);
  };

  return (
    <>
      {view === "list" ? (
        <>
          <div className="flex items-center justify-between pb-2 px-4 border-gray-500/30">
            <h1 className="text-2xl font-bold text-fs-text1">Team</h1>
            <button
              onClick={openNew}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-fs-secondary hover:bg-fs-btn1 text-white text-sm font-medium transition"
            >
              <Plus className="w-4 h-4" /> New Member
            </button>
          </div>
          <TeamList
            members={members}
            onEdit={openEdit}
            onDelete={confirmDelete}
            deleteId={deleteId}
            setDeleteId={setDeleteId}
          />
        </>
      ) : (
        <TeamForm
          form={form}
          editingId={editingId}
          saving={saving}
          onChange={handleChange}
          onSave={save}
          onBack={back}
        />
      )}
    </>
  );
}
