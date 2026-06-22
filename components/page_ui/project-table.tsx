"use client";

import { FolderOpen } from "lucide-react";
import type { Project } from "@/api/types/project.types";
import { Badge } from "@/components/ui/badge";
import { DataTable, type ColumnDef } from "@/components/global_ui/data-table";
import { formatDate } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  ongoing: "border-blue-200 bg-blue-50 text-blue-600",
  completed: "border-green-200 bg-green-50 text-green-600",
  paused: "border-orange-200 bg-orange-50 text-orange-600",
};

const PRIORITY_STYLES: Record<string, string> = {
  low: "border-gray-200 bg-gray-50 text-gray-500",
  medium: "border-blue-200 bg-blue-50 text-blue-600",
  high: "border-orange-200 bg-orange-50 text-orange-600",
  top: "border-red-200 bg-red-50 text-red-600",
};

interface Props {
  projects: Project[];
  onEdit: (item: Project) => void;
  onDelete: (slug: string) => void;
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export function ProjectTable({ projects, onEdit, onDelete, page, totalPages, totalCount, onPageChange }: Props) {
  const columns: ColumnDef<Project>[] = [
    {
      header: "Title",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
            <FolderOpen className="w-4 h-4 text-gray-400" />
          </div>
          <span className="text-sm text-gray-900">{item.title}</span>
        </div>
      ),
    },
    {
      header: "Status",
      render: (item) => (
        <Badge variant="outline" className={`font-normal gap-1.5 ${STATUS_STYLES[item.status] || STATUS_STYLES.ongoing}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            item.status === "ongoing" ? "bg-blue-500" : item.status === "completed" ? "bg-green-500" : "bg-orange-500"
          }`} />
          {item.status === "ongoing" ? "Ongoing" : item.status === "completed" ? "Completed" : "Paused"}
        </Badge>
      ),
    },
    {
      header: "Priority",
      render: (item) => (
        <Badge variant="outline" className={`font-normal ${PRIORITY_STYLES[item.priority] || PRIORITY_STYLES.medium}`}>
          {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
        </Badge>
      ),
    },
    {
      header: "Location",
      render: (item) => <span className="text-sm text-gray-500">{item.location || "—"}</span>,
    },
    {
      header: "Created",
      render: (item) => <span className="text-sm text-gray-500">{formatDate(item.created_at)}</span>,
    },
  ];

  return (
    <DataTable
      data={projects}
      columns={columns}
      onEdit={onEdit}
      onDelete={onDelete}
      getIdentifier={(item) => item.slug}
      page={page}
      totalPages={totalPages}
      totalCount={totalCount}
      onPageChange={onPageChange}
      emptyState={{ icon: FolderOpen, title: "No projects yet", description: "Create your first project to get started." }}
      deleteDialog={{
        title: (slug) => {
          const item = projects.find((p) => p.slug === slug);
          return `Delete "${item?.title || "this project"}"?`;
        },
        description: (slug) => {
          const item = projects.find((p) => p.slug === slug);
          return `Are you sure you want to delete "${item?.title || "this project"}"? This cannot be undone.`;
        },
      }}
    />
  );
}
