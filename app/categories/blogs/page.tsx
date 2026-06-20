"use client";

import { CategoryAdmin } from "@/api/services/category.service";
import { CategorySectionPage } from "@/components/page_ui/category-section-page";

export default function BlogCategoriesPage() {
  return (
    <CategorySectionPage
      heading="Blog Categories"
      breadcrumb="Blog"
      services={{
        list: (params) => CategoryAdmin.listBlog(params),
        create: (data) => CategoryAdmin.createBlog(data),
        update: (id, data) => CategoryAdmin.updateBlog(id, data),
        remove: (id) => CategoryAdmin.deleteBlog(id),
      }}
    />
  );
}
