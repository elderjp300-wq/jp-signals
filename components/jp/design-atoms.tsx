"use client"

import type { ReactNode } from "react"
import type { Signal, Outcome } from "@/lib/signals"

/* ---------- honest mapping: real Signal -> display values ---------- */

export type DisplaySide = "LONG" | "SHORT"
export type DisplayStatus = "NEW" | "WIN" | "LOSS" | "BREAKEVEN" | "NO-FILL"

export function sideOf(s: Signal): DisplaySide {
  return s.direction === "bullish" ? "LONG" : "SHORT"
}

export function statusOf(s: Signal): DisplayStatus {
  const map: Record<Exclude<Outcome, null>, DisplayStatus> = {
    win: "WIN",
    loss: "LOSS",
    breakeven: "BREAKEVEN",
    "no-fill": "NO-FILL",
  }
  // outcome === null means a freshly detected setup awaiting outcome — NOT a live position.
  return s.outcome ? map[s.outcome] : "NEW"
}

/* ---------- atoms ---------- */

export function SideTag({ side }: { side: DisplaySide }) {
  const long = side === "LONG"
  return (
    <span
      className="num"
      style={{
        fontSize: 10.5,
        fontWeight: 700,
        letterSpacing: ".6px",
        padding: "3px 8px",
        borderRadius: 7,
        color: long ? "var(--up)" : "var(--down)",
        background: long ? "var(--up-dim)" : "var(--down-dim)",
      }}
    >
      {side}
    </span>
  )
}

export function StatusPill({ status }: { status: DisplayStatus }) {
  const map: Record<DisplayStatus, { c: string; bg: string }> = {
    NEW: { c: "var(--accent)", bg: "var(--accent-soft)" },
    WIN: { c: "var(--up)", bg: "var(--up-dim)" },
    LOSS: { c: "var(--down)", bg: "var(--down-dim)" },
    BREAKEVEN: { c: "var(--text-2)", bg: "rgba(255,255,255,0.05)" },
    "NO-FILL": { c: "var(--text-3)", bg: "rgba(255,255,255,0.04)" },
  }
  const s = map[status]
  return (
    <span
      className="num"
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: ".5px",
        color: s.c,
        background: s.bg,
        padding: "3px 8px",
        borderRadius: 999,
      }}
    >
      {status}
    </span>
  )
}

export function GradePill({ grade }: { grade: Signal["grade"] }) {
  if (!grade) {
    return (
      <span className="eyebrow" style={{ fontSize: 9.5 }}>
        ungraded
      </span>
    )
  }
  const c = grade === "A" ? "var(--up)" : grade === "B" ? "var(--accent)" : "var(--text-2)"
  return (
    <span
      className="num"
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: c,
        border: `1px solid ${c}`,
        borderRadius: 7,
        padding: "1px 7px",
        opacity: 0.92,
      }}
    >
      {grade}
    </span>
  )
}

export function StatTile({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: ReactNode
  label: string
  value: ReactNode
  sub?: ReactNode
  accent?: boolean
}) {
  return (
    <div className="card" style={{ padding: "15px 15px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span className="eyebrow">{label}</span>
        <span style={{ color: accent ? "var(--accent)" : "var(--text-3)", marginTop: -2 }}>{icon}</span>
      </div>
      <div className="num" style={{ fontSize: 24, fontWeight: 600, marginTop: 12, letterSpacing: "-1px" }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 3 }}>{sub}</div>}
    </div>
  )
}

/* ---------- ambient background (grid + glow), fixed behind content ---------- */

export function BgField() {
  return (
    <div className="bg-field" aria-hidden style={{ position: "fixed" }}>
      <div className="bg-glow" />
      <svg width="100%" height="100%" style={{ opacity: 0.18 }}>
        <defs>
          <pattern id="jpgrid" width="34" height="34" patternUnits="userSpaceOnUse">
            <path d="M34 0H0V34" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5" />
          </pattern>
          <radialGradient id="jpfade" cx="50%" cy="18%" r="75%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="jpfademask">
            <rect width="100%" height="100%" fill="url(#jpfade)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#jpgrid)" mask="url(#jpfademask)" />
      </svg>
    </div>
  )
}
