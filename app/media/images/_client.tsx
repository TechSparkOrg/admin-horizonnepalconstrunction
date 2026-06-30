"use client";

import { MediaListClient } from "@/components/page_ui/media-list-client";

export default function ImagesClient() {
  return (
    <MediaListClient
      groupTitle="Images"
      labelSingular="Image"
      subtitle="Media / Images"
      accept="image/*"
    />
  );
}
