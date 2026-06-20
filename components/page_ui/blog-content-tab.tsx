"use client";

import { RichEditor } from "@/components/page_ui/rich-editor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Category } from "@/api/types/category.types";

interface BlogContentTabProps {
  title: string;
  slug: string;
  categoryId: string;
  content: string;
  categories: Category[];
  onChange: (key: string, value: string | boolean) => void;
}

export function BlogContentTab({
  title,
  slug,
  categoryId,
  content,
  categories,
  onChange,
}: BlogContentTabProps) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Title</Label>
          <Input
            value={title}
            onChange={(e) => onChange("title", e.target.value)}
            placeholder="Blog title"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Slug</Label>
          <div className="flex rounded-md border border-gray-200 overflow-hidden">
            <span className="px-3 flex items-center text-xs text-gray-500 bg-gray-100 border-r border-gray-200 shrink-0">/</span>
            <Input
              value={slug}
              onChange={(e) => onChange("slug", e.target.value)}
              placeholder="blog-slug"
              className="border-0 rounded-none font-mono focus-visible:ring-0"
            />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Category</Label>
        <Select value={categoryId} onValueChange={(v) => onChange("categoryId", v)}>
          <SelectTrigger className="max-w-sm">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Body</Label>
        <RichEditor value={content} onChange={(html) => onChange("content", html)} minHeight={380} />
      </div>
    </div>
  );
}
