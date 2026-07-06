"use client";

import { useRef, useState } from "react";
import { Search } from "lucide-react";
import { useVendorList, useVendorMutations } from "@/api/hooks/use-vendor-query";
import { useVendorUiStore } from "@/api/zustand/use-vendor-store";
import { VendorTable } from "@/components/page_ui/vendor-table";
import dynamic from "next/dynamic";
const VendorForm = dynamic(() => import("@/components/page_ui/vendor-form").then((m) => m.VendorForm), { ssr: false });
import { PageHeader } from "@/components/global_ui/page-header";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

const PAGE_SIZE = 10;

export function _Client() {
  const view = useVendorUiStore((s) => s.view);
  const editingId = useVendorUiStore((s) => s.editingId);
  const form = useVendorUiStore((s) => s.form);
  const search = useVendorUiStore((s) => s.search);
  const currentPage = useVendorUiStore((s) => s.currentPage);
  const [inputSearch, setInputSearch] = useState(search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (value: string) => {
    setInputSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(value), 300);
  };

  const openNew = useVendorUiStore((s) => s.openNew);
  const openEdit = useVendorUiStore((s) => s.openEdit);
  const back = useVendorUiStore((s) => s.back);
  const setFormField = useVendorUiStore((s) => s.setFormField);
  const setSearch = useVendorUiStore((s) => s.setSearch);
  const setPage = useVendorUiStore((s) => s.setPage);
  const validateForm = useVendorUiStore((s) => s.validateForm);

  const { data, isLoading } = useVendorList({ search: search || undefined, page: currentPage, page_size: PAGE_SIZE });
  const { deleteMutation, saveMutation } = useVendorMutations();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleSave = async () => {
    if (!validateForm()) return;
    await saveMutation.mutateAsync({ id: editingId, payload: form });
    back();
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  if (view === "form") {
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
