"use client";

import { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { ConsultationAdmin } from "@/api/services/consultation.service";
import type { ConsultationSubmission } from "@/api/types/consultation.types";
import { CustomerEnquiryTable } from "@/components/page_ui/customer-enquiry-table";
import { EnquiryDetailDialog } from "@/components/global_ui/enquiry-detail-dialog";
import { PageHeader } from "@/components/global_ui/page-header";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

const ITEMS_PER_PAGE = 10;
const READ_FILTERS = [
  { label: "All", value: "" },
  { label: "Unread", value: "false" },
  { label: "Read", value: "true" },
] as const;

export function _Client() {
  const [enquiries, setEnquiries] = useState<ConsultationSubmission[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);
  const [readFilter, setReadFilter] = useState("");
  const [selectedEnquiry, setSelectedEnquiry] = useState<ConsultationSubmission | null>(null);

  const fetchAll = () => {
    const params: Record<string, unknown> = {
      page: currentPage,
      page_size: ITEMS_PER_PAGE,
    };
    if (debouncedSearch) params.search = debouncedSearch;
    if (readFilter) params.is_read = readFilter;
    return ConsultationAdmin.list(params)
      .then((res) => { setEnquiries(res.results ?? []); setTotal(res.count ?? 0); })
      .catch(() => toast.error("Failed to load enquiries"));
  };

  useEffect(() => { fetchAll(); }, [currentPage, debouncedSearch, readFilter]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleReadFilterChange = (value: string) => {
    setReadFilter(value);
    setCurrentPage(1);
  };

  const handleMarkRead = async (id: string) => {
    try {
      await ConsultationAdmin.markRead(id);
      setEnquiries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, is_read: true } : e)),
      );
      toast.success("Marked as read");
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const confirmDelete = async (id: string) => {
    try {
      await ConsultationAdmin.delete(id);
      setEnquiries((prev) => prev.filter((e) => e.id !== id));
      setTotal((prev) => prev - 1);
      toast.success("Enquiry deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <PageHeader title="Customer Enquiries" subtitle="Manage incoming enquiries">
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <InputGroup className="flex-1 max-w-sm h-9">
          <InputGroupAddon align="inline-start">
            <Search className="size-4 text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name or email"
          />
        </InputGroup>

        <div className="flex items-center gap-1.5">
          <Filter className="size-4 text-muted-foreground" />
          {READ_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => handleReadFilterChange(f.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                readFilter === f.value
                  ? "bg-brand-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <p className="text-sm text-sidebar-primary font-medium whitespace-nowrap ml-auto">
          Total: {total} {total === 1 ? "item" : "items"} found.
        </p>
      </div>

      <CustomerEnquiryTable
        enquiries={enquiries}
        onViewDetails={setSelectedEnquiry}
        onDelete={confirmDelete}
        page={currentPage}
        totalPages={totalPages}
        totalCount={total}
        onPageChange={setCurrentPage}
      />

      <EnquiryDetailDialog
        item={selectedEnquiry}
        onClose={() => setSelectedEnquiry(null)}
        onMarkRead={handleMarkRead}
      />
    </PageHeader>
  );
}
