"use client";

import { useRef, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useStaffList, useStaffMutations } from "@/api/hooks/use-staff-query";
import { useStaffUiStore } from "@/api/zustand/use-staff-store";
import { useShallow } from "zustand/react/shallow";
import type { StaffMember, StaffMemberListItem } from "@/api/types/staff.types";
import { STAFF_TYPE_OPTIONS } from "@/api/types/staff.types";
import { StaffAdmin } from "@/api/services/staff.service";
import { StaffTable } from "@/components/page_ui/staff-table";
import dynamic from "next/dynamic";
import type { StaffFormData } from "@/components/page_ui/staff-form";
const StaffForm = dynamic(() => import("@/components/page_ui/staff-form").then((m) => m.StaffForm), { ssr: false });
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

function itemToForm(item: StaffMember): StaffFormData {
  return {
    name: item.name,
    employeeId: item.employee_id,
    type: item.type,
    role: item.designation,
    department: item.department,
    joiningDate: item.joining_date ?? "",
    currentlyWorking: item.is_currently_working,
    endDate: item.end_date ?? "",
    photo: item.photo,
    email: item.email,
    phone: item.phone,
    socialLinks: item.social_links,
    salaryAmount: item.salary_amount ?? "",
    isActive: item.is_active,
    showOnPublic: item.show_on_public,
  };
}

function formToPayload(form: StaffFormData) {
  return {
    name: form.name,
    employee_id: form.employeeId,
    type: form.type,
    designation: form.role || null,
    department: form.department || null,
    joining_date: form.joiningDate || null,
    is_currently_working: form.currentlyWorking,
    end_date: form.currentlyWorking ? null : (form.endDate || null),
    photo: form.photo,
    email: form.email,
    phone: form.phone,
    social_links: form.socialLinks,
    salary_amount: form.salaryAmount ? parseFloat(form.salaryAmount) : null,
    is_active: form.isActive,
    show_on_public: form.showOnPublic,
  };
}

function FormView() {
  const { form, editingId, saving } = useStaffUiStore(
    useShallow((s) => ({ form: s.form, editingId: s.editingId, saving: s.saving }))
  );
  const { back, setFormField, setSaving } = useStaffUiStore(
    useShallow((s) => ({ back: s.back, setFormField: s.setFormField, setSaving: s.setSaving }))
  );

  const { saveMutation } = useStaffMutations();

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = formToPayload(form);
      await saveMutation.mutateAsync({ id: editingId, payload });
      back();
    } catch {
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4">
      <StaffForm
        form={form}
        editingId={editingId}
        saving={saving}
        onChange={setFormField}
        onSave={handleSave}
        onBack={back}
      />
    </div>
  );
}

function ListView() {
  const { search, typeFilter, currentPage } = useStaffUiStore(
    useShallow((s) => ({ search: s.search, typeFilter: s.typeFilter, currentPage: s.currentPage }))
  );
  const { setSearch, setTypeFilter, setPage, openNew } = useStaffUiStore(
    useShallow((s) => ({ setSearch: s.setSearch, setTypeFilter: s.setTypeFilter, setPage: s.setPage, openNew: s.openNew }))
  );

  const [inputSearch, setInputSearch] = useState(search);
  const [editingLoading, setEditingLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, isLoading } = useStaffList({
    search: search || undefined,
    type: typeFilter !== "all" ? typeFilter : undefined,
    page: currentPage,
    page_size: ITEMS_PER_PAGE,
  });

  const { deleteMutation } = useStaffMutations();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const handleSearchChange = (value: string) => {
    setInputSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(value), 300);
  };

  const openEdit = async (item: StaffMemberListItem) => {
    setEditingLoading(true);
    try {
      const detail = await StaffAdmin.adminGet(item.id);
      useStaffUiStore.getState().openEdit(item.id, itemToForm(detail));
    } catch {
      toast.error("Failed to load staff details");
    } finally {
      setEditingLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  if (editingLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-6 animate-spin text-sidebar-primary" />
      </div>
    );
  }

  return (
    <PageHeader title="Staff" subtitle="Manage your team members" actionLabel="Add Member" onAction={openNew} actionOutlined>
      <div className="flex items-center gap-3 mb-4">
        <InputGroup className="flex-1 max-w-sm h-9">
          <InputGroupAddon align="inline-start">
            <Search className="size-4 text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            value={inputSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search"
          />
        </InputGroup>
        <Select
          value={typeFilter}
          onValueChange={setTypeFilter}
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
        onDelete={handleDelete}
        page={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </PageHeader>
  );
}

export function _Client() {
  const view = useStaffUiStore((s) => s.view);

  return view === "form" ? <FormView /> : <ListView />;
}
