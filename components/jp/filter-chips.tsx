"use client"

import { cn } from "@/lib/utils"

export type FilterKey =
  | "all"
  | "bullish"
  | "bearish"
  | "range"
  | "graded"
  | "ungraded"
  | "London"
  | "NY"
  | "Asia"

export const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "bullish", label: "Bullish" },
  { key: "bearish", label: "Bearish" },
  { key: "range", label: "Range" },
  { key: "graded", label: "Graded" },
  { key: "ungraded", label: "Ungraded" },
  { key: "London", label: "London" },
  { key: "NY", label: "NY" },
  { key: "Asia", label: "Asia" },
]

export function FilterChips({
  value,
  onChange,
}: {
  value: FilterKey
  onChange: (k: FilterKey) => void
}) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      {FILTERS.map((f) => {
        const active = value === f.key
        return (
          <button
            key={f.key}
            type="button"
            onClick={() => onChange(f.key)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-150",
              active
                ? "border-gold/50 bg-gold/15 text-gold glow-gold"
                : "border-border bg-secondary/40 text-muted-foreground hover:border-foreground/30 hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        )
      })}
    </div>
  )
}
