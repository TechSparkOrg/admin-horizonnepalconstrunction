import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichEditor } from "@/components/page_ui/rich-editor";

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
        />
        <p className="text-right text-[11px] text-gray-400">{metaTitle.length} / 60</p>
      </div>

      <div className="space-y-1.5">
        <Label>Meta Description</Label>
        <RichEditor
          value={metaDescription}
          onChange={(html) => handleDescription(html)}
          minHeight={120}
        />
        <p className="text-right text-[11px] text-gray-400">{metaDescription.length} / 160</p>
      </div>

      <div className="space-y-1.5">
        <Label>Meta Keywords</Label>
        <Input
          value={metaKeywords}
          onChange={(e) => handleKeywords(e.target.value)}
          placeholder="keyword1, keyword2, keyword3"
        />
        <p className="text-xs text-gray-400">Comma-separated keywords for search engines.</p>
      </div>
    </div>
  );
}
