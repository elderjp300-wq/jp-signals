"use client"

import { cn } from "@/lib/utils"
import { type Signal, fmtPrice, fmtTime, fmtR } from "@/lib/signals"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { Textarea } from "@/components/ui/textarea"
import { DirectionDot, SessionBadge, TrendBadge, OutcomeBadge } from "./badges"
import { GradeButtons } from "./grade-buttons"
import { CandlestickChart, X } from "lucide-react"

function DetailLevel({ label, value, tone }: { label: string; value: string; tone?: "bull" | "bear" | "gold" }) {
  const toneClass =
    tone === "bull" ? "text-bull" : tone === "bear" ? "text-bear" : tone === "gold" ? "text-gold" : "text-foreground"
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-3 last:border-0">
      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{label}</span>
      <span className={cn("font-mono text-[0.95rem] font-semibold tabular-nums", toneClass)}>{value}</span>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </span>
  )
}

export function SignalDetail({
  signal,
  open,
  onOpenChange,
  onGrade,
  onNotes,
  onAgreement,
}: {
  signal: Signal | null
  open: boolean
  onOpenChange: (o: boolean) => void
  onGrade: (id: string, g: Signal["grade"]) => void
  onNotes: (id: string, notes: string) => void
  onAgreement: (id: string, a: Signal["eye_agreement"]) => void
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[93vh]">
        {signal && (
          <div className="flex min-h-0 flex-1 flex-col">
            {/* sticky header */}
            <div className="flex items-center justify-between gap-2 border-b border-border px-4 pb-3.5 pt-1">
              <div className="flex items-center gap-3">
                <span className="font-mono text-lg font-bold tracking-tight">{signal.symbol}</span>
                <DirectionDot direction={signal.direction} />
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                aria-label="Close"
                className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8 pt-4">
              <div className="flex flex-wrap items-center gap-1.5">
                <SessionBadge session={signal.session} />
                <TrendBadge trend={signal.trend_2h} />
                <span className="font-mono text-[11px] text-muted-foreground">{fmtTime(signal.timestamp)}</span>
                <span className="ml-auto font-mono text-[10px] text-muted-foreground/60">{signal.id}</span>
              </div>

              {/* setup chart — real image when hosted, placeholder otherwise */}
              {signal.chart_url ? (
                <img
                  src={signal.chart_url}
                  alt={`Setup chart for ${signal.id}`}
                  className="mt-4 w-full overflow-hidden rounded-xl border border-border/60"
                  loading="lazy"
                />
              ) : (
                <div className="surface relative mt-4 flex aspect-[16/10] w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-xl">
                  <div className="absolute inset-0 bg-[linear-gradient(oklch(0.255_0.009_60/0.5)_1px,transparent_1px),linear-gradient(90deg,oklch(0.255_0.009_60/0.5)_1px,transparent_1px)] bg-[size:28px_28px] opacity-40" />
                  <CandlestickChart className="relative size-7 text-muted-foreground/50" aria-hidden />
                  <span className="relative font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground/70">
                    No chart for this setup
                  </span>
                </div>
              )}

              {/* outcome */}
              <div className="surface mt-4 flex items-center justify-between rounded-xl px-4 py-3.5">
                <SectionLabel>Outcome</SectionLabel>
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

              {/* levels */}
              <div className="surface mt-4 rounded-xl px-4 py-1.5">
                <DetailLevel label="Entry" value={fmtPrice(signal.entry)} />
                <DetailLevel label="Stop loss" value={fmtPrice(signal.stop)} tone="bear" />
                <DetailLevel label="Target" value={fmtPrice(signal.target)} tone="bull" />
                <DetailLevel label="R:R target" value={`${signal.rr_target.toFixed(1)}R`} tone="gold" />
                <DetailLevel label="Risk distance" value={`$${fmtPrice(signal.risk_distance)}`} />
                <DetailLevel label="Risk in ATR" value={`${signal.risk_atr.toFixed(1)}× ATR`} />
                <DetailLevel label="ATR" value={fmtPrice(signal.atr)} />
              </div>

              {/* eye agreement */}
              <div className="mt-5">
                <SectionLabel>Manual review</SectionLabel>
                <div className="mt-2.5 grid grid-cols-2 gap-2">
                  {(["agree", "skip"] as const).map((a) => {
                    const active = signal.eye_agreement === a
                    return (
                      <button
                        key={a}
                        type="button"
                        onClick={() => onAgreement(signal.id, active ? null : a)}
                        className={cn(
                          "rounded-lg border py-3 text-sm font-semibold capitalize transition-all duration-150",
                          active
                            ? a === "agree"
                              ? "border-bull/50 bg-bull/15 text-bull glow-bull"
                              : "border-bear/50 bg-bear/15 text-bear glow-bear"
                            : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {a}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* grade */}
              <div className="mt-5 flex items-center justify-between">
                <SectionLabel>Grade</SectionLabel>
                <GradeButtons value={signal.grade} onChange={(g) => onGrade(signal.id, g)} size="lg" />
              </div>

              {/* notes */}
              <div className="mt-5">
                <SectionLabel>Notes</SectionLabel>
                <Textarea
                  value={signal.notes ?? ""}
                  onChange={(e) => onNotes(signal.id, e.target.value)}
                  placeholder="Add your read on this setup…"
                  className="mt-2.5 min-h-24 resize-none bg-secondary/30 text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  )
}
