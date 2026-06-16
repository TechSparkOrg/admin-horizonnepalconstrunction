"use client";

import { ArrowLeft, Loader2, Plus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import type { ReviewGroup, ReviewItemData } from "@/api/types/review.types";

interface ReviewFormData {
  title: string;
  slug: string;
  order: number;
  isActive: boolean;
  items: ReviewItemData[];
}

interface Props {
  form: ReviewFormData;
  editingId: string | null;
  saving: boolean;
  onChange: (key: string, value: string | boolean | number) => void;
  onItemsChange: (items: ReviewItemData[]) => void;
  onSave: () => void;
  onBack: () => void;
}

const EMPTY_ITEM = (order: number): ReviewItemData => ({
  name: "",
  role: "",
  quote: { en: "", np: "" },
  rating: 5,
  order,
});

export function ReviewForm({
  form,
  editingId,
  saving,
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
          [keys[0]]: { ...(item[keys[0] as keyof typeof item] as object), [keys[1]]: value },
        } as ReviewItemData;
      }
      return { ...item, [field]: value };
    });
    onItemsChange(updated);
  };

  const renderStars = (index: number, current: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => updateItem(index, "rating", star)}
          className={`p-0.5 transition ${
            star <= current ? "text-yellow-400" : "text-gray-300"
          } hover:scale-110`}
        >
          <Star className="size-4 fill-current" />
        </button>
      ))}
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Reviews</p>
            <h1 className="text-2xl font-bold text-gray-900 leading-none">
              {editingId ? form.title || "Edit Review Group" : "New Review Group"}
            </h1>
          </div>
        </div>
        <Button onClick={onSave} disabled={!form.title.trim() || saving} className="bg-[lab(20_23.9_-60.14)] hover:bg-[lab(15_23.9_-60.14)] text-white">
          {saving && <Loader2 className="size-4 animate-spin" />}
          {saving ? "Saving\u2026" : editingId ? "Update" : "Create"}
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full flex flex-col">
        <div>
          <TabsList className="bg-gray-100 rounded-lg p-0.5 gap-0 w-auto h-auto">
            <TabsTrigger value="overview" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[lab(20_23.9_-60.14)] data-[state=active]:shadow-sm text-gray-500 px-3 py-1.5 text-xs font-medium [&_svg]:size-3.5">
              Overview
            </TabsTrigger>
            <TabsTrigger value="content" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[lab(20_23.9_-60.14)] data-[state=active]:shadow-sm text-gray-500 px-3 py-1.5 text-xs font-medium [&_svg]:size-3.5">
              Content
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[lab(20_23.9_-60.14)] data-[state=active]:shadow-sm text-gray-500 px-3 py-1.5 text-xs font-medium [&_svg]:size-3.5">
              Settings
            </TabsTrigger>
          </TabsList>
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
                      placeholder="Review group title"
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
                        placeholder="review-group-slug"
                        className="border-0 rounded-none font-mono focus-visible:ring-0"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="mt-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">Reviews</p>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    <Plus className="size-4" />
                    Add Review
                  </Button>
                </div>

                {form.items.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-200 py-10 flex flex-col items-center justify-center gap-2 text-gray-500">
                    <span className="text-lg font-medium">⭐</span>
                    <span className="text-sm">No reviews added yet</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {form.items.map((item, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Review {index + 1}
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
                            <Label className="text-[11px] text-gray-500">Name</Label>
                            <Input
                              value={item.name}
                              onChange={(e) => updateItem(index, "name", e.target.value)}
                              placeholder="Client name"
                              className="text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px] text-gray-500">Role</Label>
                            <Input
                              value={item.role}
                              onChange={(e) => updateItem(index, "role", e.target.value)}
                              placeholder="Homeowner, CEO, etc."
                              className="text-sm"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[11px] text-gray-500">Rating</Label>
                          {renderStars(index, item.rating)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-[11px] text-gray-500">Quote (English)</Label>
                            <Textarea
                              value={item.quote.en}
                              onChange={(e) => updateItem(index, "quote.en", e.target.value)}
                              placeholder="What they said..."
                              rows={3}
                              className="text-sm resize-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px] text-gray-500">Quote (नेपाली)</Label>
                            <Textarea
                              value={item.quote.np}
                              onChange={(e) => updateItem(index, "quote.np", e.target.value)}
                              placeholder="उनीहरूले भने..."
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
