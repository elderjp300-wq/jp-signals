"use client"

import { useEffect, useMemo, useState } from "react"
import { type Signal, getSignals } from "@/lib/signals"
import { fetchSignals, updateSignal as pushUpdate } from "@/lib/api"
import { BottomNav, type TabKey } from "@/components/jp/bottom-nav"
import { OverviewTab } from "@/components/jp/overview-tab"
import { SignalsTab } from "@/components/jp/signals-tab"
import { PerformanceTab } from "@/components/jp/performance-tab"
import { SignalDetail } from "@/components/jp/signal-detail"

const TITLES: Record<TabKey, string> = {
  overview: "Overview",
  signals: "Signals",
  performance: "Performance",
}

export default function Page() {
  const [tab, setTab] = useState<TabKey>("overview")
  const [signals, setSignals] = useState<Signal[]>([])
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState<string | null>(null)

  // Load the live feed from the bot; fall back to mock data if it's
  // unreachable (cold start / not yet configured) so the UI always renders.
  useEffect(() => {
    let active = true
    ;(async () => {
      const live = await fetchSignals()
      const data = live ?? (await getSignals())
      if (active) {
        setSignals(data)
        setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  // Optimistic local update, then persist to the bot (the vault).
  const updateSignal = (id: string, patch: Partial<Signal>) => {
    setSignals((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
    const writable: Partial<Pick<Signal, "grade" | "notes" | "eye_agreement">> = {}
    if ("grade" in patch) writable.grade = patch.grade ?? null
    if ("notes" in patch) writable.notes = patch.notes ?? null
    if ("eye_agreement" in patch) writable.eye_agreement = patch.eye_agreement ?? null
    if (Object.keys(writable).length) void pushUpdate(id, writable)
  }

  const onGrade = (id: string, grade: Signal["grade"]) => updateSignal(id, { grade })
  const onNotes = (id: string, notes: string) => updateSignal(id, { notes: notes.length ? notes : null })
  const onAgreement = (id: string, eye_agreement: Signal["eye_agreement"]) =>
    updateSignal(id, { eye_agreement })

  const activeSignal = useMemo(() => signals.find((s) => s.id === openId) ?? null, [signals, openId])

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background">
      {/* header */}
      <header className="glass sticky top-0 z-30 flex h-[60px] items-center justify-between border-b border-border/80 px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg border border-gold/40 bg-gold/10 glow-gold">
            <span className="font-mono text-xs font-bold text-gradient-gold">JP</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[0.95rem] font-bold leading-none tracking-tight">JP Signals</span>
            <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {TITLES[tab]}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-bull/30 bg-bull/10 px-2.5 py-1">
          <span className="relative flex size-1.5">
            <span className="animate-live-ping absolute inline-flex size-1.5 rounded-full bg-bull" />
            <span className="relative inline-flex size-1.5 rounded-full bg-bull" />
          </span>
          <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-bull">Live</span>
        </div>
      </header>

      {/* content */}
      <main className="flex-1 pb-24">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Loading feed…
            </span>
          </div>
        ) : tab === "overview" ? (
          <OverviewTab signals={signals} />
        ) : tab === "signals" ? (
          <SignalsTab signals={signals} onGrade={onGrade} onOpen={setOpenId} />
        ) : (
          <PerformanceTab signals={signals} />
        )}
      </main>

      <BottomNav value={tab} onChange={setTab} />

      <SignalDetail
        signal={activeSignal}
        open={openId !== null}
        onOpenChange={(o) => !o && setOpenId(null)}
        onGrade={onGrade}
        onNotes={onNotes}
        onAgreement={onAgreement}
      />
    </div>
  )
}
