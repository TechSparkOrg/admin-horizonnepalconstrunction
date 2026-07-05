"use client";

import { useState } from "react";
import { Plus, Trash2, ImagePlus, Eye, Upload, X, Box, Star } from "lucide-react";
import { FormHeader } from "@/components/global_ui/form-header";
import Image from "next/image";
import { RichEditor } from "@/components/page_ui/rich-editor";
import { ModelViewer } from "@/components/global_ui/ModelViewer";
import { isVideoUrl, detectPlatform } from "@/lib/media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { FormCard } from "@/components/global_ui/form-card";
import { FormTabs } from "@/components/global_ui/form-tabs";
import { SeoFields } from "@/components/global_ui/seo-fields";
import { SegmentedToggle } from "@/components/global_ui/segmented-toggle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {  Pagination,  PaginationContent,  PaginationItem,  PaginationLink,  PaginationPrevious,  PaginationNext} from "@/components/ui/pagination";
import { MediaPickerDialog } from "@/components/global_ui/media-handler-picker";
import type { PickerMediaItem } from "@/components/global_ui/media-handler-picker";
import type { Category } from "@/api/types/category.types";
import type { StaffMember } from "@/api/types/staff.types";
import type { MaterialItem } from "@/api/types/material-list.types";
import type { DocumentItem } from "@/api/types/document.types";
import type { Client, ProjectMilestone as Milestone, ProjectMilestoneImage, ProjectMilestoneEmbed } from "@/api/types/project.types";
import { SearchableSelect } from "@/components/global_ui/searchable-select";
import { ImagePreviewDialog } from "@/components/global_ui/image-preview-dialog";

interface ProjectFormData {
  title: string;
  slug: string;
  category_id: string | null;
  description: string;
  status: "ongoing" | "completed" | "paused";
  pause_reason: string;
  priority: "low" | "medium" | "high" | "top";
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  is_published: boolean;
  faqGroupSlug: string;
  boqSlug: string;
  author: string;
  author_image: string;
  author_role: string;
  authorMode: "manual" | "team";
}

interface Props {
  form: ProjectFormData;
  editingSlug: string | null;
  saving: boolean;
  categories: Category[];
  client: Client;
  onClientChange: (client: Client) => void;
  milestones: Milestone[];
  onMilestonesChange: (milestones: Milestone[]) => void;
  bannerImages: { id: string; url: string; name: string; isPrimary?: boolean }[];
  onBannerImagesChange: (images: { id: string; url: string; name: string; isPrimary?: boolean }[]) => void;
  staffMembers: StaffMember[];
  materials: MaterialItem[];
  documents: DocumentItem[];
  onChange: (key: string, value: string | boolean | null) => void;
  onSave: () => void;
  onBack: () => void;
}

const EMPTY_MILESTONE: Milestone = { id: "", date_started: "", estimated_end: "", completed_date: null, description: "", images: [], model_3d_url: "", video_url: "", video_embed_urls: [] };

let _pid = 0;
function genId() { return crypto.randomUUID?.() ?? `pid-${++_pid}`; }

const EMPTY_FORM: ProjectFormData = {
  title: "",
  slug: "",
  category_id: null,
  description: "",
  status: "ongoing",
  pause_reason: "",
  priority: "medium",
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
  is_published: false,
  faqGroupSlug: "",
  boqSlug: "",
  author: "",
  author_image: "",
  author_role: "",
  authorMode: "manual",
};

export type { ProjectFormData };
export { EMPTY_FORM };

const IMAGES_PER_PAGE = 5;

export function ProjectForm({
  form, editingSlug, saving, categories,
  client, onClientChange,
  milestones, onMilestonesChange,
  bannerImages, onBannerImagesChange,
  staffMembers, materials, documents,
  onChange, onSave, onBack,
}: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [bannerPage, setBannerPage] = useState(1);
  const [milestonePickerOpen, setMilestonePickerOpen] = useState(false);
  const [milestonePickerMode, setMilestonePickerMode] = useState<"image" | "model" | "video">("image");
  const [milestonePickerTarget, setMilestonePickerTarget] = useState<string | null>(null);
  const [milestoneImagePages, setMilestoneImagePages] = useState<Record<string, number>>({});
  const [milestoneVideoModes, setMilestoneVideoModes] = useState<Record<string, "library" | "embed">>({});
  const [milestoneEmbedInputs, setMilestoneEmbedInputs] = useState<Record<string, string>>({});
  const [modelPreview, setModelPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [authorPreview, setAuthorPreview] = useState<string | null>(form.author_image || null);
  const [authorMediaPickerOpen, setAuthorMediaPickerOpen] = useState(false);

  const addMilestoneImage = (msId: string, item: PickerMediaItem) => {
    const newImage: ProjectMilestoneImage = {
      id: item.id,
      url: item.url,
      name: item.name,
    };
    onMilestonesChange(milestones.map(ms =>
      ms.id === msId
        ? { ...ms, images: [...(ms.images || []), newImage] }
        : ms
    ));
    setMilestoneImagePages(prev => ({ ...prev, [msId]: 1 }));
  };

  const removeMilestoneImage = (msId: string, imgId: string) => {
    onMilestonesChange(milestones.map(ms =>
      ms.id === msId
        ? { ...ms, images: ms.images.filter(img => img.id !== imgId) }
        : ms
    ));
  };

  const addMilestoneEmbed = (msId: string) => {
    const url = (milestoneEmbedInputs[msId] || "").trim();
    if (!url) return;
    const platform = detectPlatform(url);
    const newEmbed: ProjectMilestoneEmbed = { platform: platform.name, id: genId(), url };
    onMilestonesChange(milestones.map(ms =>
      ms.id === msId
        ? { ...ms, video_embed_urls: [...(ms.video_embed_urls || []), newEmbed] }
        : ms
    ));
    setMilestoneEmbedInputs(prev => ({ ...prev, [msId]: "" }));
  };

  const removeMilestoneEmbed = (msId: string, embedId: string) => {
    onMilestonesChange(milestones.map(ms =>
      ms.id === msId
        ? { ...ms, video_embed_urls: ms.video_embed_urls.filter(e => e.id !== embedId) }
        : ms
    ));
  };

  const BANNER_PER_PAGE = 5;
  const totalBannerPages = Math.ceil(bannerImages.length / BANNER_PER_PAGE);
  const paginatedBanners = bannerImages.slice(
    (bannerPage - 1) * BANNER_PER_PAGE,
    bannerPage * BANNER_PER_PAGE
  );

  const handleBannerSelect = (item: PickerMediaItem, altText: string, _file?: File) => {
    const isFirst = bannerImages.length === 0;
    onBannerImagesChange([
      ...bannerImages,
      { id: item.id, url: item.url, name: altText || item.name, isPrimary: isFirst || undefined },
    ]);
  };

  const togglePrimary = (id: string) => {
    onBannerImagesChange(
      bannerImages.map((img) => ({
        ...img,
        isPrimary: img.id === id ? true : undefined,
      }))
    );
  };

  const removeBannerImage = (id: string) => {
    const remaining = bannerImages.filter((img) => img.id !== id);
    const needsPromotion = remaining.length > 0 && !remaining.some((img) => img.isPrimary);
    onBannerImagesChange(
      needsPromotion
        ? remaining.map((img, idx) => idx === 0 ? { ...img, isPrimary: true } : img)
        : remaining
    );
  };

  const openBannerPicker = () => {
    setMediaPickerOpen(true);
  };

  return (
    <div>
      <FormHeader
        breadcrumb="Projects"
        title={editingSlug ? "Edit Project" : "New Project"}
        onBack={onBack}
        onSave={onSave}
        saving={saving}
        saveDisabled={!form.title.trim() || saving}
        saveLabel={editingSlug ? "Update" : "Create"}
      />

      <Tabs defaultValue="overview" className="w-full flex flex-col">
        <div>
          <FormTabs tabs={[
            { value: "overview", label: "Overview" },
            { value: "client", label: "Client" },
            { value: "milestones", label: "Milestones" },
            { value: "seo", label: "SEO" },
            { value: "settings", label: "Settings" },
          ]} />
        </div>

        <div>
          <TabsContent value="overview" className="space-y-5 mt-4">
            <FormCard>
                <p className="text-sm font-semibold text-gray-900">Project Overview</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Project Title <span className="text-red-500">*</span></Label>
                    <Input value={form.title} onChange={(e) => onChange("title", e.target.value)} placeholder="Enter project title" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Slug <span className="text-red-500">*</span></Label>
                    <div className="flex rounded-md border border-gray-200 overflow-hidden">
                      <span className="px-3 flex items-center text-xs text-gray-500 bg-gray-100 border-r border-gray-200 shrink-0">/</span>
                      <Input value={form.slug} onChange={(e) => onChange("slug", e.target.value)} placeholder="project-slug" className="border-0 rounded-none font-mono focus-visible:ring-0" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <SearchableSelect
                    options={categories.map((c) => ({ value: c.id, label: c.name }))}
                    value={form.category_id || ""}
                    onChange={(v) => onChange("category_id", v || null)}
                    placeholder="Select category"
                    searchPlaceholder="Search categories..."
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Description <span className="text-red-500">*</span></Label>
                  <RichEditor
                    value={form.description}
                    onChange={(html) => onChange("description", html)}
                    minHeight={380}
                  />
                </div>
              </FormCard>

            <FormCard>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-gray-900">Banner Images</p>
                  <Button type="button" variant="outline" size="sm" onClick={openBannerPicker}>
                    <ImagePlus className="size-4" />
                    Add Banner
                  </Button>
                </div>

                {bannerImages.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-200 py-10 flex flex-col items-center justify-center gap-2 text-gray-500">
                    <ImagePlus className="size-6" />
                    <span className="text-sm">No banner images added yet</span>
                  </div>
                ) : (
                  <div>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-200 hover:bg-transparent">
                          <TableHead className="w-10" />
                          <TableHead className="text-gray-900 font-semibold">Image</TableHead>
                          <TableHead className="text-gray-900 font-semibold">Name</TableHead>
                          <TableHead className="text-gray-900 font-semibold text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedBanners.map((img, idx) => (
                          <TableRow key={`${img.id}-${idx}`} className="border-gray-200 hover:bg-gray-50">
                            <TableCell>
                              <button
                                type="button"
                                onClick={() => togglePrimary(img.id)}
                                title={img.isPrimary ? "Primary banner image" : "Set as primary banner image"}
                              >
                                <Star
                                  className={`size-4 ${img.isPrimary ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-400"}`}
                                />
                              </button>
                            </TableCell>
                            <TableCell>
                              <div className="size-10 rounded-md overflow-hidden bg-gray-100 relative">
                                <Image src={img.url} alt={img.name} fill className="object-cover" sizes="40px" />
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-gray-900 truncate max-w-[220px]">
                              <div className="flex items-center gap-2">
                                <span className="truncate">{img.name}</span>
                                {img.isPrimary && (
                                  <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-yellow-600 bg-yellow-50 border border-yellow-200 px-1.5 py-0.5 rounded">
                                    Primary
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-end gap-2">
                                <Button variant="outline" size="sm" className="text-gray-500 border-gray-200 hover:bg-gray-100" onClick={() => setPreviewUrl(img.url)}>
                                  <Eye className="size-3.5" />
                                </Button>
                                <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => removeBannerImage(img.id)}>
                                  <Trash2 className="size-3.5" />
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {totalBannerPages > 1 && (
                      <div className="mt-3">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                onClick={() => setBannerPage((p) => Math.max(1, p - 1))}
                                className={bannerPage === 1 ? "pointer-events-none opacity-40" : "cursor-pointer"}
                              />
                            </PaginationItem>
                            {Array.from({ length: totalBannerPages }, (_, i) => i + 1).map((page) => (
                              <PaginationItem key={page}>
                                <PaginationLink isActive={page === bannerPage} onClick={() => setBannerPage(page)} className="cursor-pointer">{page}</PaginationLink>
                              </PaginationItem>
                            ))}
                            <PaginationItem>
                              <PaginationNext
                                onClick={() => setBannerPage((p) => Math.min(totalBannerPages, p + 1))}
                                className={bannerPage === totalBannerPages ? "pointer-events-none opacity-40" : "cursor-pointer"}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </div>
                )}
              </FormCard>
          </TabsContent>

          <TabsContent value="client" className="mt-4">
            <FormCard>
                <p className="text-sm font-semibold text-gray-900">Client Information</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Client Name <span className="text-red-500">*</span></Label>
                    <Input value={client.name} onChange={(e) => onClientChange({ ...client, name: e.target.value })} placeholder="Client name" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Location</Label>
                    <Input value={client.location} onChange={(e) => onClientChange({ ...client, location: e.target.value })} placeholder="Client location" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Contract Value</Label>
                    <Input type="number" value={client.contract_value || ""} onChange={(e) => onClientChange({ ...client, contract_value: Number(e.target.value) })} placeholder="0" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Profession</Label>
                    <Input value={client.profession} onChange={(e) => onClientChange({ ...client, profession: e.target.value })} placeholder="e.g. Architect, Developer" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Document</Label>
                  <Select value={client.document_id || ""} onValueChange={(v) => onClientChange({ ...client, document_id: v || null })}>
                    <SelectTrigger className="max-w-sm">
                      <SelectValue placeholder="Select document" />
                    </SelectTrigger>
                    <SelectContent>
                      {documents.map((d) => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </FormCard>
          </TabsContent>

          <TabsContent value="milestones" className="mt-4">
            <FormCard>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">Project Milestones</p>
                  <Button type="button" variant="outline" size="sm" onClick={() => onMilestonesChange([...milestones, { ...EMPTY_MILESTONE, id: genId() }])}>
                    <Plus className="size-3.5" /> Add Milestone
                  </Button>
                </div>

                {milestones.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-200 py-8 flex flex-col items-center justify-center gap-2 text-gray-500">
                    <span className="text-sm">No milestones yet</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {milestones.map((ms) => {
                      const msImages = ms.images || [];
                      const msPage = milestoneImagePages[ms.id] || 1;
                      const totalMsPages = Math.ceil(msImages.length / IMAGES_PER_PAGE);
                      const paginatedMsImages = msImages.slice(
                        (msPage - 1) * IMAGES_PER_PAGE,
                        msPage * IMAGES_PER_PAGE
                      );

                      return (
                        <div key={ms.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-gray-700">Milestone</p>
                            <Button type="button" variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50 h-6" onClick={() => onMilestonesChange(milestones.filter((m) => m.id !== ms.id))}>
                              <Trash2 className="size-3" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <Label className="text-[11px] text-gray-500">Date Started <span className="text-red-500">*</span></Label>
                              <Input type="date" value={ms.date_started} onChange={(e) => onMilestonesChange(milestones.map((m) => m.id === ms.id ? { ...m, date_started: e.target.value } : m))} className="h-7 text-xs" />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[11px] text-gray-500">Estimated End</Label>
                              <Input type="date" value={ms.estimated_end} onChange={(e) => onMilestonesChange(milestones.map((m) => m.id === ms.id ? { ...m, estimated_end: e.target.value } : m))} className="h-7 text-xs" />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[11px] text-gray-500">Completed Date</Label>
                              <Input type="date" value={ms.completed_date || ""} onChange={(e) => onMilestonesChange(milestones.map((m) => m.id === ms.id ? { ...m, completed_date: e.target.value || null } : m))} className="h-7 text-xs" />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[11px] text-gray-500">Description</Label>
                            <textarea
                              value={ms.description}
                              onChange={(e) => onMilestonesChange(milestones.map((m) => m.id === ms.id ? { ...m, description: e.target.value } : m))}
                              placeholder="Describe this milestone..."
                              rows={2}
                              className="w-full rounded-md border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-medium text-gray-500">Images</p>
                              <Button type="button" variant="outline" size="sm" onClick={() => { setMilestonePickerTarget(ms.id); setMilestonePickerOpen(true); }}>
                                <ImagePlus className="size-3.5" /> Add Image
                              </Button>
                            </div>

                            {msImages.length === 0 ? (
                              <div className="rounded-lg border border-dashed border-gray-200 py-6 flex flex-col items-center justify-center gap-2 text-gray-500">
                                <ImagePlus className="size-5" />
                                <span className="text-xs">No images added yet</span>
                              </div>
                            ) : (
                              <div>
                                <Table>
                                  <TableHeader>
                                    <TableRow className="border-gray-200 hover:bg-transparent">
                                      <TableHead className="text-gray-900 font-semibold">Image</TableHead>
                                      <TableHead className="text-gray-900 font-semibold">Name</TableHead>
                                      <TableHead className="text-gray-900 font-semibold text-right">Actions</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {paginatedMsImages.map((img, idx) => (
                                      <TableRow key={`${img.id}-${idx}`} className="border-gray-200 hover:bg-gray-50">
                                        <TableCell>
                                          <div className="size-10 rounded-md overflow-hidden bg-gray-100 relative">
                                            <Image src={img.url} alt={img.name} fill className="object-cover" sizes="40px" />
                                          </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-900 truncate max-w-[200px]">
                                          {img.name}
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex items-center justify-end gap-2">
                                            <Button type="button" variant="outline" size="sm" className="text-gray-500 border-gray-200 hover:bg-gray-100" onClick={() => setPreviewUrl(img.url)}>
                                              <Eye className="size-3.5" />
                                            </Button>
                                            <Button type="button" variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => removeMilestoneImage(ms.id, img.id)}>
                                              <Trash2 className="size-3.5" />
                                              Delete
                                            </Button>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>

                                {totalMsPages > 1 && (
                                  <div className="mt-2">
                                    <Pagination>
                                      <PaginationContent>
                                        <PaginationItem>
                                          <PaginationPrevious
                                            onClick={() => setMilestoneImagePages(prev => ({ ...prev, [ms.id]: Math.max(1, msPage - 1) }))}
                                            className={msPage === 1 ? "pointer-events-none opacity-40" : "cursor-pointer"}
                                          />
                                        </PaginationItem>
                                        {Array.from({ length: totalMsPages }, (_, i) => i + 1).map((p) => (
                                          <PaginationItem key={p}>
                                            <PaginationLink
                                              isActive={p === msPage}
                                              onClick={() => setMilestoneImagePages(prev => ({ ...prev, [ms.id]: p }))}
                                              className="cursor-pointer"
                                            >
                                              {p}
                                            </PaginationLink>
                                          </PaginationItem>
                                        ))}
                                        <PaginationItem>
                                          <PaginationNext
                                            onClick={() => setMilestoneImagePages(prev => ({ ...prev, [ms.id]: Math.min(totalMsPages, msPage + 1) }))}
                                            className={msPage === totalMsPages ? "pointer-events-none opacity-40" : "cursor-pointer"}
                                          />
                                        </PaginationItem>
                                      </PaginationContent>
                                    </Pagination>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="border-t border-gray-200 pt-3">
                            <p className="text-xs font-medium text-gray-500 mb-2">3D Model</p>
                            {ms.model_3d_url ? (
                              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                                <div className="size-14 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0 flex items-center justify-center">
                                  <ModelViewer src={ms.model_3d_url} className="w-full h-full" />
                                </div>
                                <span className="text-sm text-gray-700 truncate flex-1">{ms.model_3d_url.split("/").pop()}</span>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <Button type="button" variant="outline" size="sm" className="text-gray-500 border-gray-200 hover:bg-gray-100" onClick={() => setModelPreview(ms.model_3d_url)}>
                                    <Eye className="size-3.5" />
                                  </Button>
                                  <Button type="button" variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => onMilestonesChange(milestones.map((m) => m.id === ms.id ? { ...m, model_3d_url: "" } : m))}>
                                    <Trash2 className="size-3.5" />
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="rounded-lg border border-dashed border-gray-200 py-6 flex flex-col items-center justify-center gap-2 text-gray-500">
                                <Box className="size-5" />
                                <span className="text-xs">No 3D model selected</span>
                                <Button type="button" variant="outline" size="sm" onClick={() => { setMilestonePickerMode("model"); setMilestonePickerTarget(ms.id); setMilestonePickerOpen(true); }}>
                                  Select Model
                                </Button>
                              </div>
                            )}
                          </div>

                          <div className="border-t border-gray-200 pt-3">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-medium text-gray-500">Video</p>
                              <SegmentedToggle<"library" | "embed">
                                value={milestoneVideoModes[ms.id] || "library"}
                                onChange={(v) => setMilestoneVideoModes(prev => ({ ...prev, [ms.id]: v }))}
                                options={[
                                  { value: "library", label: "Library" },
                                  { value: "embed", label: "Embed" },
                                ]}
                              />
                            </div>
                            {(milestoneVideoModes[ms.id] || "library") === "library" ? (
                              ms.video_url ? (
                                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                                  <div className="size-14 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                                    {isVideoUrl(ms.video_url) ? (
                                      <video src={ms.video_url} className="w-full h-full object-cover" muted />
                                    ) : (
                                      <span className="text-lg">📹</span>
                                    )}
                                  </div>
                                  <span className="text-sm text-gray-700 truncate flex-1">{ms.video_url.split("/").pop()}</span>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <Button type="button" variant="outline" size="sm" className="text-gray-500 border-gray-200 hover:bg-gray-100" onClick={() => setVideoPreview(ms.video_url)}>
                                      <Eye className="size-3.5" />
                                    </Button>
                                    <Button type="button" variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => onMilestonesChange(milestones.map((m) => m.id === ms.id ? { ...m, video_url: "" } : m))}>
                                      <Trash2 className="size-3.5" />
                                      Remove
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="rounded-lg border border-dashed border-gray-200 py-6 flex flex-col items-center justify-center gap-2 text-gray-500">
                                  <span className="text-lg">📹</span>
                                  <span className="text-xs">No video selected</span>
                                  <Button type="button" variant="outline" size="sm" onClick={() => { setMilestonePickerMode("video"); setMilestonePickerTarget(ms.id); setMilestonePickerOpen(true); }}>
                                    Select Video
                                  </Button>
                                </div>
                              )
                            ) : (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Input value={milestoneEmbedInputs[ms.id] || ""} onChange={(e) => setMilestoneEmbedInputs(prev => ({ ...prev, [ms.id]: e.target.value }))}
                                    placeholder="Paste video URL (YouTube, Vimeo, Dailymotion, etc.)" className="text-xs flex-1"
                                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addMilestoneEmbed(ms.id); } }} />
                                  <Button type="button" variant="outline" size="sm" onClick={() => addMilestoneEmbed(ms.id)} disabled={!(milestoneEmbedInputs[ms.id] || "").trim()} className="shrink-0">
                                    Add
                                  </Button>
                                </div>
                                {(ms.video_embed_urls || []).length === 0 ? (
                                  <div className="rounded-lg border border-dashed border-gray-200 py-6 flex flex-col items-center justify-center gap-2 text-gray-500">
                                    <span className="text-xs">No embed URLs added yet</span>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {ms.video_embed_urls.map((embed) => {
                                      const plat = detectPlatform(embed.url);
                                      return (
                                        <div key={embed.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium shrink-0 ${plat.color}`}>
                                            {plat.icon} {embed.platform}
                                          </span>
                                          <span className="text-sm text-gray-700 truncate flex-1">{embed.url}</span>
                                          <div className="flex items-center gap-1.5 shrink-0">
                                            <Button type="button" variant="outline" size="sm" className="text-gray-500 border-gray-200 hover:bg-gray-100" onClick={() => window.open(embed.url, "_blank")}>
                                              <Eye className="size-3.5" />
                                            </Button>
                                            <Button type="button" variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => removeMilestoneEmbed(ms.id, embed.id)}>
                                              <Trash2 className="size-3.5" />
                                              Delete
                                            </Button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </FormCard>
          </TabsContent>

          <TabsContent value="seo" className="mt-4">
            <SeoFields
              metaTitle={form.meta_title}
              metaDescription={form.meta_description}
              metaKeywords={form.meta_keywords}
              onMetaTitleChange={(v) => onChange("meta_title", v)}
              onMetaDescriptionChange={(v) => onChange("meta_description", v)}
              onMetaKeywordsChange={(v) => onChange("meta_keywords", v)}
            />
          </TabsContent>

          <TabsContent value="settings" className="mt-4 space-y-5">
            <FormCard>
                <p className="text-sm font-semibold text-gray-900">Status</p>
                <div className="flex items-end gap-6 flex-wrap">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">Project Status</Label>
                    <SegmentedToggle<string>
                      value={form.status}
                      onChange={(v) => onChange("status", v)}
                      options={[
                        { value: "ongoing", label: "Ongoing" },
                        { value: "completed", label: "Completed" },
                        { value: "paused", label: "Paused" },
                      ]}
                    />
                  </div>
                </div>

                {form.status === "paused" && (
                  <div className="space-y-1.5">
                    <Label>Pause Reason</Label>
                    <Textarea value={form.pause_reason} onChange={(e) => onChange("pause_reason", e.target.value)} placeholder="Explain why the project is paused..." rows={2} />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-500">Priority</Label>
                  <SegmentedToggle<string>
                    value={form.priority}
                    onChange={(v) => onChange("priority", v)}
                    options={[
                      { value: "low", label: "Low" },
                      { value: "medium", label: "Medium" },
                      { value: "high", label: "High" },
                      { value: "top", label: "Top" },
                    ]}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-500">Publish Status</Label>
                  <SegmentedToggle<boolean>
                    value={form.is_published}
                    onChange={(v) => onChange("is_published", v)}
                    options={[
                      { value: true, label: "Published" },
                      { value: false, label: "Draft" },
                    ]}
                  />
                </div>
              </FormCard>

            <FormCard>
                <p className="text-sm font-semibold text-gray-900">Slugs</p>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>FAQ Title / Slug</Label>
                    <Input
                      value={form.faqGroupSlug}
                      onChange={(e) => onChange("faqGroupSlug", e.target.value)}
                      placeholder="e.g. cement-faq"
                    />
                    <p className="text-[11px] text-amber-600 leading-relaxed mt-1">
                      Slug must be exactly as you type in Faq section with selected category to get specific Q&amp;A
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label>BOQ Slug</Label>
                    <Input
                      value={form.boqSlug}
                      onChange={(e) => onChange("boqSlug", e.target.value)}
                      placeholder="e.g. house-construction-boq"
                    />
                    <p className="text-[11px] text-amber-600 leading-relaxed mt-1">
                      Slug must be exactly as you type in Cost Estimator section to link this project
                    </p>
                  </div>
                </div>
              </FormCard>

            <FormCard>
                <p className="text-sm font-semibold text-gray-900">Author</p>
                <div className="space-y-1.5">
                  <Label>FAQ Title / Slug</Label>
                  <Input
                    value={form.faqGroupSlug}
                    onChange={(e) => onChange("faqGroupSlug", e.target.value)}
                    placeholder="e.g. cement-faq"
                  />
                  <p className="text-[11px] text-amber-600 leading-relaxed mt-1">
                    Slug must be exactly as you type in Faq section with selected category to get specific Q&amp;A
                  </p>
                </div>
              </FormCard>

            <FormCard>
                <p className="text-sm font-semibold text-gray-900">Author</p>

                <SegmentedToggle<string>
                  value={form.authorMode}
                  onChange={(v) => onChange("authorMode", v)}
                  options={[
                    { value: "manual", label: "Manual" },
                    { value: "team", label: "From Team" },
                  ]}
                />

                {form.authorMode === "manual" ? (
                  <div className="flex items-end gap-6">
                    <div className="space-y-1.5">
                      <Label>Author Image</Label>
                      {authorPreview ? (
                        <div className="relative size-16 rounded-full border border-gray-200 overflow-hidden group">
                          <Image src={authorPreview} alt="Author" fill className="object-cover" sizes="64px" />
                          <button type="button" onClick={() => { setAuthorPreview(null); onChange("author_image", ""); }}
                            className="absolute inset-0 grid place-items-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition">
                            <X className="size-4" />
                          </button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => setAuthorMediaPickerOpen(true)}
                          className="size-16 rounded-full border border-dashed border-gray-200 grid place-items-center text-gray-500 hover:bg-gray-100 transition">
                          <Upload className="size-5" />
                        </button>
                      )}
                    </div>
                    <div className="space-y-1.5 flex-1 max-w-sm">
                      <Label>Author Name <span className="text-red-500">*</span></Label>
                      <Input value={form.author} onChange={(e) => onChange("author", e.target.value)} placeholder="e.g. Jane Doe" />
                    </div>
                    <div className="space-y-1.5 flex-1 max-w-sm">
                      <Label>Author Role</Label>
                      <Input value={form.author_role} onChange={(e) => onChange("author_role", e.target.value)} placeholder="e.g. Project Manager" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-w-sm">
                    <Label>Select Team Member</Label>
                    <SearchableSelect
                      options={staffMembers.map((m) => ({ value: m.id, label: m.name }))}
                      value={(() => {
                        const member = staffMembers.find((m) => m.name === form.author);
                        return member?.id || "";
                      })()}
                      onChange={(v) => {
                        const member = staffMembers.find((m) => m.id === v);
                        if (member) {
                          onChange("author", member.name);
                          onChange("author_image", member.photo || "");
                        }
                      }}
                      placeholder="Select a team member"
                      searchPlaceholder="Search team members..."
                    />
                  </div>
                )}
              </FormCard>
          </TabsContent>

        </div>
      </Tabs>

      {mediaPickerOpen && (
        <MediaPickerDialog
          open={mediaPickerOpen}
          onOpenChange={(o) => setMediaPickerOpen(o)}
          mode="image"
          defaultCategory="Images"
          title="Select Banner Image"
          onSelect={(item, altText, file) => { handleBannerSelect(item, altText, file); setMediaPickerOpen(false); }}
        />
      )}

      {milestonePickerOpen && (
        <MediaPickerDialog
          open={milestonePickerOpen}
          onOpenChange={(o) => { setMilestonePickerOpen(o); if (!o) setMilestonePickerTarget(null); }}
          mode={milestonePickerMode === "model" ? "model" : "image"}
          title={
            milestonePickerMode === "image" ? "Select Milestone Image" :
            milestonePickerMode === "model" ? "Select 3D Model" :
            "Select Video"
          }
          defaultCategory={milestonePickerMode === "video" ? "Videos" : milestonePickerMode === "model" ? "3D Models" : "Images"}
          onSelect={(item) => {
            if (!milestonePickerTarget) return;
            if (milestonePickerMode === "image") {
              addMilestoneImage(milestonePickerTarget, item);
            } else if (milestonePickerMode === "model") {
              onMilestonesChange(milestones.map(ms =>
                ms.id === milestonePickerTarget ? { ...ms, model_3d_url: item.url } : ms
              ));
            } else {
              onMilestonesChange(milestones.map(ms =>
                ms.id === milestonePickerTarget ? { ...ms, video_url: item.url } : ms
              ));
            }
            setMilestonePickerOpen(false);
            setMilestonePickerTarget(null);
          }}
        />
      )}

      {authorMediaPickerOpen && (
        <MediaPickerDialog
          open={authorMediaPickerOpen}
          onOpenChange={(o) => setAuthorMediaPickerOpen(o)}
          mode="image"
          defaultCategory="Images"
          title="Select Author Image"
          onSelect={(item) => {
            onChange("author_image", item.url);
            setAuthorPreview(item.url);
            setAuthorMediaPickerOpen(false);
          }}
        />
      )}

      {modelPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setModelPreview(null)}>
          <div className="relative w-[80vw] h-[80vh] rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <ModelViewer src={modelPreview} className="w-full h-full" ar arModes="webxr scene-viewer quick-look" />
            <button type="button" onClick={() => setModelPreview(null)}
              className="absolute top-3 right-3 size-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition">
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      {videoPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setVideoPreview(null)}>
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <video src={videoPreview} controls autoPlay className="max-w-[90vw] max-h-[90vh] rounded-lg" />
            <button type="button" onClick={() => setVideoPreview(null)}
              className="absolute -top-3 -right-3 size-8 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-100 transition">
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      <ImagePreviewDialog url={previewUrl} onClose={() => setPreviewUrl(null)} />
    </div>
  );
}