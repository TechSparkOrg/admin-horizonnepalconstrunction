"use client";

import { SeoFields } from "@/components/global_ui/seo-fields";

interface UnitConverterSeoTabProps {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  onChange: (key: string, value: string | boolean) => void;
}

export function UnitConverterSeoTab({
  metaTitle,
  metaDescription,
  metaKeywords,
  onChange,
}: UnitConverterSeoTabProps) {
  return (
    <SeoFields
      metaTitle={metaTitle}
      metaDescription={metaDescription}
      metaKeywords={metaKeywords}
      onChange={(field, value) => onChange(field as string, value)}
      titlePlaceholder="Defaults to conversion title"
    />
  );
}
