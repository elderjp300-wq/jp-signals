"use client"

import type { Signal } from "@/lib/signals"
import { signalsThisWeek, settledSignals, totalR, cumulativeR, fmtTimeShort } from "@/lib/signals"
import { Icons } from "@/components/jp/icons"
import { AreaChart } from "@/components/jp/design-charts"
import { StatTile } from "@/components/jp/design-atoms"
import { SignalRow } from "@/components/jp/signal-row"

export function OverviewTab({
  signals,
  live,
  onGoSignals,
  onGoPerformance,
  onOpen,
}: {
  signals: Signal[]
  live: boolean
  onGoSignals: () => void
  onGoPerformance: () => void
  onOpen: (id: string) => void
}) {
  const total = signals.length
  const graded = signals.filter((s) => s.grade).length
  const ungraded = total - graded
  const week = signalsThisWeek(signals, new Date())
  const settled = settledSignals(signals)
  const curve = cumulativeR(signals).map((p) => p.r)
  const cumR = totalR(signals)
  const latest = signals[0]
  const longs = signals.filter((s) => s.direction === "bullish").length
  const shorts = total - longs

  return (
    <div className="screen-anim" style={{ padding: "4px 20px 24px" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 13, padding: "10px 0 18px" }}>
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            background: "linear-gradient(155deg,#15171d,#0a0b0e)",
            border: "1px solid var(--hairline-2)",
            display: "grid",
            placeItems: "center",
            color: "var(--silver)",
          }}
        >
          <Icons.bolt size={24} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 19, fontWeight: 600, letterSpacing: "-.3px" }}>JP Signals</div>
          <div className="eyebrow" style={{ marginTop: 2 }}>
            Overview
          </div>
        </div>
        <span className={live ? "chip live" : "chip"}>
          <span
            className="dot"
            style={{ background: live ? "var(--up)" : "var(--text-3)", boxShadow: live ? "0 0 10px var(--up)" : "none" }}
          />
          {live ? "LIVE" : "OFFLINE"}
        </span>
      </header>

      <div className="card card-pad" style={{ overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 11 }}>
            <span
              className="dot"
              style={{ marginTop: 7, background: live ? "var(--up)" : "var(--text-3)", boxShadow: live ? "0 0 10px var(--up)" : "none" }}
            />
            <div>
              <div style={{ fontSize: 17, fontWeight: 600 }}>Bot Status</div>
              <div
                className="num"
                style={{ fontSize: 12, color: live ? "var(--up)" : "var(--text-2)", letterSpacing: ".5px", marginTop: 3 }}
              >
                {live ? "CONNECTED \u00b7 LIVE FEED" : "OFFLINE \u00b7 SHOWING CACHED"}
              </div>
            </div>
          </div>
          <span className="chip">
            <span style={{ color: "var(--accent)", display: "inline-flex" }}>
              <Icons.radar size={13} />
            </span>
            XAUUSDm
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
          {[
            { i: <Icons.signals size={16} />, l: "Total signals", v: total, a: false },
            { i: <Icons.pulse size={16} />, l: "This week", v: week, a: true },
            { i: <Icons.shield size={16} />, l: "Graded", v: graded, a: false },
            { i: <Icons.clock size={16} />, l: "Last signal", v: latest ? fmtTimeShort(latest.timestamp) : "\u2014", a: false },
          ].map((s, i) => (
            <div
              key={i}
              style={{ padding: "13px 14px", borderRadius: 14, border: "1px solid var(--hairline)", background: "var(--surface-1)" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="eyebrow" style={{ fontSize: 9.5 }}>
                  {s.l}
                </span>
                <span style={{ color: s.a ? "var(--accent)" : "var(--text-3)" }}>{s.i}</span>
              </div>
              <div
                className="num"
                style={{ fontSize: 21, fontWeight: 600, marginTop: 9, color: s.a ? "var(--accent)" : "var(--text-0)" }}
              >
                {s.v}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
        <StatTile icon={<Icons.layers size={16} />} label="Total signals" value={total} sub={`${longs} long \u00b7 ${shorts} short`} />
        <StatTile
          icon={<Icons.shield size={16} />}
          label="Graded"
          value={graded}
          sub={ungraded > 0 ? `${ungraded} awaiting review` : "all reviewed"}
          accent
        />
      </div>

      <div className="card card-pad tap" style={{ marginTop: 12 }} onClick={onGoPerformance}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div>
            <span className="eyebrow">Cumulative R</span>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
              <span
                className={cumR >= 0 ? "num pos" : "num neg"}
                style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-1px" }}
              >
                {cumR >= 0 ? "+" : ""}
                {cumR.toFixed(1)}R
              </span>
              <span className="num" style={{ fontSize: 12.5, color: "var(--text-2)" }}>
                {settled.length} settled
              </span>
            </div>
          </div>
          <span style={{ fontSize: 12, color: "var(--accent)", display: "flex", alignItems: "center", gap: 2 }}>
            All <Icons.chevR size={14} />
          </span>
        </div>
        <div style={{ marginTop: 14 }}>
          {curve.length >= 2 ? (
            <AreaChart data={curve} h={120} />
          ) : (
            <div style={{ height: 120, display: "grid", placeItems: "center", borderRadius: 12, border: "1px dashed var(--hairline-2)" }}>
              <span className="num" style={{ fontSize: 11.5, color: "var(--text-3)", textAlign: "center" }}>
                equity curve fills in once outcomes are recorded
              </span>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "22px 2px 12px" }}>
        <span style={{ fontSize: 14.5, fontWeight: 600 }}>Latest signal</span>
        <span
          className="tap"
          onClick={onGoSignals}
          style={{ fontSize: 12, color: "var(--accent)", display: "flex", alignItems: "center", gap: 2 }}
        >
          All <Icons.chevR size={14} />
        </span>
      </div>
      {latest ? (
        <SignalRow s={latest} onTap={() => onOpen(latest.id)} />
      ) : (
        <div className="card card-pad" style={{ textAlign: "center", color: "var(--text-3)" }}>
          <span className="num" style={{ fontSize: 12 }}>
            no signals yet
          </span>
        </div>
      )}
    </div>
  )
}
