"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, X, ImagePlus } from "lucide-react";
import Image from "next/image";
import { FormHeader } from "@/components/global_ui/form-header";
import { FormCard } from "@/components/global_ui/form-card";
import { FormTabs } from "@/components/global_ui/form-tabs";
import { SegmentedToggle } from "@/components/global_ui/segmented-toggle";
import { MediaPickerDialog } from "@/components/global_ui/media-handler-picker";
import type { PickerMediaItem } from "@/components/global_ui/media-handler-picker";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SOCIAL_PLATFORMS } from "@/lib/social-platforms";
import { toSlug } from "@/lib/slug";
import type { VendorSocialMedia } from "@/api/types/vendor.types";

interface VendorFormData {
  name: string;
  slug: string;
  owner_name: string;
  phone: string;
  email: string;
  location: string;
  social_media: VendorSocialMedia[];
  logo: string;
  is_active: boolean;
}

interface Props {
  form: VendorFormData;
  editingId: string | null;
  saving: boolean;
  onChange: (key: string, value: string | boolean | number | null | VendorSocialMedia[]) => void;
  onSave: () => void;
  onBack: () => void;
}

const EMPTY: VendorFormData = {
  name: "",
  slug: "",
  owner_name: "",
  phone: "",
  email: "",
  location: "",
  social_media: [],
  logo: "",
  is_active: true,
};

const emptySocial: VendorSocialMedia = { platform: SOCIAL_PLATFORMS[0], url: "" };

export { EMPTY };
export type { VendorFormData };

export function VendorForm({
  form,
  editingId,
  saving,
  onChange,
  onSave,
  onBack,
}: Props) {
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const slugEdited = useRef(false);

  useEffect(() => {
    if (!editingId) slugEdited.current = false;
  }, [editingId]);

  const addSocial = () => {
    onChange("social_media", [...form.social_media, { ...emptySocial }]);
  };

  const updateSocial = (i: number, field: "platform" | "url", val: string) => {
    const next = form.social_media.map((s, idx) =>
      idx === i ? { ...s, [field]: val } : s
    );
    onChange("social_media", next);
  };

  const removeSocial = (i: number) => {
    onChange("social_media", form.social_media.filter((_, idx) => idx !== i));
  };

  const handleMediaSelect = (item: PickerMediaItem) => {
    onChange("logo", item.url);
    setMediaPickerOpen(false);
  };

  return (
    <div>
      <FormHeader
        breadcrumb="Vendors"
        title={editingId ? form.name || "Edit Vendor" : "New Vendor"}
        onBack={onBack}
        onSave={onSave}
        saving={saving}
        saveDisabled={!form.name.trim() || saving}
        saveLabel={editingId ? "Update" : "Create"}
      />

      <Tabs defaultValue="general" className="w-full flex flex-col">
        <div>
          <FormTabs tabs={[
            { value: "general", label: "General" },
            { value: "contact", label: "Contact" },
            { value: "media", label: "Media" },
          ]} />
        </div>

        <TabsContent value="general" className="mt-4">
          <FormCard>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Name <span className="text-red-500">*</span></Label>
                <Input
                  value={form.name}
                  onChange={(e) => {
                    onChange("name", e.target.value);
                    if (!slugEdited.current) onChange("slug", toSlug(e.target.value));
                  }}
                  placeholder="Vendor name"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Slug <span className="text-red-500">*</span></Label>
                <Input
                  value={form.slug}
                  onChange={(e) => {
                    slugEdited.current = true;
                    onChange("slug", e.target.value);
                  }}
                  placeholder="vendor-slug"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Owner Name</Label>
              <Input
                value={form.owner_name}
                onChange={(e) => onChange("owner_name", e.target.value)}
                placeholder="Owner name"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <SegmentedToggle<boolean>
                value={form.is_active}
                onChange={(v) => onChange("is_active", v)}
                options={[
                  { value: true, label: "Active" },
                  { value: false, label: "Inactive" },
                ]}
              />
            </div>
          </FormCard>
        </TabsContent>

        <TabsContent value="contact" className="mt-4">
          <Card className="bg-white border border-gray-200 rounded-xl">
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => onChange("email", e.target.value)}
                    placeholder="email@company.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => onChange("phone", e.target.value)}
                    placeholder="Phone number"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Location</Label>
                <Input
                  value={form.location}
                  onChange={(e) => onChange("location", e.target.value)}
                  placeholder="Kathmandu, Nepal"
                />
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Social Links</p>
                  <Button type="button" variant="outline" size="sm" onClick={addSocial}>
                    <Plus className="size-3.5" />
                    Add Platform
                  </Button>
                </div>
                {form.social_media.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-200 py-6 flex items-center justify-center text-xs text-gray-400">
                    No social links added
                  </div>
                ) : (
                  <div className="space-y-2">
                    {form.social_media.map((link, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Select
                          value={link.platform}
                          onValueChange={(v) => updateSocial(i, "platform", v)}
                        >
                          <SelectTrigger className="w-32 h-9 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SOCIAL_PLATFORMS.map((p) => (
                              <SelectItem key={p} value={p}>{p}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          value={link.url}
                          onChange={(e) => updateSocial(i, "url", e.target.value)}
                          placeholder="https://"
                          className="flex-1 h-9 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeSocial(i)}
                          className="size-9 flex items-center justify-center rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 shrink-0"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="mt-4">
          <FormCard>
            <div className="space-y-1.5">
              <Label>Logo</Label>
              <div className="flex items-start gap-4">
                {form.logo ? (
                  <div className="relative w-32 h-24 rounded-lg border border-gray-200 overflow-hidden group shrink-0">
                    <Image src={form.logo} alt={form.name} fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => onChange("logo", "")}
                      className="absolute top-1 right-1 w-6 h-6 grid place-items-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-24 rounded-lg border border-dashed border-gray-200 grid place-items-center text-gray-400 shrink-0">
                    <span className="text-[11px]">No image</span>
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMediaPickerOpen(true)}
                >
                  <ImagePlus className="size-3.5" />
                  Choose Image
                </Button>
              </div>
            </div>
          </FormCard>
        </TabsContent>
      </Tabs>

      {mediaPickerOpen && (
        <MediaPickerDialog
          open={mediaPickerOpen}
          onOpenChange={(o) => setMediaPickerOpen(o)}
          onSelect={(item) => handleMediaSelect(item)}
        />
      )}
    </div>
  );
}
