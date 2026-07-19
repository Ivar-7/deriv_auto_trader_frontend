import { describe, expect, it } from 'vitest'
import type {
  MarketCandleHistory,
  MarketTick
} from '../../analysis/types/analysis.types'
import { candlesForTimeframe, decimalPlaces } from './chart-data'

const tick: MarketTick = {
  market: 'R_100',
  symbol: 'R_100',
  epoch: 1_700_000_000,
  quote: '123.450',
  digit: 0,
  priceChange: null,
  direction: 'FLAT',
  latencyMs: 10,
  receivedAt: '2026-01-01T00:00:00.000Z'
}

const history: MarketCandleHistory = {
  oneMinute: [
    {
      epoch: tick.epoch,
      open: '123.100',
      high: '123.900',
      low: '123.000',
      close: '123.450'
    }
  ],
  fiveMinutes: [],
  oneHour: []
}

describe('chart data', () => {
  it('uses real historical OHLC data for time-based views', () => {
    expect(candlesForTimeframe([tick], history, '1 minute')).toEqual(
      history.oneMinute
    )
  })

  it('turns individual ticks into one-price candles for the tick view', () => {
    expect(candlesForTimeframe([tick], history, '1 tick')[0]).toMatchObject({
      epoch: tick.epoch,
      open: tick.quote,
      close: tick.quote
    })
  })

  it('preserves useful quote precision', () => {
    expect(decimalPlaces(['1.2', '2.345'])).toBe(3)
  })
})
