"use client"

import type { Signal } from "@/lib/signals"
import { settledSignals, winRate, profitFactor, totalR, cumulativeR, monthlyR, streaks } from "@/lib/signals"
import { Icons } from "@/components/jp/icons"
import { AreaChart, MonthBars, Ring } from "@/components/jp/design-charts"
import { StatTile } from "@/components/jp/design-atoms"

function pct(n: number | null): string {
  return n === null ? "\u2014" : `${Math.round(n * 100)}%`
}

export function PerformanceTab({ signals }: { signals: Signal[] }) {
  const settled = settledSignals(signals)
  const hasOutcomes = settled.length > 0

  const wr = winRate(signals)
  const pf = profitFactor(signals)
  const cumR = totalR(signals)
  const curve = cumulativeR(signals).map((p) => p.r)
  const months = monthlyR(signals)
  const st = streaks(signals)

  const withR = settled.filter((s) => s.r_result !== null)
  const avgR = withR.length ? withR.reduce((a, s) => a + (s.r_result ?? 0), 0) / withR.length : null
  const best = withR.length ? Math.max(...withR.map((s) => s.r_result ?? 0)) : null
  const longWr = winRate(signals.filter((s) => s.direction === "bullish"))
  const shortWr = winRate(signals.filter((s) => s.direction === "bearish"))

  return (
    <div className="screen-anim" style={{ padding: "4px 20px 24px" }}>
      <header style={{ padding: "10px 0 18px" }}>
        <h1 style={{ fontSize: 23, fontWeight: 600, margin: 0, letterSpacing: "-.6px" }}>Performance</h1>
        <div className="num" style={{ fontSize: 11.5, color: "var(--text-2)", marginTop: 3 }}>
          From your graded outcomes
        </div>
      </header>

      {!hasOutcomes && (
        <div
          className="card card-pad"
          style={{ marginBottom: 12, borderColor: "var(--accent-line)", background: "linear-gradient(120deg, var(--accent-soft), transparent 70%), var(--surface-2)" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "var(--accent)" }}>
              <Icons.shield size={18} />
            </span>
            <span style={{ fontSize: 13.5, fontWeight: 600 }}>Awaiting outcome data</span>
          </div>
          <div className="num" style={{ fontSize: 11.5, color: "var(--text-2)", marginTop: 8, lineHeight: 1.6 }}>
            Win rate, R and streaks fill in once trade outcomes are recorded. Detected setups so far:{" "}
            <span style={{ color: "var(--text-0)" }}>{signals.length}</span>.
          </div>
        </div>
      )}

      {/* headline */}
      <div className="card card-pad" style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <Ring pct={wr === null ? 0 : wr * 100} size={92} thick={8} label={pct(wr)} />
        <div style={{ flex: 1 }}>
          <span className="eyebrow">Win rate</span>
          <div className="num" style={{ fontSize: 12.5, color: "var(--text-2)", marginTop: 10, lineHeight: 1.7 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Profit factor</span>
              <span style={{ color: "var(--accent)", fontWeight: 600 }}>
                {pf === null ? "\u2014" : pf === Infinity ? "\u221e" : pf.toFixed(2)}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Avg R / trade</span>
              <span style={{ color: "var(--text-0)", fontWeight: 600 }}>
                {avgR === null ? "\u2014" : `${avgR >= 0 ? "+" : ""}${avgR.toFixed(2)}R`}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Best trade</span>
              <span style={{ color: "var(--up)", fontWeight: 600 }}>
                {best === null ? "\u2014" : `+${best.toFixed(1)}R`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* cumulative R */}
      <div className="card card-pad" style={{ marginTop: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span className="eyebrow">Cumulative R</span>
          <span className={cumR >= 0 ? "num pos" : "num neg"} style={{ fontSize: 18, fontWeight: 600 }}>
            {cumR >= 0 ? "+" : ""}
            {cumR.toFixed(1)}R
          </span>
        </div>
        <div style={{ marginTop: 12 }}>
          {curve.length >= 2 ? (
            <AreaChart data={curve} h={128} />
          ) : (
            <div style={{ height: 128, display: "grid", placeItems: "center", borderRadius: 12, border: "1px dashed var(--hairline-2)" }}>
              <span className="num" style={{ fontSize: 11.5, color: "var(--text-3)" }}>
                no settled trades yet
              </span>
            </div>
          )}
        </div>
      </div>

      {/* monthly */}
      {months.length > 0 && (
        <div className="card card-pad" style={{ marginTop: 12 }}>
          <span className="eyebrow">Monthly R</span>
          <div style={{ marginTop: 14 }}>
            <MonthBars data={months.map((m) => m.r)} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            {months.map((m, i) => (
              <span key={i} className="num" style={{ fontSize: 9, color: "var(--text-3)", flex: 1, textAlign: "center" }}>
                {m.key}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* stat grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
        <StatTile icon={<Icons.layers size={16} />} label="Settled trades" value={settled.length} />
        <StatTile
          icon={<Icons.flame size={16} />}
          label={st.current < 0 ? "Loss streak" : "Win streak"}
          value={Math.abs(st.current) || st.longestWin || 0}
          accent
        />
        <StatTile icon={<Icons.arrowUp size={16} />} label="Long win %" value={pct(longWr)} />
        <StatTile icon={<Icons.arrowDn size={16} />} label="Short win %" value={pct(shortWr)} />
      </div>
    </div>
  )
}
