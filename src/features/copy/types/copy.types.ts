import type { AccountSession } from '../../accounts/types/accounts.types'

export type CopyStakeMode = 'fixed' | 'proportional'
export type CopyAction = 'pause' | 'resume' | 'stop'

export type CopySubAccountConfiguration = Readonly<{
  accountId: string
  enabled: boolean
  stakeMode: CopyStakeMode
  fixedStake: string | null
  proportionalMultiplier: string | null
  maximumStake: string | null
  stopLoss: string | null
  allowedContractTypes: readonly string[]
}>

export type CopyEntry = Readonly<{
  id: string
  masterDerivContractId: string
  derivContractId: string | null
  status: string
  proposedStake: string
  stake: string | null
  potentialPayout: string | null
  profitLoss: string | null
  rejectionReason: string | null
  submittedAt: string
  settledAt: string | null
}>

export type CopySubAccount = Readonly<{
  configuration: CopySubAccountConfiguration
  state: 'running' | 'paused' | 'stopped' | 'risk_limit_reached'
  statistics: Readonly<{
    requested: number
    submitted: number
    accepted: number
    rejected: number
    pending: number
    open: number
    won: number
    lost: number
    totalStake: string
    totalProfitLoss: string
  }>
  entries: readonly CopyEntry[]
}>

export type CopyTradingSession = Readonly<{
  id: string
  masterAccountId: string
  state: 'running' | 'paused' | 'stopped' | 'risk_limit_reached'
  startedAt: string
  endedAt: string | null
  subAccounts: readonly CopySubAccount[]
}>

export type CopyConsoleData = Readonly<{
  accountSession: AccountSession
  sessions: readonly CopyTradingSession[]
}>
