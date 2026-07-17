export type AccountKind = 'demo' | 'real'

export type ConnectionState =
  | 'demo_connected'
  | 'real_connected'
  | 'reconnecting'
  | 'disconnected'
  | 'authorization_expired'
  | 'restricted'

export type AuthorizedAccount = Readonly<{
  accountId: string
  displayName: string
  currency: string
  balance: string | null
  kind: AccountKind
  connectionState: ConnectionState
}>

export type AccountSession = Readonly<{
  accounts: readonly AuthorizedAccount[]
  selectedAccountId: string | null
  expiresAt: string
}>
