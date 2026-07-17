import type { AccountSession } from '../../accounts/types/accounts.types'

export type AutomationSessionState =
  | 'idle'
  | 'starting'
  | 'running'
  | 'paused'
  | 'stopping'
  | 'stopped'
  | 'reconnecting'
  | 'risk_limit_reached'
  | 'completed'
  | 'error'

export type TradeStatus =
  | 'pending'
  | 'open'
  | 'won'
  | 'lost'
  | 'sold_early'
  | 'expired'
  | 'cancelled'
  | 'error'

export type DurationUnit = 't' | 's' | 'm' | 'h' | 'd'

export type ContractPreviewInput = Readonly<{
  botType: string
  market: string
  contractType: 'CALL' | 'PUT'
  stake: string
  duration: number
  durationUnit: DurationUnit
  barrier: string | null
}>

export type ContractPreview = Readonly<{
  id: string
  accountId: string
  currency: string
  proposalId: string
  input: ContractPreviewInput
  askPrice: string
  potentialPayout: string
  description: string | null
  expiresAt: string
}>

export type AutomationSession = Readonly<{
  id: string
  accountId: string
  botType: string
  market: string
  state: AutomationSessionState
  startedAt: string | null
  endedAt: string | null
  runningProfitLoss: string
}>

export type TrackedContract = Readonly<{
  contractId: string
  status: string
  buyPrice: string | null
  currentSpot: string | null
  profitLoss: string | null
  isSold: boolean
  derivStatus: string
  platformStatus: TradeStatus
  canSell: boolean
  canCancel: boolean
  actionReason: string | null
}>

export type AccountRiskLimits = Readonly<{
  accountId: string
  maximumActiveContracts: number
  maximumSingleTradeStake: string
  maximumCombinedRunningLoss: string
}>

export type AccountRiskProfile = Readonly<{
  limits: AccountRiskLimits
  emergencyStopActive: boolean
  updatedAt: string
}>

export type SessionRiskLimits = Readonly<{
  sessionId: string
  stopLoss: string | null
  takeProfit: string | null
  maximumTrades: number | null
  maximumConsecutiveLosses: number | null
  maximumCumulativeStake: string | null
}>

export type AutomationCycle = Readonly<{
  accountId: string
  isActive: boolean
  startedAt: string | null
  endedAt: string | null
  runningProfitLoss: string
}>

export type ActivityEvent = Readonly<{
  id: string
  occurredAt: string
  category: string
  event: string
  accountId: string
  market: string | null
  sessionId: string | null
  status: string
  details: Readonly<Record<string, string | number | boolean | null>>
}>

export type RiskSnapshot = Readonly<{
  account: AccountRiskProfile
  sessions: readonly SessionRiskLimits[]
}>

export type SafetySnapshot = Readonly<{
  risk: RiskSnapshot
  cycle: AutomationCycle
  sessions: readonly AutomationSession[]
  contracts: readonly TrackedContract[]
  activity: readonly ActivityEvent[]
}>

export type SafetyConsoleData = Readonly<{
  accountSession: AccountSession
  selectedAccountId: string
  snapshot: SafetySnapshot
}>
