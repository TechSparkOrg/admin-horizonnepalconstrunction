"use client";

import { cn } from "@/lib/utils";

interface SegmentedToggleOption<T extends string | boolean | number> {
  value: T;
  label: string;
}

interface SegmentedToggleProps<T extends string | boolean | number> {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedToggleOption<T>[];
  disabled?: boolean;
  className?: string;
}

export function SegmentedToggle<T extends string | boolean | number>({
  value,
  onChange,
  options,
  disabled = false,
  className,
}: SegmentedToggleProps<T>) {
  return (
    <div className={cn("flex items-center gap-1 rounded-lg bg-gray-100 p-0.5 w-fit", className)}>
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          type="button"
          onClick={() => onChange(opt.value)}
          disabled={disabled}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-md transition",
            value === opt.value
              ? "bg-white text-gray-900 shadow-sm border border-gray-200"
              : "text-gray-500 hover:text-gray-900",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
