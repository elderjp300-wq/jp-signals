"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Activity, Cpu, Layers, Radar, Signal as SignalIcon } from "lucide-react"
import type { Signal } from "@/lib/signals"
import { signalsThisWeek, fmtTimeShort } from "@/lib/signals"

function Metric({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  accent?: boolean
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-background/40 px-3 py-2.5">
      <span className={cn("text-muted-foreground/80", accent && "text-gold")}>{icon}</span>
      <div className="flex min-w-0 flex-col">
        <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">{label}</span>
        <span
          className={cn(
            "truncate font-mono text-[0.8rem] font-bold tabular-nums",
            accent ? "text-gold" : "text-foreground",
          )}
        >
          {value}
        </span>
      </div>
    </div>
  )
}

/**
 * Re-skinned to the cool/cyan system. The fabricated cells (version, latency,
 * uptime, auto-grade, simulated scan clock) have been removed per JP — every
 * value here is real: connection state + counts from the live signal data.
 * Animations (scan line, equalizer) are kept purely as decoration.
 */
export function BotStatus({ signals, live = true }: { signals: Signal[]; live?: boolean }) {
  // decorative cadence only — drives the scan line / equalizer, no fake numbers shown
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % 60), 1000)
    return () => clearInterval(id)
  }, [])

  const total = signals.length
  const week = signalsThisWeek(signals, new Date())
  const graded = signals.filter((s) => s.grade).length
  const latest = signals[0]
  const pulse = tick % 6 < 3 // decorative

  return (
    <section className="surface glow-gold relative overflow-hidden rounded-2xl p-4">
      {/* sweeping scan line (decorative) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px overflow-hidden">
        <div className="animate-scan h-px w-1/3 bg-gradient-to-r from-transparent via-gold to-transparent" />
      </div>

      {/* header — honest connection state */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="relative flex size-2.5">
            {live && <span className="animate-live-ping absolute inline-flex size-2.5 rounded-full bg-bull" />}
            <span
              className={cn(
                "relative inline-flex size-2.5 rounded-full",
                live ? "bg-bull glow-bull" : "bg-muted-foreground",
              )}
            />
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-none tracking-tight">Bot Status</span>
            <span
              className={cn(
                "mt-1 font-mono text-[10px] uppercase tracking-[0.14em]",
                live ? "text-bull" : "text-muted-foreground",
              )}
            >
              {live ? "Connected · live feed" : "Offline · showing cached"}
            </span>
          </div>
        </div>
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-full px-2.5 py-1",
            live ? "border border-bull/30 bg-bull/10" : "border border-border bg-muted/30",
          )}
        >
          <Radar className={cn("size-3.5", live ? "text-bull" : "text-muted-foreground")} aria-hidden />
          <span
            className={cn(
              "font-mono text-[10px] font-semibold uppercase tracking-wider",
              live ? "text-bull" : "text-muted-foreground",
            )}
          >
            {live ? "Live" : "Offline"}
          </span>
        </div>
      </div>

      {/* engine identity — no fake version, no auto-grade */}
      <div className="mt-3.5 flex items-center justify-between rounded-lg border border-gold/20 bg-gold/[0.05] px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Cpu className="size-4 text-gold" aria-hidden />
          <span className="font-mono text-xs font-semibold text-foreground">JP-Engine</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Grading</span>
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-silver">Manual</span>
        </div>
      </div>

      {/* metrics grid — all real, computed from the signal data */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Metric icon={<SignalIcon className="size-4" />} label="Total signals" value={total} />
        <Metric icon={<Activity className="size-4" />} label="This week" value={week} accent />
        <Metric icon={<Layers className="size-4" />} label="Graded" value={graded} />
        <Metric icon={<Radar className="size-4" />} label="Last signal" value={latest ? fmtTimeShort(latest.timestamp) : "—"} />
      </div>

      {/* monitoring ticker — real symbol + connection, decorative equalizer */}
      <div className="mt-3 flex items-center justify-between rounded-lg border border-border/60 bg-background/40 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Monitoring</span>
          <span className="font-mono text-xs font-bold text-foreground">XAUUSDm</span>
        </div>
        <div className="flex items-end gap-0.5" aria-hidden>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <span
              key={i}
              className="w-0.5 rounded-full bg-gold/70"
              style={{
                height: `${6 + ((tick + i * 3) % 12)}px`,
                opacity: live ? (pulse ? 1 : 0.55) : 0.3,
                transition: "height 0.4s ease, opacity 0.4s ease",
              }}
            />
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Status</span>
          <span className={cn("font-mono text-xs font-bold", live ? "text-bull" : "text-muted-foreground")}>
            {live ? "OK" : "—"}
          </span>
        </div>
      </div>
    </section>
  )
}
