"use client"

import { type Signal, fmtPrice, fmtTime, fmtR } from "@/lib/signals"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { Textarea } from "@/components/ui/textarea"
import { Icons } from "@/components/jp/icons"
import { SideTag, StatusPill, sideOf, statusOf } from "@/components/jp/design-atoms"

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 0",
        borderBottom: "1px solid var(--hairline)",
      }}
    >
      <span className="eyebrow">{label}</span>
      <span className="num" style={{ fontSize: 14, fontWeight: 600, color: color ?? "var(--text-0)" }}>
        {value}
      </span>
    </div>
  )
}

export function SignalDetail({
  signal,
  open,
  onOpenChange,
  onGrade,
  onNotes,
  onAgreement,
}: {
  signal: Signal | null
  open: boolean
  onOpenChange: (o: boolean) => void
  onGrade: (id: string, g: Signal["grade"]) => void
  onNotes: (id: string, notes: string) => void
  onAgreement: (id: string, a: Signal["eye_agreement"]) => void
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[93vh]" style={{ background: "var(--surface-1)", borderColor: "var(--hairline)" }}>
        {signal && (
          <div style={{ display: "flex", minHeight: 0, flex: 1, flexDirection: "column", color: "var(--text-0)" }}>
            {/* header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                padding: "4px 18px 14px",
                borderBottom: "1px solid var(--hairline)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <SideTag side={sideOf(signal)} />
                <span className="num" style={{ fontSize: 18, fontWeight: 700, letterSpacing: ".3px" }}>
                  {signal.symbol}
                </span>
                <StatusPill status={statusOf(signal)} />
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                aria-label="Close"
                className="iconbtn"
                style={{ width: 32, height: 32 }}
              >
                <Icons.x size={16} />
              </button>
            </div>

            <div style={{ minHeight: 0, flex: 1, overflowY: "auto", padding: "16px 18px 28px" }}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
                <span className="num" style={{ fontSize: 11.5, color: "var(--text-2)" }}>
                  {signal.session} {"\u00b7"} 2H {signal.trend_2h}
                </span>
                <span className="num" style={{ fontSize: 11.5, color: "var(--text-3)" }}>
                  {fmtTime(signal.timestamp)}
                </span>
                <span className="num" style={{ marginLeft: "auto", fontSize: 10.5, color: "var(--text-3)" }}>
                  {signal.id}
                </span>
              </div>

              {/* outcome */}
              <div
                className="card"
                style={{ marginTop: 16, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}
              >
                <span className="eyebrow">Outcome</span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {signal.r_result !== null && (
                    <span
                      className="num"
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: signal.r_result > 0 ? "var(--up)" : signal.r_result < 0 ? "var(--down)" : "var(--text-2)",
                      }}
                    >
                      {fmtR(signal.r_result)}
                    </span>
                  )}
                  <StatusPill status={statusOf(signal)} />
                </div>
              </div>

              {/* levels */}
              <div className="card" style={{ marginTop: 14, padding: "2px 16px" }}>
                <Row label="Entry" value={fmtPrice(signal.entry)} />
                <Row label="Stop loss" value={fmtPrice(signal.stop)} color="var(--down)" />
                <Row label="Target" value={fmtPrice(signal.target)} color="var(--up)" />
                <Row label="R:R target" value={`${signal.rr_target.toFixed(1)}R`} color="var(--accent)" />
                <Row label="Risk distance" value={`$${fmtPrice(signal.risk_distance)}`} />
                <Row label="Risk in ATR" value={`${signal.risk_atr.toFixed(1)}\u00d7 ATR`} />
                <div style={{ borderBottom: "none" }}>
                  <Row label="ATR" value={fmtPrice(signal.atr)} />
                </div>
              </div>

              {/* manual review */}
              <div style={{ marginTop: 20 }}>
                <span className="eyebrow">Manual review (your eye)</span>
                <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {(["agree", "skip"] as const).map((a) => {
                    const active = signal.eye_agreement === a
                    const c = a === "agree" ? "var(--up)" : "var(--down)"
                    return (
                      <button
                        key={a}
                        type="button"
                        onClick={() => onAgreement(signal.id, active ? null : a)}
                        className="tap"
                        style={{
                          padding: "12px 0",
                          borderRadius: 12,
                          fontFamily: "var(--font)",
                          fontSize: 13.5,
                          fontWeight: 600,
                          textTransform: "capitalize",
                          cursor: "pointer",
                          color: active ? c : "var(--text-2)",
                          border: `1px solid ${active ? c : "var(--hairline)"}`,
                          background: active ? (a === "agree" ? "var(--up-dim)" : "var(--down-dim)") : "var(--surface-2)",
                        }}
                      >
                        {a}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* grade */}
              <div style={{ marginTop: 20 }}>
                <span className="eyebrow">Grade</span>
                <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {(["A", "B", "C"] as const).map((g) => {
                    const active = signal.grade === g
                    const c = g === "A" ? "var(--up)" : g === "B" ? "var(--accent)" : "var(--text-2)"
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => onGrade(signal.id, active ? null : g)}
                        className="num tap"
                        style={{
                          padding: "12px 0",
                          borderRadius: 12,
                          fontSize: 16,
                          fontWeight: 700,
                          cursor: "pointer",
                          color: active ? c : "var(--text-2)",
                          border: `1px solid ${active ? c : "var(--hairline)"}`,
                          background: active ? "var(--surface-3)" : "var(--surface-2)",
                        }}
                      >
                        {g}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* notes */}
              <div style={{ marginTop: 20 }}>
                <span className="eyebrow">Notes</span>
                <Textarea
                  value={signal.notes ?? ""}
                  onChange={(e) => onNotes(signal.id, e.target.value)}
                  placeholder="Add your read on this setup\u2026"
                  className="mt-2.5 min-h-24 resize-none text-sm"
                  style={{ background: "var(--surface-2)", borderColor: "var(--hairline)", color: "var(--text-0)", marginTop: 10 }}
                />
              </div>
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  )
}
