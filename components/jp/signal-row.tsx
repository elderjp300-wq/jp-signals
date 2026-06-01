"use client"

import type { Signal } from "@/lib/signals"
import { fmtPrice, fmtTimeShort } from "@/lib/signals"
import { Icons } from "@/components/jp/icons"
import { SideTag, StatusPill, GradePill, sideOf, statusOf } from "@/components/jp/design-atoms"

export function SignalRow({ s, onTap }: { s: Signal; onTap?: () => void }) {
  const cells: [string, string, boolean][] = [
    ["Entry", fmtPrice(s.entry), false],
    ["Stop", fmtPrice(s.stop), false],
    ["Target", fmtPrice(s.target), false],
    ["R:R", s.rr_target.toFixed(1), true],
  ]
  return (
    <div className="card tap" style={{ padding: 16, marginBottom: 10 }} onClick={onTap}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <SideTag side={sideOf(s)} />
        <span className="num" style={{ fontWeight: 700, fontSize: 14, letterSpacing: ".3px" }}>
          {s.symbol}
        </span>
        <span className="num" style={{ fontSize: 11, color: "var(--text-3)" }}>
          {s.id}
        </span>
        <span style={{ flex: 1 }} />
        <StatusPill status={statusOf(s)} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, marginTop: 14 }}>
        {cells.map(([l, v, accent], i) => (
          <div key={i}>
            <div className="eyebrow" style={{ fontSize: 9 }}>
              {l}
            </div>
            <div
              className="num"
              style={{ fontSize: 13, fontWeight: 600, marginTop: 4, color: accent ? "var(--accent)" : "var(--text-0)" }}
            >
              {v}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginTop: 14,
          paddingTop: 13,
          borderTop: "1px solid var(--hairline)",
        }}
      >
        <span style={{ color: "var(--text-3)", display: "inline-flex" }}>
          <Icons.clock size={13} />
        </span>
        <span className="num" style={{ fontSize: 11, color: "var(--text-3)" }}>
          {fmtTimeShort(s.timestamp)}
        </span>
        <span className="num" style={{ fontSize: 11, color: "var(--text-3)" }}>
          · {s.session}
        </span>
        <span style={{ flex: 1 }} />
        <span className="eyebrow" style={{ fontSize: 9 }}>
          Grade
        </span>
        <GradePill grade={s.grade} />
      </div>
    </div>
  )
}
