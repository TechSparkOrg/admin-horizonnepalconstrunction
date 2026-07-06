import { Pencil, Trash2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActionButtonsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onPrint?: () => void;
  iconOnly?: boolean;
  showDelete?: boolean;
  editLabel?: string;
  deleteLabel?: string;
  printLabel?: string;
}

export function ActionButtons({
  onEdit, onDelete, onPrint, iconOnly = false, showDelete = true,
  editLabel = "Details", deleteLabel = "Delete", printLabel = "Print",
}: ActionButtonsProps) {
  if (iconOnly) {
    return (
      <div className="flex items-center justify-end gap-1">
        {onEdit && (
          <button type="button" onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="size-7 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100">
            <Pencil className="size-3" />
          </button>
        )}
        {onPrint && (
          <button type="button" onClick={(e) => { e.stopPropagation(); onPrint(); }}
            className="size-7 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100">
            <Printer className="size-3" />
          </button>
        )}
        {showDelete && onDelete && (
          <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="size-7 flex items-center justify-center rounded text-red-300 hover:text-red-600 hover:bg-red-50">
            <Trash2 className="size-3" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {onEdit && (
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
      )}
      {onPrint && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(e) => { e.stopPropagation(); onPrint(); }}
        >
          <Printer className="w-3.5 h-3.5" />
          {printLabel}
        </Button>
      )}
      {showDelete && onDelete && (
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
