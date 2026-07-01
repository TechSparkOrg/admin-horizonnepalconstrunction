"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useStaffList, useStaffMutations } from "@/api/hooks/use-staff-query";
import { useStaffUiStore } from "@/api/zustand/use-staff-store";
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
    salary_amount: form.salaryAmount ? parseFloat(form.salaryAmount) : null,
    is_active: form.isActive,
    show_on_public: form.showOnPublic,
  };
}

export function _Client() {
  const view = useStaffUiStore((s) => s.view);
  const editingId = useStaffUiStore((s) => s.editingId);
  const form = useStaffUiStore((s) => s.form);
  const saving = useStaffUiStore((s) => s.saving);
  const search = useStaffUiStore((s) => s.search);
  const typeFilter = useStaffUiStore((s) => s.typeFilter);
  const currentPage = useStaffUiStore((s) => s.currentPage);

  const [inputSearch, setInputSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setInputSearch(search); }, []);

  const handleSearchChange = (value: string) => {
    setInputSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(value), 300);
  };

  const openNew = useStaffUiStore((s) => s.openNew);
  const back = useStaffUiStore((s) => s.back);
  const setFormField = useStaffUiStore((s) => s.setFormField);
  const setSaving = useStaffUiStore((s) => s.setSaving);
  const setSearch = useStaffUiStore((s) => s.setSearch);
  const setTypeFilter = useStaffUiStore((s) => s.setTypeFilter);
  const setPage = useStaffUiStore((s) => s.setPage);

  const { data, isLoading } = useStaffList({
    search: search || undefined,
    type: typeFilter !== "all" ? typeFilter : undefined,
    page: currentPage,
    page_size: ITEMS_PER_PAGE,
  });

  const { saveMutation, deleteMutation } = useStaffMutations();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const openEdit = (item: StaffMember) => {
    useStaffUiStore.getState().openEdit(item.id, itemToForm(item));
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = formToPayload(form);
      await saveMutation.mutateAsync({ id: editingId, payload });

    } catch {
      // handled by mutation
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <>
      {view === "form" ? (
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
      ) : (
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
      )}
    </>
  );
}
