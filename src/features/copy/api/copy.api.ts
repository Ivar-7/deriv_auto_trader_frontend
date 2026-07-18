import { z } from 'zod'
import { apiRequest } from '../../../shared/api/httpClient'
import type {
  CopyAction,
  CopySubAccountConfiguration,
  CopyTradingSession
} from '../types/copy.types'

const decimal = z.string()
const configurationSchema = z.object({
  accountId: z.string(),
  enabled: z.boolean(),
  stakeMode: z.enum(['fixed', 'proportional']),
  fixedStake: decimal.nullable(),
  proportionalMultiplier: decimal.nullable(),
  maximumStake: decimal.nullable(),
  stopLoss: decimal.nullable(),
  allowedContractTypes: z.array(z.string())
})
const entrySchema = z.object({
  id: z.string(),
  masterDerivContractId: z.string(),
  derivContractId: z.string().nullable(),
  status: z.string(),
  proposedStake: decimal,
  stake: decimal.nullable(),
  potentialPayout: decimal.nullable(),
  profitLoss: z.string().nullable(),
  rejectionReason: z.string().nullable(),
  submittedAt: z.string().datetime(),
  settledAt: z.string().datetime().nullable()
})
const subSchema = z.object({
  configuration: configurationSchema,
  state: z.enum(['running', 'paused', 'stopped', 'risk_limit_reached']),
  statistics: z.object({
    requested: z.number().int(),
    submitted: z.number().int(),
    accepted: z.number().int(),
    rejected: z.number().int(),
    pending: z.number().int(),
    open: z.number().int(),
    won: z.number().int(),
    lost: z.number().int(),
    totalStake: decimal,
    totalProfitLoss: z.string()
  }),
  entries: z.array(entrySchema)
})
const sessionSchema = z.object({
  id: z.string(),
  masterAccountId: z.string(),
  state: z.enum(['running', 'paused', 'stopped', 'risk_limit_reached']),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime().nullable(),
  subAccounts: z.array(subSchema)
})

function parse<T>(schema: z.ZodType<T>) {
  return (data: unknown): T | null => {
    const parsed = schema.safeParse(data)
    return parsed.success ? parsed.data : null
  }
}

export function getCopySessions(): Promise<readonly CopyTradingSession[]> {
  return apiRequest('/api/v1/copy/sessions', parse(z.array(sessionSchema)))
}

export function createCopySession(
  masterAccountId: string,
  subAccounts: readonly CopySubAccountConfiguration[]
): Promise<CopyTradingSession> {
  return apiRequest('/api/v1/copy/sessions', parse(sessionSchema), {
    method: 'POST',
    body: JSON.stringify({ masterAccountId, subAccounts })
  })
}

export function actOnCopySession(
  sessionId: string,
  action: CopyAction
): Promise<CopyTradingSession> {
  return apiRequest(
    `/api/v1/copy/sessions/${encodeURIComponent(sessionId)}/actions`,
    parse(sessionSchema),
    { method: 'POST', body: JSON.stringify({ action }) }
  )
}

export function actOnCopySubAccount(
  sessionId: string,
  accountId: string,
  action: CopyAction
): Promise<CopyTradingSession> {
  return apiRequest(
    `/api/v1/copy/sessions/${encodeURIComponent(sessionId)}/sub-accounts/${encodeURIComponent(accountId)}/actions`,
    parse(sessionSchema),
    { method: 'POST', body: JSON.stringify({ action }) }
  )
}
