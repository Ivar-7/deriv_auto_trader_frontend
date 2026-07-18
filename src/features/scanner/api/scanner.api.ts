import { z } from 'zod'
import { apiRequest } from '../../../shared/api/httpClient'
import type {
  DiffersScannerResult,
  ScannerBulkConfiguration,
  ScannerMarket
} from '../types/scanner.types'
import type { BulkRun } from '../../bulk/types/bulk.types'

const scannerMarketSchema = z.object({
  symbol: z.string(),
  displayName: z.string(),
  market: z.string(),
  submarket: z.string()
})

const scannerResultSchema = z.object({
  market: z.string(),
  dataState: z.enum([
    'idle',
    'connecting',
    'live',
    'stale',
    'disconnected',
    'error'
  ]),
  proposedDigit: z.number().int().min(0).max(9).nullable(),
  proposedDigitCount: z.number().int(),
  longestAbsence: z.number().int(),
  observedDiffersPercentage: z.number().nullable(),
  theoreticalBaseline: z.number(),
  normalizedDeviation: z.number().nullable(),
  confirmationCount: z.number().int().min(0).max(3),
  confirmationState: z.enum(['monitoring', 'confirmed']),
  minimumSignalStrength: z.number(),
  qualifiesForExecution: z.boolean(),
  evaluatedAt: z.string().datetime()
})

function parse<T>(schema: z.ZodType<T>) {
  return (data: unknown): T | null => {
    const result = schema.safeParse(data)
    return result.success ? result.data : null
  }
}

export function getScannerMarkets(): Promise<readonly ScannerMarket[]> {
  return apiRequest(
    '/api/v1/scanner/markets',
    parse(z.array(scannerMarketSchema))
  )
}

export function subscribeScanner(
  markets: readonly string[],
  minimumSignalStrength: number
): Promise<readonly DiffersScannerResult[]> {
  return apiRequest(
    '/api/v1/scanner/subscribe',
    parse(z.array(scannerResultSchema)),
    {
      method: 'POST',
      body: JSON.stringify({ markets, minimumSignalStrength })
    }
  )
}

export function evaluateScanner(
  markets: readonly string[],
  minimumSignalStrength: number
): Promise<readonly DiffersScannerResult[]> {
  const query = new URLSearchParams({
    markets: markets.join(','),
    minimumSignalStrength: String(minimumSignalStrength)
  })
  return apiRequest(
    `/api/v1/scanner/evaluate?${query.toString()}`,
    parse(z.array(scannerResultSchema))
  )
}

export function startScannerBulk(
  market: string,
  minimumSignalStrength: number,
  configuration: ScannerBulkConfiguration
): Promise<BulkRun> {
  return apiRequest(
    `/api/v1/scanner/${encodeURIComponent(market)}/bulk`,
    parseBulkRun,
    {
      method: 'POST',
      body: JSON.stringify({ minimumSignalStrength, configuration })
    }
  )
}

const parseBulkRun = (data: unknown): BulkRun | null => {
  const result = bulkRunSchema.safeParse(data)
  return result.success ? result.data : null
}

const bulkRunSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  currency: z.string(),
  source: z.enum(['manual', 'smart', 'scanner']),
  sourceReference: z.string().nullable(),
  configuration: z.object({
    market: z.string(),
    outcome: z.enum(['differs', 'matches', 'over', 'under', 'rise', 'fall']),
    barrier: z.number().int().nullable(),
    stake: z.string(),
    duration: z.number().int(),
    durationUnit: z.enum(['t', 's', 'm', 'h', 'd']),
    count: z.number().int(),
    entryDelaySeconds: z.number().int(),
    maximumActiveContracts: z.number().int(),
    stopLoss: z.string().nullable(),
    takeProfit: z.string().nullable()
  }),
  state: z.string(),
  startedAt: z.string().datetime().nullable(),
  endedAt: z.string().datetime().nullable(),
  statistics: z.object({
    requested: z.number().int(),
    submitted: z.number().int(),
    accepted: z.number().int(),
    rejected: z.number().int(),
    pending: z.number().int(),
    open: z.number().int(),
    won: z.number().int(),
    lost: z.number().int(),
    cancelledBeforeSubmission: z.number().int(),
    totalStake: z.string(),
    totalPayout: z.string(),
    totalProfitLoss: z.string()
  }),
  entries: z.array(z.unknown())
})
