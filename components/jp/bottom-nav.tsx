"use client"

import { Icons } from "@/components/jp/icons"

export type TabKey = "overview" | "signals" | "performance"

const TABS: { key: TabKey; label: string; icon: (p: { size?: number }) => React.ReactNode }[] = [
  { key: "overview", label: "Overview", icon: Icons.grid },
  { key: "signals", label: "Signals", icon: Icons.signals },
  { key: "performance", label: "Performance", icon: Icons.chart },
]

export function BottomNav({ value, onChange }: { value: TabKey; onChange: (t: TabKey) => void }) {
  return (
    <nav className="navbar" aria-label="Primary">
      {TABS.map((t) => {
        const active = value === t.key
        const Icon = t.icon
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            aria-current={active ? "page" : undefined}
            className={active ? "nav-item active" : "nav-item"}
          >
            <span className="nav-dot" aria-hidden />
            <span className="nav-ico" style={{ display: "inline-flex" }}>
              <Icon size={21} />
            </span>
            <span>{t.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
