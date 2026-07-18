import { z } from 'zod'
import { apiRequest, apiTextRequest } from '../../../shared/api/httpClient'
import type { TradeRecord, TradeRecordFilters } from '../types/records.types'

const recordSchema = z.object({
  id: z.string(),
  sessionId: z.string().nullable(),
  accountId: z.string(),
  derivContractId: z.string(),
  market: z.string(),
  contractType: z.string(),
  prediction: z.string().nullable(),
  stake: z.string(),
  potentialPayout: z.string().nullable(),
  status: z.enum([
    'pending',
    'open',
    'won',
    'lost',
    'sold_early',
    'expired',
    'cancelled',
    'error'
  ]),
  profitLoss: z.string().nullable(),
  openedAt: z.string().datetime().nullable(),
  closedAt: z.string().datetime().nullable(),
  source: z.enum(['bot', 'bulk', 'copy']),
  sourceReference: z.string(),
  masterAccountId: z.string().nullable(),
  masterDerivContractId: z.string().nullable(),
  derivStatus: z.string(),
  entryValue: z.string().nullable(),
  currentValue: z.string().nullable(),
  remainingDuration: z.string().nullable(),
  payout: z.string().nullable(),
  martingaleStep: z.number().int().nullable(),
  bulkRunId: z.string().nullable(),
  copySessionId: z.string().nullable()
})

function parse<T>(schema: z.ZodType<T>) {
  return (data: unknown): T | null => {
    const parsed = schema.safeParse(data)
    return parsed.success ? parsed.data : null
  }
}

function query(filters: TradeRecordFilters): string {
  const search = new URLSearchParams()
  if (filters.market.trim().length > 0)
    search.set('market', filters.market.trim())
  if (filters.source.length > 0) search.set('source', filters.source)
  if (filters.status.length > 0) search.set('status', filters.status)
  if (filters.search.trim().length > 0)
    search.set('search', filters.search.trim())
  const value = search.toString()
  return value.length === 0 ? '' : `?${value}`
}

export function getOpenTrades(
  filters: TradeRecordFilters
): Promise<readonly TradeRecord[]> {
  return apiRequest(
    `/api/v1/records/open${query(filters)}`,
    parse(z.array(recordSchema))
  )
}

export function getTradeHistory(
  filters: TradeRecordFilters
): Promise<readonly TradeRecord[]> {
  return apiRequest(
    `/api/v1/records/history${query(filters)}`,
    parse(z.array(recordSchema))
  )
}

export function downloadTradeHistory(
  filters: TradeRecordFilters
): Promise<string> {
  return apiTextRequest(`/api/v1/records/history/export${query(filters)}`)
}
