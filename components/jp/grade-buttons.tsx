"use client"

import { cn } from "@/lib/utils"
import type { Grade } from "@/lib/signals"

const GRADES: Exclude<Grade, null>[] = ["A", "B", "C"]

export function GradeButtons({
  value,
  onChange,
  size = "sm",
}: {
  value: Grade
  onChange: (g: Grade) => void
  size?: "sm" | "lg"
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Setup grade"
      className="inline-flex items-center gap-1"
      onClick={(e) => e.stopPropagation()}
    >
      {GRADES.map((g) => {
        const active = value === g
        return (
          <button
            key={g}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(active ? null : g)}
            className={cn(
              "inline-flex items-center justify-center rounded-md border font-mono font-bold transition-all duration-150",
              size === "sm" ? "size-7 text-xs" : "h-10 w-12 text-base",
              active
                ? g === "A"
                  ? "border-gold bg-gold/20 text-gold glow-gold"
                  : "border-foreground/40 bg-foreground/15 text-foreground"
                : "border-border bg-secondary/40 text-muted-foreground hover:border-foreground/30 hover:text-foreground",
            )}
          >
            {g}
          </button>
        )
      })}
    </div>
  )
}
