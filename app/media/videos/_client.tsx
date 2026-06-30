"use client";

import { MediaListClient } from "@/components/page_ui/media-list-client";

export default function VideosClient() {
  return (
    <MediaListClient
      groupTitle="Videos"
      labelSingular="Video"
      subtitle="Media / Videos"
      accept="video/*"
    />
  );
}
