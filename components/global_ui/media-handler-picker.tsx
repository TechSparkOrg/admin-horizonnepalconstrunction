"use client";

import dynamic from "next/dynamic";

const MediaPickerDialog = dynamic(
  () => import("./media-handler-picker-inner").then((m) => m.MediaPickerDialog),
  { ssr: false }
);

export { MediaPickerDialog };
export type { PickerMediaItem } from "./media-handler-picker-inner";
