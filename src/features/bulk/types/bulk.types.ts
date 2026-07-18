import type { AccountSession } from '../../accounts/types/accounts.types'
import type { DurationUnit } from '../../automation/types/automation.types'

export type BulkOutcome =
  'differs' | 'matches' | 'over' | 'under' | 'rise' | 'fall'

export type BulkRunConfiguration = Readonly<{
  market: string
  outcome: BulkOutcome
  barrier: number | null
  stake: string
  duration: number
  durationUnit: DurationUnit
  count: number
  entryDelaySeconds: number
  maximumActiveContracts: number
  stopLoss: string | null
  takeProfit: string | null
}>

export type BulkRun = Readonly<{
  id: string
  accountId: string
  currency: string
  source: 'manual' | 'smart' | 'scanner'
  sourceReference: string | null
  configuration: BulkRunConfiguration
  state: string
  startedAt: string | null
  endedAt: string | null
  statistics: Readonly<{
    requested: number
    submitted: number
    accepted: number
    rejected: number
    pending: number
    open: number
    won: number
    lost: number
    cancelledBeforeSubmission: number
    totalStake: string
    totalPayout: string
    totalProfitLoss: string
  }>
  entries: readonly unknown[]
}>

export type AutoBulkProfile = Readonly<{
  id: string
  accountId: string
  enabled: boolean
  market: string | null
  configuration: Omit<BulkRunConfiguration, 'market' | 'outcome' | 'barrier'>
  createdAt: string
  updatedAt: string
}>

export type BulkConsoleData = Readonly<{
  accountSession: AccountSession
  selectedAccountId: string
  runs: readonly BulkRun[]
  profiles: readonly AutoBulkProfile[]
}>
