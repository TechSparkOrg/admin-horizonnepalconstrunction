"use client";

import { CategoryAdmin } from "@/api/services/category.service";
import { CategorySectionPage } from "@/components/page_ui/category-section-page";

export default function FaqCategoriesPage() {
  return (
    <CategorySectionPage
      heading="FAQ Categories"
      breadcrumb="FAQ"
      queryType="faq"
      services={{
        list: (params) => CategoryAdmin.listFaq(params),
        create: (data) => CategoryAdmin.createFaq(data),
        update: (id, data) => CategoryAdmin.updateFaq(id, data),
        remove: (id) => CategoryAdmin.deleteFaq(id),
      }}
    />
  );
}
