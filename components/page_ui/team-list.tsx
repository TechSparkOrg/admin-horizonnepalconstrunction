"use client";

import { Pencil, Trash2, Users } from "lucide-react";
import type { TeamMember } from "@/api/types/team.types";

interface Props {
  members: TeamMember[];
  onEdit: (item: TeamMember) => void;
  onDelete: (id: string) => void;
  deleteId: string | null;
  setDeleteId: (id: string | null) => void;
}

export function TeamList({ members, onEdit, onDelete, deleteId, setDeleteId }: Props) {
  if (members.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-400/30 p-16 text-center">
        <div className="w-12 h-12 rounded-lg bg-fs-bg4 mx-auto flex items-center justify-center mb-4">
          <Users className="w-5 h-5 text-fs-text3/50" />
        </div>
        <p className="text-sm font-medium text-fs-text1 mb-1">No team members yet</p>
        <p className="text-sm text-fs-text3">Add a member to get started.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-400/30 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-400/30 bg-fs-bg4/40">
              <th className="text-left py-3 px-4 text-xs font-semibold text-fs-text3 uppercase tracking-wider">Member</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-fs-text3 uppercase tracking-wider">Role</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-fs-text3 uppercase tracking-wider">Experience</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-fs-text3 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((item) => (
              <tr
                key={item.id}
                className="border-b border-gray-400/30 last:border-b-0 hover:bg-fs-bg4/40 transition-colors cursor-pointer"
                onClick={() => onEdit(item)}
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-fs-bg4 flex items-center justify-center text-xs font-semibold text-fs-text1 shrink-0 select-none">
                      {item.initials}
                    </div>
                    <span className="text-sm font-medium text-fs-text1">{item.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-fs-text1/80">{item.role}</td>
                <td className="py-3 px-4 text-sm text-fs-text3">{item.experience || "—"}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                      className="p-2 rounded-lg text-fs-text3 hover:text-fs-secondary hover:bg-fs-bg4 transition-colors"
                      aria-label="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteId(item.id); }}
                      className="p-2 rounded-lg text-fs-text3 hover:text-red-500 hover:bg-red-50 transition-colors"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="bg-white rounded-xl border border-gray-400/30 p-6 w-80">
            <p className="text-sm font-semibold text-fs-text1 mb-1">Remove team member?</p>
            <p className="text-sm text-fs-text3 mb-5">This cannot be undone.</p>
            <div className="flex gap-2">
              <button
                onClick={() => onDelete(deleteId)}
                className="flex-1 h-9 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition"
              >
                Remove
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 h-9 rounded-lg border border-gray-400/30 text-sm text-fs-text3 hover:text-fs-text1 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
