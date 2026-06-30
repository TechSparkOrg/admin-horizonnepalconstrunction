export default function Loading() {
  return (
    <div className="px-4 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1.5">
          <div className="h-7 w-48 bg-gray-200 rounded-md" />
          <div className="h-4 w-36 bg-gray-100 rounded-md" />
        </div>
        <div className="h-9 w-32 bg-gray-200 rounded-md" />
      </div>
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-3 bg-gray-50/50">
          <div className="flex gap-6">
            {[140, 100, 60, 60, 180, 40, 60].map((w, i) => (
              <div key={i} className="h-3 bg-gray-200 rounded" style={{ width: w }} />
            ))}
          </div>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border-b border-gray-100 px-6 py-4 last:border-0">
            <div className="flex gap-6">
              {[180, 120, 60, 60, 140, 40, 80].map((w, j) => (
                <div key={j} className="h-4 bg-gray-100 rounded" style={{ width: w }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
