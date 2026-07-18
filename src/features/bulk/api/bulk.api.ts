import { z } from 'zod'
import { apiRequest } from '../../../shared/api/httpClient'
import type {
  AutoBulkProfile,
  BulkRun,
  BulkRunConfiguration
} from '../types/bulk.types'

const configurationSchema = z.object({
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
})

const bulkRunSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  currency: z.string(),
  source: z.enum(['manual', 'smart', 'scanner']),
  sourceReference: z.string().nullable(),
  configuration: configurationSchema,
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

const profileConfigSchema = configurationSchema.omit({
  market: true,
  outcome: true,
  barrier: true
})
const profileSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  enabled: z.boolean(),
  market: z.string().nullable(),
  configuration: profileConfigSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
})

function parse<T>(schema: z.ZodType<T>) {
  return (data: unknown): T | null => {
    const result = schema.safeParse(data)
    return result.success ? result.data : null
  }
}

export function getBulkRuns(): Promise<readonly BulkRun[]> {
  return apiRequest('/api/v1/bulk/runs', parse(z.array(bulkRunSchema)))
}

export function startBulkRun(
  configuration: BulkRunConfiguration
): Promise<BulkRun> {
  return apiRequest('/api/v1/bulk/runs', parse(bulkRunSchema), {
    method: 'POST',
    body: JSON.stringify({ configuration })
  })
}

export function actOnBulkRun(
  runId: string,
  action: 'pause' | 'resume' | 'stop'
): Promise<BulkRun> {
  return apiRequest(
    `/api/v1/bulk/runs/${encodeURIComponent(runId)}/actions`,
    parse(bulkRunSchema),
    { method: 'POST', body: JSON.stringify({ action }) }
  )
}

export function getAutoBulkProfiles(): Promise<readonly AutoBulkProfile[]> {
  return apiRequest('/api/v1/bulk/auto-profiles', parse(z.array(profileSchema)))
}

export function saveAutoBulkProfile(
  input: Omit<AutoBulkProfile, 'id' | 'accountId' | 'createdAt' | 'updatedAt'>
): Promise<AutoBulkProfile> {
  return apiRequest('/api/v1/bulk/auto-profiles', parse(profileSchema), {
    method: 'POST',
    body: JSON.stringify(input)
  })
}
