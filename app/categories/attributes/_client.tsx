"use client";

import dynamic from "next/dynamic";

const AttributeSectionPage = dynamic(
  () => import("@/components/page_ui/attribute-section-page").then(m => m.AttributeSectionPage),
  { ssr: false }
);

export function _Client() {
  return <AttributeSectionPage />;
}
