import type { AccountSession } from '../../accounts/types/accounts.types'
import type {
  AutomationSessionState,
  DurationUnit,
  TradeStatus
} from '../../automation/types/automation.types'

export type BotType =
  'rise_fall' | 'over_under' | 'even_odd' | 'matches_differs' | 'smart_auto'

export type BotOutcome =
  | 'rise'
  | 'fall'
  | 'over'
  | 'under'
  | 'even'
  | 'odd'
  | 'matches'
  | 'differs'
  | 'no_signal'

export type MartingaleSettings = Readonly<{
  enabled: boolean
  multiplier: string
  maxSteps: number
  maxStake: string | null
  resetAfterWin: boolean
  resetAtSessionEnd: boolean
}>

export type BotSessionLimits = Readonly<{
  stopLoss: string | null
  takeProfit: string | null
  maximumTrades: number | null
  maximumConsecutiveLosses: number | null
  maximumSingleStake: string | null
  maximumCumulativeStake: string | null
}>

export type BotConfiguration = Readonly<{
  botType: BotType
  market: string
  outcome: Exclude<BotOutcome, 'no_signal'> | null
  barrier: number | null
  stake: string
  duration: number
  durationUnit: DurationUnit
  movementWindow: number
  digitWindow: number
  confidenceThreshold: number
  minimumSignalStrength: number
  entryDelaySeconds: number
  martingale: MartingaleSettings
  limits: BotSessionLimits
}>

export type SavedBotConfiguration = Readonly<{
  id: string
  accountId: string
  name: string
  configuration: BotConfiguration
  createdAt: string
  updatedAt: string
}>

export type BotSignal = Readonly<{
  outcome: BotOutcome
  observedConfidence: number | null
  theoreticalBaseline: number | null
  signalStrength: number | null
  reason: string
  evaluatedAt: string
}>

export type BotTrade = Readonly<{
  id: string
  sessionId: string | null
  accountId: string
  derivContractId: string
  market: string
  contractType: string
  prediction: string | null
  outcome: Exclude<BotOutcome, 'no_signal'>
  stake: string
  potentialPayout: string | null
  status: TradeStatus
  profitLoss: string | null
  openedAt: string | null
  closedAt: string | null
  martingaleStep: number
  submissionReference: string
}>

export type BotSession = Readonly<{
  id: string
  configurationId: string | null
  accountId: string
  currency: string
  configuration: BotConfiguration
  state: AutomationSessionState
  startedAt: string | null
  endedAt: string | null
  currentSignal: BotSignal
  martingale: Readonly<{
    step: number
    nextStake: string
    lastTransition:
      | 'initial'
      | 'advanced_after_loss'
      | 'reset_after_win'
      | 'reset_at_session_end'
  }>
  statistics: Readonly<{
    submittedTrades: number
    acceptedTrades: number
    openTrades: number
    wonTrades: number
    lostTrades: number
    consecutiveLosses: number
    totalStake: string
    totalProfitLoss: string
  }>
  trades: readonly BotTrade[]
}>

export type BotConsoleData = Readonly<{
  accountSession: AccountSession
  selectedAccountId: string
  configurations: readonly SavedBotConfiguration[]
  sessions: readonly BotSession[]
}>
