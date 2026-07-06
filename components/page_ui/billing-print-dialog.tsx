"use client";

import { useState } from "react";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/global_ui/searchable-select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { TemplateAdmin } from "@/api/services/template.service";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";

export type BillingDataPayload = {
  materials: Array<{ name: string; variant: string; price: number; qty: number; total: number; group: string }>;
  team: Array<{ name: string; role: string; rate: number; hours: number; days: number; total: number; group: string }>;
  taxes: Array<{ label: string; rate_display: string; type: string; amount: number }>;
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  billingVars: Record<string, string>;
  billingData: BillingDataPayload;
}

export function BillingPrintDialog({ open, onOpenChange, billingVars, billingData }: Props) {
  const [printTemplateId, setPrintTemplateId] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: printTemplates = [] } = useQuery({
    queryKey: queryKeys.templates.list({}),
    queryFn: async () => (await TemplateAdmin.search({})).results ?? [],
    enabled: open,
    staleTime: 60000,
  });

  const triggerPrint = async () => {
    if (!printTemplateId) { toast.error("Select a template first"); return; }
    setLoading(true);
    try {
      const html = await TemplateAdmin.previewHtml(printTemplateId, billingVars, billingData);
      const iframe = document.createElement("iframe");
      iframe.style.cssText = "position:fixed;top:0;left:-100vw;width:210mm;height:297mm;border:0;visibility:hidden";
      document.body.appendChild(iframe);
      iframe.onload = () => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 2000);
      };
      iframe.srcdoc = html;
    } catch {
      toast.error("Failed to generate preview");
    } finally {
      setLoading(false);
    }
  };

  const selectedTemplate = printTemplates.find((t) => t.id === printTemplateId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Export as PDF</DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Choose a template — billing values and tables will be injected automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-700">Template</Label>
            <SearchableSelect
              options={printTemplates.map((t) => ({ value: t.id, label: t.title }))}
              value={printTemplateId}
              onChange={setPrintTemplateId}
              placeholder="Select a template..."
              searchPlaceholder="Search templates..."
            />
            {selectedTemplate && (
              <p className="text-[11px] text-gray-400">{selectedTemplate.attribute_name}</p>
            )}
          </div>

          <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 space-y-2">
            <p className="text-[11px] font-semibold text-gray-600">Available tokens</p>
            <div>
              <p className="text-[10px] text-gray-400 mb-1">Tables (full auto-generated)</p>
              <div className="flex flex-wrap gap-1">
                {["materials_table", "team_table", "taxes_table"].map((k) => (
                  <span key={k} className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-mono">{`{${k}}`}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 mb-1">Row tokens — place in a <code className="bg-gray-200 px-0.5 rounded">{"<td>"}</code>, row repeats per entry</p>
              <div className="flex flex-wrap gap-1">
                {[
                  "materials.name","materials.variant","materials.price","materials.qty","materials.total","materials.group",
                  "team.name","team.role","team.rate","team.hours","team.days","team.total","team.group",
                  "taxes.label","taxes.rate_display","taxes.type","taxes.amount",
                ].map((k) => (
                  <span key={k} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono">{`{${k}}`}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 mb-1">Values</p>
              <div className="flex flex-wrap gap-1">
                {Object.keys(billingVars).map((k) => (
                  <span key={k} className="text-[10px] px-1.5 py-0.5 rounded bg-sidebar-primary/10 text-sidebar-primary font-mono">{`{${k}}`}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" onClick={triggerPrint} disabled={!printTemplateId || loading}
            className="bg-sidebar-primary hover:bg-sidebar-primary/90 gap-1.5">
            {loading ? (
              <><FileText className="size-3.5 animate-pulse" /> Generating…</>
            ) : (
              <><Download className="size-3.5" /> Generate PDF</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
