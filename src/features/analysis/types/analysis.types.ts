import type { AccountSession } from '../../accounts/types/accounts.types'

export type TickDirection = 'rising' | 'falling' | 'neutral'
export type MarketDataState =
  'idle' | 'connecting' | 'live' | 'stale' | 'disconnected' | 'error'

export type AnalysisParameters = Readonly<{
  movementWindow: number
  digitWindow: number
  barrier: number
  confidenceThreshold: number
}>

export type MarketTick = Readonly<{
  market: string
  epoch: number
  quote: string
  digit: number
  direction: TickDirection
  latencyMs: number | null
  receivedAt: string
}>

export type MarketCandle = Readonly<{
  epoch: number
  open: string
  high: string
  low: string
  close: string
}>

export type MarketCandleHistory = Readonly<{
  oneMinute: readonly MarketCandle[]
  fiveMinutes: readonly MarketCandle[]
  oneHour: readonly MarketCandle[]
}>

export type MarketDataHealth = Readonly<{
  state: MarketDataState
  lastTickAt: string | null
  latencyMs: number | null
  movementBufferSize: number
  digitBufferSize: number
}>

export type DigitBoardCell = Readonly<{
  digit: number
  count: number
  observedPercentage: number
  isLatest: boolean
}>

export type MarketAnalysis = Readonly<{
  market: string
  health: MarketDataHealth
  latestTick: MarketTick | null
  recentTicks: readonly MarketTick[]
  candles: MarketCandleHistory
  movement: Readonly<{
    rising: number
    falling: number
    neutral: number
    directionalCount: number
    risingConfidence: number | null
    fallingConfidence: number | null
    dominantDirection: 'rising' | 'falling' | null
    dominantConfidence: number | null
    meetsConfiguredThreshold: boolean
  }>
  digitBoard: readonly DigitBoardCell[]
  digits: Readonly<{
    sampleSize: number
    evenCount: number
    oddCount: number
    overCount: number
    underCount: number
    equalToBarrierCount: number
    matchesCount: number
    differsCount: number
    evenObservedPercentage: number | null
    oddObservedPercentage: number | null
    overObservedPercentage: number | null
    underObservedPercentage: number | null
    equalToBarrierObservedPercentage: number | null
    matchesObservedPercentage: number | null
    differsObservedPercentage: number | null
  }>
  streaks: Readonly<{
    direction: Readonly<{ direction: TickDirection; length: number }> | null
    digit: Readonly<{ digit: number; length: number }> | null
  }>
  parameters: AnalysisParameters
  updatedAt: string
}>

export type MarketScannerObservation = Readonly<{
  market: string
  dataState: MarketDataState
  proposedDigit: number | null
  proposedDigitCount: number
  longestAbsence: number
  observedDiffersPercentage: number | null
  theoreticalBaseline: number
  normalizedDeviation: number | null
}>

export type MarketConsoleData = Readonly<{
  accountSession: AccountSession
  selectedAccountId: string
  analysis: MarketAnalysis
  scanner: readonly MarketScannerObservation[]
}>
