import { Skeleton } from "@/components/ui/skeleton";

export function PageHeaderSkeleton({
  titleWidth = 128,
  subtitleWidth = 192,
}: {
  titleWidth?: number;
  subtitleWidth?: number;
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="space-y-1.5">
        <Skeleton className="h-7" style={{ width: titleWidth }} />
        <Skeleton className="h-4" style={{ width: subtitleWidth }} />
      </div>
      <Skeleton className="h-9 w-28" />
    </div>
  );
}

export function TableSkeleton({
  columnWidths,
  rows = 5,
}: {
  columnWidths: number[];
  rows?: number;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="border-b border-gray-200 px-6 py-3 bg-gray-50/50">
        <div className="flex gap-6">
          {columnWidths.map((w, i) => (
            <Skeleton key={i} className="h-3" style={{ width: w }} />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b border-gray-100 px-6 py-4 last:border-0">
          <div className="flex gap-6">
            {columnWidths.map((w, j) => (
              <Skeleton key={j} className="h-4" style={{ width: w }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ListPageSkeleton({
  columnWidths = [200, 120, 60, 60, 100],
  rows = 5,
}: {
  columnWidths?: number[];
  rows?: number;
}) {
  return (
    <div className="p-6">
      <PageHeaderSkeleton />
      <TableSkeleton columnWidths={columnWidths} rows={rows} />
    </div>
  );
}

export function FilterableTableSkeleton({
  columnWidths = [200, 120, 60, 60, 100],
  rows = 5,
}: {
  columnWidths?: number[];
  rows?: number;
}) {
  return (
    <div className="p-6 space-y-4">
      <PageHeaderSkeleton />
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24 rounded-lg" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
      <TableSkeleton columnWidths={columnWidths} rows={rows} />
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-7" style={{ width: 120 }} />
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4" style={{ width: 80 }} />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
        <Skeleton className="h-9 w-32" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-7" style={{ width: 160 }} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-200 p-5 space-y-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8" style={{ width: 64 }} />
            <Skeleton className="h-3" style={{ width: 96 }} />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-gray-200 p-5 space-y-3">
        <Skeleton className="h-5" style={{ width: 120 }} />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function MediaGridSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <PageHeaderSkeleton />
      <div className="flex gap-2">
        <Skeleton className="h-9 w-48 rounded-lg" />
        <Skeleton className="h-9 w-20 rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export function StackedListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="p-6 space-y-4">
      <PageHeaderSkeleton />
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export function NavCardSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <PageHeaderSkeleton />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-200 p-5 space-y-3">
            <Skeleton className="h-6" style={{ width: 120 }} />
            <Skeleton className="h-4" style={{ width: 200 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
