"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Activity, Cpu, Gauge, Radar, Signal as SignalIcon } from "lucide-react"
import type { Signal } from "@/lib/signals"
import { signalsThisWeek } from "@/lib/signals"

const SCAN_INTERVAL = 60 // seconds between scans (simulated)

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

export function BotStatus({ signals }: { signals: Signal[] }) {
  // simulated live scan clock — gives the module an "alive" cadence
  const [elapsed, setElapsed] = useState(7)
  useEffect(() => {
    const id = setInterval(() => setElapsed((e) => (e + 1) % SCAN_INTERVAL), 1000)
    return () => clearInterval(id)
  }, [])

  const sinceScan = elapsed % SCAN_INTERVAL
  const nextScan = SCAN_INTERVAL - sinceScan
  const scanning = sinceScan < 3
  const today = signalsThisWeek(signals, new Date()) // recent activity proxy
  const latency = 42 + (elapsed % 7) // jitter for liveliness

  return (
    <section className="surface glow-gold relative overflow-hidden rounded-2xl p-4">
      {/* sweeping scan line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px overflow-hidden">
        <div className="animate-scan h-px w-1/3 bg-gradient-to-r from-transparent via-gold to-transparent" />
      </div>

      {/* header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="relative flex size-2.5">
            <span className="animate-live-ping absolute inline-flex size-2.5 rounded-full bg-bull" />
            <span className="relative inline-flex size-2.5 rounded-full bg-bull glow-bull" />
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-none tracking-tight">Bot Status</span>
            <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-bull">
              {scanning ? "Scanning markets" : "Online · armed"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-bull/30 bg-bull/10 px-2.5 py-1">
          <Radar className={cn("size-3.5 text-bull", scanning && "animate-spin")} aria-hidden />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-bull">Live</span>
        </div>
      </div>

      {/* engine identity */}
      <div className="mt-3.5 flex items-center justify-between rounded-lg border border-gold/20 bg-gold/[0.05] px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Cpu className="size-4 text-gold" aria-hidden />
          <span className="font-mono text-xs font-semibold text-foreground">JP-Engine</span>
          <span className="font-mono text-[10px] text-muted-foreground">v2.4.1</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Auto-grade</span>
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-gold">On</span>
        </div>
      </div>

      {/* metrics grid */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Metric icon={<Activity className="size-4" />} label="Last scan" value={`${sinceScan}s ago`} accent={scanning} />
        <Metric icon={<Radar className="size-4" />} label="Next scan" value={`${nextScan}s`} />
        <Metric icon={<SignalIcon className="size-4" />} label="Detected today" value={today} />
        <Metric icon={<Gauge className="size-4" />} label="Latency" value={`${latency}ms`} />
      </div>

      {/* monitoring ticker */}
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
                height: `${6 + ((elapsed + i * 3) % 12)}px`,
                opacity: scanning ? 1 : 0.5,
                transition: "height 0.4s ease, opacity 0.4s ease",
              }}
            />
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Uptime</span>
          <span className="font-mono text-xs font-bold text-bull">99.9%</span>
        </div>
      </div>
    </section>
  )
}
