"use client"

import { useState } from "react"
import type { Signal } from "@/lib/signals"
import { Icons } from "@/components/jp/icons"
import { SignalRow } from "@/components/jp/signal-row"
import { statusOf, sideOf } from "@/components/jp/design-atoms"

type Filter = "ALL" | "NEW" | "WINS" | "LONG" | "SHORT"
const FILTERS: Filter[] = ["ALL", "NEW", "WINS", "LONG", "SHORT"]

export function SignalsTab({ signals, onOpen }: { signals: Signal[]; onOpen: (id: string) => void }) {
  const [filter, setFilter] = useState<Filter>("ALL")

  const list = signals.filter((s) => {
    if (filter === "ALL") return true
    if (filter === "NEW") return statusOf(s) === "NEW"
    if (filter === "WINS") return statusOf(s) === "WIN"
    return sideOf(s) === filter
  })

  const fresh = signals.filter((s) => statusOf(s) === "NEW").length

  return (
    <div className="screen-anim" style={{ padding: "4px 20px 24px" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0 16px" }}>
        <div>
          <h1 style={{ fontSize: 27, fontWeight: 600, margin: 0, letterSpacing: "-.8px" }}>Signals</h1>
          <div className="num" style={{ fontSize: 12, color: "var(--text-2)", marginTop: 4 }}>
            <span style={{ color: "var(--accent)" }}>{fresh} new</span> {"\u00b7"} {signals.length} total
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <span className="iconbtn">
            <Icons.search size={19} />
          </span>
          <span className="iconbtn">
            <Icons.filter size={19} />
          </span>
        </div>
      </header>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto", paddingBottom: 2 }} className="noscroll">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="num"
            style={{
              flex: "0 0 auto",
              padding: "8px 15px",
              borderRadius: 999,
              cursor: "pointer",
              fontSize: 11.5,
              fontWeight: 600,
              letterSpacing: ".4px",
              border: "1px solid " + (filter === f ? "var(--accent-line)" : "var(--hairline)"),
              background: filter === f ? "var(--accent-soft)" : "transparent",
              color: filter === f ? "var(--accent)" : "var(--text-2)",
              transition: "all .2s ease",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {list.length ? (
        list.map((s) => <SignalRow key={s.id} s={s} onTap={() => onOpen(s.id)} />)
      ) : (
        <div className="card card-pad" style={{ textAlign: "center", color: "var(--text-3)" }}>
          <span className="num" style={{ fontSize: 12 }}>
            no signals match {filter.toLowerCase()}
          </span>
        </div>
      )}
      <div
        style={{ textAlign: "center", padding: "18px 0 4px", fontSize: 11.5, color: "var(--text-3)", fontFamily: "var(--mono)" }}
      >
        {"\u2014 end of feed \u2014"}
      </div>
    </div>
  )
}
