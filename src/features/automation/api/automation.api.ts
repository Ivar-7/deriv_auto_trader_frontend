import { z } from 'zod'
import { apiRequest } from '../../../shared/api/httpClient'
import { getAccountSession } from '../../accounts/api/accounts.api'
import type {
  AccountRiskProfile,
  ActivityEvent,
  AutomationCycle,
  AutomationSession,
  ContractPreview,
  ContractPreviewInput,
  RiskSnapshot,
  SafetySnapshot,
  SessionRiskLimits,
  TrackedContract
} from '../types/automation.types'

const moneySchema = z.string().regex(/^-?[0-9]+(?:\.[0-9]{1,8})?$/)
const nonNegativeMoneySchema = z.string().regex(/^[0-9]+(?:\.[0-9]{1,8})?$/)

const sessionSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  botType: z.string(),
  market: z.string(),
  state: z.enum([
    'idle',
    'starting',
    'running',
    'paused',
    'stopping',
    'stopped',
    'reconnecting',
    'risk_limit_reached',
    'completed',
    'error'
  ]),
  startedAt: z.string().datetime().nullable(),
  endedAt: z.string().datetime().nullable(),
  runningProfitLoss: moneySchema
})

const previewSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  currency: z.string(),
  proposalId: z.string(),
  input: z.object({
    botType: z.string(),
    market: z.string(),
    contractType: z.enum(['CALL', 'PUT']),
    stake: nonNegativeMoneySchema,
    duration: z.number().int().positive(),
    durationUnit: z.enum(['t', 's', 'm', 'h', 'd']),
    barrier: z.string().nullable()
  }),
  askPrice: nonNegativeMoneySchema,
  potentialPayout: nonNegativeMoneySchema,
  description: z.string().nullable(),
  expiresAt: z.string().datetime()
})

const trackedContractSchema = z.object({
  contractId: z.string(),
  status: z.string(),
  buyPrice: z.string().nullable(),
  currentSpot: z.string().nullable(),
  profitLoss: z.string().nullable(),
  isSold: z.boolean(),
  derivStatus: z.string(),
  platformStatus: z.enum([
    'pending',
    'open',
    'won',
    'lost',
    'sold_early',
    'expired',
    'cancelled',
    'error'
  ]),
  canSell: z.boolean(),
  canCancel: z.boolean(),
  actionReason: z.string().nullable()
})

const accountRiskProfileSchema = z.object({
  limits: z.object({
    accountId: z.string(),
    maximumActiveContracts: z.number().int().positive(),
    maximumSingleTradeStake: nonNegativeMoneySchema,
    maximumCombinedRunningLoss: nonNegativeMoneySchema
  }),
  emergencyStopActive: z.boolean(),
  updatedAt: z.string().datetime()
})

const sessionRiskSchema = z.object({
  sessionId: z.string(),
  stopLoss: nonNegativeMoneySchema.nullable(),
  takeProfit: nonNegativeMoneySchema.nullable(),
  maximumTrades: z.number().int().positive().nullable(),
  maximumConsecutiveLosses: z.number().int().positive().nullable(),
  maximumCumulativeStake: nonNegativeMoneySchema.nullable()
})

const riskSnapshotSchema = z.object({
  account: accountRiskProfileSchema,
  sessions: z.array(sessionRiskSchema)
})

const cycleSchema = z.object({
  accountId: z.string(),
  isActive: z.boolean(),
  startedAt: z.string().datetime().nullable(),
  endedAt: z.string().datetime().nullable(),
  runningProfitLoss: moneySchema
})

const activitySchema = z.object({
  id: z.string(),
  occurredAt: z.string().datetime(),
  category: z.string(),
  event: z.string(),
  accountId: z.string(),
  market: z.string().nullable(),
  sessionId: z.string().nullable(),
  status: z.string(),
  details: z.record(
    z.string(),
    z.union([z.string(), z.number(), z.boolean(), z.null()])
  )
})

function parse<T>(schema: z.ZodType<T>) {
  return (data: unknown): T | null => {
    const result = schema.safeParse(data)
    return result.success ? result.data : null
  }
}

export async function getSafetySnapshot(): Promise<SafetySnapshot> {
  const [risk, cycle, sessions, contracts, activity] = await Promise.all([
    apiRequest('/api/v1/automation/risk', parse(riskSnapshotSchema)),
    apiRequest('/api/v1/automation/cycle', parse(cycleSchema)),
    apiRequest('/api/v1/automation/sessions', parse(z.array(sessionSchema))),
    apiRequest(
      '/api/v1/automation/open-contracts',
      parse(z.array(trackedContractSchema))
    ),
    apiRequest(
      '/api/v1/automation/activity?limit=20',
      parse(z.array(activitySchema))
    )
  ])

  return { risk, cycle, sessions, contracts, activity }
}

export async function getSafetyConsoleData() {
  const accountSession = await getAccountSession()

  if (accountSession.selectedAccountId === null) {
    return { accountSession, selectedAccountId: null, snapshot: null }
  }

  const snapshot = await getSafetySnapshot()
  return {
    accountSession,
    selectedAccountId: accountSession.selectedAccountId,
    snapshot
  }
}

export function requestContractPreview(
  input: ContractPreviewInput
): Promise<ContractPreview> {
  return apiRequest('/api/v1/automation/previews', parse(previewSchema), {
    method: 'POST',
    body: JSON.stringify({
      ...input,
      ...(input.barrier === null ? {} : { barrier: input.barrier })
    })
  })
}

export function startGuardedSession(
  previewId: string
): Promise<AutomationSession> {
  return apiRequest('/api/v1/automation/sessions', parse(sessionSchema), {
    method: 'POST',
    body: JSON.stringify({ previewId })
  })
}

export function changeSessionState(
  sessionId: string,
  action: 'pause' | 'resume' | 'stop'
): Promise<AutomationSession> {
  return apiRequest(
    `/api/v1/automation/sessions/${encodeURIComponent(sessionId)}/actions`,
    parse(sessionSchema),
    { method: 'POST', body: JSON.stringify({ action }) }
  )
}

export function updateAccountRisk(
  input: Omit<AccountRiskProfile['limits'], 'accountId'>
): Promise<AccountRiskProfile> {
  return apiRequest(
    '/api/v1/automation/risk/account',
    parse(accountRiskProfileSchema),
    { method: 'PUT', body: JSON.stringify(input) }
  )
}

export function activateEmergencyStop(): Promise<{
  profile: AccountRiskProfile
  stoppedSessions: readonly AutomationSession[]
}> {
  return apiRequest(
    '/api/v1/automation/emergency-stop',
    parse(
      z.object({
        profile: accountRiskProfileSchema,
        stoppedSessions: z.array(sessionSchema)
      })
    ),
    { method: 'POST' }
  )
}

export function clearEmergencyStop(): Promise<AccountRiskProfile> {
  return apiRequest(
    '/api/v1/automation/emergency-stop/reset',
    parse(accountRiskProfileSchema),
    {
      method: 'POST',
      body: JSON.stringify({ confirmation: 'RESUME_AUTOMATION' })
    }
  )
}

export type {
  AccountRiskProfile,
  ActivityEvent,
  AutomationCycle,
  AutomationSession,
  ContractPreview,
  RiskSnapshot,
  SessionRiskLimits,
  TrackedContract
}
