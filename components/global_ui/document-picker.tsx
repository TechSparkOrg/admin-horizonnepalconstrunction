"use client";

import dynamic from "next/dynamic";

const DocumentPicker = dynamic(
  () => import("./document-picker-inner").then((m) => m.DocumentPicker),
  { ssr: false }
);

export { DocumentPicker };
export type { PickerMediaItem } from "./document-picker-inner";
