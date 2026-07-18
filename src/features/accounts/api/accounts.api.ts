import { apiRequest } from '../../../shared/api/httpClient'
import { z } from 'zod'
import type {
  AccountSession,
  RealAccountDisclosure
} from '../types/accounts.types'

const accountSessionSchema = z.object({
  accounts: z.array(
    z.object({
      accountId: z.string(),
      displayName: z.string(),
      currency: z.string(),
      balance: z.string().nullable(),
      kind: z.enum(['demo', 'real']),
      connectionState: z.enum([
        'demo_connected',
        'real_connected',
        'reconnecting',
        'disconnected',
        'authorization_expired',
        'restricted'
      ])
    })
  ),
  selectedAccountId: z.string().nullable(),
  expiresAt: z.string().datetime()
})

const authorizationUrlSchema = z.object({ authorizationUrl: z.string().url() })
const logoutSchema = z.object({ loggedOut: z.boolean() })
const disclosureSchema = z.object({
  accountId: z.string(),
  accountKind: z.enum(['demo', 'real']),
  disclosureVersion: z.string(),
  accepted: z.boolean(),
  acceptedAt: z.string().datetime().nullable()
})

function parseAccountSession(data: unknown): AccountSession | null {
  const parsed = accountSessionSchema.safeParse(data)
  return parsed.success ? parsed.data : null
}

export async function beginDerivLogin(): Promise<void> {
  const response = await apiRequest(
    '/api/v1/auth/deriv/login',
    (data) => {
      const parsed = authorizationUrlSchema.safeParse(data)
      return parsed.success ? parsed.data : null
    },
    { method: 'POST' }
  )

  window.location.assign(response.authorizationUrl)
}

export function getAccountSession(): Promise<AccountSession> {
  return apiRequest('/api/v1/accounts/session', parseAccountSession)
}

export function selectAccount(accountId: string): Promise<AccountSession> {
  return apiRequest('/api/v1/accounts/select', parseAccountSession, {
    method: 'POST',
    body: JSON.stringify({ accountId })
  })
}

export function refreshAccount(): Promise<AccountSession> {
  return apiRequest('/api/v1/accounts/refresh', parseAccountSession, {
    method: 'POST'
  })
}

export function disconnectAccount(accountId?: string): Promise<AccountSession> {
  return apiRequest('/api/v1/accounts/disconnect', parseAccountSession, {
    method: 'POST',
    body: JSON.stringify(accountId === undefined ? {} : { accountId })
  })
}

export function logout(): Promise<{ loggedOut: boolean }> {
  return apiRequest(
    '/api/v1/auth/deriv/logout',
    (data) => {
      const parsed = logoutSchema.safeParse(data)
      return parsed.success ? parsed.data : null
    },
    { method: 'POST' }
  )
}

export function getRealAccountDisclosure(): Promise<RealAccountDisclosure> {
  return apiRequest('/api/v1/accounts/disclosure', (data) => {
    const parsed = disclosureSchema.safeParse(data)
    return parsed.success ? parsed.data : null
  })
}

export function acceptRealAccountDisclosure(): Promise<RealAccountDisclosure> {
  return apiRequest(
    '/api/v1/accounts/disclosure/accept',
    (data) => {
      const parsed = disclosureSchema.safeParse(data)
      return parsed.success ? parsed.data : null
    },
    {
      method: 'POST',
      body: JSON.stringify({ accepted: true })
    }
  )
}
