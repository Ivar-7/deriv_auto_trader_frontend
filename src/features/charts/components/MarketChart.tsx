import {
  useMemo,
  useState,
  type PointerEvent as ReactPointerEvent
} from 'react'
import type {
  MarketCandle,
  MarketCandleHistory,
  MarketTick
} from '../../analysis/types/analysis.types'
import {
  candlesForTimeframe,
  decimalPlaces,
  type ChartTimeframe
} from '../lib/chart-data'

const chartWidth = 1_440
const chartHeight = 620
const plotLeft = 26
const plotRight = 1_314
const plotTop = 70
const plotBottom = 548
const plotWidth = plotRight - plotLeft
const plotHeight = plotBottom - plotTop

export type ChartMode = 'ticks' | 'candles'

type PriceScale = Readonly<{
  min: number
  max: number
  toY: (value: number) => number
}>

export function MarketChart({
  candleHistory,
  chartMode,
  market,
  ticks,
  timeframe
}: Readonly<{
  candleHistory: MarketCandleHistory
  chartMode: ChartMode
  market: string
  ticks: readonly MarketTick[]
  timeframe: ChartTimeframe
}>) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const candles = useMemo(() => {
    const maximumBars = chartMode === 'candles' ? 120 : 240
    return candlesForTimeframe(ticks, candleHistory, timeframe).slice(
      -maximumBars
    )
  }, [candleHistory, chartMode, ticks, timeframe])
  const values = candles.flatMap((candle) =>
    chartMode === 'candles'
      ? [Number(candle.low), Number(candle.high)]
      : [Number(candle.close)]
  )
  const validValues = values.filter((value) => Number.isFinite(value))
  const scale = createPriceScale(validValues)
  const precision = decimalPlaces(
    candles.flatMap((candle) => [
      candle.open,
      candle.high,
      candle.low,
      candle.close
    ])
  )
  const activeIndex = hoverIndex ?? Math.max(candles.length - 1, 0)
  const activeCandle = candles[activeIndex]
  const activeX = xPosition(activeIndex, candles.length)
  const activeClose =
    activeCandle === undefined ? null : Number(activeCandle.close)
  const latestCandle = candles.at(-1)
  const latestPrice =
    latestCandle === undefined ? null : Number(latestCandle.close)
  const change = candleChange(activeCandle)

  const moveCrosshair = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (candles.length === 0) return

    const bounds = event.currentTarget.getBoundingClientRect()
    const chartX = ((event.clientX - bounds.left) / bounds.width) * chartWidth
    const ratio = Math.max(0, Math.min(1, (chartX - plotLeft) / plotWidth))
    setHoverIndex(Math.round(ratio * Math.max(candles.length - 1, 0)))
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#050814] shadow-inner shadow-black/20">
      <div className="relative aspect-[72/31] min-w-[1180px]">
        {activeCandle === undefined ? null : (
          <div className="pointer-events-none absolute top-3 left-4 z-10 flex items-center gap-4 rounded-lg bg-slate-950/85 px-3 py-2 font-mono text-[11px] text-slate-400 shadow-lg backdrop-blur sm:text-xs">
            <span className="font-sans font-bold text-slate-200">{market}</span>
            <span>{formatDateTime(activeCandle.epoch, timeframe)}</span>
            <QuoteValue label="O" value={activeCandle.open} />
            <QuoteValue label="H" value={activeCandle.high} positive />
            <QuoteValue label="L" value={activeCandle.low} negative />
            <QuoteValue label="C" value={activeCandle.close} />
            <span
              className={change >= 0 ? 'text-emerald-400' : 'text-rose-400'}
            >
              {change >= 0 ? '+' : ''}
              {change.toFixed(3)}%
            </span>
          </div>
        )}

        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="h-full w-full cursor-crosshair select-none"
          role="img"
          aria-label={`${market} ${timeframe} ${chartMode === 'candles' ? 'candlestick' : 'line'} chart`}
          onPointerMove={moveCrosshair}
          onPointerLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="line-area-gradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </linearGradient>
            <clipPath id="market-plot-clip">
              <rect
                x={plotLeft}
                y={plotTop}
                width={plotWidth}
                height={plotHeight}
              />
            </clipPath>
          </defs>

          <rect
            x={plotLeft}
            y={plotTop}
            width={plotWidth}
            height={plotHeight}
            fill="#050814"
          />
          <ChartGrid
            candles={candles}
            precision={precision}
            scale={scale}
            timeframe={timeframe}
          />

          <g clipPath="url(#market-plot-clip)">
            {chartMode === 'candles' ? (
              <Candlesticks candles={candles} scale={scale} />
            ) : (
              <PriceLine candles={candles} scale={scale} />
            )}

            {latestPrice === null || !Number.isFinite(latestPrice) ? null : (
              <line
                x1={plotLeft}
                x2={plotRight}
                y1={scale.toY(latestPrice)}
                y2={scale.toY(latestPrice)}
                stroke="#38bdf8"
                strokeDasharray="5 6"
                strokeOpacity="0.55"
              />
            )}

            {hoverIndex === null || activeClose === null ? null : (
              <>
                <line
                  x1={activeX}
                  x2={activeX}
                  y1={plotTop}
                  y2={plotBottom}
                  stroke="#94a3b8"
                  strokeDasharray="4 5"
                  strokeOpacity="0.62"
                />
                <line
                  x1={plotLeft}
                  x2={plotRight}
                  y1={scale.toY(activeClose)}
                  y2={scale.toY(activeClose)}
                  stroke="#94a3b8"
                  strokeDasharray="4 5"
                  strokeOpacity="0.42"
                />
              </>
            )}
          </g>

          {latestPrice === null || !Number.isFinite(latestPrice) ? null : (
            <PriceMarker
              price={latestPrice}
              precision={precision}
              y={scale.toY(latestPrice)}
            />
          )}

          {candles.length === 0 ? (
            <g>
              <text
                x={(plotLeft + plotRight) / 2}
                y={chartHeight / 2 - 8}
                textAnchor="middle"
                fill="#cbd5e1"
                fontSize="20"
                fontWeight="700"
              >
                Loading market history
              </text>
              <text
                x={(plotLeft + plotRight) / 2}
                y={chartHeight / 2 + 24}
                textAnchor="middle"
                fill="#64748b"
                fontSize="14"
              >
                Historical OHLC bars will appear when the Deriv feed responds.
              </text>
            </g>
          ) : null}
        </svg>
      </div>
    </div>
  )
}

function ChartGrid({
  candles,
  precision,
  scale,
  timeframe
}: Readonly<{
  candles: readonly MarketCandle[]
  precision: number
  scale: PriceScale
  timeframe: ChartTimeframe
}>) {
  const horizontalLines = Array.from({ length: 7 }, (_, index) => index)
  const labelIndexes = axisLabelIndexes(candles.length, 7)

  return (
    <g>
      {horizontalLines.map((index) => {
        const ratio = index / (horizontalLines.length - 1)
        const y = plotTop + ratio * plotHeight
        const price = scale.max - ratio * (scale.max - scale.min)

        return (
          <g key={`price-${index}`}>
            <line
              x1={plotLeft}
              x2={plotRight}
              y1={y}
              y2={y}
              stroke="#182033"
              strokeWidth="1"
            />
            <text
              x={plotRight + 14}
              y={y + 4}
              fill="#64748b"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
              fontSize="12"
            >
              {formatPrice(price, precision)}
            </text>
          </g>
        )
      })}

      {labelIndexes.map((index) => {
        const candle = candles[index]
        const x = xPosition(index, candles.length)

        return candle === undefined ? null : (
          <g key={`time-${candle.epoch}-${index}`}>
            <line
              x1={x}
              x2={x}
              y1={plotTop}
              y2={plotBottom}
              stroke="#121a2b"
              strokeWidth="1"
            />
            <text
              x={x}
              y={plotBottom + 30}
              textAnchor="middle"
              fill="#64748b"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
              fontSize="12"
            >
              {formatAxisTime(candle.epoch, timeframe)}
            </text>
          </g>
        )
      })}

      <line
        x1={plotRight}
        x2={plotRight}
        y1={plotTop}
        y2={plotBottom}
        stroke="#253047"
      />
      <line
        x1={plotLeft}
        x2={plotRight}
        y1={plotBottom}
        y2={plotBottom}
        stroke="#253047"
      />
    </g>
  )
}

function Candlesticks({
  candles,
  scale
}: Readonly<{
  candles: readonly MarketCandle[]
  scale: PriceScale
}>) {
  const spacing = plotWidth / Math.max(candles.length, 1)
  const candleWidth = Math.max(3, Math.min(13, spacing * 0.66))

  return candles.map((candle, index) => {
    const open = Number(candle.open)
    const high = Number(candle.high)
    const low = Number(candle.low)
    const close = Number(candle.close)

    if (![open, high, low, close].every(Number.isFinite)) return null

    const x = xPosition(index, candles.length)
    const openY = scale.toY(open)
    const closeY = scale.toY(close)
    const bodyHeight = Math.max(2.5, Math.abs(closeY - openY))
    const bodyY = Math.min(openY, closeY) - (bodyHeight === 2.5 ? 1.25 : 0)
    const rising = close >= open
    const color = rising ? '#22c55e' : '#f43f5e'

    return (
      <g key={`${candle.epoch}-${index}`}>
        <line
          x1={x}
          x2={x}
          y1={scale.toY(high)}
          y2={scale.toY(low)}
          stroke={color}
          strokeWidth="1.5"
        />
        <rect
          x={x - candleWidth / 2}
          y={bodyY}
          width={candleWidth}
          height={bodyHeight}
          fill={color}
          rx="1"
        />
      </g>
    )
  })
}

function PriceLine({
  candles,
  scale
}: Readonly<{
  candles: readonly MarketCandle[]
  scale: PriceScale
}>) {
  const points = candles.flatMap((candle, index) => {
    const close = Number(candle.close)
    return Number.isFinite(close)
      ? [{ x: xPosition(index, candles.length), y: scale.toY(close) }]
      : []
  })

  if (points.length === 0) return null

  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')
  const first = points[0]
  const last = points.at(-1)
  const areaPath =
    first === undefined || last === undefined
      ? ''
      : `${linePath} L ${last.x} ${plotBottom} L ${first.x} ${plotBottom} Z`

  return (
    <g>
      <path d={areaPath} fill="url(#line-area-gradient)" />
      <path
        d={linePath}
        fill="none"
        stroke="#38bdf8"
        strokeWidth="2.25"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {last === undefined ? null : (
        <circle
          cx={last.x}
          cy={last.y}
          r="4.5"
          fill="#7dd3fc"
          stroke="#050814"
          strokeWidth="2.5"
        />
      )}
    </g>
  )
}

function PriceMarker({
  price,
  precision,
  y
}: Readonly<{ price: number; precision: number; y: number }>) {
  return (
    <g>
      <rect
        x={plotRight + 6}
        y={y - 13}
        width="112"
        height="26"
        rx="5"
        fill="#0ea5e9"
      />
      <text
        x={plotRight + 62}
        y={y + 4}
        textAnchor="middle"
        fill="#020617"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        fontSize="12"
        fontWeight="800"
      >
        {formatPrice(price, precision)}
      </text>
    </g>
  )
}

function QuoteValue({
  label,
  negative = false,
  positive = false,
  value
}: Readonly<{
  label: string
  negative?: boolean
  positive?: boolean
  value: string
}>) {
  const valueClass = positive
    ? 'text-emerald-400'
    : negative
      ? 'text-rose-400'
      : 'text-slate-200'

  return (
    <span>
      {label} <span className={valueClass}>{value}</span>
    </span>
  )
}

function createPriceScale(values: readonly number[]): PriceScale {
  const low = values.length === 0 ? 0 : Math.min(...values)
  const high = values.length === 0 ? 1 : Math.max(...values)
  const padding = Math.max((high - low) * 0.09, Math.abs(high) * 0.00008, 0.001)
  const min = low - padding
  const max = high + padding
  const range = Math.max(max - min, Number.EPSILON)

  return {
    min,
    max,
    toY: (value) => plotBottom - ((value - min) / range) * plotHeight
  }
}

function xPosition(index: number, count: number): number {
  if (count < 2) return (plotLeft + plotRight) / 2
  const spacing = plotWidth / count
  return plotLeft + spacing * index + spacing / 2
}

function axisLabelIndexes(
  count: number,
  targetCount: number
): readonly number[] {
  if (count === 0) return []
  if (count === 1) return [0]

  return Array.from(
    new Set(
      Array.from({ length: targetCount }, (_, index) =>
        Math.round((index / (targetCount - 1)) * (count - 1))
      )
    )
  )
}

function candleChange(candle: MarketCandle | undefined): number {
  if (candle === undefined) return 0
  const open = Number(candle.open)
  const close = Number(candle.close)
  return !Number.isFinite(open) || !Number.isFinite(close) || open === 0
    ? 0
    : ((close - open) / open) * 100
}

function formatPrice(value: number, precision: number): string {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: Math.min(2, precision),
    maximumFractionDigits: precision,
    useGrouping: false
  }).format(value)
}

function formatAxisTime(epoch: number, timeframe: ChartTimeframe): string {
  return new Intl.DateTimeFormat(undefined, {
    month: timeframe === '1 hour' ? 'short' : undefined,
    day: timeframe === '1 hour' ? 'numeric' : undefined,
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(epoch * 1_000))
}

function formatDateTime(epoch: number, timeframe: ChartTimeframe): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: timeframe === '1 tick' ? '2-digit' : undefined
  }).format(new Date(epoch * 1_000))
}
