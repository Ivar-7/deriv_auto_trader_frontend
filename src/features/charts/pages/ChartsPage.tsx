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
import type { MarketTick } from '../../analysis/types/analysis.types'

const timeframes = ['1 tick', '1 minute', '5 minutes', '1 hour'] as const
const chartPreferencesKey = 'deriv-auto-trader:chart-preferences'
const analysisParameters = {
  movementWindow: 30,
  digitWindow: 200,
  barrier: 5,
  confidenceThreshold: 0.6
}

type ChartMode = 'ticks' | 'candles'
type Timeframe = (typeof timeframes)[number]
type ChartPreferences = Readonly<{
  market: string
  chartMode: ChartMode
  timeframe: Timeframe
}>
type Candle = Readonly<{
  open: number
  high: number
  low: number
  close: number
}>

const defaultChartPreferences: ChartPreferences = {
  market: 'R_100',
  chartMode: 'ticks',
  timeframe: '1 tick'
}

const candleGroupSize: Record<Timeframe, number> = {
  '1 tick': 1,
  '1 minute': 2,
  '5 minutes': 4,
  '1 hour': 5
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

    if (selectedMarket.length === 0) {
      return
    }

    autoConnectRequested.current = true
    void startMarket(selectedMarket, analysisParameters)
  }, [market, startMarket, state])

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const selectedMarket = market.trim().toUpperCase()

    if (selectedMarket.length === 0) {
      return
    }

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
    <main className="w-full px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
      <section className="rounded-3xl border border-slate-800 bg-slate-900 px-6 py-7 shadow-2xl shadow-slate-950/20 sm:px-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-sky-400">
              <ChartNoAxesCombined className="size-4" aria-hidden="true" />
              Live market workspace
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Watch observed market movement at a useful scale.
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
              Your market, chart view, and timeframe are remembered. The feed
              reconnects automatically when this workspace opens.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void fullscreen()}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm font-bold text-slate-100 transition hover:border-sky-400 hover:text-white"
          >
            <Expand className="size-4" aria-hidden="true" /> Full screen
          </button>
        </div>
      </section>

      <section className="mt-5 rounded-3xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
        <form
          onSubmit={submit}
          className="grid gap-4 xl:grid-cols-4 xl:items-end"
        >
          <label className="block text-sm font-semibold text-slate-200">
            Market
            <input
              value={market}
              onChange={(event) =>
                setPreferences((current) => ({
                  ...current,
                  market: event.target.value
                }))
              }
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-3 text-sm font-semibold text-white transition outline-none placeholder:text-slate-600 focus:border-sky-400"
              aria-label="Market"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-200">
            Chart view
            <select
              value={chartMode}
              onChange={(event) =>
                setPreferences((current) => ({
                  ...current,
                  chartMode: event.target.value as ChartMode
                }))
              }
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-3 text-sm font-semibold text-white transition outline-none focus:border-sky-400"
              aria-label="Chart view"
            >
              <option value="ticks">Tick line</option>
              <option value="candles">Candlesticks</option>
            </select>
          </label>
          <label className="block text-sm font-semibold text-slate-200">
            Timeframe
            <select
              value={timeframe}
              onChange={(event) =>
                setPreferences((current) => ({
                  ...current,
                  timeframe: event.target.value as Timeframe
                }))
              }
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-3 text-sm font-semibold text-white transition outline-none focus:border-sky-400"
              aria-label="Chart timeframe"
            >
              {timeframes.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <button
            disabled={isWorking}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-sky-400 px-5 py-3 text-sm font-extrabold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Radio className="size-4" aria-hidden="true" />
            {isWorking ? 'Connecting…' : 'Reconnect feed'}
          </button>
        </form>
        {actionMessage === null ? null : (
          <p className="mt-4 rounded-xl border border-rose-900/80 bg-rose-950/50 px-4 py-3 text-sm text-rose-200">
            {actionMessage}
          </p>
        )}
      </section>

      {state.status === 'loading' ? (
        <StateCard
          icon={
            <LoaderCircle className="size-7 animate-spin" aria-hidden="true" />
          }
          title="Restoring chart access"
          message="Loading the selected account and its saved chart workspace."
        />
      ) : null}
      {state.status === 'empty' ? (
        <StateCard
          icon={<WalletCards className="size-7" aria-hidden="true" />}
          title={
            hasSelectedAccount
              ? isWorking
                ? 'Connecting the saved market feed'
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
        <section className="mt-5 grid gap-5 2xl:grid-cols-5">
          <article className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 2xl:col-span-4">
            <div className="flex flex-col gap-4 border-b border-slate-800 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <p className="text-sm font-bold text-sky-400">
                  {chartMode === 'ticks' ? 'Tick line' : 'Candlesticks'} ·{' '}
                  {timeframe}
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-white">
                  {state.data.analysis.market}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => void refresh(analysisParameters)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs font-bold text-slate-200 transition hover:border-sky-400 hover:text-white"
              >
                <RefreshCw className="size-3.5" aria-hidden="true" /> Refresh
              </button>
            </div>
            <div className="px-3 py-3 sm:px-5 sm:py-5">
              <MarketChart
                chartMode={chartMode}
                ticks={state.data.analysis.recentTicks}
                timeframe={timeframe}
              />
            </div>
            <p className="border-t border-slate-800 px-5 py-4 text-xs leading-5 text-slate-400 sm:px-6">
              {chartMode === 'candles'
                ? 'Each candle aggregates the currently available observed ticks for the selected display interval. It is a live visual summary, not a forecast.'
                : 'The line shows the recent observed quote sequence from the live feed. It is for inspection only, not a forecast.'}
            </p>
          </article>

          <aside className="rounded-3xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
            <p className="text-sm font-bold text-slate-400">Current price</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-white">
              {state.data.analysis.latestTick?.quote ?? '—'}
            </p>
            <div className="mt-7 space-y-5 border-t border-slate-800 pt-5 text-sm">
              <Metric
                label="Feed state"
                value={state.data.analysis.health.state}
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
            </div>
            <div className="mt-7 flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-3 py-3 text-xs font-semibold text-slate-300">
              <TableProperties
                className="size-4 text-sky-400"
                aria-hidden="true"
              />
              {state.data.analysis.recentTicks.length} live observations
            </div>
          </aside>
        </section>
      ) : null}
    </main>
  )
}

function MarketChart({
  chartMode,
  ticks,
  timeframe
}: Readonly<{
  chartMode: ChartMode
  ticks: readonly MarketTick[]
  timeframe: Timeframe
}>) {
  const values = ticks
    .map((tick) => Number(tick.quote))
    .filter((value) => Number.isFinite(value))
  const scale = chartScale(values)
  const candles = createCandles(ticks, candleGroupSize[timeframe])

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-2 sm:p-4">
      <svg
        viewBox="0 0 1200 540"
        className="h-96 w-full"
        role="img"
        aria-label={
          chartMode === 'candles'
            ? 'Observed market candlestick chart'
            : 'Observed market tick line chart'
        }
      >
        <ChartGrid scale={scale} />
        {chartMode === 'ticks' ? (
          <TickLine ticks={ticks} scale={scale} />
        ) : (
          <CandleBars candles={candles} scale={scale} />
        )}
        {values.length === 0 ? (
          <text
            x="600"
            y="270"
            textAnchor="middle"
            className="fill-slate-500 text-2xl"
          >
            Waiting for observed price data
          </text>
        ) : null}
      </svg>
    </div>
  )
}

function ChartGrid({ scale }: Readonly<{ scale: PriceScale }>) {
  return (
    <>
      {[80, 180, 280, 380, 480].map((y, index) => {
        const value = scale.max - ((y - 80) / 400) * (scale.max - scale.min)

        return (
          <g key={y}>
            <line
              x1="78"
              x2="1150"
              y1={y}
              y2={y}
              className="stroke-slate-800"
              strokeWidth="1"
            />
            <text x="12" y={y + 5} className="fill-slate-500 text-sm">
              {index === 0 || index === 4 ? formatPrice(value) : ''}
            </text>
          </g>
        )
      })}
      <line
        x1="78"
        x2="78"
        y1="60"
        y2="480"
        className="stroke-slate-700"
        strokeWidth="1"
      />
      <line
        x1="78"
        x2="1150"
        y1="480"
        y2="480"
        className="stroke-slate-700"
        strokeWidth="1"
      />
    </>
  )
}

function TickLine({
  ticks,
  scale
}: Readonly<{
  ticks: readonly MarketTick[]
  scale: PriceScale
}>) {
  const points = ticks
    .map((tick, index) => {
      const quote = Number(tick.quote)
      if (!Number.isFinite(quote)) return null
      return `${xPosition(index, ticks.length)},${scale.toY(quote)}`
    })
    .filter((point): point is string => point !== null)
    .join(' ')

  return points.length === 0 ? null : (
    <>
      <polyline
        points={points}
        className="fill-none stroke-sky-400"
        strokeWidth="4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {ticks.slice(-1).map((tick) => {
        const quote = Number(tick.quote)
        if (!Number.isFinite(quote)) return null

        return (
          <circle
            key={`${tick.epoch}-${tick.receivedAt}`}
            cx={xPosition(ticks.length - 1, ticks.length)}
            cy={scale.toY(quote)}
            r="7"
            className="fill-sky-300 stroke-slate-950"
            strokeWidth="4"
          />
        )
      })}
    </>
  )
}

function CandleBars({
  candles,
  scale
}: Readonly<{
  candles: readonly Candle[]
  scale: PriceScale
}>) {
  const spacing = 1072 / Math.max(candles.length, 1)
  const width = Math.max(8, Math.min(34, spacing * 0.58))

  return candles.map((candle, index) => {
    const x = 78 + spacing * index + spacing / 2
    const openY = scale.toY(candle.open)
    const closeY = scale.toY(candle.close)
    const isRising = candle.close >= candle.open
    const bodyTop = Math.min(openY, closeY)

    return (
      <g key={`${index}-${candle.open}-${candle.close}`}>
        <line
          x1={x}
          x2={x}
          y1={scale.toY(candle.high)}
          y2={scale.toY(candle.low)}
          className={isRising ? 'stroke-emerald-400' : 'stroke-rose-400'}
          strokeWidth="3"
        />
        <rect
          x={x - width / 2}
          y={bodyTop}
          width={width}
          height={Math.max(5, Math.abs(closeY - openY))}
          className={isRising ? 'fill-emerald-400' : 'fill-rose-400'}
          rx="2"
        />
      </g>
    )
  })
}

function Metric({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div>
      <p className="text-xs font-bold tracking-wider text-slate-500 uppercase">
        {label}
      </p>
      <p className="mt-1.5 font-semibold text-slate-100 capitalize">{value}</p>
    </div>
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
      className={`mt-5 rounded-3xl border p-8 text-center ${
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

type PriceScale = Readonly<{
  min: number
  max: number
  toY: (value: number) => number
}>

function chartScale(values: readonly number[]): PriceScale {
  const low = values.length === 0 ? 0 : Math.min(...values)
  const high = values.length === 0 ? 1 : Math.max(...values)
  const padding = Math.max((high - low) * 0.12, Math.abs(high) * 0.0002, 0.01)
  const min = low - padding
  const max = high + padding
  const range = max - min

  return {
    min,
    max,
    toY: (value) => 480 - ((value - min) / range) * 400
  }
}

function createCandles(
  ticks: readonly MarketTick[],
  groupSize: number
): readonly Candle[] {
  const candles: Candle[] = []

  for (let index = 0; index < ticks.length; index += groupSize) {
    const values = ticks
      .slice(index, index + groupSize)
      .map((tick) => Number(tick.quote))
      .filter((value) => Number.isFinite(value))

    if (values.length === 0) continue

    candles.push({
      open: values[0],
      high: Math.max(...values),
      low: Math.min(...values),
      close: values[values.length - 1]
    })
  }

  return candles
}

function xPosition(index: number, count: number): number {
  if (count < 2) return 614
  return 78 + (index / (count - 1)) * 1072
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 4
  }).format(value)
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
      !timeframes.includes(stored.timeframe as Timeframe)
    ) {
      return defaultChartPreferences
    }

    return {
      market: stored.market,
      chartMode: stored.chartMode,
      timeframe: stored.timeframe as Timeframe
    }
  } catch {
    return defaultChartPreferences
  }
}
