"use client";

import dynamic from "next/dynamic";

const RichMediaPicker = dynamic(
  () => import("./rich-media-picker-inner").then((m) => m.RichMediaPicker),
  { ssr: false }
);

export { RichMediaPicker };
export type { PickerMediaItem } from "./rich-media-picker-inner";
