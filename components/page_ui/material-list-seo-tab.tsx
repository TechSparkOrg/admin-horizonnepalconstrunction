"use client";

import { SeoFields } from "@/components/global_ui/seo-fields";

interface Props {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  onChange: (key: string, value: string | boolean) => void;
}

export function MaterialListSeoTab({
  metaTitle,
  metaDescription,
  metaKeywords,
  onChange,
}: Props) {
  return (
    <SeoFields
      metaTitle={metaTitle}
      metaDescription={metaDescription}
      metaKeywords={metaKeywords}
      onChange={(field, value) => onChange(field as string, value)}
      titlePlaceholder="Defaults to material name"
    />
  );
}
