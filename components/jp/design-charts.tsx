"use client"

import { useId } from "react"

// smooth cubic path (catmull-rom -> bezier) — ported from the design's data.jsx
function smoothPath(data: number[], w: number, h: number, pad = 4): string {
  if (data.length < 2) return ""
  const min = Math.min(...data)
  const max = Math.max(...data)
  const rng = max - min || 1
  const step = (w - pad * 2) / (data.length - 1)
  const pts = data.map((v, i) => [pad + i * step, pad + (h - pad * 2) * (1 - (v - min) / rng)] as const)
  let d = `M${pts[0][0].toFixed(2)},${pts[0][1].toFixed(2)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] || p2
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`
  }
  return d
}

export function AreaChart({
  data,
  w = 320,
  h = 150,
  color = "var(--chart)",
  showGrid = true,
  animate = true,
}: {
  data: number[]
  w?: number
  h?: number
  color?: string
  showGrid?: boolean
  animate?: boolean
}) {
  const id = useId().replace(/:/g, "")
  const pad = 6
  if (data.length < 2) {
    return (
      <div style={{ height: h, display: "grid", placeItems: "center" }}>
        <span className="num" style={{ fontSize: 11.5, color: "var(--text-3)" }}>
          not enough data yet
        </span>
      </div>
    )
  }
  const d = smoothPath(data, w, h, pad)
  const area = `${d} L${w - pad},${h} L${pad},${h} Z`
  const min = Math.min(...data)
  const max = Math.max(...data)
  const rng = max - min || 1
  const lx = w - pad
  const ly = pad + (h - pad * 2) * (1 - (data[data.length - 1] - min) / rng)
  return (
    <svg
      width="100%"
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        <linearGradient id={`ar${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.30" />
          <stop offset="55%" stopColor={color} stopOpacity="0.07" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {showGrid &&
        [0.25, 0.5, 0.75].map((g) => (
          <line
            key={g}
            x1={pad}
            x2={w - pad}
            y1={pad + (h - pad * 2) * g}
            y2={pad + (h - pad * 2) * g}
            stroke="rgba(255,255,255,0.045)"
            strokeWidth="1"
            strokeDasharray="2 5"
          />
        ))}
      <path d={area} fill={`url(#ar${id})`} />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        style={
          animate
            ? { strokeDasharray: 1400, strokeDashoffset: 1400, animation: "drawLine 1.3s cubic-bezier(.2,.7,.3,1) forwards" }
            : undefined
        }
      />
      <circle cx={lx} cy={ly} r="9" fill={color} opacity="0.16" />
      <circle cx={lx} cy={ly} r="3.4" fill={color} stroke="var(--bg)" strokeWidth="1.5" />
    </svg>
  )
}

export function MonthBars({ data, w = 322, h = 96 }: { data: number[]; w?: number; h?: number }) {
  if (!data.length) return null
  const max = Math.max(1, ...data.map(Math.abs))
  const slot = w / data.length
  const bw = slot * 0.5
  const mid = h / 2
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <line x1="0" x2={w} y1={mid} y2={mid} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      {data.map((v, i) => {
        const bh = (Math.abs(v) / max) * (h / 2 - 6)
        const x = slot * i + (slot - bw) / 2
        const col = v >= 0 ? "var(--up)" : "var(--down)"
        const y = v >= 0 ? mid - bh : mid
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={bw}
            height={Math.max(1.5, bh)}
            rx="2"
            fill={col}
            style={{ transformOrigin: `center ${mid}px`, animation: "barRise .6s ease forwards", animationDelay: `${i * 30}ms` }}
          />
        )
      })}
    </svg>
  )
}

export function Ring({
  pct,
  size = 64,
  thick = 6,
  color = "var(--accent)",
  label,
}: {
  pct: number
  size?: number
  thick?: number
  color?: string
  label: string
}) {
  const r = (size - thick) / 2
  const C = 2 * Math.PI * r
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={thick} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={thick}
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * C} ${C}`}
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
        <span className="num" style={{ fontSize: 15, fontWeight: 600 }}>
          {label}
        </span>
      </div>
    </div>
  )
}
