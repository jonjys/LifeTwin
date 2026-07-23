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

/** Adds `months` to a YYYY-MM-DD date key, for future-dated projections. */
export function addMonths(dateKey: string, months: number): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1 + months, d);
}

/** e.g. "June 2027" — the format every future-dated projection reads in. */
export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}
