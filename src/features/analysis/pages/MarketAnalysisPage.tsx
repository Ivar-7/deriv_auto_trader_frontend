import {
  Activity,
  ArrowLeft,
  BarChart3,
  CircleAlert,
  Clock3,
  Gauge,
  Moon,
  RefreshCw,
  ScanSearch,
  ShieldCheck,
  Sun,
  TrendingDown,
  TrendingUp,
  WalletCards,
  Waves
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { StatusPill } from '../../../shared/components/StatusPill'
import { useAppearance } from '../../../shared/hooks/useAppearance'
import { useMarketAnalysis } from '../hooks/useMarketAnalysis'
import type {
  AnalysisParameters,
  MarketDataState,
  TickDirection
} from '../types/analysis.types'

const defaultParameters: AnalysisParameters = {
  movementWindow: 30,
  digitWindow: 200,
  barrier: 5,
  confidenceThreshold: 0.6
}

const inputClassName =
  'mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:focus:border-white'

const stateTone: Record<MarketDataState, 'ready' | 'attention' | 'planned'> = {
  idle: 'planned',
  connecting: 'attention',
  live: 'ready',
  stale: 'attention',
  disconnected: 'planned',
  error: 'attention'
}

const directionClassName: Record<TickDirection, string> = {
  rising:
    'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  falling: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
  neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
}

function percentage(value: number | null): string {
  return value === null ? 'Awaiting sample' : `${(value * 100).toFixed(1)}%`
}

function formatLatency(value: number | null): string {
  return value === null ? 'Awaiting tick' : `${Math.round(value)} ms`
}

function label(value: string): string {
  return value.replaceAll('_', ' ')
}

export function MarketAnalysisPage() {
  const { isDark, setIsDark } = useAppearance()
  const {
    state,
    actionMessage,
    isWorking,
    startMarket,
    refresh,
    startScanner
  } = useMarketAnalysis()
  const [market, setMarket] = useState('R_100')
  const [scannerInput, setScannerInput] = useState('R_100,R_75,R_50')
  const [parameters, setParameters] =
    useState<AnalysisParameters>(defaultParameters)

  const selectedAccount =
    state.accountSession?.accounts.find(
      (account) => account.accountId === state.accountSession?.selectedAccountId
    ) ?? null

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Deriv Auto Trader
          </Link>
          <div className="flex items-center gap-3">
            {selectedAccount === null ? null : (
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold">
                  {selectedAccount.displayName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Market analysis
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsDark((appearance) => !appearance)}
              className="flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200"
              aria-label={
                isDark ? 'Use light appearance' : 'Use dark appearance'
              }
            >
              {isDark ? (
                <Sun className="size-4" aria-hidden="true" />
              ) : (
                <Moon className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <section className="rounded-3xl bg-slate-950 p-6 text-white sm:p-8 dark:bg-white dark:text-slate-950">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-sky-300 dark:text-sky-700">
                <Waves className="size-4" aria-hidden="true" />
                Phase Three analysis layer
              </p>
              <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
                Observe the stream. Keep data health in view.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 dark:text-slate-600">
                Movement, digit, streak, and scanner measurements are historical
                observations of the active tick window. They are not predictions
                or trade signals.
              </p>
            </div>
            <Link
              to="/bots"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-white dark:border-slate-300 dark:text-slate-950"
            >
              <ShieldCheck className="size-4" aria-hidden="true" />
              Bot console
            </Link>
          </div>
        </section>

        {state.status === 'loading' ? (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <RefreshCw
              className="mx-auto size-6 animate-spin text-slate-500 dark:text-slate-400"
              aria-hidden="true"
            />
            <h2 className="mt-4 text-lg font-semibold">
              Checking market analysis access
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Account context is required before a public stream is started.
            </p>
          </section>
        ) : null}

        {state.status === 'empty' ? (
          <section className="mt-8 grid gap-6 lg:grid-cols-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:col-span-3 dark:border-slate-800 dark:bg-slate-900">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                <BarChart3 className="size-6" aria-hidden="true" />
              </span>
              <h2 className="mt-6 text-2xl font-semibold tracking-tight">
                Connect a read-only market feed
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                {state.message}
              </p>
              {state.accountSession?.selectedAccountId === null ||
              state.accountSession === null ? (
                <Link
                  to="/accounts"
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"
                >
                  <WalletCards className="size-4" aria-hidden="true" />
                  Select account
                </Link>
              ) : (
                <form
                  className="mt-6 flex flex-col gap-3 sm:flex-row"
                  onSubmit={(event) => {
                    event.preventDefault()
                    void startMarket(market.trim().toUpperCase(), parameters)
                  }}
                >
                  <label className="sr-only" htmlFor="initial-market">
                    Deriv market symbol
                  </label>
                  <input
                    id="initial-market"
                    value={market}
                    onChange={(event) => setMarket(event.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:focus:border-white"
                    pattern="\\w{2,30}"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isWorking}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950"
                  >
                    <Waves className="size-4" aria-hidden="true" />
                    Connect stream
                  </button>
                </form>
              )}
            </div>
            <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="font-semibold">Data safeguards</h2>
              <ul className="mt-5 space-y-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
                <li>
                  Every result exposes stream state, latency, and sample size.
                </li>
                <li>
                  Neutral movements never inflate Rise or Fall confidence.
                </li>
                <li>Equal digits are separate from both Over and Under.</li>
              </ul>
            </aside>
          </section>
        ) : null}

        {state.status === 'error' ? (
          <section className="mt-8 rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center dark:border-rose-900 dark:bg-rose-950">
            <CircleAlert
              className="mx-auto size-7 text-rose-700 dark:text-rose-300"
              aria-hidden="true"
            />
            <h2 className="mt-4 text-lg font-semibold text-rose-950 dark:text-rose-100">
              Market analysis is unavailable
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-rose-800 dark:text-rose-200">
              {state.message}
            </p>
            <Link
              to="/accounts"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-rose-700 px-4 py-2.5 text-sm font-semibold text-white dark:bg-rose-300 dark:text-rose-950"
            >
              Open accounts
            </Link>
          </section>
        ) : null}

        {state.status === 'success' ? (
          <>
            {actionMessage === null ? null : (
              <p
                className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200"
                role="alert"
              >
                {actionMessage}
              </p>
            )}

            <section
              className="mt-8 grid gap-4 md:grid-cols-3"
              aria-label="Market data state"
            >
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                      Stream health
                    </p>
                    <p className="mt-3 text-2xl font-semibold tracking-tight capitalize">
                      {label(state.data.analysis.health.state)}
                    </p>
                  </div>
                  <StatusPill
                    tone={stateTone[state.data.analysis.health.state]}
                  >
                    {label(state.data.analysis.health.state)}
                  </StatusPill>
                </div>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                  Last tick{' '}
                  {state.data.analysis.health.lastTickAt ?? 'not received'}
                </p>
              </article>
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Delivery age
                </p>
                <p className="mt-3 text-2xl font-semibold tracking-tight">
                  {formatLatency(state.data.analysis.health.latencyMs)}
                </p>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                  Measured from Deriv tick epoch to server receipt.
                </p>
              </article>
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Active windows
                </p>
                <p className="mt-3 text-2xl font-semibold tracking-tight">
                  {state.data.analysis.health.movementBufferSize} /{' '}
                  {state.data.analysis.health.digitBufferSize}
                </p>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                  Movement and digit observations retain up to 500 ticks.
                </p>
              </article>
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-5">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-sm font-semibold text-sky-700 dark:text-sky-300">
                      Live tick workspace
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                      {state.data.analysis.market}
                    </h2>
                  </div>
                  <button
                    type="button"
                    disabled={isWorking}
                    onClick={() => void refresh(parameters)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"
                  >
                    <RefreshCw className="size-4" aria-hidden="true" />
                    Refresh
                  </button>
                </div>

                {state.data.analysis.latestTick === null ? (
                  <div className="mt-7 rounded-2xl bg-slate-100 p-6 text-sm leading-6 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    The public subscription is connected, but no tick has been
                    received yet. Keep this workspace open until the feed state
                    becomes live.
                  </div>
                ) : (
                  <>
                    <div className="mt-7 flex flex-col gap-4 rounded-2xl bg-slate-100 p-5 sm:flex-row sm:items-end sm:justify-between dark:bg-slate-800">
                      <div>
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                          Latest quote
                        </p>
                        <p className="mt-2 text-4xl font-semibold tracking-tight">
                          {state.data.analysis.latestTick.quote}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${directionClassName[state.data.analysis.latestTick.direction]}`}
                        >
                          {state.data.analysis.latestTick.direction ===
                          'rising' ? (
                            <TrendingUp className="size-4" aria-hidden="true" />
                          ) : state.data.analysis.latestTick.direction ===
                            'falling' ? (
                            <TrendingDown
                              className="size-4"
                              aria-hidden="true"
                            />
                          ) : (
                            <Activity className="size-4" aria-hidden="true" />
                          )}
                          {state.data.analysis.latestTick.direction}
                        </span>
                        <span className="text-sm font-semibold">
                          Digit {state.data.analysis.latestTick.digit}
                        </span>
                      </div>
                    </div>
                    <div
                      className="mt-5 flex flex-wrap gap-2"
                      aria-label="Recent tick sequence"
                    >
                      {state.data.analysis.recentTicks.map((tick) => (
                        <span
                          key={`${tick.epoch}-${tick.receivedAt}-${tick.quote}`}
                          className={`flex size-9 items-center justify-center rounded-full text-sm font-semibold ${directionClassName[tick.direction]}`}
                          title={`${tick.quote} · ${tick.direction}`}
                        >
                          {tick.digit}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <form
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 dark:border-slate-800 dark:bg-slate-900"
                onSubmit={(event) => {
                  event.preventDefault()
                  void refresh(parameters)
                }}
              >
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Observation windows
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight">
                  Analysis settings
                </h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  <label className="text-sm font-medium">
                    Movement ticks
                    <select
                      value={parameters.movementWindow}
                      onChange={(event) => {
                        const movementWindow = Number(event.target.value)
                        setParameters((current) => ({
                          ...current,
                          movementWindow
                        }))
                      }}
                      className={inputClassName}
                    >
                      <option value="20">20 ticks</option>
                      <option value="30">30 ticks</option>
                      <option value="40">40 ticks</option>
                      <option value="50">50 ticks</option>
                    </select>
                  </label>
                  <label className="text-sm font-medium">
                    Digit ticks
                    <select
                      value={parameters.digitWindow}
                      onChange={(event) => {
                        const digitWindow = Number(event.target.value)
                        setParameters((current) => ({
                          ...current,
                          digitWindow
                        }))
                      }}
                      className={inputClassName}
                    >
                      <option value="100">100 ticks</option>
                      <option value="200">200 ticks</option>
                      <option value="300">300 ticks</option>
                      <option value="500">500 ticks</option>
                    </select>
                  </label>
                  <label className="text-sm font-medium">
                    Digit barrier
                    <select
                      value={parameters.barrier}
                      onChange={(event) => {
                        const barrier = Number(event.target.value)
                        setParameters((current) => ({ ...current, barrier }))
                      }}
                      className={inputClassName}
                    >
                      {Array.from({ length: 10 }, (_, digit) => (
                        <option key={digit} value={digit}>
                          {digit}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm font-medium">
                    Direction threshold
                    <select
                      value={parameters.confidenceThreshold}
                      onChange={(event) => {
                        const confidenceThreshold = Number(event.target.value)
                        setParameters((current) => ({
                          ...current,
                          confidenceThreshold
                        }))
                      }}
                      className={inputClassName}
                    >
                      <option value="0.6">60%</option>
                      <option value="0.65">65%</option>
                      <option value="0.7">70%</option>
                      <option value="0.75">75%</option>
                    </select>
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={isWorking}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-slate-950"
                >
                  <Gauge className="size-4" aria-hidden="true" />
                  Apply windows
                </button>
              </form>
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-5">
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                      Tick pressure
                    </p>
                    <h2 className="mt-2 text-xl font-semibold tracking-tight">
                      Rise / Fall observation
                    </h2>
                  </div>
                  <Activity
                    className="size-5 text-slate-500 dark:text-slate-400"
                    aria-hidden="true"
                  />
                </div>
                <dl className="mt-6 space-y-4 text-sm">
                  <MetricRow
                    label="Rising"
                    value={`${state.data.analysis.movement.rising} · ${percentage(state.data.analysis.movement.risingConfidence)}`}
                  />
                  <MetricRow
                    label="Falling"
                    value={`${state.data.analysis.movement.falling} · ${percentage(state.data.analysis.movement.fallingConfidence)}`}
                  />
                  <MetricRow
                    label="Neutral"
                    value={`${state.data.analysis.movement.neutral} excluded`}
                  />
                  <MetricRow
                    label="Dominant"
                    value={
                      state.data.analysis.movement.dominantDirection === null
                        ? 'No dominant direction'
                        : `${state.data.analysis.movement.dominantDirection} · ${percentage(state.data.analysis.movement.dominantConfidence)}`
                    }
                  />
                </dl>
                <p className="mt-5 rounded-2xl bg-slate-100 p-3 text-sm leading-5 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {state.data.analysis.movement.meetsConfiguredThreshold
                    ? 'The current observed direction meets your display threshold.'
                    : 'No observed direction currently meets your display threshold.'}
                </p>
              </article>

              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                      Digit board
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                      Observed digit distribution
                    </h2>
                  </div>
                  <StatusPill tone="planned">
                    {state.data.analysis.digits.sampleSize} ticks
                  </StatusPill>
                </div>
                <div className="mt-6 grid grid-cols-5 gap-3 sm:grid-cols-10">
                  {state.data.analysis.digitBoard.map((cell) => (
                    <div
                      key={cell.digit}
                      className={`rounded-2xl p-3 text-center ${cell.isLatest ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'bg-slate-100 dark:bg-slate-800'}`}
                    >
                      <p className="text-lg font-semibold">{cell.digit}</p>
                      <p className="mt-1 text-xs font-medium">{cell.count}</p>
                      <p className="mt-1 text-xs opacity-70">
                        {percentage(cell.observedPercentage)}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Counts reflect historical digits in the selected window; they
                  are not probabilities of the next independent tick.
                </p>
              </article>
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-5">
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Digit observations
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  Barrier {state.data.analysis.parameters.barrier} kept explicit
                </h2>
                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <ObservationCard
                    label="Even"
                    value={percentage(
                      state.data.analysis.digits.evenObservedPercentage
                    )}
                  />
                  <ObservationCard
                    label="Odd"
                    value={percentage(
                      state.data.analysis.digits.oddObservedPercentage
                    )}
                  />
                  <ObservationCard
                    label="Over"
                    value={percentage(
                      state.data.analysis.digits.overObservedPercentage
                    )}
                  />
                  <ObservationCard
                    label="Under"
                    value={percentage(
                      state.data.analysis.digits.underObservedPercentage
                    )}
                  />
                  <ObservationCard
                    label="Equal to barrier"
                    value={percentage(
                      state.data.analysis.digits
                        .equalToBarrierObservedPercentage
                    )}
                  />
                  <ObservationCard
                    label="Matches"
                    value={percentage(
                      state.data.analysis.digits.matchesObservedPercentage
                    )}
                  />
                  <ObservationCard
                    label="Differs"
                    value={percentage(
                      state.data.analysis.digits.differsObservedPercentage
                    )}
                  />
                </div>
              </article>
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Streak analysis
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight">
                  Current observations
                </h2>
                <dl className="mt-6 space-y-4 text-sm">
                  <MetricRow
                    label="Direction"
                    value={
                      state.data.analysis.streaks.direction === null
                        ? 'Awaiting tick'
                        : `${state.data.analysis.streaks.direction.direction} × ${state.data.analysis.streaks.direction.length}`
                    }
                  />
                  <MetricRow
                    label="Digit"
                    value={
                      state.data.analysis.streaks.digit === null
                        ? 'Awaiting tick'
                        : `${state.data.analysis.streaks.digit.digit} × ${state.data.analysis.streaks.digit.length}`
                    }
                  />
                </dl>
                <p className="mt-5 rounded-2xl bg-amber-50 p-3 text-sm leading-5 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                  Streaks describe market observations, not trade outcomes.
                </p>
              </article>
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-5">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Market scanner
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight">
                  Compare observed deviations
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Enter up to eight symbols. The scanner ranks the
                  least-frequent digit observation by normalized deviation from
                  the 90% Differs baseline.
                </p>
                <form
                  className="mt-5"
                  onSubmit={(event) => {
                    event.preventDefault()
                    const markets = scannerInput
                      .split(',')
                      .map((value) => value.trim().toUpperCase())
                      .filter((value) => value.length > 0)
                    void startScanner(markets)
                  }}
                >
                  <label
                    className="text-sm font-medium"
                    htmlFor="scanner-markets"
                  >
                    Comma-separated symbols
                  </label>
                  <input
                    id="scanner-markets"
                    value={scannerInput}
                    onChange={(event) => setScannerInput(event.target.value)}
                    className={inputClassName}
                    required
                  />
                  <button
                    type="submit"
                    disabled={isWorking}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"
                  >
                    <ScanSearch className="size-4" aria-hidden="true" />
                    Connect scanner markets
                  </button>
                </form>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                      Scanner ranking
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                      Historical deviations
                    </h2>
                  </div>
                  <Clock3
                    className="size-5 text-slate-500 dark:text-slate-400"
                    aria-hidden="true"
                  />
                </div>
                {state.data.scanner.length === 0 ? (
                  <p className="mt-6 rounded-2xl bg-slate-100 p-5 text-sm leading-6 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    Connect one or more scanner markets to compare their current
                    observed digit distributions.
                  </p>
                ) : (
                  <div className="mt-6 overflow-x-auto">
                    <table className="w-full min-w-max text-left text-sm">
                      <thead className="text-xs tracking-wide text-slate-500 uppercase dark:text-slate-400">
                        <tr>
                          <th className="pb-3 font-semibold">Market</th>
                          <th className="pb-3 font-semibold">Data</th>
                          <th className="pb-3 font-semibold">Digit</th>
                          <th className="pb-3 font-semibold">
                            Differs observed
                          </th>
                          <th className="pb-3 font-semibold">Deviation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {state.data.scanner.map((row) => (
                          <tr
                            key={row.market}
                            className="border-t border-slate-100 dark:border-slate-800"
                          >
                            <td className="py-3 font-medium">{row.market}</td>
                            <td className="py-3 capitalize">
                              {label(row.dataState)}
                            </td>
                            <td className="py-3">
                              {row.proposedDigit === null
                                ? 'Awaiting ticks'
                                : `${row.proposedDigit} · ${row.proposedDigitCount} seen`}
                            </td>
                            <td className="py-3">
                              {percentage(row.observedDiffersPercentage)}
                            </td>
                            <td className="py-3">
                              {row.normalizedDeviation === null
                                ? 'Awaiting sample'
                                : row.normalizedDeviation.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          </>
        ) : null}
      </main>
    </div>
  )
}

function MetricRow({
  label: rowLabel,
  value
}: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-slate-500 dark:text-slate-400">{rowLabel}</dt>
      <dd className="text-right font-semibold">{value}</dd>
    </div>
  )
}

function ObservationCard({
  label: cardLabel,
  value
}: Readonly<{ label: string; value: string }>) {
  return (
    <div className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800">
      <p className="text-sm font-semibold">{cardLabel}</p>
      <p className="mt-2 text-xl font-semibold tracking-tight">{value}</p>
    </div>
  )
}
