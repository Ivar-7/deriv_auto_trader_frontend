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
import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState
} from 'react'
import { Link } from 'react-router-dom'
import { useMarketAnalysis } from '../../analysis/hooks/useMarketAnalysis'
import type { MarketCandleHistory } from '../../analysis/types/analysis.types'
import { MarketChart, type ChartMode } from '../components/MarketChart'
import { chartTimeframes, type ChartTimeframe } from '../lib/chart-data'

const chartPreferencesKey = 'deriv-auto-trader:chart-preferences'
const analysisParameters = {
  movementWindow: 30,
  digitWindow: 500,
  barrier: 5,
  confidenceThreshold: 0.6
}

type ChartPreferences = Readonly<{
  market: string
  chartMode: ChartMode
  timeframe: ChartTimeframe
}>

const defaultChartPreferences: ChartPreferences = {
  market: 'R_100',
  chartMode: 'candles',
  timeframe: '1 minute'
}

export function ChartsPage() {
  const { state, actionMessage, isWorking, startMarket, refresh } =
    useMarketAnalysis()
  const [preferences, setPreferences] =
    useState<ChartPreferences>(readChartPreferences)
  const autoConnectRequested = useRef(false)
  const { chartMode, market, timeframe } = preferences
  const hasSelectedAccount =
    state.accountSession?.selectedAccountId !== null &&
    state.accountSession?.selectedAccountId !== undefined

  useEffect(() => {
    window.localStorage.setItem(
      chartPreferencesKey,
      JSON.stringify(preferences)
    )
  }, [preferences])

  useEffect(() => {
    if (
      autoConnectRequested.current ||
      state.status !== 'empty' ||
      state.accountSession?.selectedAccountId === null
    ) {
      return
    }

    const selectedMarket = market.trim().toUpperCase()

    if (selectedMarket.length === 0) return

    autoConnectRequested.current = true
    void startMarket(selectedMarket, analysisParameters)
  }, [market, startMarket, state])

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const selectedMarket = market.trim().toUpperCase()

    if (selectedMarket.length === 0) return

    setPreferences((current) => ({ ...current, market: selectedMarket }))
    void startMarket(selectedMarket, analysisParameters)
  }

  const fullscreen = async () => {
    if (document.fullscreenElement === null) {
      await document.documentElement.requestFullscreen()
      return
    }

    await document.exitFullscreen()
  }

  return (
    <main className="w-full px-3 py-4 sm:px-5 lg:px-6">
      <header className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3.5 shadow-xl shadow-slate-950/20 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-sky-400/10 text-sky-400">
            <ChartNoAxesCombined className="size-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white sm:text-xl">
                Live market chart
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] font-extrabold tracking-wide text-emerald-400 uppercase">
                <span className="size-1.5 rounded-full bg-emerald-400" /> Live
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-400">
              Historical Deriv OHLC with live price updates
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void fullscreen()}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-bold text-slate-200 transition hover:border-sky-400 hover:text-white"
        >
          <Expand className="size-3.5" aria-hidden="true" /> Full screen
        </button>
      </header>

      {state.status === 'loading' ? (
        <StateCard
          icon={
            <LoaderCircle className="size-7 animate-spin" aria-hidden="true" />
          }
          title="Restoring chart access"
          message="Loading the selected account and chart workspace."
        />
      ) : null}
      {state.status === 'empty' ? (
        <StateCard
          icon={<WalletCards className="size-7" aria-hidden="true" />}
          title={
            hasSelectedAccount
              ? isWorking
                ? 'Connecting the market feed'
                : 'The chart feed is disconnected'
              : 'An account connection is required'
          }
          message={state.message}
          action={
            hasSelectedAccount ? null : (
              <Link
                to="/accounts"
                className="mt-5 inline-flex rounded-xl bg-sky-400 px-4 py-2.5 text-sm font-extrabold text-slate-950 transition hover:bg-sky-300"
              >
                Open accounts
              </Link>
            )
          }
        />
      ) : null}
      {state.status === 'error' ? (
        <StateCard
          icon={
            <CircleAlert className="size-7 text-rose-300" aria-hidden="true" />
          }
          title="Charts are unavailable"
          message={state.message}
          danger
        />
      ) : null}

      {state.status === 'success' ? (
        <section className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_17rem]">
          <article className="min-w-0 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl shadow-slate-950/20">
            <form
              onSubmit={submit}
              className="flex flex-wrap items-end gap-3 border-b border-slate-800 px-3 py-3 sm:px-4"
            >
              <label className="block w-36 text-[11px] font-bold tracking-wide text-slate-500 uppercase">
                Market
                <input
                  value={market}
                  onChange={(event) =>
                    setPreferences((current) => ({
                      ...current,
                      market: event.target.value
                    }))
                  }
                  className="mt-1.5 h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 font-mono text-sm font-bold text-white transition outline-none focus:border-sky-400"
                  aria-label="Market"
                />
              </label>

              <div>
                <p className="text-[11px] font-bold tracking-wide text-slate-500 uppercase">
                  Chart
                </p>
                <div className="mt-1.5 flex h-10 overflow-hidden rounded-lg border border-slate-700 bg-slate-950 p-1">
                  <ChartModeButton
                    active={chartMode === 'candles'}
                    label="Candles"
                    onClick={() =>
                      setPreferences((current) => ({
                        ...current,
                        chartMode: 'candles'
                      }))
                    }
                  />
                  <ChartModeButton
                    active={chartMode === 'ticks'}
                    label="Line"
                    onClick={() =>
                      setPreferences((current) => ({
                        ...current,
                        chartMode: 'ticks'
                      }))
                    }
                  />
                </div>
              </div>

              <label className="block w-40 text-[11px] font-bold tracking-wide text-slate-500 uppercase">
                Interval
                <select
                  value={timeframe}
                  onChange={(event) =>
                    setPreferences((current) => ({
                      ...current,
                      timeframe: event.target.value as ChartTimeframe
                    }))
                  }
                  className="mt-1.5 h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm font-bold text-white transition outline-none focus:border-sky-400"
                  aria-label="Chart interval"
                >
                  {chartTimeframes.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>

              <div className="ml-auto flex gap-2">
                <button
                  type="button"
                  onClick={() => void refresh(analysisParameters)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs font-bold text-slate-200 transition hover:border-sky-400 hover:text-white"
                >
                  <RefreshCw className="size-3.5" aria-hidden="true" /> Refresh
                </button>
                <button
                  disabled={isWorking}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-sky-400 px-4 text-xs font-extrabold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Radio className="size-3.5" aria-hidden="true" />
                  {isWorking ? 'Connecting...' : 'Reconnect'}
                </button>
              </div>
            </form>

            {actionMessage === null ? null : (
              <p className="mx-4 mt-3 rounded-lg border border-rose-900/80 bg-rose-950/50 px-3 py-2 text-xs text-rose-200">
                {actionMessage}
              </p>
            )}

            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <h2 className="font-mono text-lg font-extrabold text-white">
                  {state.data.analysis.market}
                </h2>
                <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
                  {chartMode === 'candles' ? 'Candlestick' : 'Price line'} ·{' '}
                  {timeframe}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                  Bars loaded
                </p>
                <p className="mt-0.5 font-mono text-sm font-bold text-slate-200">
                  {barCount(
                    state.data.analysis.candles,
                    state.data.analysis.recentTicks.length,
                    timeframe
                  )}
                </p>
              </div>
            </div>

            <div className="px-2 pb-2 sm:px-3 sm:pb-3">
              <MarketChart
                candleHistory={state.data.analysis.candles}
                chartMode={chartMode}
                market={state.data.analysis.market}
                ticks={state.data.analysis.recentTicks}
                timeframe={timeframe}
              />
            </div>
            <p className="border-t border-slate-800 px-4 py-3 text-[11px] leading-5 text-slate-500">
              Drag the pointer across the plot to inspect time and OHLC values.
              Time-based bars come from Deriv historical market data and the
              current bar updates from the live feed.
            </p>
          </article>

          <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl shadow-slate-950/20">
            <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              Current price
            </p>
            <p className="mt-2 font-mono text-3xl font-bold tracking-tight break-all text-white">
              {state.data.analysis.latestTick?.quote ?? '—'}
            </p>
            <div className="mt-5 space-y-4 border-t border-slate-800 pt-4 text-sm">
              <Metric
                label="Feed state"
                value={state.data.analysis.health.state}
                live={state.data.analysis.health.state === 'live'}
              />
              <Metric
                label="Latency"
                value={
                  state.data.analysis.health.latencyMs === null
                    ? '—'
                    : `${state.data.analysis.health.latencyMs} ms`
                }
              />
              <Metric label="Market" value={state.data.analysis.market} />
              <Metric label="Source" value="Deriv public feed" />
            </div>
            <div className="mt-5 flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-[11px] font-semibold text-slate-300">
              <TableProperties
                className="size-3.5 text-sky-400"
                aria-hidden="true"
              />
              {state.data.analysis.recentTicks.length} recent ticks
            </div>
          </aside>
        </section>
      ) : null}
    </main>
  )
}

function ChartModeButton({
  active,
  label,
  onClick
}: Readonly<{
  active: boolean
  label: string
  onClick: () => void
}>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 text-xs font-bold transition ${
        active
          ? 'bg-sky-400 text-slate-950 shadow-sm'
          : 'text-slate-400 hover:text-white'
      }`}
    >
      {label}
    </button>
  )
}

function Metric({
  label,
  live = false,
  value
}: Readonly<{ label: string; live?: boolean; value: string }>) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
        {label}
      </p>
      <p className="flex items-center gap-1.5 text-xs font-bold text-slate-100 capitalize">
        {live ? (
          <span className="size-1.5 rounded-full bg-emerald-400" />
        ) : null}
        {value}
      </p>
    </div>
  )
}

function StateCard({
  action,
  danger = false,
  icon,
  message,
  title
}: Readonly<{
  action?: ReactNode
  danger?: boolean
  icon: ReactNode
  message: string
  title: string
}>) {
  return (
    <section
      className={`mt-4 rounded-2xl border p-8 text-center ${
        danger
          ? 'border-rose-900 bg-rose-950/40'
          : 'border-slate-800 bg-slate-900'
      }`}
    >
      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-slate-800 text-slate-200">
        {icon}
      </div>
      <h2 className="mt-4 text-lg font-semibold text-white">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-400">
        {message}
      </p>
      {action}
    </section>
  )
}

function barCount(
  history: MarketCandleHistory,
  tickCount: number,
  timeframe: ChartTimeframe
): number {
  if (timeframe === '1 minute') return history.oneMinute.length
  if (timeframe === '5 minutes') return history.fiveMinutes.length
  if (timeframe === '1 hour') return history.oneHour.length
  return tickCount
}

function readChartPreferences(): ChartPreferences {
  if (typeof window === 'undefined') return defaultChartPreferences

  try {
    const stored = JSON.parse(
      window.localStorage.getItem(chartPreferencesKey) ?? ''
    ) as Partial<ChartPreferences>

    if (
      typeof stored.market !== 'string' ||
      (stored.chartMode !== 'ticks' && stored.chartMode !== 'candles') ||
      !chartTimeframes.includes(stored.timeframe as ChartTimeframe)
    ) {
      return defaultChartPreferences
    }

    return {
      market: stored.market,
      chartMode: stored.chartMode,
      timeframe: stored.timeframe as ChartTimeframe
    }
  } catch {
    return defaultChartPreferences
  }
}
