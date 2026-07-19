import {
  BarChart3,
  CircleAlert,
  Gauge,
  Play,
  RefreshCw,
  ScanSearch,
  Waves
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { StatusPill } from '../../../shared/components/StatusPill'
import { useMarketAnalysis } from '../hooks/useMarketAnalysis'
import type {
  AnalysisParameters,
  MarketDataState,
  ReplayTickInput,
  TickDirection
} from '../types/analysis.types'

const windows = [10, 25, 50, 100, 500, 1_000] as const
const defaults: AnalysisParameters = {
  movementWindow: 100,
  digitWindow: 1_000,
  barrier: 5,
  confidenceThreshold: 0.6
}

const card =
  'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900'
const input =
  'mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:focus:border-white'
const stateTone: Record<MarketDataState, 'ready' | 'attention' | 'planned'> = {
  idle: 'planned',
  connecting: 'attention',
  live: 'ready',
  stale: 'attention',
  disconnected: 'planned',
  error: 'attention'
}
const directionTone: Record<TickDirection, string> = {
  UP: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
  DOWN: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200',
  FLAT: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
}

function percent(value: number | null): string {
  return value === null ? '—' : `${(value * 100).toFixed(1)}%`
}

function signedPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${(value * 100).toFixed(1)}%`
}

function parseReplay(value: string): readonly ReplayTickInput[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [epoch, quote, pipSize] = line.split(',').map((part) => part.trim())
      if (
        !/^\d+$/.test(epoch ?? '') ||
        quote === undefined ||
        quote.length === 0
      ) {
        throw new Error('Use one tick per line: epoch,quote,pipSize')
      }
      return {
        epoch: Number(epoch),
        quote,
        pipSize:
          pipSize === undefined || pipSize === '' ? null : Number(pipSize)
      }
    })
}

export function MarketAnalysisPage() {
  const {
    state,
    actionMessage,
    isWorking,
    availableMarkets,
    startMarket,
    startScanner,
    replay
  } = useMarketAnalysis()
  const [market, setMarket] = useState('R_100')
  const [parameters, setParameters] = useState<AnalysisParameters>(defaults)
  const [scannerInput, setScannerInput] = useState('R_100,R_75,R_50')
  const [replayInput, setReplayInput] = useState('')
  const [replayError, setReplayError] = useState<string | null>(null)

  const analysis = state.status === 'success' ? state.data.analysis : null
  const scanner = state.status === 'success' ? state.data.scanner : []
  const selectedFrequency = useMemo(
    () =>
      analysis?.digitFrequency.find(
        (item) => item.window === parameters.digitWindow
      ) ?? null,
    [analysis, parameters.digitWindow]
  )

  const connect = () => {
    void startMarket(market.trim().toUpperCase(), parameters)
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-50">
      <section className="rounded-3xl bg-slate-950 p-6 text-white sm:p-8 dark:bg-white dark:text-slate-950">
        <p className="flex items-center gap-2 text-sm font-semibold text-sky-300 dark:text-sky-700">
          <Waves className="size-4" aria-hidden="true" />
          Deriv tick observation workspace
        </p>
        <div className="mt-4 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Live market observations, not signals.
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 dark:text-slate-600">
              Active symbols, 1,000-tick history, and live ticks come from
              Deriv. Frequency, pressure, streaks, anomalies, and Activity Score
              describe recorded data only. They do not predict or guarantee the
              next tick.
            </p>
          </div>
          <Link
            to="/charts"
            className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold dark:border-slate-300"
          >
            Open charts
          </Link>
        </div>
      </section>

      {actionMessage !== null ? (
        <p
          className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-100"
          role="alert"
        >
          {actionMessage}
        </p>
      ) : null}

      {state.status === 'loading' ? <LoadingCard /> : null}
      {state.status === 'error' ? <ErrorCard message={state.message} /> : null}

      {state.status === 'empty' ? (
        <section className="mt-8 grid gap-6 lg:grid-cols-5">
          <div className={`${card} lg:col-span-3`}>
            <BarChart3
              className="size-7 text-sky-700 dark:text-sky-300"
              aria-hidden="true"
            />
            <h2 className="mt-5 text-2xl font-semibold">
              Start a read-only stream
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {state.message}
            </p>
            <MarketForm
              market={market}
              availableMarkets={availableMarkets}
              parameters={parameters}
              isWorking={isWorking}
              onMarket={setMarket}
              onParameters={setParameters}
              onSubmit={connect}
            />
          </div>
          <Safeguards />
        </section>
      ) : null}

      {analysis !== null ? (
        <>
          <section className="mt-8 grid gap-4 md:grid-cols-3">
            <article className={card}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Connection status
                  </p>
                  <p className="mt-2 text-2xl font-semibold capitalize">
                    {analysis.health.state}
                  </p>
                </div>
                <StatusPill tone={stateTone[analysis.health.state]}>
                  {analysis.health.state}
                </StatusPill>
              </div>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                {analysis.health.movementBufferSize} unique ticks retained
              </p>
            </article>
            <article className={card}>
              <p className="text-sm font-semibold text-slate-500">
                Live quote / last digit
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">
                {analysis.latestTick?.quote ?? 'Awaiting tick'}
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Digit {analysis.latestTick?.digit ?? '—'} · Change{' '}
                {analysis.latestTick?.priceChange ?? '—'}
              </p>
            </article>
            <article className={card}>
              <p className="text-sm font-semibold text-slate-500">
                Live movement
              </p>
              <p
                className={`mt-2 inline-flex rounded-full px-3 py-1.5 text-lg font-semibold ${analysis.latestTick === null ? directionTone.FLAT : directionTone[analysis.latestTick.direction]}`}
              >
                {analysis.latestTick?.direction ?? 'FLAT'}
              </p>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                Server receipt age:{' '}
                {analysis.health.latencyMs === null
                  ? '—'
                  : `${Math.round(analysis.health.latencyMs)} ms`}
              </p>
            </article>
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-5">
            <div className={`${card} lg:col-span-3`}>
              <h2 className="text-xl font-semibold">
                Market and analysis window
              </h2>
              <MarketForm
                market={market}
                availableMarkets={availableMarkets}
                parameters={parameters}
                isWorking={isWorking}
                onMarket={setMarket}
                onParameters={setParameters}
                onSubmit={connect}
                compact
              />
            </div>
            <div className={`${card} lg:col-span-2`}>
              <p className="text-sm font-semibold text-slate-500">
                Latest 50 digits
              </p>
              <div
                className="mt-4 flex flex-wrap gap-1.5"
                aria-label="Latest fifty digits"
              >
                {analysis.recentTicks.map((tick) => (
                  <span
                    key={`${tick.epoch}-${tick.quote}`}
                    title={`${tick.quote} · ${tick.direction}`}
                    className={`flex size-8 items-center justify-center rounded-full text-xs font-bold ${directionTone[tick.direction]}`}
                  >
                    {tick.digit}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-5">
            <article className={`${card} lg:col-span-3`}>
              <p className="text-sm font-semibold text-slate-500">
                Digit heatmap · selected window
              </p>
              <h2 className="mt-1 text-2xl font-semibold">
                {selectedFrequency?.sampleSize ?? 0} recorded ticks
              </h2>
              <div className="mt-5 grid grid-cols-5 gap-2 sm:grid-cols-10">
                {selectedFrequency?.digits.map((cell) => (
                  <div
                    key={cell.digit}
                    className="rounded-xl bg-slate-100 p-3 text-center dark:bg-slate-800"
                  >
                    <p className="text-lg font-bold">{cell.digit}</p>
                    <p className="text-xs">{cell.count}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {percent(cell.percentage)}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                Expected frequency is 10% for each digit. The heatmap reports
                historical counts, not next-tick probabilities.
              </p>
            </article>
            <article className={`${card} lg:col-span-2`}>
              <p className="text-sm font-semibold text-slate-500">
                Matches / Differs and digit groups
              </p>
              <dl className="mt-5 space-y-3 text-sm">
                <Row
                  label="Matches"
                  value={percent(analysis.digits.matchesObservedPercentage)}
                />
                <Row
                  label="Differs"
                  value={percent(analysis.digits.differsObservedPercentage)}
                />
                <Row
                  label="Even / Odd"
                  value={`${percent(analysis.digits.evenObservedPercentage)} / ${percent(analysis.digits.oddObservedPercentage)}`}
                />
                <Row
                  label="Over / Under"
                  value={`${percent(analysis.digits.overObservedPercentage)} / ${percent(analysis.digits.underObservedPercentage)}`}
                />
                <Row
                  label="Equal to barrier"
                  value={percent(
                    analysis.digits.equalToBarrierObservedPercentage
                  )}
                />
              </dl>
            </article>
          </section>

          <section
            className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
            aria-label="Rolling digit frequency windows"
          >
            {analysis.digitFrequency.map((frequency) => (
              <article className={card} key={frequency.window}>
                <p className="text-sm font-semibold text-slate-500">
                  Rolling {frequency.window}-tick frequency
                </p>
                <p className="mt-2 text-xl font-semibold">
                  Hot {frequency.hottestDigit ?? '—'} · Cold{' '}
                  {frequency.coldestDigit ?? '—'}
                </p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Deviation:{' '}
                  {frequency.digits
                    .map(
                      (item) =>
                        `${item.digit}:${signedPercent(item.deviationFromExpected)}`
                    )
                    .join(' · ')}
                </p>
              </article>
            ))}
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-5">
            <article className={`${card} lg:col-span-3`}>
              <div className="flex items-center gap-2">
                <Gauge className="size-5 text-sky-700" />
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Tick pressure
                  </p>
                  <h2 className="text-2xl font-semibold">
                    UP minus DOWN over directional ticks
                  </h2>
                </div>
              </div>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="text-xs text-slate-500 uppercase">
                    <tr>
                      <th className="pb-3">Window</th>
                      <th className="pb-3">Pressure</th>
                      <th className="pb-3">Class</th>
                      <th className="pb-3">UP / DOWN</th>
                      <th className="pb-3">Consecutive</th>
                      <th className="pb-3">Volatility</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.tickPressure.map((item) => (
                      <tr
                        className="border-t border-slate-100 dark:border-slate-800"
                        key={item.window}
                      >
                        <td className="py-3">
                          {item.sampleSize}/{item.window}
                        </td>
                        <td>{percent(item.pressure)}</td>
                        <td>{item.classification}</td>
                        <td>
                          {item.upTicks} / {item.downTicks}
                        </td>
                        <td>
                          {item.consecutiveUp} up · {item.consecutiveDown} down
                        </td>
                        <td>{percent(item.volatility)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
            <article className={`${card} lg:col-span-2`}>
              <p className="text-sm font-semibold text-slate-500">
                Digit streaks
              </p>
              <h2 className="mt-1 text-xl font-semibold">
                Current / average / longest recent
              </h2>
              <div className="mt-5 space-y-4 text-sm">
                <Streak
                  label="Repeated digit"
                  data={analysis.digitStreaks.repeatedDigits}
                />
                <Streak
                  label="Even / Odd"
                  data={analysis.digitStreaks.evenOdd}
                />
                <Streak
                  label="Over / Under"
                  data={analysis.digitStreaks.overUnder}
                />
              </div>
            </article>
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-5">
            <article className={`${card} lg:col-span-3`}>
              <p className="text-sm font-semibold text-slate-500">
                Anomaly detection
              </p>
              <h2 className="mt-1 text-2xl font-semibold">
                Digit z-scores against the 10% historical expectation
              </h2>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[580px] text-left text-sm">
                  <thead className="text-xs text-slate-500 uppercase">
                    <tr>
                      <th className="pb-3">Digit</th>
                      <th className="pb-3">Count</th>
                      <th className="pb-3">Observed</th>
                      <th className="pb-3">z-score</th>
                      <th className="pb-3">Label</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.anomalies.map((item) => (
                      <tr
                        key={item.digit}
                        className="border-t border-slate-100 dark:border-slate-800"
                      >
                        <td className="py-3 font-semibold">{item.digit}</td>
                        <td>{item.count}</td>
                        <td>{percent(item.observedPercentage)}</td>
                        <td>{item.zScore?.toFixed(2) ?? '—'}</td>
                        <td>{item.label}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                Anomaly labels describe unusual historical deviation only. They
                are not a prediction.
              </p>
            </article>
            <ReplayPanel
              value={replayInput}
              error={replayError}
              working={isWorking}
              onChange={setReplayInput}
              onReplay={() => {
                try {
                  setReplayError(null)
                  void replay(market, parseReplay(replayInput))
                } catch (error) {
                  setReplayError(
                    error instanceof Error
                      ? error.message
                      : 'Invalid replay data.'
                  )
                }
              }}
            />
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-5">
            <article className={`${card} lg:col-span-2`}>
              <p className="text-sm font-semibold text-slate-500">
                Market scanner
              </p>
              <h2 className="mt-1 text-xl font-semibold">
                Synthetic-index Activity Score
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Ranks observed activity: 30% directional pressure, 25%
                volatility, 20% digit-frequency deviation, 15% streak anomaly,
                10% tick activity. It is not a win probability.
              </p>
              <form
                className="mt-5"
                onSubmit={(event) => {
                  event.preventDefault()
                  void startScanner(
                    scannerInput
                      .split(',')
                      .map((value) => value.trim().toUpperCase())
                      .filter(Boolean)
                  )
                }}
              >
                <label className="text-sm font-medium" htmlFor="scanner">
                  Symbols, up to eight
                </label>
                <input
                  id="scanner"
                  value={scannerInput}
                  onChange={(event) => setScannerInput(event.target.value)}
                  className={input}
                />
                <button
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold dark:border-slate-700"
                  disabled={isWorking}
                >
                  <ScanSearch className="size-4" />
                  Run scanner
                </button>
              </form>
            </article>
            <article className={`${card} lg:col-span-3`}>
              <p className="text-sm font-semibold text-slate-500">
                Scanner rankings
              </p>
              <h2 className="mt-1 text-2xl font-semibold">
                Activity observations
              </h2>
              {scanner.length === 0 ? (
                <p className="mt-5 rounded-xl bg-slate-100 p-4 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  Run the scanner to rank subscribed synthetic indices.
                </p>
              ) : (
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full min-w-[650px] text-left text-sm">
                    <thead className="text-xs text-slate-500 uppercase">
                      <tr>
                        <th className="pb-3">Market</th>
                        <th className="pb-3">State</th>
                        <th className="pb-3">Activity Score</th>
                        <th className="pb-3">Pressure</th>
                        <th className="pb-3">Volatility</th>
                        <th className="pb-3">Digit deviation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scanner.map((item) => (
                        <tr
                          className="border-t border-slate-100 dark:border-slate-800"
                          key={item.market}
                        >
                          <td className="py-3 font-semibold">{item.market}</td>
                          <td>{item.dataState}</td>
                          <td>{item.activityScore.toFixed(1)}</td>
                          <td>
                            {item.activityComponents.directionalPressure.toFixed(
                              1
                            )}
                          </td>
                          <td>
                            {item.activityComponents.volatility.toFixed(1)}
                          </td>
                          <td>
                            {item.activityComponents.digitFrequencyDeviation.toFixed(
                              1
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </article>
          </section>
        </>
      ) : null}
    </main>
  )
}

function MarketForm({
  market,
  availableMarkets,
  parameters,
  isWorking,
  onMarket,
  onParameters,
  onSubmit,
  compact = false
}: Readonly<{
  market: string
  availableMarkets: readonly { symbol: string; displayName: string }[]
  parameters: AnalysisParameters
  isWorking: boolean
  onMarket: (market: string) => void
  onParameters: (parameters: AnalysisParameters) => void
  onSubmit: () => void
  compact?: boolean
}>) {
  return (
    <form
      className={
        compact
          ? 'mt-4 grid gap-3 sm:grid-cols-3'
          : 'mt-6 grid gap-3 sm:grid-cols-3'
      }
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <label className="text-sm font-medium">
        Deriv synthetic index
        <select
          value={market}
          onChange={(event) => onMarket(event.target.value)}
          className={input}
        >
          {availableMarkets.length === 0 ? (
            <option value={market}>{market}</option>
          ) : (
            availableMarkets.map((item) => (
              <option value={item.symbol} key={item.symbol}>
                {item.displayName} ({item.symbol})
              </option>
            ))
          )}
        </select>
      </label>
      <label className="text-sm font-medium">
        Analysis window
        <select
          value={parameters.digitWindow}
          onChange={(event) =>
            onParameters({
              ...parameters,
              digitWindow: Number(event.target.value),
              movementWindow: Math.min(100, Number(event.target.value))
            })
          }
          className={input}
        >
          {windows.map((window) => (
            <option value={window} key={window}>
              {window} ticks
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-end">
        <button
          type="submit"
          disabled={isWorking}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-slate-950"
        >
          <RefreshCw className={`size-4 ${isWorking ? 'animate-spin' : ''}`} />
          {compact ? 'Switch / refresh' : 'Connect stream'}
        </button>
      </div>
    </form>
  )
}

function Safeguards() {
  return (
    <aside className={card}>
      <h2 className="font-semibold">Real-data safeguards</h2>
      <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
        <li>One central Deriv connection multiplexes markets.</li>
        <li>History and live ticks use per-market duplicate keys.</li>
        <li>Quotes retain the feed’s pip precision.</li>
        <li>All output is observation or anomaly, never a signal.</li>
      </ul>
    </aside>
  )
}
function LoadingCard() {
  return (
    <section className={`${card} mt-8 text-center`}>
      <RefreshCw className="mx-auto size-6 animate-spin" />
      <p className="mt-3 text-sm">
        Loading the account context and active Deriv symbols…
      </p>
    </section>
  )
}
function ErrorCard({ message }: Readonly<{ message: string }>) {
  return (
    <section className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-900 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-100">
      <CircleAlert className="mx-auto size-6" />
      <p className="mt-3">{message}</p>
    </section>
  )
}
function Row({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-semibold">{value}</dd>
    </div>
  )
}
function Streak({
  label,
  data
}: Readonly<{
  label: string
  data: {
    current: string | null
    currentLength: number
    averageLength: number | null
    longestRecent: number
  }
}>) {
  return (
    <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
      <p className="font-semibold">{label}</p>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        {data.current ?? '—'} × {data.currentLength} · avg{' '}
        {data.averageLength?.toFixed(2) ?? '—'} · longest {data.longestRecent}
      </p>
    </div>
  )
}
function ReplayPanel({
  value,
  error,
  working,
  onChange,
  onReplay
}: Readonly<{
  value: string
  error: string | null
  working: boolean
  onChange: (value: string) => void
  onReplay: () => void
}>) {
  return (
    <article className={`${card} lg:col-span-2`}>
      <p className="text-sm font-semibold text-slate-500">Replay mode</p>
      <h2 className="mt-1 text-xl font-semibold">
        Test stored ticks through this same engine
      </h2>
      <p className="mt-2 text-sm leading-5 text-slate-600 dark:text-slate-300">
        Paste one tick per line: <code>epoch,quote,pipSize</code>. Replay is
        isolated from live execution.
      </p>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="1700000000,100.123,3"
        className={`${input} min-h-28 font-mono`}
      />
      <button
        type="button"
        onClick={onReplay}
        disabled={working || value.trim().length === 0}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold disabled:opacity-50 dark:border-slate-700"
      >
        <Play className="size-4" />
        Run replay
      </button>
      {error === null ? null : (
        <p className="mt-2 text-sm text-rose-700 dark:text-rose-300">{error}</p>
      )}
    </article>
  )
}
