import {
  ChartNoAxesCombined,
  CircleAlert,
  Expand,
  LoaderCircle,
  Radio,
  RefreshCw,
  TableProperties,
  WalletCards
} from 'lucide-react'
import { type FormEvent, type ReactNode, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMarketAnalysis } from '../../analysis/hooks/useMarketAnalysis'

const timeframes = ['1 tick', '1 minute', '5 minutes', '1 hour'] as const

export function ChartsPage() {
  const { state, actionMessage, isWorking, startMarket, refresh } =
    useMarketAnalysis()
  const [market, setMarket] = useState('R_100')
  const [chartMode, setChartMode] = useState<'ticks' | 'candles'>('ticks')
  const [timeframe, setTimeframe] =
    useState<(typeof timeframes)[number]>('1 tick')
  const parameters = {
    movementWindow: 30,
    digitWindow: 200,
    barrier: 5,
    confidenceThreshold: 0.6
  }

  const points = useMemo(() => {
    if (state.status !== 'success') return ''
    const ticks = state.data.analysis.recentTicks.slice(-30)
    return ticks
      .map((tick, index) => `${index * 10},${90 - tick.digit * 8}`)
      .join(' ')
  }, [state])

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void startMarket(market.trim().toUpperCase(), parameters)
  }
  const fullscreen = async () => {
    if (document.fullscreenElement === null)
      await document.documentElement.requestFullscreen()
    else await document.exitFullscreen()
  }

  return (
    <main className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section className="rounded-3xl bg-slate-950 p-6 text-white sm:p-8 dark:bg-white dark:text-slate-950">
        <p className="flex items-center gap-2 text-sm font-bold text-emerald-300 dark:text-emerald-700">
          <ChartNoAxesCombined className="size-4" aria-hidden="true" /> Live
          Deriv charts
        </p>
        <div className="mt-4 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Read live ticks without pretending they are a forecast.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 dark:text-slate-600">
              Select a supported market to view the current price marker and
              recent tick sequence. Candle mode is a display preference for the
              supported timeframe; it is not TradingView.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void fullscreen()}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-bold text-white dark:border-slate-300 dark:text-slate-950"
          >
            <Expand className="size-4" aria-hidden="true" /> Full screen
          </button>
        </div>
      </section>
      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <form
          onSubmit={submit}
          className="grid gap-4 lg:grid-cols-4 lg:items-end"
        >
          <label className="block text-sm font-semibold">
            Market
            <input
              value={market}
              onChange={(event) => setMarket(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
          </label>
          <label className="block text-sm font-semibold">
            View
            <select
              value={chartMode}
              onChange={(event) =>
                setChartMode(event.target.value as typeof chartMode)
              }
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="ticks">Tick view</option>
              <option value="candles">Candle view</option>
            </select>
          </label>
          <label className="block text-sm font-semibold">
            Timeframe
            <select
              value={timeframe}
              onChange={(event) =>
                setTimeframe(event.target.value as typeof timeframe)
              }
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              {timeframes.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <button
            disabled={isWorking}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50 dark:bg-white dark:text-slate-950"
          >
            <Radio className="size-4" aria-hidden="true" />{' '}
            {isWorking ? 'Connecting…' : 'Connect live feed'}
          </button>
        </form>
        {actionMessage === null ? null : (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
            {actionMessage}
          </p>
        )}
      </section>
      {state.status === 'loading' ? (
        <StateCard
          icon={
            <LoaderCircle className="size-7 animate-spin" aria-hidden="true" />
          }
          title="Checking chart access"
          message="Loading the selected account before connecting a read-only market feed."
        />
      ) : null}
      {state.status === 'empty' ? (
        <StateCard
          icon={<WalletCards className="size-7" aria-hidden="true" />}
          title="Connect a market when ready"
          message={state.message}
          action={
            <Link
              to="/accounts"
              className="mt-5 inline-flex rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-bold text-white dark:bg-white dark:text-slate-950"
            >
              Open accounts
            </Link>
          }
        />
      ) : null}
      {state.status === 'error' ? (
        <StateCard
          icon={
            <CircleAlert
              className="size-7 text-rose-700 dark:text-rose-300"
              aria-hidden="true"
            />
          }
          title="Charts are unavailable"
          message={state.message}
          danger
        />
      ) : null}
      {state.status === 'success' ? (
        <section className="mt-6 grid gap-6 xl:grid-cols-5">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 xl:col-span-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                  {chartMode === 'ticks' ? 'Tick chart' : 'Candle chart'} ·{' '}
                  {timeframe}
                </p>
                <h2 className="mt-1 text-2xl font-semibold">
                  {state.data.analysis.market}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => void refresh(parameters)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold dark:border-slate-700"
              >
                <RefreshCw className="size-3.5" aria-hidden="true" /> Refresh
              </button>
            </div>
            <div className="mt-6 rounded-2xl bg-slate-100 p-4 dark:bg-slate-800">
              <svg
                viewBox="0 0 300 100"
                className="h-56 w-full text-emerald-600 dark:text-emerald-400"
                role="img"
                aria-label="Recent observed tick digit chart"
              >
                <line
                  x1="0"
                  y1="90"
                  x2="300"
                  y2="90"
                  className="stroke-slate-300 dark:stroke-slate-600"
                  strokeWidth="1"
                />
                <line
                  x1="0"
                  y1="50"
                  x2="300"
                  y2="50"
                  className="stroke-slate-200 dark:stroke-slate-700"
                  strokeWidth="1"
                />
                {points.length > 0 ? (
                  <polyline
                    points={points}
                    className="fill-none stroke-current"
                    strokeWidth="2"
                  />
                ) : null}
              </svg>
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-400">
              The line represents recent observed last digits from the live
              feed, displayed for inspection only.
            </p>
          </article>
          <aside className="rounded-3xl border border-slate-200 bg-white p-6 xl:col-span-1 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
              Current price
            </p>
            <p className="mt-3 text-3xl font-semibold">
              {state.data.analysis.latestTick?.quote ?? '—'}
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Data state: {state.data.analysis.health.state}
            </p>
            <p className="mt-5 text-sm text-slate-600 dark:text-slate-300">
              Latency:{' '}
              {state.data.analysis.health.latencyMs === null
                ? '—'
                : `${state.data.analysis.health.latencyMs} ms`}
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <TableProperties className="size-4" aria-hidden="true" />{' '}
              {state.data.analysis.recentTicks.length} observations
            </div>
          </aside>
        </section>
      ) : null}
    </main>
  )
}

function StateCard({
  icon,
  title,
  message,
  action,
  danger = false
}: Readonly<{
  icon: ReactNode
  title: string
  message: string
  action?: ReactNode
  danger?: boolean
}>) {
  return (
    <section
      className={`mt-6 rounded-3xl border p-8 text-center ${danger ? 'border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}
    >
      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
        {icon}
      </div>
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
        {message}
      </p>
      {action}
    </section>
  )
}
