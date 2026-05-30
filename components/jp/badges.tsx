import { cn } from "@/lib/utils"
import type { Direction, Trend2H, Session, Outcome, Grade } from "@/lib/signals"

export function DirectionBar({ direction, className }: { direction: Direction; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "block w-1",
        direction === "bullish" ? "bg-bull" : "bg-bear",
        className,
      )}
    />
  )
}

export function DirectionDot({ direction }: { direction: Direction }) {
  const isBull = direction === "bullish"
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden
        className={cn("size-2 rounded-full", isBull ? "bg-bull glow-bull" : "bg-bear glow-bear")}
      />
      <span
        className={cn(
          "font-mono text-xs font-semibold uppercase tracking-wider",
          isBull ? "text-bull" : "text-bear",
        )}
      >
        {isBull ? "Long" : "Short"}
      </span>
    </span>
  )
}

const chip =
  "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider"

export function SessionBadge({ session }: { session: Session }) {
  return (
    <span className={cn(chip, "border-border bg-secondary text-muted-foreground")}>{session}</span>
  )
}

export function TrendBadge({ trend }: { trend: Trend2H }) {
  const map: Record<Trend2H, string> = {
    bullish: "border-bull/30 bg-bull/10 text-bull",
    bearish: "border-bear/30 bg-bear/10 text-bear",
    range: "border-border bg-secondary text-muted-foreground",
  }
  const label = trend === "range" ? "2H Range" : trend === "bullish" ? "2H Up" : "2H Down"
  return <span className={cn(chip, map[trend])}>{label}</span>
}

export function OutcomeBadge({ outcome }: { outcome: Outcome }) {
  if (outcome === null) {
    return (
      <span className={cn(chip, "border-dashed border-border bg-transparent text-muted-foreground/70")}>
        Pending
      </span>
    )
  }
  const map: Record<Exclude<Outcome, null>, string> = {
    win: "border-bull/40 bg-bull/15 text-bull",
    loss: "border-bear/40 bg-bear/15 text-bear",
    breakeven: "border-border bg-secondary text-muted-foreground",
    "no-fill": "border-border bg-secondary text-muted-foreground",
  }
  const label =
    outcome === "win" ? "Win" : outcome === "loss" ? "Loss" : outcome === "breakeven" ? "Breakeven" : "No fill"
  return <span className={cn(chip, map[outcome])}>{label}</span>
}

export function GradePill({ grade }: { grade: Grade }) {
  if (!grade) {
    return <span className="font-mono text-xs text-muted-foreground/60">—</span>
  }
  const map = {
    A: "border-gold/40 bg-gold/15 text-gold",
    B: "border-foreground/20 bg-foreground/10 text-foreground",
    C: "border-border bg-secondary text-muted-foreground",
  }
  return (
    <span
      className={cn(
        "inline-flex size-5 items-center justify-center rounded-md border font-mono text-[11px] font-bold",
        map[grade],
      )}
    >
      {grade}
    </span>
  )
}
