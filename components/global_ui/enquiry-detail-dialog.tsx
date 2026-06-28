"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/global_ui/status-badge";
import { formatDate } from "@/lib/utils";
import { Mail, Phone, Calendar, MapPin, FileText, Eye } from "lucide-react";
import type { ConsultationSubmission } from "@/api/types/consultation.types";

const READ_STATUS = {
  true: { label: "Read", color: "border-green-200 bg-green-50 text-green-600", dotColor: "bg-green-500" },
  false: { label: "Unread", color: "border-amber-200 bg-amber-50 text-amber-600", dotColor: "bg-amber-500" },
} as const;

interface Props {
  item: ConsultationSubmission | null;
  onClose: () => void;
  onMarkRead?: (id: string) => void;
}

export function EnquiryDetailDialog({ item, onClose, onMarkRead }: Props) {
  if (!item) return null;

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="!max-w-4xl !max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enquiry Details</DialogTitle>
          <DialogDescription>Submitted on {formatDate(item.created_at)}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">{item.name}</h3>
            <StatusBadge value={item.is_read} map={READ_STATUS} />
          </div>

          <div className="space-y-2">
            <a href={`mailto:${item.email}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-brand-primary">
              <Mail className="size-4" /> {item.email}
            </a>
            <a href={`tel:${item.phone}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-brand-primary">
              <Phone className="size-4" /> {item.phone}
            </a>
          </div>

          <div className="flex items-start gap-2">
            <FileText className="size-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">Service</p>
              <p className="text-sm">{item.service || "—"}</p>
            </div>
          </div>

          {item.description && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Description</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{item.description}</p>
            </div>
          )}

          {item.preferred_date && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="size-4 shrink-0" />
              <span>Preferred date: {formatDate(item.preferred_date)}</span>
            </div>
          )}

          {item.landmark && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="size-4 shrink-0" />
              <span>{item.landmark}</span>
            </div>
          )}

          {item.site_photos?.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2">Site Photos ({item.site_photos.length})</p>
              <div className="grid grid-cols-3 gap-2">
                {item.site_photos.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <Image src={url} alt={`Site photo ${i + 1}`} width={200} height={200} className="object-cover size-full hover:scale-105 transition-transform" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {!item.is_read && onMarkRead && (
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={() => { onMarkRead(item.id); onClose(); }}
            >
              <Eye className="size-4 mr-2" />
              Mark as Read
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
