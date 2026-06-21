"use client";

import { CategoryAdmin } from "@/api/services/category.service";
import { CategorySectionPage } from "@/components/page_ui/category-section-page";

export default function ProjectCategoriesPage() {
  return (
    <CategorySectionPage
      heading="Project Categories"
      breadcrumb="Project"
      queryType="project"
      services={{
        list: (params) => CategoryAdmin.listProject(params),
        create: (data) => CategoryAdmin.createProject(data),
        update: (id, data) => CategoryAdmin.updateProject(id, data),
        remove: (id) => CategoryAdmin.deleteProject(id),
      }}
    />
  );
}
