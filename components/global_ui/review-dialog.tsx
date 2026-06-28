"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { AdminReview, AdminReviewCreate } from "@/api/types/review.types";

interface Props {
  item: AdminReview | null
  saving: boolean
  onSave: (data: AdminReviewCreate) => void
  onStatusChange?: (id: string, status: AdminReview["status"]) => void
  onClose: () => void
}

function StarSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className={`p-0.5 transition ${s <= value ? "text-amber-400" : "text-gray-200"} hover:scale-110`}
        >
          <Star className="size-5 fill-current" />
        </button>
      ))}
    </div>
  );
}

export function ReviewDialog({ item, saving, onSave, onStatusChange, onClose }: Props) {
  const isEditing = !!item;
  const [name, setName] = useState(item?.name ?? "");
  const [rating, setRating] = useState(item?.rating ?? 5);
  const [description, setDescription] = useState(item?.description ?? "");

  useEffect(() => {
    if (item) {
      setName(item.name);
      setRating(item.rating);
      setDescription(item.description);
    } else {
      setName("");
      setRating(5);
      setDescription("");
    }
  }, [item]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), rating, description: description.trim() });
  };

  const canSave = name.trim().length > 0 && !saving;

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="!max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Review" : "New Review"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the review details and status." : "Add a new customer review."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Name <span className="text-red-500">*</span></Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Reviewer name"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Rating</Label>
            <StarSelector value={rating} onChange={setRating} />
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What did they say?"
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!canSave}>
              {saving ? "Saving..." : isEditing ? "Update" : "Create"}
            </Button>
          </div>

          {isEditing && item && onStatusChange && (
            <div className="border-t border-gray-200 pt-4 mt-2">
              <p className="text-xs font-medium text-gray-500 mb-2">Change Status</p>
              <div className="flex gap-2">
                {item.status !== "read" && (
                  <Button variant="outline" size="sm" onClick={() => onStatusChange(item.id, "read")}>
                    Mark Read
                  </Button>
                )}
                {item.status !== "published" && (
                  <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => onStatusChange(item.id, "published")}>
                    Publish
                  </Button>
                )}
                {item.status !== "ignored" && (
                  <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => onStatusChange(item.id, "ignored")}>
                    Ignore
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
