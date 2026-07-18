import type { AccountSession } from '../../accounts/types/accounts.types'
import type { DurationUnit } from '../../automation/types/automation.types'

export type ScannerMarket = Readonly<{
  symbol: string
  displayName: string
  market: string
  submarket: string
}>

export type DiffersScannerResult = Readonly<{
  market: string
  dataState: 'idle' | 'connecting' | 'live' | 'stale' | 'disconnected' | 'error'
  proposedDigit: number | null
  proposedDigitCount: number
  longestAbsence: number
  observedDiffersPercentage: number | null
  theoreticalBaseline: number
  normalizedDeviation: number | null
  confirmationCount: number
  confirmationState: 'monitoring' | 'confirmed'
  minimumSignalStrength: number
  qualifiesForExecution: boolean
  evaluatedAt: string
}>

export type ScannerBulkConfiguration = Readonly<{
  stake: string
  duration: number
  durationUnit: DurationUnit
  count: number
  entryDelaySeconds: number
  maximumActiveContracts: number
  stopLoss: string | null
  takeProfit: string | null
}>

export type ScannerConsoleData = Readonly<{
  accountSession: AccountSession
  selectedAccountId: string
  markets: readonly ScannerMarket[]
  results: readonly DiffersScannerResult[]
}>
