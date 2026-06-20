"use client";

import { FormHeader } from "@/components/global_ui/form-header";
import { FormTabs } from "@/components/global_ui/form-tabs";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import type { Category } from "@/api/types/category.types";
import { BlogContentTab } from "@/components/page_ui/blog-content-tab";
import { BlogMediaTab } from "@/components/page_ui/blog-media-tab";
import { BlogSeoTab } from "@/components/page_ui/blog-seo-tab";
import { BlogSettingsTab } from "@/components/page_ui/blog-settings-tab";

interface StaffMember {
  id: string;
  name: string;
  image?: string;
}

interface Project {
  id: string;
  title: string;
}

interface BlogFormData {
  title: string;
  slug: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  isActive: boolean;
  isPublished: boolean;
  publishDate: string;
  projectId: string;
  authorMode: "manual" | "team";
  authorName: string;
  authorImage: string;
  authorTeamId: string;
  categoryId: string;
  model3dBlock: string;
  videoBlockUrl: string;
  videoEmbedUrl: string;
}

interface Props {
  form: BlogFormData;
  editingSlug: string | null;
  saving: boolean;
  projects?: Project[];
  teamMembers?: StaffMember[];
  categories?: Category[];
  bannerImages: { id: string; url: string; name: string }[];
  onBannerImagesChange: (images: { id: string; url: string; name: string }[]) => void;
  reelBlocks: { url: string }[];
  onReelBlocksChange: (blocks: { url: string }[]) => void;
  onChange: (key: string, value: string | boolean) => void;
  onSave: () => void;
  onBack: () => void;
}

export function BlogForm({
  form,
  editingSlug,
  saving,
  categories = [],
  projects = [],
  teamMembers = [],
  bannerImages,
  onBannerImagesChange,
  reelBlocks,
  onReelBlocksChange,
  onChange,
  onSave,
  onBack,
}: Props) {
  return (
    <div>
      <FormHeader
        breadcrumb="Blogs"
        title={editingSlug ? form.title || "Edit Blog" : "New Blog"}
        onBack={onBack}
        onSave={onSave}
        saving={saving}
        saveDisabled={!form.title.trim() || saving}
        saveLabel={editingSlug ? "Update" : "Publish"}
      />

      <Tabs defaultValue="content" className="w-full flex flex-col">
        <div>
          <FormTabs tabs={[{"value":"content","label":"Content"},{"value":"media","label":"Media"},{"value":"seo","label":"SEO"},{"value":"settings","label":"Settings"}]} />
        </div>

        <div>
          <TabsContent value="content" className="space-y-5 mt-4">
            <BlogContentTab
              title={form.title}
              slug={form.slug}
              categoryId={form.categoryId}
              content={form.content}
              categories={categories}
              onChange={onChange}
            />
          </TabsContent>

          <TabsContent value="media" className="space-y-4">
            <BlogMediaTab
              model3dBlock={form.model3dBlock}
              videoBlockUrl={form.videoBlockUrl}
              videoEmbedUrl={form.videoEmbedUrl}
              bannerImages={bannerImages}
              reelBlocks={reelBlocks}
              onBannerImagesChange={onBannerImagesChange}
              onReelBlocksChange={onReelBlocksChange}
              onChange={onChange}
            />
          </TabsContent>

          <TabsContent value="seo" className="mt-4">
            <BlogSeoTab
              metaTitle={form.metaTitle}
              metaDescription={form.metaDescription}
              metaKeywords={form.metaKeywords}
              onChange={onChange}
            />
          </TabsContent>

          <TabsContent value="settings" className="space-y-5">
            <BlogSettingsTab
              isPublished={form.isPublished}
              publishDate={form.publishDate}
              projectId={form.projectId}
              authorMode={form.authorMode}
              authorName={form.authorName}
              authorImage={form.authorImage}
              authorTeamId={form.authorTeamId}
              projects={projects}
              teamMembers={teamMembers}
              onChange={onChange}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
