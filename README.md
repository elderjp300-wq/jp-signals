# JP Signals

A premium mobile dashboard for reviewing, grading, and tracking the setups detected by **JP Gold Bot** (XAUUSDm). It reads the bot's live signal feed, lets you grade each setup (A/B/C), add notes, and mark whether you agree with the bot's read — and saves it all back to the bot.

Built with Next.js. Deployed on Vercel. Reads from / writes to the bot's HTTP API.

---

## How it works

```
JP Gold Bot (Render)              JP Signals (Vercel)
  detects setups                    reads  GET  /signals   -> shows the feed
  serves /signals        <───────   writes POST /update_signal <- grade/notes/agree
  stores everything
```

The bot is the single source of truth (the "vault"). The app is the window onto it. Grades you tap in Telegram and grades you set in the app both write to the same record, so they stay in sync.

---

## Tabs

- **Overview** — bot status strip, total signals, win rate, cumulative-R curve, grade distribution.
- **Signals** — the live feed. Each card shows direction, session, 2H trend, and entry/stop/target/3R. Grade A/B/C inline; tap a card for full detail (chart, notes, agree/skip).
- **Performance** — win rate by 2H context (range vs trending), by session, by direction; expectancy and average R. Most metrics populate once automated trade outcomes are live.

---

## Configuration

The app needs to know the bot's address. Set this environment variable in Vercel:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_BOT_URL` | `https://tv-telegram-bot-bhuc.onrender.com` |

If the variable is missing, the app falls back to the same URL baked into `lib/api.ts`. If the bot is unreachable (e.g. Render free-tier cold start), the app shows mock data so the UI still renders.

---

## Local development

```bash
npm install
npm run dev        # http://localhost:3000
```

Optional local env override — create `.env.local`:

```
NEXT_PUBLIC_BOT_URL=https://tv-telegram-bot-bhuc.onrender.com
```

Build for production:

```bash
npm run build
```

---

## Deploying (Vercel)

1. Push this repo to GitHub.
2. Vercel → New Project → import the repo (Next.js auto-detected).
3. Add the `NEXT_PUBLIC_BOT_URL` environment variable (above).
4. Deploy.

---

## The signal data contract

Each signal from `/signals` carries these fields. Detector fills the first group on detection; MetaApi fills the outcome group once automation is live; you fill the last group via the app or Telegram.

**Detector (live now):** `id`, `timestamp`, `symbol`, `direction`, `trend_2h`, `session`, `entry`, `stop`, `target`, `risk_distance`, `risk_atr`, `atr`, `rr_target`, `bos_time`, `ob_time`, `chart_url`

**Automation intent:** `risk_percent`, `order_expiry_hours`

**MetaApi (when automation is live):** `order_placed`, `fill_status`, `fill_price`, `fill_time`, `outcome`, `exit_price`, `exit_time`, `r_result`, `lot_size`, `pnl`

**You (app / Telegram):** `grade` (A/B/C), `eye_agreement` (agree/skip), `notes`, `telegram_message_id`

Only `grade`, `eye_agreement`, and `notes` are writable via `POST /update_signal`. All other fields are protected.

---

## Roadmap

- [ ] Full PWA (installable, offline shell) — pending app icon
- [ ] Inline chart images in the app (needs image hosting)
- [ ] MetaApi automation → real trade outcomes populate the metrics
- [ ] Move the bot's storage from a JSON file to a real database when it matters

---

*Personal project. Not financial advice. Not auto-trading anything yet.*
