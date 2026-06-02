"use client"

import {
  type Signal,
  winRate,
  settledSignals,
  cumulativeR,
  signalsThisWeek,
  mostCommonSession,
  totalR,
} from "@/lib/signals"
import { StatCard } from "./stat-card"
import { CumulativeRChart } from "./charts"
import { BotStatus } from "./bot-status"
import { TrendingUp } from "lucide-react"

export function OverviewTab({ signals, live = true }: { signals: Signal[]; live?: boolean }) {
  const total = signals.length
  const graded = signals.filter((s) => s.grade !== null).length
  const settled = settledSignals(signals)
  const wr = winRate(signals)
  const curve = cumulativeR(signals)
  const week = signalsThisWeek(signals)
  const session = mostCommonSession(signals)
  const netR = totalR(signals)

  return (
    <div className="space-y-4 px-4 pb-4 pt-3">
      {/* live bot status — replaces the old grading card */}
      <BotStatus signals={signals} live={live} />

      {/* hero stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Total signals"
          value={total}
          hint={`${signals.filter((s) => s.direction === "bullish").length} long · ${signals.filter((s) => s.direction === "bearish").length} short`}
        />
        <StatCard label="Graded" value={graded} accent="gold" hint={`${total - graded} awaiting review`} />
      </div>

      <StatCard
        label="Win rate"
        value={
          wr === null ? (
            <span className="text-base text-muted-foreground">Awaiting automation</span>
          ) : (
            `${Math.round(wr * 100)}%`
          )
        }
        accent={wr === null ? "muted" : "bull"}
        icon={wr !== null ? <TrendingUp className="size-4" /> : undefined}
        hint={
          wr === null
            ? "No closed trades yet — outcomes populate once live trading is enabled."
            : `${settled.filter((s) => s.outcome === "win").length} wins of ${settled.length} closed`
        }
      />

      {/* cumulative R */}
      <section className="surface rounded-2xl p-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Cumulative R
          </h2>
          {curve.length > 0 && (
            <span className="font-mono text-base font-bold tabular-nums text-gradient-gold">
              {netR > 0 ? "+" : ""}
              {netR.toFixed(1)}R
            </span>
          )}
        </div>
        <div className="mt-3">
          {curve.length === 0 ? (
            <div className="flex h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background/30">
              <span className="text-sm text-muted-foreground">No realized R yet</span>
              <span className="mt-1 text-[11px] text-muted-foreground/60">Curve plots once trades close</span>
            </div>
          ) : (
            <CumulativeRChart data={curve} />
          )}
        </div>
      </section>

      {/* small cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="This week" value={week} hint="signals detected" />
        <StatCard label="Top session" value={session ?? "—"} hint="most frequent" />
      </div>
    </div>
  )
}
