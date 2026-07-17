# Automated Trading Platform — Product Specification

## 1. Product scope

Build a responsive, Deriv-connected automated-trading platform with a public landing page and one authenticated dashboard. Deriv authorization is the only account system: never request or store a Deriv password.

Out of scope: email/password accounts, admin portal, subscriptions, strategy marketplace, social features, support tickets, custom scripting, unsupported strategies/contracts, and AI-generated trading signals.

## 2. Public landing page

Include branding, a concise product description, **Login with Deriv** and **Create Deriv Account** actions, and summaries of Trading Bots, Differs Scanner, Bulk Trader, Copy Trading, Charts, Risk Calculator, and mobile support. Include FAQ, risk disclosure, terms, privacy policy, contact details, and footer.

## 3. Shared authenticated experience

The persistent dashboard has these sections: Dashboard, Bot Builder, Charts, Bulk Trader, Trading Bots, Differs Bot, Analysis Tool, Risk Calculator, Copy Trading, Trade History, Activity Log, Settings, and Aviator.

All sections share authorization, connected accounts, account selector, Deriv-reported balance/currency, connection state, navigation, sound preference, and appearance preference. Use horizontal navigation on large screens and scrollable/collapsed navigation on small screens. Always highlight the active section.

### Header

Always show product/section title, account identifier, Demo/Real badge, account selector, balance/currency, connection state, appearance and sound controls, Disconnect, and Reset. Reset affects only inactive configuration and temporary results of the selected tool; it cannot stop bots, affect another account, remove history, alter open contracts, disconnect, or change running sessions. Disable Reset while the selected tool is active.

## 4. Deriv accounts and connection lifecycle

Support demo and real accounts, multiple authorized accounts, account switching, disconnection/logout, authorization expiry, restricted accounts, reconnection, and accurate balances. Visible states: **Demo — Connected**, **Real — Connected**, **Reconnecting**, **Disconnected**, **Authorization Expired**, and **Restricted**.

Bots remain bound to their starting account. Changing the displayed account only changes displayed data/controls. Balance must come from Deriv, never calculated from platform history.

On a lost connection, pause new entries for that account, preserve contracts/configuration/martingale state, set Reconnecting, and retry for five minutes. On recovery: refresh balance, restore subscriptions, fetch open contracts, reconcile settlements, prevent duplicate entries, and restore each prior state (Running resumes; manually Paused stays paused; Stopping/Stopped do not restart). After five minutes, set Disconnected, stop affected sessions, require manual restart, and retain open contracts when final status becomes available.

## 5. Sessions, trades, and automation controls

A session starts on Start and ends on Stop, configured limit, Emergency Stop, or unrecoverable error. States: Idle, Starting, Running, Paused, Stopping, Stopped, Reconnecting, Risk Limit Reached, Completed, Error. Pause prevents new entries but preserves current state. Stop prevents new entries and cancels unsubmitted bulk entries only; it never sells open contracts. Show Sell/Cancel only when Deriv explicitly supports that action.

Multiple independent sessions may run per account. Each keeps its bot type, market, contract config, signals, martingale state, limits, results, and activity. An account automation cycle runs from the first active automation process until the last ends; combined running P/L spans that full cycle.

Before enabling Start, display a validated trade preview: account state, market, contract/prediction/barrier/digit, stake, duration, current quote/payout/return, martingale/bulk state, and session limits. Validate all relevant values against current Deriv contract information and give the exact invalidity reason.

### Open trades and history

Open Trades include reference, account, market, contract, prediction, stake, potential payout, entry/current value, remaining duration, original Deriv status, platform status, and P/L. Platform statuses: Pending, Open, Won, Lost, Sold Early, Expired, Cancelled, Error; never conceal or contradict original Deriv status.

Trade History includes all open-trade details plus payout, exit value, opened/closed times, bot, martingale step, bulk/copy references, filters, trade details, search, and CSV export.

## 6. Dashboard and market analysis

Dashboard areas: Auto Trader status/market row, central live tick and digit workspace, and automation control panel. Show session state/P&L/account/market/contract and Start/Pause/Resume/Stop. The workspace shows market, live data state, latest tick/direction, active-window tick count, recent sequence, latency, and sound.

Define movement as Rising, Falling, or Neutral (unchanged). Digit board shows 0–9 circles, count and observed percentage, with distinct latest/selected prediction/barrier highlights. For Over/Under show above/below/equal-to-barrier percentages; equal digits are neither over nor under. All frequencies are historical observations, not probabilities of the next independent tick.

### Signals

Rise/Fall uses a configurable 20–50 movement window. Directional confidence is Rising/(Rising+Falling) or Falling/(Rising+Falling); display Neutral but exclude it from confidence. A dominant direction must meet its threshold.

Digit bots use a 100–500 digit window. Calculate Even, Odd, Over, Under, Matches, and Differs observed confidence as their count divided by window size; report equal-to-barrier separately.

Smart Auto Trader evaluates Rise, Fall, Over, Under, Matches, Differs (not Even/Odd). For each outcome, compare observed frequency to its theoretical contract baseline, normalize deviation to one signal-strength score, and take the highest score meeting threshold. Otherwise display No Signal, monitor without trading, and log only transitions into/out of No Signal. Use one martingale sequence per Smart session.

## 7. Bots, scanner, and bulk execution

Bot Builder creates only Rise/Fall, Over/Under, Even/Odd, and Matches/Differs configurations. Store account, market, contract/prediction/barrier/digit, stake/duration, analysis window, threshold, limits, delay, martingale, and bulk settings; surface saved configurations in Trading Bots.

Each bot displays its input-specific counts/confidence, current signal/trade, recent results, state, and session statistics.

Differs Scanner covers supported volatility markets and displays market/tick/digit, least-frequent proposed digit, observed Differs frequency, baseline, normalized strength, required minimum, confirmation, scanner/data state. Break equal lowest-frequency ties by longest absence. Require the same proposed digit for three completed evaluations (1/3, 2/3, 3/3 Confirmed); reset to 1/3 if it changes. Rank by normalized strength, allow search/filter/sort/refresh/select, and open a selection in Differs Bot. Use label **Minimum Differs Signal Strength** and call it an observational deviation, never a predicted win rate.

Auto Bulk follows accepted Smart/Scanner signals; Bulk Trader starts manually. Both share one bulk-run model. Submit fixed-stake contracts sequentially with delay, never martingale. Model account, market, contract/prediction, duration, count, stake, delay, max active contracts, P/L limits. Determine count from Deriv/current constraints, not a hardcoded 100. Track Requested, Submitted, Accepted, Rejected, Pending, Open, Won, Lost, Cancelled Before Submission, total stake/payout/net result.

## 8. Martingale and risk controls

Martingale applies only to ordinary single-bot and Smart sessions, never bulk. Settings: enabled, multiplier, max steps/stake, reset-after-win, reset-at-session-end. A loss advances one step; the next stake is prior stake × multiplier. A win resets when configured. Stop with Martingale Limit Reached if no valid stake fits configured/account-wide limits.

Risk Calculator provides account-wide Combined Running Loss, Maximum Active Contracts, Maximum Single-Trade Stake, and Emergency Stop; and bot-level session stop loss/take profit, maximum trades/consecutive losses/single stake/cumulative stake/martingale stake, and entry delay. Bot limits may be stricter but never exceed account limits. Account-limit breach stops new entries across all processes; bot-limit breach affects only that bot. Warn for all invalid, unavailable, insufficient-balance, unstable-connection, active-martingale/bulk, approaching/reached-limit states.

Emergency Stop requires confirmation with selected account and affected process count. Stop all automation and pending bulk submissions on that account without selling open contracts. For copy trading, end the complete session if it is master; otherwise disable that sub-account only.

## 9. Copy Trading, Analysis, Charts, and Aviator

Copy Trading operates only between authorized accounts. Configure master/sub accounts, per-sub enablement, fixed/proportional stakes, cap/loss limit per account, and allowed contracts. Copy only Deriv-accepted master trades; validate each sub independently and allow partial success. Pause blocks new copies; Stop ends copying; show master/sub state, proposed stake, accepted/rejected copies, delay, balances, results, and activity.

Analysis Tool contains Tick Pressure, Digit Analysis, Streak Analysis, and Market Scanner with their specified observed counts, percentages, directions, digit heatmap, streaks, market metrics, data state, and search/filter/sort/refresh/open-compatible-bot controls. Streaks are market observations, not trade outcomes.

Charts use live Deriv data with market selector, tick/candle views, supported timeframes, full screen, and current price marker. Do not use TradingView branding/proprietary controls unless licensed. Aviator only shows an unavailable-automation notice and Return to Dashboard.

## 10. Activity, settings, AI, mobile, and disclosure

Activity Log records meaningful state changes (account, market, bot, signal, trade, martingale, limits, bulk, copy, connection, reconciliation, error) with time, event, account, market, session, status, details—never every tick.

Settings includes accounts/defaults, market/contract/stake/duration/window/threshold defaults, risk defaults, notifications, sound/appearance, disconnect, and logout. The floating AI panel is contextual help only: it may explain controls/states/errors/current session and link sections; it must never trade, alter settings, promise results, or claim prediction.

On mobile, collapse navigation while retaining account state/balance/connection visibility. Keep active-session controls, Emergency Stop, digit board, controls, readable charts, scrolling tables/navigation, open trades, and risk disclaimer accessible.

Keep a Risk Disclaimer action visible in Auto Trader. Before the first real-account automation session, require acceptance stating that trading and automation can lose money; past performance and historical tick/digit statistics do not predict independent outcomes; settings are the user's responsibility; martingale and bulk trading can increase losses; and no profit is guaranteed.
