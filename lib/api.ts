import type { Signal } from "./signals"

/**
 * Base URL of the JP Gold Bot (the "vault").
 * Set NEXT_PUBLIC_BOT_URL in Vercel to your Render bot URL, e.g.
 *   https://jp-gold-bot.onrender.com
 * The fallback below lets the app build/run before it's configured.
 */
export const BOT_URL =
  process.env.NEXT_PUBLIC_BOT_URL?.replace(/\/$/, "") || "https://tv-telegram-bot-bhuc.onrender.com"

const isConfigured = BOT_URL.startsWith("http") && !BOT_URL.includes("YOUR-BOT")

/**
 * Fetch the live signal feed from the bot's /signals endpoint.
 * Returns null if the bot isn't configured or is unreachable (e.g. Render
 * free-tier cold start), so callers can fall back to mock data gracefully.
 */
export async function fetchSignals(): Promise<Signal[] | null> {
  if (!isConfigured) return null
  try {
    // Render free tier can cold-start (~50s); give it room.
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 60_000)
    const res = await fetch(`${BOT_URL}/signals`, {
      cache: "no-store",
      signal: ctrl.signal,
    })
    clearTimeout(t)
    if (!res.ok) return null
    const data = await res.json()
    const signals = (data?.signals ?? []) as Signal[]
    // newest first
    return [...signals].sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
  } catch {
    return null
  }
}

/**
 * Save a user edit (grade / notes / eye_agreement) back to the bot.
 * Returns true on success. The UI updates optimistically regardless, so a
 * failed write just means it won't persist server-side — surfaced by caller.
 */
export async function updateSignal(
  id: string,
  patch: Partial<Pick<Signal, "grade" | "notes" | "eye_agreement">>,
): Promise<boolean> {
  if (!isConfigured) return false
  try {
    const res = await fetch(`${BOT_URL}/update_signal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    })
    return res.ok
  } catch {
    return false
  }
}

export const botConfigured = isConfigured
