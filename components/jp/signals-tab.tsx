"use client"

import { useMemo, useState } from "react"
import type { Signal } from "@/lib/signals"
import { SignalCard } from "./signal-card"
import { FilterChips, type FilterKey } from "./filter-chips"

function matches(s: Signal, f: FilterKey): boolean {
  switch (f) {
    case "all":
      return true
    case "bullish":
      return s.direction === "bullish"
    case "bearish":
      return s.direction === "bearish"
    case "range":
      return s.trend_2h === "range"
    case "graded":
      return s.grade !== null
    case "ungraded":
      return s.grade === null
    case "London":
    case "NY":
    case "Asia":
      return s.session === f
  }
}

export function SignalsTab({
  signals,
  onGrade,
  onOpen,
}: {
  signals: Signal[]
  onGrade: (id: string, g: Signal["grade"]) => void
  onOpen: (id: string) => void
}) {
  const [filter, setFilter] = useState<FilterKey>("all")

  const sorted = useMemo(
    () => signals.slice().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [signals],
  )
  const visible = useMemo(() => sorted.filter((s) => matches(s, filter)), [sorted, filter])

  return (
    <div className="flex flex-col">
      <div className="sticky top-[57px] z-20 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-xl">
        <FilterChips value={filter} onChange={setFilter} />
      </div>

      <div className="space-y-3 px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            {visible.length} {visible.length === 1 ? "signal" : "signals"}
          </span>
          <span className="font-mono text-[11px] text-muted-foreground/60">newest first</span>
        </div>

        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-secondary/20 py-16">
            <span className="text-sm text-muted-foreground">No signals match this filter</span>
          </div>
        ) : (
          visible.map((s) => <SignalCard key={s.id} signal={s} onGrade={onGrade} onOpen={onOpen} />)
        )}
      </div>
    </div>
  )
}
