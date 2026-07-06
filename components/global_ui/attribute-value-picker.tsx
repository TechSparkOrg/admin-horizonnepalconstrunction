"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/global_ui/searchable-select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { flattenAttributeValues } from "@/lib/attributes";
import type { AttributeItem } from "@/api/types/attribute.types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (value: string) => void;
  attributes: AttributeItem[];
  title: string;
  placeholder: string;
}

export function AttributeValuePickerDialog({ open, onOpenChange, onConfirm, attributes, title, placeholder }: Props) {
  const attrGroups = useMemo(() => flattenAttributeValues(attributes), [attributes]);
  const [selectedLabel, setSelectedLabel] = useState("");
  const [selectedValue, setSelectedValue] = useState("");

  const currentValues = useMemo(() => {
    const group = attrGroups.find((g) => g.label === selectedLabel);
    return group?.values ?? [];
  }, [attrGroups, selectedLabel]);

  const handleConfirm = () => {
    if (!selectedValue) {
      toast.error("Pick a value first");
      return;
    }
    onConfirm(selectedValue);
    setSelectedLabel("");
    setSelectedValue("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { setSelectedLabel(""); setSelectedValue(""); } onOpenChange(o); }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{placeholder}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">Label</Label>
            <SearchableSelect
              options={attrGroups.map((g) => ({ value: g.label, label: g.label }))}
              value={selectedLabel}
              onChange={(v) => { setSelectedLabel(v); setSelectedValue(""); }}
              placeholder="Choose a label..."
              searchPlaceholder="Search labels..."
            />
          </div>
          {selectedLabel && (
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">Value</Label>
              <SearchableSelect
                options={currentValues.map((v) => ({ value: v, label: v }))}
                value={selectedValue}
                onChange={setSelectedValue}
                placeholder="Choose a value..."
                searchPlaceholder="Search values..."
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="default" size="sm" onClick={handleConfirm}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
