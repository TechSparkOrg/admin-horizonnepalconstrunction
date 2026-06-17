"use client";

import Link from "next/link";
import { Users, Wrench } from "lucide-react";

export default function ResourceAllocationLanding() {
  return (
    <div className="px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 leading-none">Resource Allocation</h1>
        <p className="text-xs text-gray-500 mt-1">Manage team and material allocations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
        <Link href="/resource-allocation/team"
          className="block bg-white rounded-xl border border-gray-200 p-8 hover:border-[lab(20_23.9_-60.14)]/30 hover:shadow-md transition">
          <div className="size-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
            <Users className="size-6 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Team Allocation</h2>
          <p className="text-sm text-gray-500">Assign team members to projects with salary or project-based compensation.</p>
          <span className="inline-block mt-4 text-sm font-medium text-[lab(20_23.9_-60.14)]">Open &rarr;</span>
        </Link>

        <Link href="/resource-allocation/material"
          className="block bg-white rounded-xl border border-gray-200 p-8 hover:border-[lab(20_23.9_-60.14)]/30 hover:shadow-md transition">
          <div className="size-12 rounded-xl bg-orange-50 flex items-center justify-center mb-4">
            <Wrench className="size-6 text-orange-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Material Allocation</h2>
          <p className="text-sm text-gray-500">Allocate materials and tools to projects with cost and timeline tracking.</p>
          <span className="inline-block mt-4 text-sm font-medium text-[lab(20_23.9_-60.14)]">Open &rarr;</span>
        </Link>
      </div>
    </div>
  );
}
