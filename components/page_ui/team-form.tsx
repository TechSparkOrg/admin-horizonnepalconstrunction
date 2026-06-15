"use client";

import { ArrowLeft, User } from "lucide-react";

interface FormData {
  name: string;
  initials: string;
  role: string;
  specialisation: string;
  experience: string;
  email: string;
  linkedin: string;
}

interface Props {
  form: FormData;
  editingId: string | null;
  saving: boolean;
  onChange: (key: string, value: string) => void;
  onSave: () => void;
  onBack: () => void;
}

const input =
  "w-full h-10 px-3 rounded-lg border border-light-gray bg-white text-sm text-brand-dark placeholder:text-mid-gray/60 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition";
const lbl = "block text-xs font-medium text-mid-gray mb-1.5";
const section = "rounded-xl border border-light-gray bg-white p-5";
const sectionTitle = "text-sm font-semibold text-brand-dark mb-4";

export function TeamForm({ form, editingId, saving, onChange, onSave, onBack }: Props) {
  return (
    <div className="px-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-mid-gray hover:text-brand-dark transition mb-6"
      >
        <ArrowLeft className="size-3.5" /> Back to team
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="size-10 rounded-lg bg-brand-primary/10 flex items-center justify-center shrink-0">
          <User className="size-4.5 text-brand-primary" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-brand-dark">
            {editingId ? "Edit Member" : "New Member"}
          </h1>
          <p className="text-xs text-mid-gray">
            {editingId ? "Update this team member's details" : "Add a new member to your team"}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className={section}>
          <p className={sectionTitle}>Basic Information</p>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className={lbl}>Full Name</label>
                <input value={form.name} onChange={(e) => onChange("name", e.target.value)} className={input} placeholder="Jane Smith" />
              </div>
              <div>
                <label className={lbl}>Initials</label>
                <input value={form.initials} onChange={(e) => onChange("initials", e.target.value.toUpperCase())} className={`${input} font-mono text-center`} placeholder="JS" maxLength={3} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Role / Title</label>
                <input value={form.role} onChange={(e) => onChange("role", e.target.value)} className={input} placeholder="Lead Engineer" />
              </div>
              <div>
                <label className={lbl}>Experience</label>
                <input value={form.experience} onChange={(e) => onChange("experience", e.target.value)} className={input} placeholder="10 yrs" />
              </div>
            </div>

            <div>
              <label className={lbl}>Specialisation</label>
              <input value={form.specialisation} onChange={(e) => onChange("specialisation", e.target.value)} className={input} placeholder="Structural design" />
            </div>
          </div>
        </div>

        <div className={section}>
          <p className={sectionTitle}>Contact</p>
          <div className="space-y-4">
            <div>
              <label className={lbl}>Email</label>
              <input value={form.email} onChange={(e) => onChange("email", e.target.value)} className={input} type="email" placeholder="jane@example.com" />
            </div>

            <div>
              <label className={lbl}>LinkedIn URL</label>
              <input value={form.linkedin} onChange={(e) => onChange("linkedin", e.target.value)} className={input} placeholder="https://linkedin.com/in/…" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-6">
        <button
          onClick={onBack}
          className="h-10 px-4 rounded-lg border border-light-gray text-sm font-medium text-brand-dark hover:bg-light-gray/50 transition"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={!form.name.trim() || !form.role.trim() || saving}
          className="flex-1 h-10 rounded-lg bg-brand-primary text-white text-sm font-medium hover:brightness-110 transition disabled:opacity-40"
        >
          {saving ? "Saving..." : editingId ? "Update Member" : "Create Member"}
        </button>
      </div>
    </div>
  );
}