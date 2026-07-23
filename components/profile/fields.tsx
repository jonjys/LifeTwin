"use client";

import { cn } from "@/lib/utils";

type Option = { value: string; label: string };

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
      {children}
    </label>
  );
}

/** Single-select chip row — exactly one value active at a time. */
export function SingleChipGroup({
  options,
  value,
  onChange,
}: {
  options: readonly Option[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200",
            value === opt.value
              ? "border-primary/50 bg-primary/10 text-primary"
              : "border-border bg-surface-2/50 text-ink-secondary hover:border-white/20 hover:text-ink"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/** Multi-select chip row — any number of values active. */
export function MultiChipGroup({
  options,
  values,
  onChange,
}: {
  options: readonly Option[];
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const toggle = (value: string) => {
    onChange(values.includes(value) ? values.filter((v) => v !== value) : [...values, value]);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => toggle(opt.value)}
          className={cn(
            "rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200",
            values.includes(opt.value)
              ? "border-primary/50 bg-primary/10 text-primary"
              : "border-border bg-surface-2/50 text-ink-secondary hover:border-white/20 hover:text-ink"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function YesNoToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <SingleChipGroup
      options={[
        { value: "yes", label: "Ja" },
        { value: "no", label: "Nej" },
      ]}
      value={value ? "yes" : "no"}
      onChange={(v) => onChange(v === "yes")}
    />
  );
}

export function TextField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-border bg-surface-2/50 px-4 py-3 text-sm text-ink placeholder:text-ink-muted focus:border-primary/40 focus:outline-none"
    />
  );
}

export function NumberField({
  value,
  onChange,
  suffix,
  min = 0,
}: {
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  min?: number;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-2/50 px-4 py-3">
      <input
        type="number"
        min={min}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-full bg-transparent text-sm text-ink focus:outline-none"
      />
      {suffix && <span className="shrink-0 text-xs text-ink-muted">{suffix}</span>}
    </div>
  );
}
