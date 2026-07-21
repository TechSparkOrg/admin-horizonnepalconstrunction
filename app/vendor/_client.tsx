"use client";

import { useRef, useState } from "react";
import { Search } from "lucide-react";
import { useVendorList, useVendorMutations } from "@/api/hooks/use-vendor-query";
import { useVendorUiStore } from "@/api/zustand/use-vendor-store";
import { useShallow } from "zustand/react/shallow";
import { VendorTable } from "@/components/page_ui/vendor-table";
import dynamic from "next/dynamic";
const VendorForm = dynamic(() => import("@/components/page_ui/vendor-form").then((m) => m.VendorForm), { ssr: false });
import { PageHeader } from "@/components/global_ui/page-header";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

const PAGE_SIZE = 10;

function FormView() {
  const { form, editingId } = useVendorUiStore(
    useShallow((s) => ({ form: s.form, editingId: s.editingId }))
  );
  const { back, setFormField, validateForm } = useVendorUiStore(
    useShallow((s) => ({ back: s.back, setFormField: s.setFormField, validateForm: s.validateForm }))
  );

  const { saveMutation } = useVendorMutations();

  const handleSave = async () => {
    if (!validateForm()) return;
    await saveMutation.mutateAsync({ id: editingId, payload: form });
    back();
  };

  return (
    <div className="px-4">
      <VendorForm
        form={form}
        editingId={editingId}
        saving={saveMutation.isPending}
        onChange={setFormField}
        onSave={handleSave}
        onBack={back}
      />
    </div>
  );
}

function ListView() {
  const { search, currentPage } = useVendorUiStore(
    useShallow((s) => ({ search: s.search, currentPage: s.currentPage }))
  );
  const { openNew, openEdit, setSearch, setPage } = useVendorUiStore(
    useShallow((s) => ({ openNew: s.openNew, openEdit: s.openEdit, setSearch: s.setSearch, setPage: s.setPage }))
  );

  const [inputSearch, setInputSearch] = useState(search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (value: string) => {
    setInputSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(value), 300);
  };

  const { data, isLoading } = useVendorList({ search: search || undefined, page: currentPage, page_size: PAGE_SIZE });
  const { deleteMutation } = useVendorMutations();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  return (
    <PageHeader title="Vendors" actionOutlined subtitle="Manage vendors and their contact information" actionLabel="Add Vendor" onAction={openNew}>
      <div className="flex items-center gap-3 mb-4">
        <InputGroup className="flex-1 max-w-sm h-9">
          <InputGroupAddon align="inline-start">
            <Search className="size-4 text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput value={inputSearch} onChange={(e) => handleSearchChange(e.target.value)} placeholder="Search" />
        </InputGroup>
        <p className="text-sm text-sidebar-primary font-medium whitespace-nowrap">Total: {total} {total === 1 ? "item" : "items"} found.</p>
      </div>
      <VendorTable items={items} onEdit={openEdit} onDelete={handleDelete} page={currentPage} totalPages={totalPages} totalCount={total} onPageChange={setPage} />
    </PageHeader>
  );
}

export function _Client() {
  const view = useVendorUiStore((s) => s.view);

  return view === "form" ? <FormView /> : <ListView />;
}
