import { z } from 'zod'
import { apiRequest } from '../../../shared/api/httpClient'
import type {
  BotConfiguration,
  BotSession,
  SavedBotConfiguration
} from '../types/bots.types'

const durationUnitSchema = z.enum(['t', 's', 'm', 'h', 'd'])
const outcomeSchema = z.enum([
  'rise',
  'fall',
  'over',
  'under',
  'even',
  'odd',
  'matches',
  'differs'
])

const configurationSchema = z.object({
  botType: z.enum([
    'rise_fall',
    'over_under',
    'even_odd',
    'matches_differs',
    'smart_auto'
  ]),
  market: z.string(),
  outcome: outcomeSchema.nullable(),
  barrier: z.number().int().min(0).max(9).nullable(),
  stake: z.string(),
  duration: z.number().int(),
  durationUnit: durationUnitSchema,
  movementWindow: z.number().int(),
  digitWindow: z.number().int(),
  confidenceThreshold: z.number(),
  minimumSignalStrength: z.number(),
  entryDelaySeconds: z.number().int(),
  martingale: z.object({
    enabled: z.boolean(),
    multiplier: z.string(),
    maxSteps: z.number().int(),
    maxStake: z.string().nullable(),
    resetAfterWin: z.boolean(),
    resetAtSessionEnd: z.boolean()
  }),
  limits: z.object({
    stopLoss: z.string().nullable(),
    takeProfit: z.string().nullable(),
    maximumTrades: z.number().int().nullable(),
    maximumConsecutiveLosses: z.number().int().nullable(),
    maximumSingleStake: z.string().nullable(),
    maximumCumulativeStake: z.string().nullable()
  })
})

const signalSchema = z.object({
  outcome: z.enum([
    'rise',
    'fall',
    'over',
    'under',
    'even',
    'odd',
    'matches',
    'differs',
    'no_signal'
  ]),
  observedConfidence: z.number().nullable(),
  theoreticalBaseline: z.number().nullable(),
  signalStrength: z.number().nullable(),
  reason: z.string(),
  evaluatedAt: z.string().datetime()
})

const botSessionSchema = z.object({
  id: z.string(),
  configurationId: z.string().nullable(),
  accountId: z.string(),
  currency: z.string(),
  configuration: configurationSchema,
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
  currentSignal: signalSchema,
  martingale: z.object({
    step: z.number().int(),
    nextStake: z.string(),
    lastTransition: z.enum([
      'initial',
      'advanced_after_loss',
      'reset_after_win',
      'reset_at_session_end'
    ])
  }),
  statistics: z.object({
    submittedTrades: z.number().int(),
    acceptedTrades: z.number().int(),
    openTrades: z.number().int(),
    wonTrades: z.number().int(),
    lostTrades: z.number().int(),
    consecutiveLosses: z.number().int(),
    totalStake: z.string(),
    totalProfitLoss: z.string()
  }),
  trades: z.array(
    z.object({
      id: z.string(),
      sessionId: z.string().nullable(),
      accountId: z.string(),
      derivContractId: z.string(),
      market: z.string(),
      contractType: z.string(),
      prediction: z.string().nullable(),
      outcome: outcomeSchema,
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
      martingaleStep: z.number().int(),
      submissionReference: z.string()
    })
  )
})

const savedConfigurationSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  name: z.string(),
  configuration: configurationSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
})

function parse<T>(schema: z.ZodType<T>) {
  return (data: unknown): T | null => {
    const result = schema.safeParse(data)
    return result.success ? result.data : null
  }
}

export function getBotConfigurations(): Promise<
  readonly SavedBotConfiguration[]
> {
  return apiRequest(
    '/api/v1/bots/configurations',
    parse(z.array(savedConfigurationSchema))
  )
}

export function saveBotConfiguration(
  name: string,
  configuration: BotConfiguration
): Promise<SavedBotConfiguration> {
  return apiRequest(
    '/api/v1/bots/configurations',
    parse(savedConfigurationSchema),
    {
      method: 'POST',
      body: JSON.stringify({ name, configuration })
    }
  )
}

export function getBotSessions(): Promise<readonly BotSession[]> {
  return apiRequest('/api/v1/bots/sessions', parse(z.array(botSessionSchema)))
}

export function startBotSession(
  configuration: BotConfiguration
): Promise<BotSession> {
  return apiRequest('/api/v1/bots/sessions', parse(botSessionSchema), {
    method: 'POST',
    body: JSON.stringify({ configuration })
  })
}

export function changeBotSessionState(
  sessionId: string,
  action: 'pause' | 'resume' | 'stop'
): Promise<BotSession> {
  return apiRequest(
    `/api/v1/bots/sessions/${encodeURIComponent(sessionId)}/actions`,
    parse(botSessionSchema),
    { method: 'POST', body: JSON.stringify({ action }) }
  )
}

export function evaluateBotSession(sessionId: string): Promise<BotSession> {
  return apiRequest(
    `/api/v1/bots/sessions/${encodeURIComponent(sessionId)}/evaluate`,
    parse(botSessionSchema),
    { method: 'POST' }
  )
}
