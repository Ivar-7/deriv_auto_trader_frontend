# Implementation TODO

## Phase 0 — Foundation

- [x] Confirm frontend technology: React, Vite, TypeScript, React Router, and Tailwind CSS.
- [ ] Set the deployment-specific Deriv App ID and OAuth redirect URI in the environment; validation is implemented, but no credential is stored in source control.
- [x] Add environment-variable validation; keep tokens/secrets out of source control.
- [x] Install backend dependencies and establish lint, format, typecheck, test, and build scripts.
- [x] Define shared TypeScript contracts for accounts, sessions, ticks, trades, risk, activity, and API messages.
- [x] Establish persistent storage/migrations for non-secret configurations, sessions, trade snapshots, activity, and disclosure acceptance.

## Phase 1 — Deriv connectivity and account state

- [x] Implement Deriv OAuth/login redirect and callback without password collection.
- [x] Implement authorized-account discovery, multiple-account selection, demo/real badges, balance/currency refresh, disconnect, and logout.
- [x] Build a per-account connection manager with subscriptions, reconnection, expiry/restricted states, and five-minute retry policy.
- [x] Implement reconnect reconciliation: balances, open contracts, missed settlements, idempotent trade submission, and session restoration.

## Phase 2 — Core domain and safety layer

- [x] Implement account-bound session lifecycle and state machine.
- [x] Implement contract proposal/validation and Start-preview guard.
- [x] Implement open-contract tracking, Deriv-to-platform status mapping, and action availability checks.
- [x] Implement account automation-cycle P/L tracking.
- [x] Implement centralized account/bot risk-limit evaluation and Emergency Stop.
- [x] Implement structured, meaningful Activity Log events.

## Phase 3 — Market data and analytical primitives

- [ ] Add tick subscriptions, latency/data-state reporting, rolling movement/digit buffers, and digit board data.
- [ ] Implement Rise/Fall confidence and digit observations with correct equal-to-barrier handling.
- [ ] Implement theoretical-baseline and normalized-deviation utilities.
- [ ] Add analysis/streak/market-scanner computations and unit tests.

## Phase 4 — Single bot sessions

- [ ] Implement reusable bot configuration, evaluation, submission, pause/resume/stop, settlement, and statistics engine.
- [ ] Implement Rise/Fall bot UI/API.
- [ ] Implement Over/Under bot UI/API.
- [ ] Implement Even/Odd bot UI/API.
- [ ] Implement Matches/Differs bot UI/API.
- [ ] Implement martingale constraints, transitions, and stop behavior.
- [ ] Implement Smart Auto Trader selection and No Signal transition logging.

## Phase 5 — Differs Scanner and bulk runs

- [ ] Implement scanner market discovery, digit proposal/tie-break, normalized ranking, and filters.
- [ ] Implement three-evaluation confirmation and qualifying execution guard.
- [ ] Implement shared sequential bulk-run engine with active-contract limits and cancellation of only unsubmitted entries.
- [ ] Wire Auto Bulk to accepted Smart/Scanner signals and Bulk Trader to manual starts.

## Phase 6 — Copy trading and records

- [ ] Implement authorized-account-only copy configuration and per-sub-account validation.
- [ ] Copy only accepted master trades; support partial success, pause, stop, caps, and loss limits.
- [ ] Build Open Trades and Trade History views with filters, details, and CSV export.

## Phase 7 — Dashboard UX

- [ ] Build landing page and legal/risk/FAQ content.
- [ ] Build persistent authenticated layout, header, responsive navigation, account controls, and safe Reset behavior.
- [ ] Build Dashboard, Bot Builder, Differs Bot, Analysis Tool, Charts, Risk Calculator, Copy Trading, Settings, Activity, History, and Aviator screens.
- [ ] Add contextual help-only AI panel, sound/appearance preferences, and mobile layouts.
- [ ] Gate first real-account automation session on disclosure acceptance.

## Phase 8 — Verification and release readiness

- [ ] Unit-test calculations, state transitions, martingale, limits, scanner confirmation, and idempotency.
- [ ] Integration-test Deriv authorization, proposal validation, trade lifecycle, reconnection, bulk, and copy paths using demo accounts/mocks.
- [ ] Test responsive UI and accessibility, including keyboard controls and visible risk/emergency actions.
- [ ] Perform security review: token storage, authorization boundaries, input validation, logs, rate limits, and audit trails.
- [ ] Run end-to-end demo-account acceptance tests and document deployment, monitoring, rollback, and incident procedures.
