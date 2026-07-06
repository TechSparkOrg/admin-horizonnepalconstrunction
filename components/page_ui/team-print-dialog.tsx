"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { SearchableSelect } from "@/components/global_ui/searchable-select";
import { TemplateTokensCard } from "@/components/global_ui/template-tokens-card";
import { useQuery } from "@tanstack/react-query";
import { TemplateAdmin } from "@/api/services/template.service";
import { printHtml } from "@/lib/print";
import { TEAM_PAYMENT_SECTIONS } from "@/lib/template-tokens";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TeamPrintDialog({ open, onOpenChange }: Props) {
  const [templateId, setTemplateId] = useState("");

  const { data: templates = [] } = useQuery({
    queryKey: ["team-accounting", "print-templates"],
    queryFn: async () => (await TemplateAdmin.search({})).results ?? [],
    enabled: open,
    staleTime: 60000,
  });

  const handlePrint = async () => {
    if (!templateId) { toast.error("Select a template first"); return; }
    try {
      const vars: Record<string, string> = {};
      const html = await TemplateAdmin.previewHtml(templateId, vars);
      printHtml(html);
    } catch {
      toast.error("Failed to generate preview");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Print Team Report</DialogTitle>
          <DialogDescription>Generate a printable team payment report</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Template</Label>
            <SearchableSelect
              options={templates.map((t) => ({ value: t.id, label: t.title }))}
              value={templateId}
              onChange={setTemplateId}
              placeholder="Select a template..."
              searchPlaceholder="Search templates..."
            />
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-[11px] font-semibold text-muted-foreground mb-2">Available tokens</p>
            <TemplateTokensCard sections={TEAM_PAYMENT_SECTIONS} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="default" size="sm" onClick={handlePrint} disabled={!templateId}>
            <Eye className="size-3.5 mr-1" /> Preview & Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
