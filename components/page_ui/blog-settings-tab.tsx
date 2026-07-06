"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/global_ui/searchable-select";
import { SegmentedToggle } from "@/components/global_ui/segmented-toggle";
import { MediaPickerDialog } from "@/components/global_ui/media-handler-picker";
import { useFaqSelector } from "@/api/hooks/use-faq-selector";

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
  faqGroupSlug: string;
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
  faqGroupSlug,
  authorMode,
  authorName,
  authorImage,
  authorTeamId,
  projects,
  teamMembers,
  onChange,
}: BlogSettingsTabProps) {
  const [authorPickerOpen, setAuthorPickerOpen] = useState(false);

  const { data: faqOptions = [] } = useFaqSelector();

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
            <Label>Publish Date <span className="text-red-400">*</span></Label>
            <Input type="date" value={publishDate} onChange={(e) => onChange("publishDate", e.target.value)} className="w-40" />
          </div>
        </div>
      </div>

      <div className="p-5 bg-white border border-gray-200 rounded-xl">
        <p className="text-sm font-semibold text-gray-900 mb-4">Project</p>
        <div className="space-y-1.5">
          <Label>Linked Project</Label>
          <SearchableSelect
            options={projects.map((p) => ({ value: p.id, label: p.title }))}
            value={projectId}
            onChange={(v) => onChange("projectId", v)}
            placeholder="Select a project"
            searchPlaceholder="Search projects..."
          />
          <p className="text-xs text-gray-400">Link this blog to an existing project.</p>
        </div>

                <div className="space-y-1.5">
                  <Label>FAQ Group</Label>
                  <SearchableSelect
                    options={faqOptions}
                    value={faqGroupSlug}
                    onChange={(v) => onChange("faqGroupSlug", v)}
                    placeholder="Select a FAQ group"
                    searchPlaceholder="Search FAQ groups..."
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Select a FAQ group to display related Q&amp;A
                  </p>
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
              {authorImage ? (
                <div className="relative size-16 rounded-full border border-gray-200 overflow-hidden group cursor-pointer" onClick={() => setAuthorPickerOpen(true)}>
                  <Image src={authorImage} alt="Author"  width={40} height={40} className="object-cover size-full" />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onChange("authorImage", ""); }}
                    className="absolute inset-0 grid place-items-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setAuthorPickerOpen(true)}
                  className="size-16 rounded-full border border-dashed border-gray-200 grid place-items-center text-gray-400 hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition"
                >
                  <Upload className="size-5" />
                </button>
              )}
            </div>
            <div className="space-y-1.5 flex-1 max-w-sm">
              <Label>Author Name <span className="text-red-400">*</span></Label>
              <Input value={authorName} onChange={(e) => onChange("authorName", e.target.value)} placeholder="e.g. Jane Doe" />
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <Label>Select Team Member</Label>
            <SearchableSelect
              options={teamMembers.map((m) => ({ value: m.id, label: m.name }))}
              value={authorTeamId}
              onChange={(v) => onChange("authorTeamId", v)}
              placeholder="Select a team member"
              searchPlaceholder="Search team members..."
            />
          </div>
        )}
      </div>

      {authorPickerOpen && (
        <MediaPickerDialog
          open={authorPickerOpen}
          onOpenChange={(o) => { if (!o) setAuthorPickerOpen(false); }}
          mode="image"
          defaultCategory="Images"
          title="Select Author Image"
          onSelect={(item) => {
            onChange("authorImage", item.url);
            setAuthorPickerOpen(false);
          }}
        />
      )}
    </div>
  );
}
