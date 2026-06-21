import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActionButtonsProps {
  onEdit: () => void;
  onDelete: () => void;
  showDelete?: boolean;
  editLabel?: string;
  deleteLabel?: string;
}

export function ActionButtons({ onEdit, onDelete, showDelete = true, editLabel = "Details", deleteLabel = "Delete" }: ActionButtonsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="text-sidebar-primary border-sidebar-primary/20 hover:bg-sidebar-primary/5"
        onClick={(e) => { e.stopPropagation(); onEdit(); }}
      >
        <Pencil className="w-3.5 h-3.5" />
        {editLabel}
      </Button>
      {showDelete && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-red-500 border-red-200 hover:bg-red-50"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
        >
          <Trash2 className="w-3.5 h-3.5" />
          {deleteLabel}
        </Button>
      )}
    </div>
  );
}
