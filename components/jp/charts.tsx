"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  ComposedChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  ReferenceLine,
  Tooltip,
} from "recharts"
import type { RateBucket, EquityPoint } from "@/lib/signals"

const GOLD = "#3ad0ff"          // re-skin: accent is now cyan (kept name to limit churn)
const GOLD_BRIGHT = "#7fd9ff"
const MUTED = "#8b929d"          // cool tertiary
const GRID = "rgba(255,255,255,0.07)"
const BULL = "#4ed49a"
const BEAR = "#e0697b"

function ChartTip({
  active,
  payload,
  label,
  suffix,
}: {
  active?: boolean
  payload?: { value: number; name?: string }[]
  label?: string | number
  suffix?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="surface rounded-lg px-2.5 py-1.5">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="font-mono text-sm font-bold tabular-nums text-foreground">
          {p.value}
          {suffix}
        </div>
      ))}
    </div>
  )
}

export function CumulativeRChart({ data }: { data: { label: string; r: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={188}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="rFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={GOLD} stopOpacity={0.35} />
            <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="label"
          tick={{ fill: MUTED, fontSize: 10, fontFamily: "var(--font-mono)" }}
          tickLine={false}
          axisLine={{ stroke: GRID }}
          minTickGap={24}
        />
        <YAxis
          tick={{ fill: MUTED, fontSize: 10, fontFamily: "var(--font-mono)" }}
          tickLine={false}
          axisLine={false}
          width={40}
          tickFormatter={(v) => `${v}R`}
        />
        <ReferenceLine y={0} stroke={GRID} />
        <Tooltip content={<ChartTip suffix="R" />} cursor={{ stroke: GRID }} />
        <Area
          type="monotone"
          dataKey="r"
          stroke={GOLD_BRIGHT}
          strokeWidth={2.5}
          fill="url(#rFill)"
          dot={{ r: 2, fill: GOLD, strokeWidth: 0 }}
          activeDot={{ r: 4, fill: GOLD_BRIGHT, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function EquityDrawdownChart({ data }: { data: EquityPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="eqFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={GOLD} stopOpacity={0.3} />
            <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="ddFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BEAR} stopOpacity={0} />
            <stop offset="100%" stopColor={BEAR} stopOpacity={0.3} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="label"
          tick={{ fill: MUTED, fontSize: 10, fontFamily: "var(--font-mono)" }}
          tickLine={false}
          axisLine={{ stroke: GRID }}
          minTickGap={28}
        />
        <YAxis
          tick={{ fill: MUTED, fontSize: 10, fontFamily: "var(--font-mono)" }}
          tickLine={false}
          axisLine={false}
          width={40}
          tickFormatter={(v) => `${v}R`}
        />
        <ReferenceLine y={0} stroke={GRID} />
        <Tooltip content={<ChartTip suffix="R" />} cursor={{ stroke: GRID }} />
        <Area type="monotone" dataKey="drawdown" stroke={BEAR} strokeWidth={1.5} fill="url(#ddFill)" dot={false} />
        <Area
          type="monotone"
          dataKey="equity"
          stroke={GOLD_BRIGHT}
          strokeWidth={2.5}
          fill="url(#eqFill)"
          dot={false}
          activeDot={{ r: 4, fill: GOLD_BRIGHT, strokeWidth: 0 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

export function MonthlyRBars({ data }: { data: { key: string; r: number }[] }) {
  if (data.length === 0) {
    return <NeedsData height={150} />
  }
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} margin={{ top: 16, right: 8, left: -20, bottom: 0 }} barCategoryGap="28%">
        <XAxis
          dataKey="key"
          tick={{ fill: MUTED, fontSize: 11, fontFamily: "var(--font-mono)" }}
          tickLine={false}
          axisLine={{ stroke: GRID }}
        />
        <YAxis
          tick={{ fill: MUTED, fontSize: 10, fontFamily: "var(--font-mono)" }}
          tickLine={false}
          axisLine={false}
          width={40}
          tickFormatter={(v) => `${v}R`}
        />
        <ReferenceLine y={0} stroke={GRID} />
        <Tooltip content={<ChartTip suffix="R" />} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
        <Bar dataKey="r" radius={[4, 4, 0, 0]} maxBarSize={48}>
          {data.map((d) => (
            <Cell key={d.key} fill={d.r >= 0 ? BULL : BEAR} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function NeedsData({ height }: { height: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-xl border border-dashed border-border bg-background/30"
      style={{ height }}
    >
      <span className="text-center text-xs text-muted-foreground">
        Needs outcome data
        <br />
        <span className="text-[11px] text-muted-foreground/60">awaiting automation</span>
      </span>
    </div>
  )
}

export function WinRateBars({
  buckets,
  highlightFirst,
}: {
  buckets: RateBucket[]
  highlightFirst?: boolean
}) {
  const data = buckets.map((b) => ({
    key: b.key,
    rate: b.winRate === null ? 0 : Math.round(b.winRate * 100),
    total: b.total,
  }))
  const hasData = buckets.some((b) => b.total > 0)
  if (!hasData) return <NeedsData height={150} />
  return (
    <ResponsiveContainer width="100%" height={158}>
      <BarChart data={data} margin={{ top: 16, right: 8, left: -20, bottom: 0 }} barCategoryGap="30%">
        <XAxis
          dataKey="key"
          tick={{ fill: MUTED, fontSize: 11, fontFamily: "var(--font-mono)" }}
          tickLine={false}
          axisLine={{ stroke: GRID }}
        />
        <YAxis
          tick={{ fill: MUTED, fontSize: 10, fontFamily: "var(--font-mono)" }}
          tickLine={false}
          axisLine={false}
          width={40}
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip content={<ChartTip suffix="%" />} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
        <Bar dataKey="rate" radius={[4, 4, 0, 0]} maxBarSize={56}>
          {data.map((d, i) => (
            <Cell key={d.key} fill={d.total === 0 ? GRID : highlightFirst && i === 0 ? GOLD : MUTED} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function GradeDistributionBar({ data }: { data: { grade: string; count: number }[] }) {
  const total = data.reduce((a, b) => a + b.count, 0)
  if (total === 0) {
    return (
      <div className="flex h-9 items-center justify-center rounded-md border border-dashed border-border bg-secondary/20 text-[11px] text-muted-foreground">
        No graded setups yet
      </div>
    )
  }
  const colors: Record<string, string> = { A: GOLD, B: "#c8cfd8", C: "#7f8793" }
  return (
    <div className="space-y-2">
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-secondary">
        {data.map(
          (d) =>
            d.count > 0 && (
              <div
                key={d.grade}
                style={{ width: `${(d.count / total) * 100}%`, backgroundColor: colors[d.grade] }}
                className="h-full"
              />
            ),
        )}
      </div>
      <div className="flex items-center gap-4">
        {data.map((d) => (
          <div key={d.grade} className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ backgroundColor: colors[d.grade] }} aria-hidden />
            <span className="font-mono text-[11px] text-muted-foreground">
              {d.grade} <span className="text-foreground">{d.count}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
