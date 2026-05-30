"use client"

import type React from "react"
import {
  type Signal,
  type HeatCell,
  rateBy,
  expectancy,
  winRate,
  settledSignals,
  totalR,
  profitFactor,
  streaks,
  equityCurve,
  maxDrawdown,
  monthlyR,
  executionQuality,
  winRateHeatmap,
  setupFrequency,
  pairBreakdown,
  avgRBy,
} from "@/lib/signals"
import { WinRateBars, EquityDrawdownChart, MonthlyRBars } from "./charts"
import { StatCard } from "./stat-card"
import { GradePill } from "./badges"
import { Activity, Crosshair, Flame, Layers, Target, TrendingDown } from "lucide-react"

function Section({
  title,
  subtitle,
  children,
  emphasized,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  emphasized?: boolean
}) {
  return (
    <section className={emphasized ? "surface glow-gold rounded-2xl p-4" : "surface rounded-2xl p-4"}>
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {title}
        </h2>
        {emphasized && (
          <span className="rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-gold">
            Primary edge
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1.5 text-xs leading-snug text-muted-foreground">{subtitle}</p>}
      <div className="mt-3.5">{children}</div>
    </section>
  )
}

/* session x 2H-context win-rate heatmap */
function Heatmap({ cells }: { cells: HeatCell[] }) {
  const sessions: ("London" | "NY" | "Asia")[] = ["London", "NY", "Asia"]
  const contexts: ("range" | "bullish" | "bearish")[] = ["range", "bullish", "bearish"]
  const ctxLabel = { range: "Range", bullish: "Trend Up", bearish: "Trend Dn" }
  const cellOf = (s: string, c: string) => cells.find((x) => x.session === s && x.context === c)
  const color = (wr: number | null) => {
    if (wr === null) return "border-border bg-background/40 text-muted-foreground/50"
    return wr >= 0.5 ? "border-bull/20 text-foreground" : "border-bear/20 text-foreground"
  }
  const bg = (wr: number | null): React.CSSProperties => {
    if (wr === null) return {}
    const a = Math.min(0.85, 0.12 + Math.abs(wr - 0.5) * 1.5)
    return {
      backgroundColor: wr >= 0.5 ? `oklch(0.75 0.105 160 / ${a})` : `oklch(0.68 0.16 30 / ${a})`,
    }
  }
  return (
    <div className="grid grid-cols-[auto_repeat(3,1fr)] gap-1.5">
      <div />
      {contexts.map((c) => (
        <div key={c} className="pb-1 text-center font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
          {ctxLabel[c]}
        </div>
      ))}
      {sessions.map((s) => (
        <FragmentRow key={s} label={s}>
          {contexts.map((c) => {
            const cell = cellOf(s, c)
            const wr = cell?.winRate ?? null
            return (
              <div
                key={c}
                className={`flex aspect-square flex-col items-center justify-center rounded-md border ${color(wr)}`}
                style={bg(wr)}
              >
                <span className="font-mono text-sm font-bold tabular-nums">
                  {wr === null ? "—" : `${Math.round(wr * 100)}`}
                </span>
                {cell && cell.total > 0 && (
                  <span className="font-mono text-[8px] text-foreground/60">n{cell.total}</span>
                )}
              </div>
            )
          })}
        </FragmentRow>
      ))}
    </div>
  )
}

function FragmentRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <div className="flex items-center pr-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      {children}
    </>
  )
}

function StreakStrip({ sequence }: { sequence: ("win" | "loss" | "breakeven")[] }) {
  const recent = sequence.slice(-28)
  return (
    <div className="flex flex-wrap gap-1">
      {recent.map((o, i) => (
        <span
          key={i}
          title={o}
          className={
            o === "win"
              ? "size-3.5 rounded-[3px] bg-bull"
              : o === "loss"
                ? "size-3.5 rounded-[3px] bg-bear"
                : "size-3.5 rounded-[3px] bg-muted"
          }
        />
      ))}
    </div>
  )
}

function MiniBars({ data }: { data: { key: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count))
  return (
    <div className="space-y-2.5">
      {data.map((d) => (
        <div key={d.key} className="flex items-center gap-3">
          <span className="w-14 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{d.key}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-background/60">
            <div className="h-full rounded-full bg-gold/70" style={{ width: `${(d.count / max) * 100}%` }} />
          </div>
          <span className="w-8 text-right font-mono text-xs font-semibold tabular-nums text-foreground">
            {d.count}
          </span>
        </div>
      ))}
    </div>
  )
}

export function PerformanceTab({ signals }: { signals: Signal[] }) {
  const settled = settledSignals(signals)
  const hasOutcomes = settled.length > 0

  const byContext = rateBy(signals, ["range", "bullish", "bearish"], (s) => s.trend_2h)
  const contextLabeled = byContext.map((b) => ({
    ...b,
    key: b.key === "range" ? "Range" : b.key === "bullish" ? "Trend Up" : "Trend Down",
  }))
  const bySession = rateBy(signals, ["London", "NY", "Asia"], (s) => s.session)
  const byDirection = rateBy(signals, ["bullish", "bearish"], (s) => s.direction).map((b) => ({
    ...b,
    key: b.key === "bullish" ? "Long" : "Short",
  }))

  const exp = expectancy(signals)
  const wr = winRate(signals)
  const net = totalR(signals)
  const pf = profitFactor(signals)
  const avgR =
    settled.filter((s) => s.r_result !== null).length > 0
      ? settled.reduce((a, s) => a + (s.r_result ?? 0), 0) /
        settled.filter((s) => s.r_result !== null).length
      : null

  const streak = streaks(signals)
  const equity = equityCurve(signals)
  const maxDD = maxDrawdown(signals)
  const months = monthlyR(signals)
  const exec = executionQuality(signals)
  const heat = winRateHeatmap(signals)
  const freq = setupFrequency(signals)
  const pairs = pairBreakdown(signals)
  const sessionAvgR = avgRBy(signals, ["London", "NY", "Asia"], (s) => s.session)

  const gradeRows = (["A", "B", "C"] as const).map((g) => {
    const subset = settled.filter((s) => s.grade === g)
    const wins = subset.filter((s) => s.outcome === "win").length
    return {
      grade: g,
      total: subset.length,
      rate: subset.length > 0 ? Math.round((wins / subset.length) * 100) : null,
    }
  })

  const fmtSigned = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(1)}R`

  return (
    <div className="space-y-4 px-4 pb-4 pt-3">
      {/* headline KPI band */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Win rate"
          value={wr === null ? <span className="text-base text-muted-foreground">—</span> : `${Math.round(wr * 100)}%`}
          accent={wr === null ? "muted" : "bull"}
          icon={<Target className="size-4" />}
          hint={hasOutcomes ? `${settled.length} closed trades` : "needs data"}
        />
        <StatCard
          label="Net R"
          value={hasOutcomes ? <span className="text-gradient-gold">{fmtSigned(net)}</span> : <span className="text-base text-muted-foreground">—</span>}
          icon={<Activity className="size-4" />}
          hint={hasOutcomes ? "realized return" : "needs data"}
        />
        <StatCard
          label="Expectancy"
          value={exp === null ? <span className="text-base text-muted-foreground">—</span> : fmtSigned(exp)}
          accent={exp === null ? "muted" : exp > 0 ? "bull" : "bear"}
          hint="per signal"
        />
        <StatCard
          label="Profit factor"
          value={pf === null ? <span className="text-base text-muted-foreground">—</span> : pf === Infinity ? "∞" : pf.toFixed(2)}
          accent={pf === null ? "muted" : pf >= 1 ? "bull" : "bear"}
          hint="gross win / loss"
        />
      </div>

      {/* equity + drawdown */}
      <Section
        title="Equity curve & drawdown"
        subtitle="Cumulative R with underwater drawdown shaded below the high-water mark."
      >
        {equity.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center rounded-xl border border-dashed border-border bg-background/30">
            <span className="text-sm text-muted-foreground">No realized R yet</span>
          </div>
        ) : (
          <>
            <EquityDrawdownChart data={equity} />
            <div className="mt-3 flex items-center justify-between rounded-lg border border-border/60 bg-background/40 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <TrendingDown className="size-4 text-bear" aria-hidden />
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Max drawdown</span>
              </div>
              <span className="font-mono text-sm font-bold tabular-nums text-bear">{maxDD.toFixed(1)}R</span>
            </div>
          </>
        )}
      </Section>

      {/* PRIMARY: by 2H context */}
      <Section
        title="Win rate by 2H context"
        subtitle="Does the bot perform better in range vs trending regimes? This is the edge to validate."
        emphasized
      >
        <WinRateBars buckets={contextLabeled} highlightFirst />
      </Section>

      {/* heatmap */}
      <Section title="Performance heatmap" subtitle="Win rate by session × 2H context. Green favors the setup, red warns against it.">
        {hasOutcomes ? <Heatmap cells={heat} /> : <NeedsOutcome />}
      </Section>

      {/* streaks */}
      <Section title="Streak tracking" subtitle="Consecutive results in chronological order.">
        {hasOutcomes ? (
          <>
            <div className="grid grid-cols-3 gap-2">
              <StreakStat
                label="Current"
                value={streak.current === 0 ? "—" : `${Math.abs(streak.current)}${streak.current > 0 ? "W" : "L"}`}
                tone={streak.current > 0 ? "bull" : streak.current < 0 ? "bear" : "muted"}
                icon={<Flame className="size-4" />}
              />
              <StreakStat label="Best win run" value={`${streak.longestWin}W`} tone="bull" />
              <StreakStat label="Worst loss run" value={`${streak.longestLoss}L`} tone="bear" />
            </div>
            <div className="mt-3.5">
              <StreakStrip sequence={streak.sequence} />
            </div>
          </>
        ) : (
          <NeedsOutcome />
        )}
      </Section>

      {/* monthly growth */}
      <Section title="Monthly growth" subtitle="Net R booked per calendar month.">
        <MonthlyRBars data={months} />
      </Section>

      {/* session performance */}
      <Section title="Session performance" subtitle="Win rate and average R across London, NY and Asia.">
        <WinRateBars buckets={bySession} />
        <div className="mt-3 grid grid-cols-3 gap-2">
          {sessionAvgR.map((s) => (
            <div key={s.key} className="rounded-lg border border-border/60 bg-background/40 px-2 py-2 text-center">
              <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{s.key}</div>
              <div
                className={
                  "mt-1 font-mono text-sm font-bold tabular-nums " +
                  (s.avgR === null ? "text-muted-foreground" : s.avgR > 0 ? "text-bull" : "text-bear")
                }
              >
                {s.avgR === null ? "—" : fmtSigned(s.avgR)}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* direction */}
      <Section title="Win rate by direction" subtitle="Long versus short bias.">
        <WinRateBars buckets={byDirection} />
      </Section>

      {/* setup frequency */}
      <Section title="Setup frequency" subtitle="Signals detected per session across the full feed.">
        <MiniBars data={freq} />
      </Section>

      {/* execution quality */}
      <Section title="Execution quality" subtitle="Fill reliability and slippage on placed orders.">
        {exec.placed === 0 ? (
          <NeedsOutcome />
        ) : (
          <div className="grid grid-cols-3 gap-2">
            <ExecStat
              label="Fill rate"
              value={exec.fillRate === null ? "—" : `${Math.round(exec.fillRate * 100)}%`}
              icon={<Crosshair className="size-4" />}
            />
            <ExecStat
              label="Avg slippage"
              value={exec.avgSlippage === null ? "—" : `$${exec.avgSlippage.toFixed(2)}`}
            />
            <ExecStat
              label="Avg fill"
              value={exec.avgFillDelayMin === null ? "—" : `${exec.avgFillDelayMin.toFixed(1)}m`}
            />
          </div>
        )}
      </Section>

      {/* pair breakdown */}
      <Section title="Pair-by-pair breakdown" subtitle="Per-instrument performance. Built to scale as more symbols come online.">
        <div className="overflow-hidden rounded-lg border border-border/60">
          <div className="grid grid-cols-[1.4fr_repeat(4,1fr)] gap-1 border-b border-border/60 bg-background/40 px-3 py-2 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
            <span>Symbol</span>
            <span className="text-right">Trades</span>
            <span className="text-right">Win%</span>
            <span className="text-right">Net R</span>
            <span className="text-right">Avg R</span>
          </div>
          {pairs.map((p) => (
            <div
              key={p.symbol}
              className="grid grid-cols-[1.4fr_repeat(4,1fr)] items-center gap-1 px-3 py-2.5 font-mono text-xs tabular-nums"
            >
              <span className="flex items-center gap-1.5 font-bold text-foreground">
                <Layers className="size-3.5 text-gold" aria-hidden />
                {p.symbol}
              </span>
              <span className="text-right text-muted-foreground">{p.settled}</span>
              <span className="text-right text-foreground">
                {p.winRate === null ? "—" : `${Math.round(p.winRate * 100)}%`}
              </span>
              <span className={"text-right font-bold " + (p.totalR >= 0 ? "text-bull" : "text-bear")}>
                {p.settled ? fmtSigned(p.totalR) : "—"}
              </span>
              <span className="text-right text-foreground">{p.avgR === null ? "—" : p.avgR.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* grade vs outcome */}
      <Section title="Grade vs outcome" subtitle="Do A-graded setups actually win more than C?">
        {!hasOutcomes ? (
          <NeedsOutcome />
        ) : (
          <div className="space-y-2.5">
            {gradeRows.map((r) => (
              <div key={r.grade} className="flex items-center gap-3">
                <GradePill grade={r.grade} />
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-background/60">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold/80 to-gold transition-all"
                    style={{ width: `${r.rate ?? 0}%` }}
                  />
                </div>
                <span className="w-20 text-right font-mono text-xs font-semibold tabular-nums text-foreground">
                  {r.rate === null ? "—" : `${r.rate}%`}
                  <span className="ml-1 font-normal text-muted-foreground/60">({r.total})</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </Section>

      {!hasOutcomes && (
        <p className="px-1 text-center text-[11px] leading-relaxed text-muted-foreground/70">
          Most performance metrics stay empty until automated trading is live and outcomes are recorded.
        </p>
      )}
    </div>
  )
}

function NeedsOutcome() {
  return (
    <div className="flex h-[88px] items-center justify-center rounded-xl border border-dashed border-border bg-background/30">
      <span className="text-center text-xs text-muted-foreground">
        Needs outcome data
        <br />
        <span className="text-[11px] text-muted-foreground/60">populates as trades close</span>
      </span>
    </div>
  )
}

function StreakStat({
  label,
  value,
  tone,
  icon,
}: {
  label: string
  value: string
  tone: "bull" | "bear" | "muted"
  icon?: React.ReactNode
}) {
  const toneClass = tone === "bull" ? "text-bull" : tone === "bear" ? "text-bear" : "text-muted-foreground"
  return (
    <div className="rounded-lg border border-border/60 bg-background/40 px-2 py-2.5 text-center">
      <div className="flex items-center justify-center gap-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className={"mt-1.5 font-mono text-lg font-bold tabular-nums " + toneClass}>{value}</div>
    </div>
  )
}

function ExecStat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/40 px-2 py-2.5 text-center">
      <div className="flex items-center justify-center gap-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1.5 font-mono text-base font-bold tabular-nums text-foreground">{value}</div>
    </div>
  )
}
