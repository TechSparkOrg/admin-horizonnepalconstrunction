import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SeoFieldsProps {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  onChange?: (field: "metaTitle" | "metaDescription" | "metaKeywords", value: string) => void;
  onMetaTitleChange?: (value: string) => void;
  onMetaDescriptionChange?: (value: string) => void;
  onMetaKeywordsChange?: (value: string) => void;
  titlePlaceholder?: string;
}

const META_TITLE_MAX = 60;
const META_DESC_MAX = 160;
const META_KEYWORDS_MAX = 255;

function charCount(value: string, max: number) {
  const len = value.length;
  const over = len > max;
  return <span className={over ? "text-red-500 font-medium" : "text-gray-400"}>{len} / {max}</span>;
}

export function SeoFields({
  metaTitle,
  metaDescription,
  metaKeywords,
  onChange,
  onMetaTitleChange,
  onMetaDescriptionChange,
  onMetaKeywordsChange,
  titlePlaceholder = "Defaults to title",
}: SeoFieldsProps) {
  const handleTitle = (v: string) => { onChange?.("metaTitle", v); onMetaTitleChange?.(v); };
  const handleDescription = (v: string) => { onChange?.("metaDescription", v); onMetaDescriptionChange?.(v); };
  const handleKeywords = (v: string) => { onChange?.("metaKeywords", v); onMetaKeywordsChange?.(v); };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Meta Title</Label>
        <Input
          value={metaTitle}
          onChange={(e) => handleTitle(e.target.value)}
          placeholder={titlePlaceholder}
          maxLength={META_TITLE_MAX}
        />
        <p className="text-right text-[11px]">{charCount(metaTitle, META_TITLE_MAX)}</p>
      </div>

      <div className="space-y-1.5">
        <Label>Meta Description</Label>
        <Textarea
          value={metaDescription}
          onChange={(e) => handleDescription(e.target.value)}
          placeholder="Brief description for search results"
          rows={3}
          maxLength={META_DESC_MAX}
        />
        <p className="text-right text-[11px]">{charCount(metaDescription, META_DESC_MAX)}</p>
      </div>

      <div className="space-y-1.5">
        <Label>Meta Keywords</Label>
        <Input
          value={metaKeywords}
          onChange={(e) => handleKeywords(e.target.value)}
          placeholder="keyword1, keyword2, keyword3"
          maxLength={META_KEYWORDS_MAX}
        />
        <p className="text-right text-[11px]">{charCount(metaKeywords, META_KEYWORDS_MAX)}</p>
      </div>
    </div>
  );
}
