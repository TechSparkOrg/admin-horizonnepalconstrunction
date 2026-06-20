"use client";

import { SeoFields } from "@/components/global_ui/seo-fields";

interface BlogSeoTabProps {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  onChange: (key: string, value: string | boolean) => void;
}

export function BlogSeoTab({
  metaTitle,
  metaDescription,
  metaKeywords,
  onChange,
}: BlogSeoTabProps) {
  return <SeoFields metaTitle={metaTitle} metaDescription={metaDescription} metaKeywords={metaKeywords} onChange={onChange} titlePlaceholder="Defaults to blog title" />;
}
