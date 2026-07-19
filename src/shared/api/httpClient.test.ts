import { afterEach, describe, expect, it, vi } from 'vitest'
import { requestWithRecovery } from './httpClient'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('requestWithRecovery', () => {
  it('retries a transient 522 for a read request', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('', { status: 522 }))
      .mockResolvedValueOnce(new Response('{"data":{"ready":true}}'))

    vi.stubGlobal('fetch', fetchMock)
    vi.stubGlobal('window', {
      setTimeout: (callback: () => void) => {
        callback()
        return 0
      }
    })

    const response = await requestWithRecovery('https://example.test/api', {})

    expect(response.status).toBe(200)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('does not replay a state-changing request', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response('', { status: 522 }))

    vi.stubGlobal('fetch', fetchMock)

    const response = await requestWithRecovery('https://example.test/api', {
      method: 'POST'
    })

    expect(response.status).toBe(522)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
