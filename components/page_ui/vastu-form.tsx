"use client";

import { ArrowLeft, Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RichEditor } from "@/components/page_ui/rich-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import Image from "next/image";
import type { VastuItemType, BilingualPair } from "@/api/types/vastu.types";

interface TeamMember {
  id: string;
  name: string;
  image?: string;
}

interface VastuFormData {
  type: VastuItemType;
  title: string;
  slug: string;
  order: number;
  isActive: boolean;
  contentList: BilingualPair[];
  benefits: BilingualPair[];
  avoids: BilingualPair[];
  idealDirection: BilingualPair;
  facingDirection: BilingualPair;
  deity: string;
  element: string;
  description: BilingualPair;
  metaTitle: string;
  metaKeywords: string;
  metaDescription: string;
  authorMode: "manual" | "team";
  authorName: string;
  authorImage: string;
  authorTeamId: string;
}

interface Props {
  form: VastuFormData;
  editingId: string | null;
  saving: boolean;
  teamMembers?: TeamMember[];
  onChange: (key: string, value: string | boolean | number | BilingualPair | BilingualPair[]) => void;
  onListChange: (listKey: string, items: BilingualPair[]) => void;
  onSave: () => void;
  onBack: () => void;
}

const EMPTY_PAIR = (): BilingualPair => ({ en: "", np: "" });

const EMPTY: VastuFormData = {
  type: "section",
  title: "",
  slug: "",
  order: 0,
  isActive: true,
  contentList: [],
  benefits: [],
  avoids: [],
  idealDirection: { en: "", np: "" },
  facingDirection: { en: "", np: "" },
  deity: "",
  element: "",
  description: { en: "", np: "" },
  metaTitle: "",
  metaKeywords: "",
  metaDescription: "",
  authorMode: "manual",
  authorName: "",
  authorImage: "",
  authorTeamId: "",
};

export { EMPTY };
export type { VastuFormData };

function ListEditor({ items, onChange, label }: {
  items: BilingualPair[];
  onChange: (items: BilingualPair[]) => void;
  label: string;
}) {
  const add = () => onChange([...items, EMPTY_PAIR()]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i: number, field: "en" | "np", value: string) => {
    const next = items.map((item, idx) => idx === i ? { ...item, [field]: value } : item);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>
      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 py-8 flex items-center justify-center text-sm text-gray-400">
          No items added yet
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Item {i + 1}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-red-500 border-red-200 hover:bg-red-50 h-7"
                  onClick={() => remove(i)}
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-gray-500">English</Label>
                <Textarea
                  value={item.en}
                  onChange={(e) => update(i, "en", e.target.value)}
                  placeholder="English text"
                  rows={2}
                  className="text-sm resize-none"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-gray-500">नेपाली</Label>
                <Textarea
                  value={item.np}
                  onChange={(e) => update(i, "np", e.target.value)}
                  placeholder="नेपाली पाठ"
                  rows={2}
                  className="text-sm resize-none"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BilingualInput({ value, onChange, label }: {
  value: BilingualPair;
  onChange: (v: BilingualPair) => void;
  label: string;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-gray-500">{label}</Label>
      <div className="grid grid-cols-2 gap-2">
        <Input
          value={value.en}
          onChange={(e) => onChange({ ...value, en: e.target.value })}
          placeholder="English"
          className="text-sm"
        />
        <Input
          value={value.np}
          onChange={(e) => onChange({ ...value, np: e.target.value })}
          placeholder="नेपाली"
          className="text-sm"
        />
      </div>
    </div>
  );
}

export function VastuForm({
  form,
  editingId,
  saving,
  teamMembers = [],
  onChange,
  onListChange,
  onSave,
  onBack,
}: Props) {
  const [authorPreview, setAuthorPreview] = useState<string | null>(form.authorImage || null);
  const authorInputRef = useRef<HTMLInputElement>(null);

  const typeLabel = form.type === "section" ? "Section" : form.type === "room" ? "Room" : "Direction";
  const contentLabel = form.type === "section" ? "Content Items" : form.type === "room" ? "Tips" : "Recommended";

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAuthorPreview(url);
    onChange("authorImage", url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Vastu</p>
            <h1 className="text-2xl font-bold text-gray-900 leading-none">
              {editingId ? form.title || `Edit ${typeLabel}` : `New ${typeLabel}`}
            </h1>
          </div>
        </div>
        <Button onClick={onSave} disabled={!form.title.trim() || saving} className="bg-[lab(20_23.9_-60.14)] hover:bg-[lab(15_23.9_-60.14)] text-white">
          {saving && <Loader2 className="size-4 animate-spin" />}
          {saving ? "Saving\u2026" : editingId ? "Update" : "Create"}
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full flex flex-col">
        <div>
          <TabsList className="bg-gray-100 rounded-lg p-0.5 gap-0 w-auto h-auto">
            <TabsTrigger value="overview" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[lab(20_23.9_-60.14)] data-[state=active]:shadow-sm text-gray-500 px-3 py-1.5 text-xs font-medium">
              Overview
            </TabsTrigger>
            <TabsTrigger value="content" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[lab(20_23.9_-60.14)] data-[state=active]:shadow-sm text-gray-500 px-3 py-1.5 text-xs font-medium">
              Content
            </TabsTrigger>
            <TabsTrigger value="benefits" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[lab(20_23.9_-60.14)] data-[state=active]:shadow-sm text-gray-500 px-3 py-1.5 text-xs font-medium">
              Benefits
            </TabsTrigger>
            <TabsTrigger value="avoids" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[lab(20_23.9_-60.14)] data-[state=active]:shadow-sm text-gray-500 px-3 py-1.5 text-xs font-medium">
              What to Avoid
            </TabsTrigger>
            <TabsTrigger value="seo" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[lab(20_23.9_-60.14)] data-[state=active]:shadow-sm text-gray-500 px-3 py-1.5 text-xs font-medium">
              SEO
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[lab(20_23.9_-60.14)] data-[state=active]:shadow-sm text-gray-500 px-3 py-1.5 text-xs font-medium">
              Settings
            </TabsTrigger>
          </TabsList>
        </div>

        <div>
          <TabsContent value="overview" className="mt-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Title</Label>
                    <Input
                      value={form.title}
                      onChange={(e) => onChange("title", e.target.value)}
                      placeholder={`${typeLabel} title`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Slug</Label>
                    <div className="flex rounded-md border border-gray-200 overflow-hidden">
                      <span className="px-3 flex items-center text-xs text-gray-500 bg-gray-100 border-r border-gray-200 shrink-0">
                        /
                      </span>
                      <Input
                        value={form.slug}
                        onChange={(e) => onChange("slug", e.target.value)}
                        placeholder="item-slug"
                        className="border-0 rounded-none font-mono focus-visible:ring-0"
                      />
                    </div>
                  </div>
                </div>

                {form.type === "room" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <BilingualInput
                      value={form.idealDirection}
                      onChange={(v) => onChange("idealDirection", v)}
                      label="Ideal Direction"
                    />
                    <BilingualInput
                      value={form.facingDirection}
                      onChange={(v) => onChange("facingDirection", v)}
                      label="Facing Direction"
                    />
                  </div>
                )}

                {form.type === "direction" && (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>Deity</Label>
                        <Input
                          value={form.deity}
                          onChange={(e) => onChange("deity", e.target.value)}
                          placeholder="Deity name"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Element</Label>
                        <Input
                          value={form.element}
                          onChange={(e) => onChange("element", e.target.value)}
                          placeholder="Element name"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs text-gray-500 font-medium">Description</p>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-gray-500">English</Label>
                        <RichEditor
                          value={form.description.en}
                          onChange={(html) => onChange("description", { ...form.description, en: html })}
                          minHeight={120}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-gray-500">नेपाली</Label>
                        <Textarea
                          value={form.description.np}
                          onChange={(e) => onChange("description", { ...form.description, np: e.target.value })}
                          placeholder="नेपाली विवरण"
                          rows={4}
                          className="text-sm resize-none"
                        />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="mt-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5">
                <ListEditor
                  items={form.contentList}
                  onChange={(items) => onListChange("contentList", items)}
                  label={contentLabel}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="benefits" className="mt-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5">
                <ListEditor
                  items={form.benefits}
                  onChange={(items) => onListChange("benefits", items)}
                  label="Benefits"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="avoids" className="mt-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5">
                <ListEditor
                  items={form.avoids}
                  onChange={(items) => onListChange("avoids", items)}
                  label="What to Avoid"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="mt-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <Label>Meta Title</Label>
                  <Input
                    value={form.metaTitle}
                    onChange={(e) => onChange("metaTitle", e.target.value)}
                    placeholder="Defaults to title"
                  />
                  <p className="text-right text-[11px] text-gray-400">{form.metaTitle.length} / 60</p>
                </div>
                <div className="space-y-1.5">
                  <Label>Meta Description</Label>
                  <RichEditor
                    value={form.metaDescription}
                    onChange={(html) => onChange("metaDescription", html)}
                    minHeight={120}
                  />
                  <p className="text-right text-[11px] text-gray-400">{form.metaDescription.length} / 160</p>
                </div>
                <div className="space-y-1.5">
                  <Label>Meta Keywords</Label>
                  <Input
                    value={form.metaKeywords}
                    onChange={(e) => onChange("metaKeywords", e.target.value)}
                    placeholder="keyword1, keyword2, keyword3"
                  />
                  <p className="text-xs text-gray-400">Comma-separated keywords for search engines.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <Label>Order</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.order}
                    onChange={(e) => onChange("order", parseInt(e.target.value) || 0)}
                    className="w-24"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5 w-fit">
                    <button
                      type="button"
                      onClick={() => onChange("isActive", true)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                        form.isActive
                          ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => onChange("isActive", false)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                        !form.isActive
                          ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      Inactive
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 rounded-xl mt-4">
              <CardContent className="p-5">
                <p className="text-sm font-semibold text-gray-900 mb-4">Author</p>
                <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1 w-fit mb-4">
                  <button
                    type="button"
                    onClick={() => onChange("authorMode", "manual")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                      form.authorMode === "manual"
                        ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    Manual
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange("authorMode", "team")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                      form.authorMode === "team"
                        ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    From Team
                  </button>
                </div>
                {form.authorMode === "manual" ? (
                  <div className="flex items-end gap-6">
                    <div className="space-y-1.5">
                      <Label>Author Image</Label>
                      {authorPreview ? (
                        <div className="relative size-16 rounded-full border border-gray-200 overflow-hidden group">
                          <Image src={authorPreview} alt="Author" fill className="object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              setAuthorPreview(null);
                              onChange("authorImage", "");
                            }}
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
                      <input
                        ref={authorInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImagePick}
                      />
                    </div>
                    <div className="space-y-1.5 flex-1 max-w-sm">
                      <Label>Author Name</Label>
                      <Input
                        value={form.authorName}
                        onChange={(e) => onChange("authorName", e.target.value)}
                        placeholder="e.g. Jane Doe"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <Label>Select Team Member</Label>
                    <Select
                      value={form.authorTeamId}
                      onValueChange={(v) => onChange("authorTeamId", v)}
                    >
                      <SelectTrigger className="max-w-sm">
                        <SelectValue placeholder="Select a team member" />
                      </SelectTrigger>
                      <SelectContent>
                        {teamMembers.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
