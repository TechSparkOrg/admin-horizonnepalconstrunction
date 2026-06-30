"use client";

import dynamic from "next/dynamic";
import { CategoryAdmin } from "@/api/services/category.service";
import type { Category, CategoryCreate } from "@/api/types/category.types";

const CategorySectionPage = dynamic(
  () => import("@/components/page_ui/category-section-page").then(m => m.CategorySectionPage),
  { ssr: false }
);

export function _Client() {
  return (
    <CategorySectionPage
      heading="Services Categories"
      breadcrumb="Services"
      queryType="service"
      showTypeField
      showTypeColumn
      services={{
        list: (params?: Record<string, unknown>) => CategoryAdmin.listServices(params),
        create: (data: CategoryCreate) => CategoryAdmin.createService(data),
        update: (id: string, data: Partial<CategoryCreate>) => CategoryAdmin.updateService(id, data),
        remove: (id: string) => CategoryAdmin.deleteService(id),
      }}
    />
  );
}
