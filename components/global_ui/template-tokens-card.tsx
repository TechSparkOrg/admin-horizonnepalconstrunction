import type { TokenSection } from "@/lib/template-tokens";

const VARIANT_STYLES: Record<string, { bg: string; color: string }> = {
  purple: { bg: "bg-purple-100", color: "text-purple-700" },
  blue: { bg: "bg-blue-50", color: "text-blue-700" },
  green: { bg: "bg-green-50", color: "text-green-700" },
  amber: { bg: "bg-amber-50", color: "text-amber-700" },
  gray: { bg: "bg-gray-100", color: "text-gray-700" },
};

interface Props {
  sections: TokenSection[];
}

export function TemplateTokensCard({ sections }: Props) {
  return (
    <div className="space-y-3">
      {sections.map((section) => {
        const style = VARIANT_STYLES[section.variant] ?? VARIANT_STYLES.gray;
        return (
          <div key={section.heading}>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{section.heading}</p>
            {section.description && (
              <p className="text-[10px] text-gray-400 mb-1.5">{section.description}</p>
            )}
            <div className="flex flex-wrap gap-1.5">
              {section.tokens.map((k) => (
                <span key={k} className={`text-[11px] px-2 py-0.5 rounded font-mono ${style.bg} ${style.color}`}>{`{${k}}`}</span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
