import { z } from 'zod'
import { apiRequest } from '../../../shared/api/httpClient'
import type {
  AnalysisParameters,
  ActiveMarketSymbol,
  MarketAnalysis,
  MarketScannerObservation,
  ReplayTickInput
} from '../types/analysis.types'

const dataStateSchema = z.enum([
  'idle',
  'connecting',
  'live',
  'stale',
  'disconnected',
  'error'
])

const tickSchema = z.object({
  market: z.string(),
  symbol: z.string(),
  epoch: z.number().int(),
  quote: z.string(),
  digit: z.number().int().min(0).max(9),
  priceChange: z.string().nullable(),
  direction: z.enum(['UP', 'DOWN', 'FLAT']),
  latencyMs: z.number().nullable(),
  receivedAt: z.string().datetime()
})

const candleSchema = z.object({
  epoch: z.number().int().nonnegative(),
  open: z.string(),
  high: z.string(),
  low: z.string(),
  close: z.string()
})

const streakSummarySchema = z.object({
  current: z.string().nullable(),
  currentLength: z.number().int().nonnegative(),
  averageLength: z.number().nonnegative().nullable(),
  longestRecent: z.number().int().nonnegative()
})

const analysisSchema = z.object({
  market: z.string(),
  health: z.object({
    state: dataStateSchema,
    lastTickAt: z.string().datetime().nullable(),
    latencyMs: z.number().nullable(),
    movementBufferSize: z.number().int().nonnegative(),
    digitBufferSize: z.number().int().nonnegative()
  }),
  latestTick: tickSchema.nullable(),
  recentTicks: z.array(tickSchema),
  candles: z.object({
    oneMinute: z.array(candleSchema),
    fiveMinutes: z.array(candleSchema),
    oneHour: z.array(candleSchema)
  }),
  movement: z.object({
    rising: z.number().int().nonnegative(),
    falling: z.number().int().nonnegative(),
    neutral: z.number().int().nonnegative(),
    directionalCount: z.number().int().nonnegative(),
    risingConfidence: z.number().nullable(),
    fallingConfidence: z.number().nullable(),
    dominantDirection: z.enum(['rising', 'falling']).nullable(),
    dominantConfidence: z.number().nullable(),
    meetsConfiguredThreshold: z.boolean()
  }),
  digitBoard: z.array(
    z.object({
      digit: z.number().int().min(0).max(9),
      count: z.number().int().nonnegative(),
      observedPercentage: z.number().min(0).max(1),
      isLatest: z.boolean()
    })
  ),
  digits: z.object({
    sampleSize: z.number().int().nonnegative(),
    evenCount: z.number().int().nonnegative(),
    oddCount: z.number().int().nonnegative(),
    overCount: z.number().int().nonnegative(),
    underCount: z.number().int().nonnegative(),
    equalToBarrierCount: z.number().int().nonnegative(),
    matchesCount: z.number().int().nonnegative(),
    differsCount: z.number().int().nonnegative(),
    evenObservedPercentage: z.number().nullable(),
    oddObservedPercentage: z.number().nullable(),
    overObservedPercentage: z.number().nullable(),
    underObservedPercentage: z.number().nullable(),
    equalToBarrierObservedPercentage: z.number().nullable(),
    matchesObservedPercentage: z.number().nullable(),
    differsObservedPercentage: z.number().nullable()
  }),
  streaks: z.object({
    direction: z
      .object({
        direction: z.enum(['UP', 'DOWN', 'FLAT']),
        length: z.number().int().positive()
      })
      .nullable(),
    digit: z
      .object({
        digit: z.number().int().min(0).max(9),
        length: z.number().int().positive()
      })
      .nullable()
  }),
  parameters: z.object({
    movementWindow: z.number().int().min(10).max(100),
    digitWindow: z.number().int().min(10).max(1000),
    barrier: z.number().int().min(0).max(9),
    confidenceThreshold: z.number().min(0.5).max(1)
  }),
  digitFrequency: z.array(
    z.object({
      window: z.number().int(),
      sampleSize: z.number().int().nonnegative(),
      digits: z.array(
        z.object({
          digit: z.number().int().min(0).max(9),
          count: z.number().int().nonnegative(),
          percentage: z.number().min(0).max(1),
          deviationFromExpected: z.number()
        })
      ),
      hottestDigit: z.number().int().min(0).max(9).nullable(),
      coldestDigit: z.number().int().min(0).max(9).nullable()
    })
  ),
  digitStreaks: z.object({
    repeatedDigits: streakSummarySchema,
    evenOdd: streakSummarySchema,
    overUnder: streakSummarySchema
  }),
  tickPressure: z.array(
    z.object({
      window: z.number().int(),
      sampleSize: z.number().int().nonnegative(),
      upTicks: z.number().int().nonnegative(),
      downTicks: z.number().int().nonnegative(),
      flatTicks: z.number().int().nonnegative(),
      pressure: z.number().min(-1).max(1).nullable(),
      classification: z.enum([
        'Strong Up',
        'Up',
        'Neutral',
        'Down',
        'Strong Down'
      ]),
      consecutiveUp: z.number().int().nonnegative(),
      consecutiveDown: z.number().int().nonnegative(),
      volatility: z.number().nonnegative().nullable()
    })
  ),
  anomalies: z.array(
    z.object({
      digit: z.number().int().min(0).max(9),
      count: z.number().int().nonnegative(),
      sampleSize: z.number().int().nonnegative(),
      observedPercentage: z.number().min(0).max(1).nullable(),
      expectedPercentage: z.literal(0.1),
      zScore: z.number().nullable(),
      label: z.enum(['Normal', 'Mild', 'Significant', 'Extreme'])
    })
  ),
  updatedAt: z.string().datetime()
})

const scannerSchema = z.object({
  market: z.string(),
  dataState: dataStateSchema,
  proposedDigit: z.number().int().min(0).max(9).nullable(),
  proposedDigitCount: z.number().int().nonnegative(),
  longestAbsence: z.number().int().nonnegative(),
  observedDiffersPercentage: z.number().nullable(),
  theoreticalBaseline: z.number().min(0).max(1),
  normalizedDeviation: z.number().nullable(),
  activityScore: z.number().min(0).max(100),
  activityComponents: z.object({
    directionalPressure: z.number().min(0).max(100),
    volatility: z.number().min(0).max(100),
    digitFrequencyDeviation: z.number().min(0).max(100),
    streakAnomaly: z.number().min(0).max(100),
    tickActivity: z.number().min(0).max(100)
  })
})

const activeSymbolSchema = z.object({
  symbol: z.string(),
  displayName: z.string(),
  market: z.string(),
  submarket: z.string(),
  pipSize: z.number().int().min(0).max(12).nullable()
})

function parse<T>(schema: z.ZodType<T>) {
  return (data: unknown): T | null => {
    const result = schema.safeParse(data)
    return result.success ? result.data : null
  }
}

export function subscribeToMarket(market: string): Promise<MarketAnalysis> {
  return apiRequest('/api/v1/markets/subscribe', parse(analysisSchema), {
    method: 'POST',
    body: JSON.stringify({ market })
  })
}

export function unsubscribeFromMarket(
  market: string
): Promise<{ market: string }> {
  return apiRequest(
    '/api/v1/markets/unsubscribe',
    parse(z.object({ market: z.string() })),
    {
      method: 'POST',
      body: JSON.stringify({ market })
    }
  )
}

export function getActiveSymbols(): Promise<readonly ActiveMarketSymbol[]> {
  return apiRequest(
    '/api/v1/markets/symbols',
    parse(z.array(activeSymbolSchema))
  )
}

export function replayMarket(
  market: string,
  ticks: readonly ReplayTickInput[]
): Promise<MarketAnalysis> {
  return apiRequest('/api/v1/markets/replay', parse(analysisSchema), {
    method: 'POST',
    body: JSON.stringify({ market, ticks })
  })
}

export function getMarketAnalysis(
  market: string,
  parameters: AnalysisParameters
): Promise<MarketAnalysis> {
  const search = new URLSearchParams({
    movementWindow: String(parameters.movementWindow),
    digitWindow: String(parameters.digitWindow),
    barrier: String(parameters.barrier),
    confidenceThreshold: String(parameters.confidenceThreshold)
  })
  return apiRequest(
    `/api/v1/markets/${encodeURIComponent(market)}/analysis?${search.toString()}`,
    parse(analysisSchema)
  )
}

export function subscribeToScanner(
  markets: readonly string[]
): Promise<readonly MarketScannerObservation[]> {
  return apiRequest(
    '/api/v1/markets/scanner/subscribe',
    parse(z.array(scannerSchema)),
    {
      method: 'POST',
      body: JSON.stringify({ markets })
    }
  )
}

export function getScanner(
  markets: readonly string[]
): Promise<readonly MarketScannerObservation[]> {
  const search = new URLSearchParams({ markets: markets.join(',') })
  return apiRequest(
    `/api/v1/markets/scanner?${search.toString()}`,
    parse(z.array(scannerSchema))
  )
}
