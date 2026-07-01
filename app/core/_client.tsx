"use client";

import dynamic from "next/dynamic";

const CoreForm = dynamic(() => import("@/components/page_ui/core-form").then((m) => m.CoreForm));

export function _Client() {
  return <CoreForm />;
}
