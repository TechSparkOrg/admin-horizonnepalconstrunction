"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SegmentedToggle } from "@/components/global_ui/segmented-toggle";

interface StaffMember {
  id: string;
  name: string;
  image?: string;
}

interface Project {
  id: string;
  title: string;
}

interface BlogSettingsTabProps {
  isPublished: boolean;
  publishDate: string;
  projectId: string;
  authorMode: "manual" | "team";
  authorName: string;
  authorImage: string;
  authorTeamId: string;
  projects: Project[];
  teamMembers: StaffMember[];
  onChange: (key: string, value: string | boolean) => void;
}

export function BlogSettingsTab({
  isPublished,
  publishDate,
  projectId,
  authorMode,
  authorName,
  authorImage,
  authorTeamId,
  projects,
  teamMembers,
  onChange,
}: BlogSettingsTabProps) {
  const [authorPreview, setAuthorPreview] = useState<string | null>(authorImage || null);
  const authorInputRef = useRef<HTMLInputElement>(null);

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAuthorPreview(url);
    onChange("authorImage", url);
  };

  return (
    <div className="space-y-5">
      <div className="p-5 bg-white border border-gray-200 rounded-xl">
        <p className="text-sm font-semibold text-gray-900 mb-4">Status</p>
        <div className="flex items-end gap-6 flex-wrap">
          <div className="space-y-1.5">
            <Label>Published</Label>
            <SegmentedToggle<boolean>
              value={isPublished}
              onChange={(v) => onChange("isPublished", v)}
              options={[
                { value: true, label: "Published" },
                { value: false, label: "Draft" },
              ]}
            />
          </div>
          <div className="space-y-1">
            <Label>Publish Date</Label>
            <Input type="date" value={publishDate} onChange={(e) => onChange("publishDate", e.target.value)} className="w-40" />
          </div>
        </div>
      </div>

      <div className="p-5 bg-white border border-gray-200 rounded-xl">
        <p className="text-sm font-semibold text-gray-900 mb-4">Project</p>
        <div className="space-y-1.5">
          <Label>Linked Project</Label>
          <Select value={projectId} onValueChange={(v) => onChange("projectId", v)}>
            <SelectTrigger className="max-w-sm">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-400">Link this blog to an existing project.</p>
        </div>
      </div>

      <div className="p-5 bg-white border border-gray-200 rounded-xl">
        <p className="text-sm font-semibold text-gray-900 mb-4">Author</p>

        <SegmentedToggle<string>
          value={authorMode}
          onChange={(v) => onChange("authorMode", v)}
          options={[
            { value: "manual", label: "Manual" },
            { value: "team", label: "From Team" },
          ]}
          className="mb-4"
        />

        {authorMode === "manual" ? (
          <div className="flex items-end gap-6">
            <div className="space-y-1.5">
              <Label>Author Image</Label>
              {authorPreview ? (
                <div className="relative size-16 rounded-full border border-gray-200 overflow-hidden group">
                  <Image src={authorPreview} alt="Author" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => { setAuthorPreview(null); onChange("authorImage", ""); }}
                    className="absolute inset-0 grid place-items-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => authorInputRef.current?.click()}
                  className="size-16 rounded-full border border-dashed border-gray-200 grid place-items-center text-gray-500 hover:bg-gray-100 transition"
                >
                  <Upload className="size-5" />
                </button>
              )}
              <input ref={authorInputRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
            </div>
            <div className="space-y-1.5 flex-1 max-w-sm">
              <Label>Author Name</Label>
              <Input value={authorName} onChange={(e) => onChange("authorName", e.target.value)} placeholder="e.g. Jane Doe" />
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <Label>Select Team Member</Label>
            <Select value={authorTeamId} onValueChange={(v) => onChange("authorTeamId", v)}>
              <SelectTrigger className="max-w-sm">
                <SelectValue placeholder="Select a team member" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
}
