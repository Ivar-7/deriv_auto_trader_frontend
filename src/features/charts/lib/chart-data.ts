import type {
  MarketCandle,
  MarketCandleHistory,
  MarketTick
} from '../../analysis/types/analysis.types'

export const chartTimeframes = [
  '1 tick',
  '1 minute',
  '5 minutes',
  '1 hour'
] as const

export type ChartTimeframe = (typeof chartTimeframes)[number]

export function candlesForTimeframe(
  ticks: readonly MarketTick[],
  history: MarketCandleHistory,
  timeframe: ChartTimeframe
): readonly MarketCandle[] {
  if (timeframe === '1 minute') return history.oneMinute
  if (timeframe === '5 minutes') return history.fiveMinutes
  if (timeframe === '1 hour') return history.oneHour

  return ticks.flatMap((tick) => {
    const quote = Number(tick.quote)

    return Number.isFinite(quote)
      ? [
          {
            epoch: tick.epoch,
            open: tick.quote,
            high: tick.quote,
            low: tick.quote,
            close: tick.quote
          }
        ]
      : []
  })
}

export function decimalPlaces(values: readonly string[]): number {
  return Math.min(
    8,
    Math.max(2, ...values.map((value) => value.split('.')[1]?.length ?? 0))
  )
}
