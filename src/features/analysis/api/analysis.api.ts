import { z } from 'zod'
import { apiRequest } from '../../../shared/api/httpClient'
import type {
  AnalysisParameters,
  MarketAnalysis,
  MarketScannerObservation
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
  epoch: z.number().int(),
  quote: z.string(),
  digit: z.number().int().min(0).max(9),
  direction: z.enum(['rising', 'falling', 'neutral']),
  latencyMs: z.number().nullable(),
  receivedAt: z.string().datetime()
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
        direction: z.enum(['rising', 'falling', 'neutral']),
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
    movementWindow: z.number().int().min(20).max(50),
    digitWindow: z.number().int().min(100).max(500),
    barrier: z.number().int().min(0).max(9),
    confidenceThreshold: z.number().min(0.5).max(1)
  }),
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
  normalizedDeviation: z.number().nullable()
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
