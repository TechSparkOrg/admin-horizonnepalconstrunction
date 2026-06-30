"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Edit, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { MediaService } from "@/api/services/media.service";
import type { UsageTag } from "@/api/types/media.types";
import { Badge } from "@/components/ui/badge";
import { MediaSeoDialog } from "@/components/page_ui/media-seo-dialog";

interface Props {
  mediaId: string;
  usageTags?: UsageTag[];
}

export function UsageDetailPanel({ mediaId, usageTags }: Props) {
  const [open, setOpen] = useState(false);
  const [seoMediaId, setSeoMediaId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["media", "usage-detail", mediaId],
    queryFn: async () => {
      const res = await MediaService.getUsageDetail(mediaId);
      return res;
    },
    enabled: open,
    staleTime: 1000 * 60 * 5,
  });

  const hasTags = usageTags && usageTags.length > 0;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex items-center gap-1.5 text-left"
      >
        {hasTags ? (
          <div className="flex flex-wrap gap-1 items-center">
            {usageTags!.map((t) => (
              <Badge
                key={t.type}
                variant="outline"
                className="rounded-md text-[11px] font-normal bg-gray-50 text-gray-500 border-gray-200 cursor-pointer group-hover:border-gray-300"
              >
                {t.type} ({t.count})
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-sm text-gray-400">&mdash;</span>
        )}
        <ChevronRight className="size-3 text-gray-400 shrink-0 group-hover:text-gray-600 transition-colors" />
      </button>
    );
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => { setOpen(false); setSeoMediaId(null); }}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors mb-2"
      >
        <MapPin className="size-3" />
        <span className="font-medium">
          Used in {isLoading ? "..." : `${data?.total ?? 0} place${(data?.total ?? 0) !== 1 ? "s" : ""}`}
        </span>
        <ChevronDown className="size-3" />
      </button>

      {isLoading ? (
        <div className="space-y-2 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-5 bg-gray-200 rounded w-3/4" />
          ))}
        </div>
      ) : data?.groups && data.groups.length > 0 ? (
        <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
          {data.groups.map((group) => (
            <div key={group.type}>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1 pl-1">
                {group.label} ({group.items.length})
              </p>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <div key={item.id}>
                    <div className="flex items-center gap-2 bg-white rounded-md border border-gray-100 px-2.5 py-1.5 text-xs">
                      <span className="truncate flex-1 min-w-0 text-gray-700 font-medium">
                        {item.label}
                      </span>
                      <span className="text-[10px] text-gray-400 bg-gray-100 rounded px-1.5 py-0.5 shrink-0">
                        {item.field}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setSeoMediaId(mediaId); }}
                        className="size-6 flex items-center justify-center rounded-md bg-sidebar-primary/10 text-sidebar-primary hover:bg-sidebar-primary/20 transition-colors shrink-0"
                        title="Edit SEO"
                      >
                        <Edit className="size-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400">Not used anywhere.</p>
      )}

      <MediaSeoDialog mediaId={seoMediaId} onClose={() => setSeoMediaId(null)} />
    </div>
  );
}
