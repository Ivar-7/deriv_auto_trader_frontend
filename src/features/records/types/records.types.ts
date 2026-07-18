import type { AccountSession } from '../../accounts/types/accounts.types'

export type TradeSource = 'bot' | 'bulk' | 'copy'
export type TradeStatus =
  | 'pending'
  | 'open'
  | 'won'
  | 'lost'
  | 'sold_early'
  | 'expired'
  | 'cancelled'
  | 'error'

export type TradeRecord = Readonly<{
  id: string
  sessionId: string | null
  accountId: string
  derivContractId: string
  market: string
  contractType: string
  prediction: string | null
  stake: string
  potentialPayout: string | null
  status: TradeStatus
  profitLoss: string | null
  openedAt: string | null
  closedAt: string | null
  source: TradeSource
  sourceReference: string
  masterAccountId: string | null
  masterDerivContractId: string | null
  derivStatus: string
  entryValue: string | null
  currentValue: string | null
  remainingDuration: string | null
  payout: string | null
  martingaleStep: number | null
  bulkRunId: string | null
  copySessionId: string | null
}>

export type TradeRecordFilters = Readonly<{
  market: string
  source: TradeSource | ''
  status: TradeStatus | ''
  search: string
}>

export type RecordsConsoleData = Readonly<{
  accountSession: AccountSession
  selectedAccountId: string
  openTrades: readonly TradeRecord[]
  history: readonly TradeRecord[]
}>
