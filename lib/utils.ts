import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | null | undefined, fallback = "—"): string {
  if (!date) return fallback;
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

let _idCounter = 0;
export function genId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${++_idCounter}`;
}

