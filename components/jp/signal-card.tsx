"use client"

import { cn } from "@/lib/utils"
import { type Signal, fmtPrice, fmtTime, fmtR } from "@/lib/signals"
import { DirectionBar, SessionBadge, TrendBadge, OutcomeBadge } from "./badges"
import { GradeButtons } from "./grade-buttons"

function Level({ label, value, tone }: { label: string; value: string; tone?: "bull" | "bear" | "gold" }) {
  const toneClass =
    tone === "bull" ? "text-bull" : tone === "bear" ? "text-bear" : tone === "gold" ? "text-gold" : "text-foreground"
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">{label}</span>
      <span className={cn("font-mono text-[0.95rem] font-semibold tabular-nums", toneClass)}>{value}</span>
    </div>
  )
}

export function SignalCard({
  signal,
  onGrade,
  onOpen,
}: {
  signal: Signal
  onGrade: (id: string, g: Signal["grade"]) => void
  onOpen: (id: string) => void
}) {
  const isBull = signal.direction === "bullish"
  return (
    <button
      type="button"
      onClick={() => onOpen(signal.id)}
      className="surface group relative flex w-full overflow-hidden rounded-xl text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/15 active:translate-y-0"
    >
      <DirectionBar direction={signal.direction} className="self-stretch" />
      <div className="min-w-0 flex-1 p-4">
        {/* header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span
              className={cn("size-2.5 rounded-full", isBull ? "bg-bull glow-bull" : "bg-bear glow-bear")}
              aria-hidden
            />
            <div className="flex flex-col">
              <span className="font-mono text-[0.95rem] font-bold leading-none tracking-tight">
                {signal.symbol}
              </span>
              <span className="mt-1.5 font-mono text-[11px] text-muted-foreground">
                {fmtTime(signal.timestamp)}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <SessionBadge session={signal.session} />
            <TrendBadge trend={signal.trend_2h} />
          </div>
        </div>

        {/* levels */}
        <div className="mt-3.5 grid grid-cols-4 gap-2 rounded-lg border border-border/70 bg-background/40 px-3 py-3">
          <Level label="Entry" value={fmtPrice(signal.entry)} />
          <Level label="Stop" value={fmtPrice(signal.stop)} tone="bear" />
          <Level label="Target" value={fmtPrice(signal.target)} tone="bull" />
          <Level label="R:R" value={`${signal.rr_target.toFixed(1)}`} tone="gold" />
        </div>

        {/* footer: grade + outcome */}
        <div className="mt-3.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">Grade</span>
            <GradeButtons value={signal.grade} onChange={(g) => onGrade(signal.id, g)} />
          </div>
          <div className="flex items-center gap-2">
            {signal.r_result !== null && (
              <span
                className={cn(
                  "font-mono text-sm font-bold tabular-nums",
                  signal.r_result > 0 ? "text-bull" : signal.r_result < 0 ? "text-bear" : "text-muted-foreground",
                )}
              >
                {fmtR(signal.r_result)}
              </span>
            )}
            <OutcomeBadge outcome={signal.outcome} />
          </div>
        </div>
      </div>
    </button>
  )
}
