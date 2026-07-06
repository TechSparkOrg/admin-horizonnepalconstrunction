"use client";

import { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ReviewAdmin } from "@/api/services/review.service";
import type { AdminReview, AdminReviewCreate } from "@/api/types/review.types";
import { ReviewTable } from "@/components/page_ui/review-table";
import { ReviewDialog } from "@/components/global_ui/review-dialog";
import { PageHeader } from "@/components/global_ui/page-header";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

const ITEMS_PER_PAGE = 10;
const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Read", value: "read" },
  { label: "Published", value: "published" },
  { label: "Ignored", value: "ignored" },
] as const;

export function _Client() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);
  const [statusFilter, setStatusFilter] = useState("");
  const [editingItem, setEditingItem] = useState<AdminReview | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchAll = () => {
    const params: Record<string, unknown> = {
      page: currentPage,
      page_size: ITEMS_PER_PAGE,
    };
    if (debouncedSearch) params.search = debouncedSearch;
    if (statusFilter) params.status = statusFilter;
    return ReviewAdmin.list(params)
      .then((res) => { setReviews(res.results ?? []); setTotal(res.count ?? 0); })
      .catch(() => toast.error("Failed to load reviews"));
  };

  useEffect(() => { fetchAll(); }, [currentPage, debouncedSearch, statusFilter]);

  const refetch = () => fetchAll();

  const openNew = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const openEdit = (item: AdminReview) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setEditingItem(null);
    setDialogOpen(false);
  };

  const createMutation = useMutation({
    mutationFn: (data: AdminReviewCreate) => ReviewAdmin.create(data),
    onSuccess: () => { toast.success("Review created"); refetch(); closeDialog(); },
    onError: () => toast.error("Failed to create review"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminReviewCreate }) => ReviewAdmin.update(id, data),
    onSuccess: () => { toast.success("Review updated"); refetch(); closeDialog(); },
    onError: () => toast.error("Failed to update review"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AdminReview["status"] }) => ReviewAdmin.patchStatus(id, status),
    onSuccess: () => { toast.success("Status updated"); refetch(); },
    onError: () => toast.error("Failed to update status"),
  });

  const handleSave = (data: AdminReviewCreate) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleStatusChange = (id: string, status: AdminReview["status"]) => {
    statusMutation.mutate({ id, status });
  };

  const confirmDelete = async (id: string) => {
    try {
      await ReviewAdmin.delete(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      setTotal((prev) => prev - 1);
      toast.success("Review deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  return (
    <>
      <PageHeader title="Reviews" subtitle="Manage customer reviews" actionLabel="New Review" onAction={openNew}>
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <InputGroup className="flex-1 max-w-sm h-9">
            <InputGroupAddon align="inline-start">
              <Search className="size-4 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by name"
            />
          </InputGroup>

          <div className="flex items-center gap-1.5">
            <Filter className="size-4 text-muted-foreground" />
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => handleStatusFilterChange(f.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  statusFilter === f.value
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

        <ReviewTable
          reviews={reviews}
          onEdit={openEdit}
          onDelete={confirmDelete}
          page={currentPage}
          totalPages={totalPages}
          totalCount={total}
          onPageChange={setCurrentPage}
        />
      </PageHeader>

      {dialogOpen && (
        <ReviewDialog
          item={editingItem}
          saving={createMutation.isPending || updateMutation.isPending}
          onSave={handleSave}
          onStatusChange={handleStatusChange}
          onClose={closeDialog}
        />
      )}
    </>
  );
}
