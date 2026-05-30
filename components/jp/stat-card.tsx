import type React from "react"
import { cn } from "@/lib/utils"

export function StatCard({
  label,
  value,
  hint,
  accent,
  icon,
  className,
}: {
  label: string
  value: React.ReactNode
  hint?: React.ReactNode
  accent?: "gold" | "bull" | "bear" | "muted"
  icon?: React.ReactNode
  className?: string
}) {
  const accentClass =
    accent === "gold"
      ? "text-gradient-gold"
      : accent === "bull"
        ? "text-bull"
        : accent === "bear"
          ? "text-bear"
          : "text-foreground"
  return (
    <div className={cn("surface relative overflow-hidden rounded-xl p-4", className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </div>
        {icon && <span className="text-muted-foreground/70">{icon}</span>}
      </div>
      <div
        className={cn(
          "mt-2.5 font-mono text-[1.75rem] font-bold leading-none tracking-tight tabular-nums",
          accentClass,
        )}
      >
        {value}
      </div>
      {hint && <div className="mt-2 text-xs leading-snug text-muted-foreground">{hint}</div>}
    </div>
  )
}
