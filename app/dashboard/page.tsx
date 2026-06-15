"use client";

import { FolderKanban, MessageSquare, Star, Users } from "lucide-react";
import { useAuthStore } from "@/app/store/auth-store";

const stats = [
  { label: "Projects", value: "—", icon: FolderKanban, color: "text-blue-600 bg-blue-50" },
  { label: "Reviews", value: "—", icon: Star, color: "text-amber-600 bg-amber-50" },
  { label: "Consultations", value: "—", icon: MessageSquare, color: "text-emerald-600 bg-emerald-50" },
  { label: "Team Members", value: "—", icon: Users, color: "text-purple-600 bg-purple-50" },
];

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-fs-text1">
          Welcome back{user?.first_name ? `, ${user.first_name}` : ""}
        </h1>
        <p className="text-fs-text3 text-sm mt-1">Here&apos;s what&apos;s happening today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl shadow-sm border border-fs-border3/10 p-5 hover:shadow-md transition-shadow"
          >
            <div className={`rounded-xl p-2.5 w-fit ${stat.color} mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-fs-text1">{stat.value}</p>
            <p className="text-sm text-fs-text3 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-fs-border3/10 p-6">
          <h2 className="font-semibold text-fs-text1 mb-4">Recent Activity</h2>
          <p className="text-sm text-fs-text3">No recent activity to display.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-fs-border3/10 p-6">
          <h2 className="font-semibold text-fs-text1 mb-4">Quick Links</h2>
          <div className="space-y-3">
            {["Manage Projects", "View Reviews", "Consultations", "Team Settings"].map(
              (link) => (
                <button
                  key={link}
                  className="w-full text-left px-4 py-2.5 rounded-xl bg-fs-bg4/50 text-sm text-fs-text2 hover:bg-fs-bg4 transition-colors"
                >
                  {link}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
