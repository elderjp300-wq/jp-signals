export type Direction = "bullish" | "bearish"
export type Trend2H = "bullish" | "bearish" | "range"
export type Session = "London" | "NY" | "Asia"
export type Grade = "A" | "B" | "C" | null
export type EyeAgreement = "agree" | "skip" | null
export type Outcome = "win" | "loss" | "breakeven" | "no-fill" | null

export interface Signal {
  id: string
  timestamp: string
  symbol: string
  direction: Direction
  trend_2h: Trend2H
  session: Session
  entry: number
  stop: number
  target: number
  risk_distance: number
  risk_atr: number
  atr: number
  rr_target: number
  grade: Grade
  eye_agreement: EyeAgreement
  notes: string | null
  chart_url?: string | null
  outcome: Outcome
  r_result: number | null
  fill_status: string | null
  fill_price: number | null
  fill_time: string | null
  exit_price: number | null
  exit_time: string | null
  lot_size: number | null
  pnl: number | null
  order_placed: boolean | null
}

/**
 * Deterministic block of closed historical signals. These give the
 * Performance analytics (monthly growth, drawdown, streaks, heatmaps)
 * real, populated data to render against. Removed once the live feed lands.
 */
function buildHistory(): Signal[] {
  // simple seeded PRNG for stable, realistic-looking history
  let seed = 73
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed / 0x7fffffff
  }
  const sessions: Session[] = ["London", "NY", "Asia"]
  const trends: Trend2H[] = ["range", "range", "range", "bullish", "bearish"]
  const out: Signal[] = []
  // span ~7 weeks of history ending just before the curated recent set
  let day = new Date("2026-04-06T00:00:00Z").getTime()
  const end = new Date("2026-05-21T00:00:00Z").getTime()
  let n = 0
  while (day < end) {
    const perDay = rand() < 0.45 ? 1 : rand() < 0.85 ? 2 : 0
    for (let i = 0; i < perDay; i++) {
      const direction: Direction = rand() < 0.5 ? "bullish" : "bearish"
      const session = sessions[Math.floor(rand() * sessions.length)]
      const trend = trends[Math.floor(rand() * trends.length)]
      // contextual win probability: trending-with-direction is the edge
      let p = 0.5
      if (trend === "range") p = 0.58
      if (trend === "bullish") p = direction === "bullish" ? 0.7 : 0.42
      if (trend === "bearish") p = direction === "bearish" ? 0.7 : 0.42
      if (session === "NY") p += 0.06
      if (session === "Asia") p -= 0.05
      const roll = rand()
      let outcome: Outcome
      let r: number
      if (roll < 0.08) {
        outcome = "breakeven"
        r = 0
      } else if (roll < 0.08 + p) {
        outcome = "win"
        r = 3.0
      } else {
        outcome = "loss"
        r = -1.0
      }
      const base = 4490 + rand() * 60
      const atr = 4.4 + rand() * 0.9
      const riskDist = atr * (1.2 + rand() * 0.35)
      const entry = Number(base.toFixed(1))
      const stop = Number((direction === "bullish" ? base - riskDist : base + riskDist).toFixed(1))
      const target = Number(
        (direction === "bullish" ? base + riskDist * 3 : base - riskDist * 3).toFixed(1),
      )
      const grade: Grade = p > 0.62 ? "A" : p > 0.5 ? "B" : "C"
      const hour = session === "Asia" ? 2 : session === "London" ? 9 : 15
      const ts = new Date(day + hour * 3600_000 + Math.floor(rand() * 40) * 60_000).toISOString()
      const fillDelay = (4 + rand() * 6) * 60_000
      const slip = (rand() - 0.4) * 0.4
      const fillPrice = Number((entry + slip).toFixed(1))
      const exitPrice = outcome === "win" ? target : outcome === "loss" ? stop : fillPrice
      n++
      out.push({
        id: `${ts.slice(0, 10).replace(/-/g, "")}_${hour}${i}_${direction[0]}`,
        timestamp: ts,
        symbol: "XAUUSDm",
        direction,
        trend_2h: trend,
        session,
        entry,
        stop,
        target,
        risk_distance: Number(riskDist.toFixed(1)),
        risk_atr: Number((riskDist / atr).toFixed(1)),
        atr: Number(atr.toFixed(1)),
        rr_target: 3.0,
        grade,
        eye_agreement: grade === "C" ? "skip" : "agree",
        notes: null,
        outcome,
        r_result: r,
        fill_status: "filled",
        fill_price: fillPrice,
        fill_time: new Date(new Date(ts).getTime() + fillDelay).toISOString(),
        exit_price: exitPrice,
        exit_time: new Date(new Date(ts).getTime() + fillDelay + (40 + rand() * 140) * 60_000).toISOString(),
        lot_size: 0.4,
        pnl: Number((r * 100 + (rand() - 0.5) * 14).toFixed(1)),
        order_placed: true,
      })
    }
    day += 24 * 3600_000
  }
  return out
}

const HISTORICAL_SIGNALS = buildHistory()

/**
 * Mock signal feed. Replace `getSignals()` below with a real fetch()
 * against your bot's API once it is exposed — the shape is identical.
 */
export const MOCK_SIGNALS: Signal[] = [
  {
    id: "20260529_141500_b",
    timestamp: "2026-05-29T14:15:00Z",
    symbol: "XAUUSDm",
    direction: "bullish",
    trend_2h: "range",
    session: "NY",
    entry: 4512.4,
    stop: 4505.8,
    target: 4532.2,
    risk_distance: 6.6,
    risk_atr: 1.3,
    atr: 5.1,
    rr_target: 3.0,
    grade: "A",
    eye_agreement: "agree",
    notes: "Clean sweep of Asia low into NY open, strong rejection wick.",
    outcome: null,
    r_result: null,
    fill_status: null,
    fill_price: null,
    fill_time: null,
    exit_price: null,
    exit_time: null,
    lot_size: null,
    pnl: null,
    order_placed: null,
  },
  {
    id: "20260529_103000_s",
    timestamp: "2026-05-29T10:30:00Z",
    symbol: "XAUUSDm",
    direction: "bearish",
    trend_2h: "range",
    session: "London",
    entry: 4528.9,
    stop: 4535.7,
    target: 4508.5,
    risk_distance: 6.8,
    risk_atr: 1.4,
    atr: 4.9,
    rr_target: 3.0,
    grade: "B",
    eye_agreement: "agree",
    notes: "Range high tap, but London momentum is choppy.",
    outcome: null,
    r_result: null,
    fill_status: null,
    fill_price: null,
    fill_time: null,
    exit_price: null,
    exit_time: null,
    lot_size: null,
    pnl: null,
    order_placed: null,
  },
  {
    id: "20260529_021500_b",
    timestamp: "2026-05-29T02:15:00Z",
    symbol: "XAUUSDm",
    direction: "bullish",
    trend_2h: "bullish",
    session: "Asia",
    entry: 4504.2,
    stop: 4498.1,
    target: 4522.5,
    risk_distance: 6.1,
    risk_atr: 1.2,
    atr: 5.0,
    rr_target: 3.0,
    grade: "C",
    eye_agreement: "skip",
    notes: "Thin Asia liquidity, lower conviction.",
    outcome: null,
    r_result: null,
    fill_status: null,
    fill_price: null,
    fill_time: null,
    exit_price: null,
    exit_time: null,
    lot_size: null,
    pnl: null,
    order_placed: null,
  },
  {
    id: "20260528_153000_s",
    timestamp: "2026-05-28T15:30:00Z",
    symbol: "XAUUSDm",
    direction: "bearish",
    trend_2h: "range",
    session: "NY",
    entry: 4541.3,
    stop: 4548.0,
    target: 4521.2,
    risk_distance: 6.7,
    risk_atr: 1.5,
    atr: 4.5,
    rr_target: 3.0,
    grade: "A",
    eye_agreement: "agree",
    notes: "Textbook range high distribution, displacement down.",
    outcome: "win",
    r_result: 3.0,
    fill_status: "filled",
    fill_price: 4541.1,
    fill_time: "2026-05-28T15:34:00Z",
    exit_price: 4521.2,
    exit_time: "2026-05-28T17:02:00Z",
    lot_size: 0.4,
    pnl: 318.4,
    order_placed: true,
  },
  {
    id: "20260528_090000_b",
    timestamp: "2026-05-28T09:00:00Z",
    symbol: "XAUUSDm",
    direction: "bullish",
    trend_2h: "range",
    session: "London",
    entry: 4519.6,
    stop: 4513.2,
    target: 4538.8,
    risk_distance: 6.4,
    risk_atr: 1.3,
    atr: 4.9,
    rr_target: 3.0,
    grade: "B",
    eye_agreement: "agree",
    notes: null,
    outcome: "loss",
    r_result: -1.0,
    fill_status: "filled",
    fill_price: 4519.5,
    fill_time: "2026-05-28T09:06:00Z",
    exit_price: 4513.2,
    exit_time: "2026-05-28T10:11:00Z",
    lot_size: 0.4,
    pnl: -102.4,
    order_placed: true,
  },
  {
    id: "20260528_013000_b",
    timestamp: "2026-05-28T01:30:00Z",
    symbol: "XAUUSDm",
    direction: "bullish",
    trend_2h: "bullish",
    session: "Asia",
    entry: 4501.8,
    stop: 4496.0,
    target: 4519.2,
    risk_distance: 5.8,
    risk_atr: 1.2,
    atr: 4.8,
    rr_target: 3.0,
    grade: "A",
    eye_agreement: "agree",
    notes: "Trending Asia continuation, strong 2H structure.",
    outcome: "win",
    r_result: 3.0,
    fill_status: "filled",
    fill_price: 4501.9,
    fill_time: "2026-05-28T01:35:00Z",
    exit_price: 4519.2,
    exit_time: "2026-05-28T03:40:00Z",
    lot_size: 0.4,
    pnl: 276.8,
    order_placed: true,
  },
  {
    id: "20260527_144500_s",
    timestamp: "2026-05-27T14:45:00Z",
    symbol: "XAUUSDm",
    direction: "bearish",
    trend_2h: "range",
    session: "NY",
    entry: 4533.5,
    stop: 4540.0,
    target: 4514.0,
    risk_distance: 6.5,
    risk_atr: 1.4,
    atr: 4.6,
    rr_target: 3.0,
    grade: "C",
    eye_agreement: "skip",
    notes: "Choppy, eye skipped — bot still logged it.",
    outcome: "breakeven",
    r_result: 0.0,
    fill_status: "filled",
    fill_price: 4533.4,
    fill_time: "2026-05-27T14:51:00Z",
    exit_price: 4533.4,
    exit_time: "2026-05-27T16:20:00Z",
    lot_size: 0.4,
    pnl: 0.0,
    order_placed: true,
  },
  {
    id: "20260527_080000_b",
    timestamp: "2026-05-27T08:00:00Z",
    symbol: "XAUUSDm",
    direction: "bullish",
    trend_2h: "range",
    session: "London",
    entry: 4515.0,
    stop: 4508.9,
    target: 4533.3,
    risk_distance: 6.1,
    risk_atr: 1.3,
    atr: 4.7,
    rr_target: 3.0,
    grade: "B",
    eye_agreement: "agree",
    notes: null,
    outcome: "win",
    r_result: 3.0,
    fill_status: "filled",
    fill_price: 4515.2,
    fill_time: "2026-05-27T08:07:00Z",
    exit_price: 4533.3,
    exit_time: "2026-05-27T10:55:00Z",
    lot_size: 0.4,
    pnl: 292.0,
    order_placed: true,
  },
  {
    id: "20260526_160000_s",
    timestamp: "2026-05-26T16:00:00Z",
    symbol: "XAUUSDm",
    direction: "bearish",
    trend_2h: "bearish",
    session: "NY",
    entry: 4548.2,
    stop: 4554.4,
    target: 4529.6,
    risk_distance: 6.2,
    risk_atr: 1.3,
    atr: 4.8,
    rr_target: 3.0,
    grade: "A",
    eye_agreement: "agree",
    notes: "Trending down day, clean continuation short.",
    outcome: "win",
    r_result: 3.0,
    fill_status: "filled",
    fill_price: 4548.0,
    fill_time: "2026-05-26T16:05:00Z",
    exit_price: 4529.6,
    exit_time: "2026-05-26T18:30:00Z",
    lot_size: 0.4,
    pnl: 294.4,
    order_placed: true,
  },
  {
    id: "20260526_093000_s",
    timestamp: "2026-05-26T09:30:00Z",
    symbol: "XAUUSDm",
    direction: "bearish",
    trend_2h: "range",
    session: "London",
    entry: 4536.7,
    stop: 4543.1,
    target: 4517.5,
    risk_distance: 6.4,
    risk_atr: 1.4,
    atr: 4.6,
    rr_target: 3.0,
    grade: "C",
    eye_agreement: "skip",
    notes: null,
    outcome: "loss",
    r_result: -1.0,
    fill_status: "filled",
    fill_price: 4536.5,
    fill_time: "2026-05-26T09:36:00Z",
    exit_price: 4543.1,
    exit_time: "2026-05-26T11:14:00Z",
    lot_size: 0.4,
    pnl: -102.4,
    order_placed: true,
  },
  {
    id: "20260525_021500_b",
    timestamp: "2026-05-25T02:15:00Z",
    symbol: "XAUUSDm",
    direction: "bullish",
    trend_2h: "range",
    session: "Asia",
    entry: 4506.9,
    stop: 4501.2,
    target: 4524.0,
    risk_distance: 5.7,
    risk_atr: 1.2,
    atr: 4.8,
    rr_target: 3.0,
    grade: null,
    eye_agreement: null,
    notes: null,
    outcome: null,
    r_result: null,
    fill_status: null,
    fill_price: null,
    fill_time: null,
    exit_price: null,
    exit_time: null,
    lot_size: null,
    pnl: null,
    order_placed: null,
  },
  {
    id: "20260524_150000_s",
    timestamp: "2026-05-24T15:00:00Z",
    symbol: "XAUUSDm",
    direction: "bearish",
    trend_2h: "range",
    session: "NY",
    entry: 4544.0,
    stop: 4550.3,
    target: 4525.1,
    risk_distance: 6.3,
    risk_atr: 1.4,
    atr: 4.5,
    rr_target: 3.0,
    grade: "B",
    eye_agreement: "agree",
    notes: null,
    outcome: "win",
    r_result: 3.0,
    fill_status: "filled",
    fill_price: 4543.8,
    fill_time: "2026-05-24T15:07:00Z",
    exit_price: 4525.1,
    exit_time: "2026-05-24T17:45:00Z",
    lot_size: 0.4,
    pnl: 299.2,
    order_placed: true,
  },
  {
    id: "20260524_080000_b",
    timestamp: "2026-05-24T08:00:00Z",
    symbol: "XAUUSDm",
    direction: "bullish",
    trend_2h: "range",
    session: "London",
    entry: 4517.3,
    stop: 4511.0,
    target: 4536.2,
    risk_distance: 6.3,
    risk_atr: 1.3,
    atr: 4.8,
    rr_target: 3.0,
    grade: null,
    eye_agreement: null,
    notes: null,
    outcome: null,
    r_result: null,
    fill_status: null,
    fill_price: null,
    fill_time: null,
    exit_price: null,
    exit_time: null,
    lot_size: null,
    pnl: null,
    order_placed: null,
  },
  {
    id: "20260523_013000_b",
    timestamp: "2026-05-23T01:30:00Z",
    symbol: "XAUUSDm",
    direction: "bullish",
    trend_2h: "bullish",
    session: "Asia",
    entry: 4499.5,
    stop: 4493.8,
    target: 4516.6,
    risk_distance: 5.7,
    risk_atr: 1.2,
    atr: 4.7,
    rr_target: 3.0,
    grade: "A",
    eye_agreement: "agree",
    notes: "Trending up, clean Asia accumulation.",
    outcome: "loss",
    r_result: -1.0,
    fill_status: "filled",
    fill_price: 4499.6,
    fill_time: "2026-05-23T01:35:00Z",
    exit_price: 4493.8,
    exit_time: "2026-05-23T03:02:00Z",
    lot_size: 0.4,
    pnl: -92.8,
    order_placed: true,
  },
  {
    id: "20260522_144500_s",
    timestamp: "2026-05-22T14:45:00Z",
    symbol: "XAUUSDm",
    direction: "bearish",
    trend_2h: "range",
    session: "NY",
    entry: 4539.8,
    stop: 4546.2,
    target: 4520.6,
    risk_distance: 6.4,
    risk_atr: 1.4,
    atr: 4.6,
    rr_target: 3.0,
    grade: "B",
    eye_agreement: "agree",
    notes: null,
    outcome: "win",
    r_result: 3.0,
    fill_status: "filled",
    fill_price: 4539.6,
    fill_time: "2026-05-22T14:52:00Z",
    exit_price: 4520.6,
    exit_time: "2026-05-22T16:40:00Z",
    lot_size: 0.4,
    pnl: 304.0,
    order_placed: true,
  },
  ...HISTORICAL_SIGNALS,
]

/**
 * Swap this implementation for a live call when the bot API is ready, e.g.
 *   const res = await fetch("/api/signals", { cache: "no-store" })
 *   return (await res.json()) as Signal[]
 * The mock returns the same Promise<Signal[]> shape.
 */
export async function getSignals(): Promise<Signal[]> {
  return MOCK_SIGNALS
}

/* ---------- formatting helpers ---------- */

export function fmtPrice(n: number | null): string {
  if (n === null || Number.isNaN(n)) return "—"
  return n.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

export function fmtR(n: number | null): string {
  if (n === null || Number.isNaN(n)) return "—"
  const sign = n > 0 ? "+" : ""
  return `${sign}${n.toFixed(1)}R`
}

export function fmtTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

export function fmtTimeShort(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

export function fmtDayShort(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString("en-US", { month: "short", day: "numeric" })
}

/* ---------- analytics helpers ---------- */

export interface RateBucket {
  key: string
  wins: number
  losses: number
  breakeven: number
  total: number
  winRate: number | null
}

function emptyBucket(key: string): RateBucket {
  return { key, wins: 0, losses: 0, breakeven: 0, total: 0, winRate: null }
}

export function settledSignals(signals: Signal[]): Signal[] {
  return signals.filter((s) => s.outcome === "win" || s.outcome === "loss" || s.outcome === "breakeven")
}

export function winRate(signals: Signal[]): number | null {
  const settled = settledSignals(signals)
  if (settled.length === 0) return null
  const wins = settled.filter((s) => s.outcome === "win").length
  return wins / settled.length
}

export function rateBy<T extends string>(signals: Signal[], keys: T[], pick: (s: Signal) => T): RateBucket[] {
  const map = new Map<string, RateBucket>()
  keys.forEach((k) => map.set(k, emptyBucket(k)))
  settledSignals(signals).forEach((s) => {
    const k = pick(s)
    const b = map.get(k) ?? emptyBucket(k)
    b.total += 1
    if (s.outcome === "win") b.wins += 1
    else if (s.outcome === "loss") b.losses += 1
    else if (s.outcome === "breakeven") b.breakeven += 1
    b.winRate = b.total > 0 ? b.wins / b.total : null
    map.set(k, b)
  })
  return keys.map((k) => map.get(k) ?? emptyBucket(k))
}

export function expectancy(signals: Signal[]): number | null {
  const withR = settledSignals(signals).filter((s) => s.r_result !== null)
  if (withR.length === 0) return null
  const sum = withR.reduce((acc, s) => acc + (s.r_result ?? 0), 0)
  return sum / withR.length
}

export function cumulativeR(signals: Signal[]): { time: string; r: number; label: string }[] {
  const withR = signals
    .filter((s) => s.r_result !== null)
    .slice()
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  let running = 0
  return withR.map((s) => {
    running += s.r_result ?? 0
    return { time: s.timestamp, r: Number(running.toFixed(1)), label: fmtDayShort(s.timestamp) }
  })
}

export function mostCommonSession(signals: Signal[]): Session | null {
  if (signals.length === 0) return null
  const counts: Record<Session, number> = { London: 0, NY: 0, Asia: 0 }
  signals.forEach((s) => (counts[s.session] += 1))
  return (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] as Session) ?? null
}

export function signalsThisWeek(signals: Signal[], now = new Date()): number {
  const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000
  return signals.filter((s) => new Date(s.timestamp).getTime() >= weekAgo).length
}

export function gradeDistribution(signals: Signal[]): { grade: "A" | "B" | "C"; count: number }[] {
  const counts = { A: 0, B: 0, C: 0 }
  signals.forEach((s) => {
    if (s.grade === "A") counts.A += 1
    else if (s.grade === "B") counts.B += 1
    else if (s.grade === "C") counts.C += 1
  })
  return [
    { grade: "A", count: counts.A },
    { grade: "B", count: counts.B },
    { grade: "C", count: counts.C },
  ]
}

/* ---------- advanced performance analytics ---------- */

function settledSorted(signals: Signal[]): Signal[] {
  return settledSignals(signals)
    .filter((s) => s.r_result !== null)
    .slice()
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
}

export function totalR(signals: Signal[]): number {
  return settledSorted(signals).reduce((a, s) => a + (s.r_result ?? 0), 0)
}

export function profitFactor(signals: Signal[]): number | null {
  const rows = settledSorted(signals)
  if (rows.length === 0) return null
  const gross = rows.filter((s) => (s.r_result ?? 0) > 0).reduce((a, s) => a + (s.r_result ?? 0), 0)
  const loss = Math.abs(rows.filter((s) => (s.r_result ?? 0) < 0).reduce((a, s) => a + (s.r_result ?? 0), 0))
  if (loss === 0) return gross > 0 ? Infinity : null
  return gross / loss
}

export interface StreakInfo {
  current: number // positive = win streak, negative = loss streak
  longestWin: number
  longestLoss: number
  sequence: ("win" | "loss" | "breakeven")[]
}

export function streaks(signals: Signal[]): StreakInfo {
  const rows = settledSorted(signals)
  const sequence = rows.map((s) => s.outcome as "win" | "loss" | "breakeven")
  let longestWin = 0
  let longestLoss = 0
  let runW = 0
  let runL = 0
  for (const o of sequence) {
    if (o === "win") {
      runW += 1
      runL = 0
      longestWin = Math.max(longestWin, runW)
    } else if (o === "loss") {
      runL += 1
      runW = 0
      longestLoss = Math.max(longestLoss, runL)
    } else {
      runW = 0
      runL = 0
    }
  }
  // trailing current streak
  let current = 0
  for (let i = sequence.length - 1; i >= 0; i--) {
    const o = sequence[i]
    if (o === "breakeven") break
    if (current === 0) current = o === "win" ? 1 : -1
    else if (current > 0 && o === "win") current += 1
    else if (current < 0 && o === "loss") current -= 1
    else break
  }
  return { current, longestWin, longestLoss, sequence }
}

export interface EquityPoint {
  i: number
  label: string
  equity: number
  drawdown: number
}

export function equityCurve(signals: Signal[]): EquityPoint[] {
  const rows = settledSorted(signals)
  let running = 0
  let peak = 0
  return rows.map((s, i) => {
    running += s.r_result ?? 0
    peak = Math.max(peak, running)
    return {
      i,
      label: fmtDayShort(s.timestamp),
      equity: Number(running.toFixed(1)),
      drawdown: Number((running - peak).toFixed(1)),
    }
  })
}

export function maxDrawdown(signals: Signal[]): number {
  const curve = equityCurve(signals)
  return curve.reduce((min, p) => Math.min(min, p.drawdown), 0)
}

export function monthlyR(signals: Signal[]): { key: string; r: number; trades: number }[] {
  const map = new Map<string, { r: number; trades: number; sort: number }>()
  settledSorted(signals).forEach((s) => {
    const d = new Date(s.timestamp)
    const key = d.toLocaleString("en-US", { month: "short" })
    const sort = d.getFullYear() * 12 + d.getMonth()
    const cur = map.get(key) ?? { r: 0, trades: 0, sort }
    cur.r += s.r_result ?? 0
    cur.trades += 1
    map.set(key, cur)
  })
  return Array.from(map.entries())
    .sort((a, b) => a[1].sort - b[1].sort)
    .map(([key, v]) => ({ key, r: Number(v.r.toFixed(1)), trades: v.trades }))
}

export interface ExecutionQuality {
  fillRate: number | null
  avgSlippage: number | null
  avgFillDelayMin: number | null
  filled: number
  placed: number
}

export function executionQuality(signals: Signal[]): ExecutionQuality {
  const placedRows = signals.filter((s) => s.order_placed === true)
  const filled = placedRows.filter((s) => s.fill_price !== null)
  const slips = filled
    .filter((s) => s.fill_price !== null)
    .map((s) => Math.abs((s.fill_price as number) - s.entry))
  const delays = filled
    .filter((s) => s.fill_time !== null)
    .map((s) => (new Date(s.fill_time as string).getTime() - new Date(s.timestamp).getTime()) / 60000)
  return {
    placed: placedRows.length,
    filled: filled.length,
    fillRate: placedRows.length > 0 ? filled.length / placedRows.length : null,
    avgSlippage: slips.length ? slips.reduce((a, b) => a + b, 0) / slips.length : null,
    avgFillDelayMin: delays.length ? delays.reduce((a, b) => a + b, 0) / delays.length : null,
  }
}

/** Win-rate heatmap: session (rows) x 2H context (cols). */
export interface HeatCell {
  session: Session
  context: "range" | "bullish" | "bearish"
  total: number
  winRate: number | null
}

export function winRateHeatmap(signals: Signal[]): HeatCell[] {
  const sessions: Session[] = ["London", "NY", "Asia"]
  const contexts: ("range" | "bullish" | "bearish")[] = ["range", "bullish", "bearish"]
  const cells: HeatCell[] = []
  for (const session of sessions) {
    for (const context of contexts) {
      const subset = settledSignals(signals).filter(
        (s) => s.session === session && s.trend_2h === context,
      )
      const wins = subset.filter((s) => s.outcome === "win").length
      cells.push({
        session,
        context,
        total: subset.length,
        winRate: subset.length ? wins / subset.length : null,
      })
    }
  }
  return cells
}

/** Setup frequency by session across all detected signals. */
export function setupFrequency(signals: Signal[]): { key: string; count: number }[] {
  const counts: Record<Session, number> = { London: 0, NY: 0, Asia: 0 }
  signals.forEach((s) => (counts[s.session] += 1))
  return (["London", "NY", "Asia"] as Session[]).map((k) => ({ key: k, count: counts[k] }))
}

export interface PairRow {
  symbol: string
  total: number
  settled: number
  winRate: number | null
  totalR: number
  avgR: number | null
}

export function pairBreakdown(signals: Signal[]): PairRow[] {
  const symbols = Array.from(new Set(signals.map((s) => s.symbol)))
  return symbols.map((symbol) => {
    const subset = signals.filter((s) => s.symbol === symbol)
    const settled = settledSignals(subset).filter((s) => s.r_result !== null)
    const wins = settled.filter((s) => s.outcome === "win").length
    const sumR = settled.reduce((a, s) => a + (s.r_result ?? 0), 0)
    return {
      symbol,
      total: subset.length,
      settled: settled.length,
      winRate: settled.length ? wins / settled.length : null,
      totalR: Number(sumR.toFixed(1)),
      avgR: settled.length ? Number((sumR / settled.length).toFixed(2)) : null,
    }
  })
}

/** Average R achieved per session (settled signals only). */
export function avgRBy<T extends string>(
  signals: Signal[],
  keys: T[],
  pick: (s: Signal) => T,
): { key: T; avgR: number | null; total: number }[] {
  return keys.map((key) => {
    const subset = settledSorted(signals).filter((s) => pick(s) === key)
    const sum = subset.reduce((a, s) => a + (s.r_result ?? 0), 0)
    return { key, total: subset.length, avgR: subset.length ? Number((sum / subset.length).toFixed(2)) : null }
  })
}
