import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Local date as YYYY-MM-DD, so "today" follows the user's timezone. */
export function todayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Formats whole SEK amounts with a thousands separator, e.g. "8 412 kr". */
export function formatSEK(amount: number): string {
  return `${Math.round(amount).toLocaleString("sv-SE")} kr`;
}
