"use client";

import { FormHeader } from "@/components/global_ui/form-header";
import { FormCard } from "@/components/global_ui/form-card";
import { FormTabs } from "@/components/global_ui/form-tabs";
import { SegmentedToggle } from "@/components/global_ui/segmented-toggle";
import { SearchableSelect } from "@/components/global_ui/searchable-select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useCategoryOptions } from "@/api/hooks/use-category-query";
import { MaterialListOverviewTab } from "@/components/page_ui/material-list-overview-tab";
import { MaterialListVariantsTab } from "@/components/page_ui/material-list-variants-tab";
import { MaterialListMediaTab } from "@/components/page_ui/material-list-media-tab";
import { MaterialListSeoTab } from "@/components/page_ui/material-list-seo-tab";
import { Input } from "@/components/ui/input";
import type { BannerImage, VariantItem } from "@/api/types/material-list.types";

interface MaterialListFormData {
  name: string;
  slug: string;
  description: string;
  pricePerUnit: number | "";
  unitValue: string;
  companyId: string | null;
  logo: string;
  serviceCategoryId: string | null;
  faqCategoryId: string | null;
  faqGroupSlug: string;
  variants: VariantItem[];
  isActive: boolean;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  bannerImages: BannerImage[];
  videoUrl: string;
}

interface Props {
  form: MaterialListFormData;
  editingId: string | null;
  saving: boolean;
  bannerImages: BannerImage[];
  onBannerImagesChange: (images: BannerImage[]) => void;
  onChange: (key: string, value: string | boolean | number | VariantItem[] | null) => void;
  onSave: () => void;
  onBack: () => void;
}

const EMPTY: MaterialListFormData = {
  name: "",
  slug: "",
  description: "",
  pricePerUnit: "",
  unitValue: "",
  companyId: null,
  logo: "",
  serviceCategoryId: null,
  faqCategoryId: null,
  faqGroupSlug: "",
  variants: [],
  isActive: true,
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  bannerImages: [],
  videoUrl: "",
};

export { EMPTY };
export type { MaterialListFormData };

export function MaterialListForm({
  form,
  editingId,
  saving,
  bannerImages,
  onBannerImagesChange,
  onChange,
  onSave,
  onBack,
}: Props) {
  const { data: serviceCategories = [] } = useCategoryOptions("services");

  return (
    <div>
      <FormHeader
        breadcrumb="Material List"
        title={editingId ? form.name || "Edit Material" : "New Material"}
        onBack={onBack}
        onSave={onSave}
        saving={saving}
        saveDisabled={!form.name.trim() || saving}
        saveLabel={editingId ? "Update" : "Create"}
      />

      <Tabs defaultValue="overview" className="w-full flex flex-col">
        <div>
          <FormTabs
            tabs={[
              { value: "overview", label: "Overview" },
              { value: "variants", label: "Variants" },
              { value: "media", label: "Media" },
              { value: "seo", label: "SEO" },
              { value: "settings", label: "Settings" },
            ]}
          />
        </div>

        <div>
          <TabsContent value="overview" className="mt-4">
            <FormCard>
              <MaterialListOverviewTab
                name={form.name}
                slug={form.slug}
                pricePerUnit={form.pricePerUnit}
                description={form.description}
                unitValue={form.unitValue}
                companyId={form.companyId}
                logo={form.logo}
                editingId={editingId}
                onChange={onChange}
              />
            </FormCard>
          </TabsContent>

          <TabsContent value="variants" className="mt-4">
            <FormCard>
              <MaterialListVariantsTab
                variants={form.variants}
                onChange={onChange}
              />
            </FormCard>
          </TabsContent>

          <TabsContent value="media" className="mt-4">
            <MaterialListMediaTab
              bannerImages={bannerImages}
              videoUrl={form.videoUrl}
              onBannerImagesChange={onBannerImagesChange}
              onChange={onChange}
            />
          </TabsContent>

          <TabsContent value="seo" className="mt-4">
            <FormCard>
              <MaterialListSeoTab
                metaTitle={form.metaTitle}
                metaDescription={form.metaDescription}
                metaKeywords={form.metaKeywords}
                onChange={onChange}
              />
            </FormCard>
          </TabsContent>

          <TabsContent value="settings" className="mt-4">
            <FormCard>
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <SegmentedToggle<boolean>
                    value={form.isActive}
                    onChange={(v) => onChange("isActive", v)}
                    options={[
                      { value: true, label: "Active" },
                      { value: false, label: "Inactive" },
                    ]}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Service Category</Label>
                  <SearchableSelect
                    options={[
                      { value: "", label: "All Services" },
                      ...serviceCategories,
                    ]}
                    value={form.serviceCategoryId ?? ""}
                    onChange={(v) => onChange("serviceCategoryId", v || null)}
                    placeholder="All Services"
                    searchPlaceholder="Search categories..."
                  />
                </div>

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
              </div>
            </FormCard>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
