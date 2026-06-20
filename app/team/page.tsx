"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { StaffAdmin } from "@/api/services/staff.service";
import type { StaffMember } from "@/api/types/staff.types";
import { STAFF_TYPE_OPTIONS } from "@/api/types/staff.types";
import { StaffTable } from "@/components/page_ui/staff-table";
import { StaffForm, EMPTY as EMPTY_FORM } from "@/components/page_ui/staff-form";
import type { StaffFormData } from "@/components/page_ui/staff-form";
import { PageHeader } from "@/components/global_ui/page-header";
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

function itemToForm(item: StaffMember): StaffFormData {
  return {
    name: item.name,
    employeeId: item.employee_id,
    type: item.type,
    attributeId: item.attribute_id,
    designationLabel: item.designation_label,
    designationValue: item.designation,
    departmentLabel: item.department_label,
    departmentValue: item.department,
    joiningDate: item.joining_date ?? "",
    currentlyWorking: item.is_currently_working,
    endDate: item.end_date ?? "",
    photo: item.photo,
    email: item.email,
    phone: item.phone,
    socialLinks: item.social_links,
    isActive: item.is_active,
    showOnPublic: item.show_on_public,
  };
}

function formToPayload(form: StaffFormData) {
  return {
    name: form.name,
    employee_id: form.employeeId,
    type: form.type,
    attribute_id: form.attributeId,
    designation_label: form.designationLabel || null,
    designation: form.designationValue || null,
    department_label: form.departmentLabel || null,
    department: form.departmentValue || null,
    joining_date: form.joiningDate || null,
    is_currently_working: form.currentlyWorking,
    end_date: form.currentlyWorking ? null : (form.endDate || null),
    photo: form.photo,
    email: form.email,
    phone: form.phone,
    social_links: form.socialLinks,
    is_active: form.isActive,
    show_on_public: form.showOnPublic,
  };
}

export default function AdminStaffPage() {
  const [items, setItems] = useState<StaffMember[]>([]);
  const [total, setTotal] = useState(0);
  const [view, setView] = useState<View>("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<StaffFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const searchParams = useMemo(() => ({
    search: search || undefined,
    type: typeFilter !== "all" ? typeFilter : undefined,
    page: currentPage,
    page_size: ITEMS_PER_PAGE,
  }), [search, typeFilter, currentPage]);

  const loadData = () =>
    StaffAdmin.search(searchParams)
      .then((res) => {
        setItems(res.results ?? []);
        setTotal(res.count ?? 0);
      })
      .catch(() => toast.error("Failed to load data"));

  useEffect(() => {
    loadData();
  }, [searchParams]);

  const refetch = loadData;

  const openNew = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setView("form");
  };

  const openEdit = (item: StaffMember) => {
    setForm(itemToForm(item));
    setEditingId(item.id);
    setView("form");
  };

  const back = () => {
    setForm(EMPTY_FORM);
    setView("list");
  };

  const handleChange = (key: string, value: string | boolean | { platform: string; url: string }[] | null) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = formToPayload(form);
      if (editingId) {
        await StaffAdmin.update(editingId, payload);
        toast.success("Staff member updated");
      } else {
        await StaffAdmin.create(payload);
        toast.success("Staff member created");
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
      await StaffAdmin.delete(id);
      setItems((prev) => prev.filter((g) => g.id !== id));
      toast.success("Staff member deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleTypeFilterChange = (v: string) => {
    setTypeFilter(v);
    setCurrentPage(1);
  };

  return (
    <>
      {view === "list" ? (
        <PageHeader title="Staff" subtitle="Manage your team members" actionLabel="Add Member" onAction={openNew} actionOutlined>
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
                {STAFF_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-sidebar-primary font-medium whitespace-nowrap">
              Total: {total} {total === 1 ? "item" : "items"} found.
            </p>
          </div>

          <StaffTable
            items={items}
            onEdit={openEdit}
            onDelete={confirmDelete}
            page={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </PageHeader>
      ) : (
        <div className="px-4">
          <StaffForm
            form={form}
            editingId={editingId}
            saving={saving}
            onChange={handleChange}
            onSave={save}
            onBack={back}
          />
        </div>
      )}
    </>
  );
}
