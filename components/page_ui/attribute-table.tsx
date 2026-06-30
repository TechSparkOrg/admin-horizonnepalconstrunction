"use client";
import { useState } from "react";
import { FileText } from "lucide-react";
import {
  Table, TableBody, TableCell, TableRow,
} from "@/components/ui/table";
import { TableHeaderRow } from "@/components/global_ui/table-header-row";
import { ActionButtons } from "@/components/global_ui/action-buttons";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge, ACTIVE_STATUS } from "@/components/global_ui/status-badge";
import { PaginationBar } from "@/components/global_ui/pagination-bar";
import type { AttributeItem } from "@/api/types/attribute.types";

interface Props {
  items: AttributeItem[];
  onEdit: (item: AttributeItem) => void;
  onDelete: (item: AttributeItem) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function AttributeTable({ items, onEdit, onDelete, page, totalPages, onPageChange }: Props) {
  if (items.length === 0) {
    return (
      <Card className="bg-white border border-gray-200 rounded-xl">
        <CardContent className="p-16 text-center">
          <div className="w-12 h-12 rounded-lg bg-gray-100 mx-auto flex items-center justify-center mb-4">
            <FileText className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-900 mb-1">No attributes yet</p>
          <p className="text-sm text-gray-500">Add an attribute type to get started.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table>
          <TableHeaderRow columns={[
            { label: "Name" },
            { label: "Values" },
            { label: "Status" },
            { label: "Actions", className: "text-right" },
          ]} />
          <TableBody>
            {items.map((item) => {
              const allValues = item.values.flatMap((v) => v.values).filter(Boolean);
              return (
                <TableRow
                  key={item.id}
                  className="border-gray-200 cursor-pointer hover:bg-gray-50"
                  onClick={() => onEdit(item)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-gray-400" />
                      </div>
                      <span className="text-sm text-gray-900">{item.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600 truncate max-w-[300px] block">
                      {allValues.length > 0
                        ? allValues.slice(0, 4).join(", ") + (allValues.length > 4 ? ` +${allValues.length - 4} more` : "")
                        : "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge value={item.is_active} map={ACTIVE_STATUS} />
                  </TableCell>
                  <TableCell>
                    <ActionButtons onEdit={() => onEdit(item)} onDelete={() => onDelete(item)} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <PaginationBar page={page} totalPages={totalPages} onPageChange={onPageChange} />
    </>
  );
}
