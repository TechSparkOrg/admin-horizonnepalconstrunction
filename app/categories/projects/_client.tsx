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
      heading="Project Categories"
      breadcrumb="Project"
      queryType="project"
      services={{
        list: (params?: Record<string, unknown>) => CategoryAdmin.listProject(params),
        create: (data: CategoryCreate) => CategoryAdmin.createProject(data),
        update: (id: string, data: Partial<CategoryCreate>) => CategoryAdmin.updateProject(id, data),
        remove: (id: string) => CategoryAdmin.deleteProject(id),
      }}
    />
  );
}
