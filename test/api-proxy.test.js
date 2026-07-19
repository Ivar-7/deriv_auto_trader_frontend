import { afterEach, describe, expect, it, vi } from 'vitest'
import { forwardRequest, isRetrySafeRequest } from '../api/[...path].js'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('Vercel API proxy', () => {
  it('passes redirects through instead of following them inside the function', async () => {
    const redirect = new Response(null, {
      status: 302,
      headers: { location: 'https://frontend.example/accounts?auth=connected' }
    })
    const fetchMock = vi.fn().mockResolvedValue(redirect)
    vi.stubGlobal('fetch', fetchMock)

    const response = await forwardRequest(
      new URL('https://backend.example/api/v1/auth/deriv/callback'),
      { method: 'GET', headers: new Headers(), body: undefined }
    )

    expect(response).toBe(redirect)
    expect(fetchMock).toHaveBeenCalledOnce()
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ redirect: 'manual' })
  })

  it('never replays a single-use OAuth callback after a transport failure', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('timeout'))
    vi.stubGlobal('fetch', fetchMock)

    const response = await forwardRequest(
      new URL('https://backend.example/api/v1/auth/deriv/callback'),
      { method: 'GET', headers: new Headers(), body: undefined }
    )

    expect(response).toBeNull()
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it('retries the safe login handoff after a transient transport failure', async () => {
    const success = new Response(
      JSON.stringify({ data: { authorizationUrl: 'https://auth.example/' } })
    )
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('temporary connection failure'))
      .mockResolvedValueOnce(success)
    vi.stubGlobal('fetch', fetchMock)

    const response = await forwardRequest(
      new URL('https://backend.example/api/v1/auth/deriv/login'),
      { method: 'POST', headers: new Headers(), body: undefined }
    )

    expect(response).toBe(success)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('continues retrying ordinary read-only API requests', () => {
    expect(
      isRetrySafeRequest(
        new URL('https://backend.example/api/v1/accounts/session'),
        'GET'
      )
    ).toBe(true)
    expect(
      isRetrySafeRequest(
        new URL('https://backend.example/api/v1/auth/deriv/callback'),
        'GET'
      )
    ).toBe(false)
    expect(
      isRetrySafeRequest(
        new URL('https://backend.example/api/v1/auth/deriv/login'),
        'POST'
      )
    ).toBe(true)
    expect(
      isRetrySafeRequest(
        new URL('https://backend.example/api/v1/markets/subscribe'),
        'POST'
      )
    ).toBe(true)
    expect(
      isRetrySafeRequest(
        new URL('https://backend.example/api/v1/bots/start'),
        'POST'
      )
    ).toBe(false)
  })
})
