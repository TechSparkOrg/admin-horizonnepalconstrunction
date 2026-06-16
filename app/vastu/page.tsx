"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { VastuAdmin } from "@/api/services/vastu.service";
import type { VastuItem, VastuItemType, BilingualPair } from "@/api/types/vastu.types";
import { VastuTable } from "@/components/page_ui/vastu-table";
import { VastuForm, EMPTY as EMPTY_FORM } from "@/components/page_ui/vastu-form";
import type { VastuFormData } from "@/components/page_ui/vastu-form";
import { toSlug } from "@/lib/slug";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

const ITEMS_PER_PAGE = 10;

type View = "list" | "form";

function formForType(type: VastuItemType): VastuFormData {
  return { ...EMPTY_FORM, type };
}

function itemToForm(item: VastuItem): VastuFormData {
  return {
    type: item.type,
    title: item.title,
    slug: item.slug,
    order: item.order,
    isActive: item.is_active,
    contentList: item.content_list.map((c) => ({ ...c })),
    benefits: item.benefits.map((c) => ({ ...c })),
    avoids: item.avoids.map((c) => ({ ...c })),
    idealDirection: { ...item.ideal_direction },
    facingDirection: { ...item.facing_direction },
    deity: item.deity,
    element: item.element,
    description: { ...item.description },
    metaTitle: item.meta_title,
    metaKeywords: item.meta_keywords,
    metaDescription: item.meta_description,
    authorMode: item.author_mode,
    authorName: item.author_name,
    authorImage: item.author_image,
    authorTeamId: item.author_team_id,
  };
}

export default function AdminVastuPage() {
  const [items, setItems] = useState<VastuItem[]>([]);
  const [view, setView] = useState<View>("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<VastuFormData>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<VastuItemType | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [total, setTotal] = useState(0);

  const searchParams = useMemo(() => ({
    search: search || undefined,
    type: typeFilter !== "all" ? typeFilter : undefined,
    page: currentPage,
    page_size: ITEMS_PER_PAGE,
  }), [search, typeFilter, currentPage]);

  useEffect(() => {
    VastuAdmin.search(searchParams)
      .then((res) => {
        setItems(res.results ?? []);
        setTotal(res.count ?? 0);
      })
      .catch(() => toast.error("Failed to load data"));
  }, [searchParams]);

  const refetch = () =>
    VastuAdmin.search(searchParams)
      .then((res) => {
        setItems(res.results ?? []);
        setTotal(res.count ?? 0);
      })
      .catch(() => toast.error("Failed to load vastu items"));

  const openNew = (type: VastuItemType) => {
    setForm(formForType(type));
    setEditingId(null);
    setView("form");
  };

  const openEdit = (item: VastuItem) => {
    setForm(itemToForm(item));
    setEditingId(item.id);
    setView("form");
  };

  const back = () => {
    setForm(EMPTY_FORM);
    setDeleteId(null);
    setView("list");
  };

  const handleChange = (key: string, value: string | boolean | number | BilingualPair | BilingualPair[]) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "title" && !editingId && typeof value === "string"
        ? { slug: toSlug(value) }
        : {}),
    }));
  };

  const handleListChange = (listKey: string, items: BilingualPair[]) => {
    setForm((prev) => ({ ...prev, [listKey]: items }));
  };

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        type: form.type,
        title: form.title,
        slug: form.slug,
        order: form.order,
        is_active: form.isActive,
        content_list: form.contentList,
        benefits: form.benefits,
        avoids: form.avoids,
        ideal_direction: form.idealDirection,
        facing_direction: form.facingDirection,
        deity: form.deity,
        element: form.element,
        description: form.description,
        meta_title: form.metaTitle,
        meta_keywords: form.metaKeywords,
        meta_description: form.metaDescription,
        author_mode: form.authorMode,
        author_name: form.authorName,
        author_image: form.authorImage,
        author_team_id: form.authorTeamId,
      };
      if (editingId) {
        await VastuAdmin.update(editingId, payload);
        toast.success("Vastu item updated");
      } else {
        const create =
          form.type === "section"
            ? VastuAdmin.createSection(payload)
            : form.type === "room"
              ? VastuAdmin.createRoom(payload)
              : VastuAdmin.createDirection(payload);
        await create;
        toast.success("Vastu item created");
      }
      await refetch();
      back();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async (id: string) => {
    try {
      await VastuAdmin.delete(id);
      setItems((prev) => prev.filter((g) => g.id !== id));
      toast.success("Vastu item deleted");
    } catch {
      toast.error("Failed to delete");
    }
    setDeleteId(null);
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleTypeFilterChange = (v: string) => {
    setTypeFilter(v as VastuItemType | "all");
    setCurrentPage(1);
  };

  return (
    <>
      {view === "list" ? (
        <div className="px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 leading-none">Vastu Shastra</h1>
              <p className="text-xs text-gray-500 mt-1">Sections, rooms, and directions</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openNew("section")}
                className="text-[lab(20_23.9_-60.14)] border-[lab(20_23.9_-60.14)]/20"
              >
                <Plus className="w-4 h-4" /> Section
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openNew("room")}
                className="text-[lab(20_23.9_-60.14)] border-[lab(20_23.9_-60.14)]/20"
              >
                <Plus className="w-4 h-4" /> Room
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openNew("direction")}
                className="text-[lab(20_23.9_-60.14)] border-[lab(20_23.9_-60.14)]/20"
              >
                <Plus className="w-4 h-4" /> Direction
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <InputGroup className="flex-1 max-w-sm h-9">
              <InputGroupAddon align="inline-start">
                <Search className="size-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search"
              />
            </InputGroup>
            <Select
              value={typeFilter}
              onValueChange={handleTypeFilterChange}
            >
              <SelectTrigger className="w-36 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="section">Section</SelectItem>
                <SelectItem value="room">Room</SelectItem>
                <SelectItem value="direction">Direction</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-[lab(20_23.9_-60.14)] font-medium whitespace-nowrap">
              Total: {total} {total === 1 ? "item" : "items"} found.
            </p>
          </div>

          <VastuTable
            items={items}
            onEdit={openEdit}
            onDelete={confirmDelete}
            deleteId={deleteId}
            setDeleteId={setDeleteId}
            page={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      ) : (
        <div className="px-4">
          <VastuForm
            form={form}
            editingId={editingId}
            saving={saving}
            onChange={handleChange}
            onListChange={handleListChange}
            onSave={save}
            onBack={back}
          />
        </div>
      )}
    </>
  );
}
