"use client"

import { useEffect, useMemo, useState } from "react"
import { type Signal, getSignals } from "@/lib/signals"
import { fetchSignals, updateSignal as pushUpdate } from "@/lib/api"
import { BottomNav, type TabKey } from "@/components/jp/bottom-nav"
import { OverviewTab } from "@/components/jp/overview-tab"
import { SignalsTab } from "@/components/jp/signals-tab"
import { PerformanceTab } from "@/components/jp/performance-tab"
import { SignalDetail } from "@/components/jp/signal-detail"
import { BgField } from "@/components/jp/design-atoms"

export default function Page() {
  const [tab, setTab] = useState<TabKey>("overview")
  const [signals, setSignals] = useState<Signal[]>([])
  const [loading, setLoading] = useState(true)
  const [live, setLive] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)

  // Load the live feed from the bot; fall back to mock data if it's
  // unreachable (cold start / not yet configured) so the UI always renders.
  // `live` reflects whether the real /signals feed answered.
  useEffect(() => {
    let active = true
    ;(async () => {
      const liveData = await fetchSignals()
      const data = liveData ?? (await getSignals())
      if (active) {
        setSignals(data)
        setLive(liveData !== null)
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
  const onAgreement = (id: string, eye_agreement: Signal["eye_agreement"]) => updateSignal(id, { eye_agreement })

  const activeSignal = useMemo(() => signals.find((s) => s.id === openId) ?? null, [signals, openId])

  return (
    <div className="jp-shell">
      <BgField />

      <main className="screen" style={{ position: "relative", zIndex: 10 }}>
        {loading ? (
          <div style={{ height: 280, display: "grid", placeItems: "center" }}>
            <span className="num" style={{ fontSize: 12, letterSpacing: "2px", textTransform: "uppercase", color: "var(--text-3)" }}>
              Loading feed{"\u2026"}
            </span>
          </div>
        ) : tab === "overview" ? (
          <OverviewTab
            signals={signals}
            live={live}
            onGoSignals={() => setTab("signals")}
            onGoPerformance={() => setTab("performance")}
            onOpen={setOpenId}
          />
        ) : tab === "signals" ? (
          <SignalsTab signals={signals} onOpen={setOpenId} />
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
