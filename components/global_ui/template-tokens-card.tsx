import { FormCard } from "@/components/global_ui/form-card";

interface Props {
  materialGroups: { groupLabel: string }[];
  teamGroups: { groupLabel: string }[];
  taxes: { label: string }[];
  billingVars: Record<string, string>;
}

export function TemplateTokensCard({ materialGroups, teamGroups, taxes, billingVars }: Props) {
  return (
    <FormCard>
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Template Tokens</p>
      <p className="text-xs text-gray-400 mb-3">Use these in billing templates — values update live as you fill in data.</p>
      <div className="space-y-3">
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Tables — auto-generated full tables</p>
          <p className="text-[10px] text-gray-400 mb-1.5">Place once in template; backend renders all rows with headers, subtotals, and pagination.</p>
          <div className="flex flex-wrap gap-1.5">
            {[
              { k: "materials_table", label: "All material rows" },
              { k: "team_table", label: "All team entries" },
              { k: "taxes_table", label: "All tax rows" },
            ].map(({ k, label }) => (
              <span key={k} title={label} className="text-[11px] px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-mono">{`{${k}}`}</span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Row Template Tokens</p>
          <p className="text-[10px] text-gray-400 mb-1.5">Design your own table in the template editor. Place these in a <code className="bg-gray-100 px-0.5 rounded">{"<td>"}</code> — the row auto-repeats for each entry.</p>
          <div className="space-y-1.5">
            <div className="flex flex-wrap gap-1">
              {["materials.name","materials.variant","materials.price","materials.qty","materials.total","materials.group"].map((k) => (
                <span key={k} className="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 font-mono">{`{${k}}`}</span>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {["team.name","team.role","team.rate","team.hours","team.days","team.total","team.group"].map((k) => (
                <span key={k} className="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 font-mono">{`{${k}}`}</span>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {["taxes.label","taxes.rate_display","taxes.type","taxes.amount"].map((k) => (
                <span key={k} className="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 font-mono">{`{${k}}`}</span>
              ))}
            </div>
          </div>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Basic</p>
          <div className="flex flex-wrap gap-1.5">
            {(["title", "project", "balance_status"] as const).map((k) => (
              <span key={k} className="text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-mono">{`{${k}}`}</span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Financials</p>
          <div className="flex flex-wrap gap-1.5">
            {(["materials_total", "team_total", "tax_total", "grand_total", "contract_value", "balance"] as const).map((k) => (
              <span key={k} className="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono">{`{${k}}`}</span>
            ))}
          </div>
        </div>
        {materialGroups.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Materials by Group</p>
            <div className="flex flex-wrap gap-1.5">
              {materialGroups.map((g) => {
                const k = `mat_${g.groupLabel.toLowerCase().replace(/\W+/g, "_")}`;
                return <span key={k} className="text-[11px] px-2 py-0.5 rounded bg-green-50 text-green-700 font-mono">{`{${k}}`}</span>;
              })}
            </div>
          </div>
        )}
        {teamGroups.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Team by Group</p>
            <div className="flex flex-wrap gap-1.5">
              {teamGroups.map((g) => {
                const k = `team_${g.groupLabel.toLowerCase().replace(/\W+/g, "_")}`;
                return <span key={k} className="text-[11px] px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-mono">{`{${k}}`}</span>;
              })}
            </div>
          </div>
        )}
        {taxes.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Taxes</p>
            <div className="flex flex-wrap gap-1.5">
              {taxes.map((t) => {
                const k = `tax_${t.label.toLowerCase().replace(/\W+/g, "_")}`;
                return <span key={k} className="text-[11px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-mono">{`{${k}}`}</span>;
              })}
            </div>
          </div>
        )}
      </div>
    </FormCard>
  );
}
