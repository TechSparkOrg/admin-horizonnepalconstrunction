"use client";

import { CategoryAdmin } from "@/api/services/category.service";
import { CategorySectionPage } from "@/components/page_ui/category-section-page";

export default function ServicesCategoriesPage() {
  return (
    <CategorySectionPage
      heading="Services Categories"
      breadcrumb="Services"
      queryType="service"
      showTypeField
      showTypeColumn
      services={{
        list: (params) => CategoryAdmin.listServices(params),
        create: (data) => CategoryAdmin.createService(data),
        update: (id, data) => CategoryAdmin.updateService(id, data),
        remove: (id) => CategoryAdmin.deleteService(id),
      }}
    />
  );
}
