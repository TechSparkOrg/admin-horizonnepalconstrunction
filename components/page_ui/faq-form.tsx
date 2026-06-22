"use client";

import { Plus, Trash2 } from "lucide-react";
import { FormHeader } from "@/components/global_ui/form-header";
import { FormTabs } from "@/components/global_ui/form-tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/api/types/category.types";
import type { FaqGroup, FaqItemData } from "@/api/types/faq.types";

interface FaqFormData {
  title: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  order: number;
  isActive: boolean;
  items: FaqItemData[];
}

interface Props {
  form: FaqFormData;
  editingId: string | null;
  saving: boolean;
  categories: Category[];
  onChange: (key: string, value: string | boolean | number) => void;
  onItemsChange: (items: FaqItemData[]) => void;
  onSave: () => void;
  onBack: () => void;
}

const EMPTY_ITEM = (order: number): FaqItemData => ({
  question: { en: "", np: "" },
  answer: { en: "", np: "" },
  order,
});

export function FaqForm({
  form,
  editingId,
  saving,
  categories,
  onChange,
  onItemsChange,
  onSave,
  onBack,
}: Props) {
  const addItem = () => {
    const maxOrder = form.items.reduce((max, i) => Math.max(max, i.order), 0);
    onItemsChange([...form.items, EMPTY_ITEM(maxOrder + 1)]);
  };

  const removeItem = (index: number) => {
    onItemsChange(form.items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const updated = form.items.map((item, i) => {
      if (i !== index) return item;
      const keys = field.split(".");
      if (keys.length === 2) {
        return {
          ...item,
          [keys[0]]: { ...item[keys[0] as keyof typeof item] as object, [keys[1]]: value },
        } as FaqItemData;
      }
      return { ...item, [field]: value };
    });
    onItemsChange(updated);
  };

  return (
    <div>
      <FormHeader
        breadcrumb="FAQs"
        title={editingId ? form.title || "Edit FAQ Group" : "New FAQ Group"}
        onBack={onBack}
        onSave={onSave}
        saving={saving}
        saveDisabled={!form.title.trim() || saving}
        saveLabel={editingId ? "Update" : "Create"}
      />

      <Tabs defaultValue="overview" className="w-full flex flex-col">
        <div>
          <FormTabs tabs={[{"value":"overview","label":"Overview"},{"value":"content","label":"Content"},{"value":"settings","label":"Settings"}]} />
        </div>

        <div>
          <TabsContent value="overview" className="mt-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Title</Label>
                    <Input
                      value={form.title}
                      onChange={(e) => onChange("title", e.target.value)}
                      placeholder="FAQ group title"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Slug</Label>
                    <div className="flex rounded-md border border-gray-200 overflow-hidden">
                      <span className="px-3 flex items-center text-xs text-gray-500 bg-gray-100 border-r border-gray-200 shrink-0">
                        /
                      </span>
                      <Input
                        value={form.slug}
                        onChange={(e) => onChange("slug", e.target.value)}
                        placeholder="faq-group-slug"
                        className="border-0 rounded-none font-mono focus-visible:ring-0"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select
                    value={form.categoryId}
                    onValueChange={(v) => {
                      onChange("categoryId", v);
                      const cat = categories.find((c) => c.id === v);
                      if (cat) onChange("categoryName", cat.name);
                    }}
                  >
                    <SelectTrigger className="max-w-sm">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="mt-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">Q&A Items</p>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    <Plus className="size-4" />
                    Add Question
                  </Button>
                </div>

                {form.items.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-200 py-10 flex flex-col items-center justify-center gap-2 text-gray-500">
                    <span className="text-lg font-medium">❓</span>
                    <span className="text-sm">No questions added yet</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {form.items.map((item, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Item {index + 1}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-red-500 border-red-200 hover:bg-red-50 h-7"
                            onClick={() => removeItem(index)}
                          >
                            <Trash2 className="size-3" />
                            Remove
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-[11px] text-gray-500">Question (English)</Label>
                            <Input
                              value={item.question.en}
                              onChange={(e) => updateItem(index, "question.en", e.target.value)}
                              placeholder="What is your question?"
                              className="text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px] text-gray-500">Question (नेपाली)</Label>
                            <Input
                              value={item.question.np}
                              onChange={(e) => updateItem(index, "question.np", e.target.value)}
                              placeholder="तपाईंको प्रश्न के हो?"
                              className="text-sm"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-[11px] text-gray-500">Answer (English)</Label>
                            <Textarea
                              value={item.answer.en}
                              onChange={(e) => updateItem(index, "answer.en", e.target.value)}
                              placeholder="Your answer..."
                              rows={3}
                              className="text-sm resize-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px] text-gray-500">Answer (नेपाली)</Label>
                            <Textarea
                              value={item.answer.np}
                              onChange={(e) => updateItem(index, "answer.np", e.target.value)}
                              placeholder="तपाईंको जवाफ..."
                              rows={3}
                              className="text-sm resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <Label>Order</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.order}
                    onChange={(e) => onChange("order", parseInt(e.target.value) || 0)}
                    className="w-24"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5 w-fit">
                    <button
                      type="button"
                      onClick={() => onChange("isActive", true)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                        form.isActive
                          ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => onChange("isActive", false)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                        !form.isActive
                          ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      Inactive
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
