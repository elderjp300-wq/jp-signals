"use client"

import { cn } from "@/lib/utils"
import { LayoutGrid, List, BarChart3 } from "lucide-react"

export type TabKey = "overview" | "signals" | "performance"

const TABS: { key: TabKey; label: string; icon: typeof LayoutGrid }[] = [
  { key: "overview", label: "Overview", icon: LayoutGrid },
  { key: "signals", label: "Signals", icon: List },
  { key: "performance", label: "Performance", icon: BarChart3 },
]

export function BottomNav({ value, onChange }: { value: TabKey; onChange: (t: TabKey) => void }) {
  return (
    <nav
      aria-label="Primary"
      className="glass fixed inset-x-0 bottom-0 z-40 border-t border-border/80"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around px-3 pb-[env(safe-area-inset-bottom)]">
        {TABS.map((t) => {
          const active = value === t.key
          const Icon = t.icon
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onChange(t.key)}
              aria-current={active ? "page" : undefined}
              className="relative flex flex-1 flex-col items-center gap-1.5 py-3"
            >
              {active && (
                <span
                  className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-gradient-to-r from-transparent via-gold to-transparent"
                  aria-hidden
                />
              )}
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-lg transition-all duration-300",
                  active ? "bg-gold/12 text-gold glow-gold" : "text-muted-foreground",
                )}
              >
                <Icon className="size-[1.15rem]" aria-hidden />
              </span>
              <span
                className={cn(
                  "text-[10px] font-semibold tracking-wide transition-colors",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {t.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
