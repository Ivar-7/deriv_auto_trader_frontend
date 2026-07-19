const backendOrigin =
  process.env.BACKEND_API_ORIGIN ??
  'https://deriv-auto-trader-api-h44p4.ondigitalocean.app'
const retryableStatuses = new Set([502, 503, 504, 522])
const readRequestTimeoutMilliseconds = 8_000
const writeRequestTimeoutMilliseconds = 15_000
const oauthCallbackTimeoutMilliseconds = 20_000

export const config = { maxDuration: 30 }

export default async function handler(request, response) {
  response.setHeader('cache-control', 'private, no-store')
  response.setHeader('x-deriv-api-proxy', 'vercel-function')

  const method = request.method ?? 'GET'
  const body = requestBody(request, method)
  const headers = requestHeaders(request.headers)
  const target = backendTarget(request)
  const upstream = await forwardRequest(target, {
    method,
    headers,
    body
  })

  if (upstream === null) {
    response.status(503).json({
      error: {
        code: 'API_PROXY_UNAVAILABLE',
        message: 'The application service is unavailable. Try again shortly.',
        requestId: ''
      }
    })
    return
  }

  copyResponseHeaders(upstream, response)
  response.status(upstream.status)
  response.send(Buffer.from(await upstream.arrayBuffer()))
}

function backendTarget(request) {
  const requestUrl = new URL(request.url ?? '/api', backendOrigin)
  const path = catchAllPath(request.query?.path)
  const target = new URL(
    path === null ? requestUrl.pathname : `/api/${path}`,
    backendOrigin
  )

  for (const [key, value] of Object.entries(request.query ?? {})) {
    if (key === 'path' || value === undefined) continue

    for (const item of Array.isArray(value) ? value : [value]) {
      target.searchParams.append(key, item)
    }
  }

  return target
}

function catchAllPath(value) {
  if (typeof value === 'string') return value
  if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
    return value.join('/')
  }
  return null
}

async function forwardRequest(target, init) {
  const attempts = isRetrySafeRequest(target, init.method) ? 2 : 1
  const timeoutMilliseconds = requestTimeout(target, init.method)

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(
        () => controller.abort(),
        timeoutMilliseconds
      )

      try {
        const upstream = await fetch(target, {
          ...init,
          // OAuth callback redirects must reach the browser. Following the
          // redirect here serves the SPA at the callback URL instead, leaving
          // React on an unknown route and making a successful login look dead.
          redirect: 'manual',
          signal: controller.signal
        })

        if (
          attempt === attempts - 1 ||
          !retryableStatuses.has(upstream.status)
        ) {
          return upstream
        }
      } finally {
        clearTimeout(timeout)
      }
    } catch (error) {
      console.warn('API proxy upstream request failed', {
        method: init.method,
        path: target.pathname,
        attempt: attempt + 1,
        attempts,
        error: error instanceof Error ? error.name : 'UnknownError'
      })

      if (attempt === attempts - 1) {
        return null
      }
    }
  }

  return null
}

function isRetrySafeRequest(target, method) {
  // The authorization code and state are single-use. Replaying this GET after
  // the backend consumes them turns a successful callback into an expired one.
  if (target.pathname === '/api/v1/auth/deriv/callback') return false

  if (['GET', 'HEAD'].includes(method)) return true

  // These POST routes only create an OAuth attempt or replace/read a market
  // subscription. Repeating them after a lost transport response is safe and
  // prevents a transient Vercel-to-backend connection from surfacing to users.
  return (
    method === 'POST' &&
    (target.pathname === '/api/v1/auth/deriv/login' ||
      target.pathname.endsWith('/subscribe'))
  )
}

function requestTimeout(target, method) {
  if (target.pathname === '/api/v1/auth/deriv/callback') {
    return oauthCallbackTimeoutMilliseconds
  }

  return ['GET', 'HEAD'].includes(method)
    ? readRequestTimeoutMilliseconds
    : writeRequestTimeoutMilliseconds
}

function requestHeaders(headers) {
  const forwarded = new Headers()
  const skipped = new Set([
    'connection',
    'content-length',
    'host',
    'transfer-encoding'
  ])

  for (const [name, value] of Object.entries(headers)) {
    if (value === undefined || skipped.has(name.toLowerCase())) continue
    forwarded.set(name, Array.isArray(value) ? value.join(', ') : value)
  }

  return forwarded
}

function requestBody(request, method) {
  if (['GET', 'HEAD'].includes(method) || request.body === undefined) {
    return undefined
  }

  if (typeof request.body === 'string' || Buffer.isBuffer(request.body)) {
    return request.body
  }

  return JSON.stringify(request.body)
}

function copyResponseHeaders(upstream, response) {
  const skipped = new Set(['content-encoding', 'content-length', 'set-cookie'])

  for (const [name, value] of upstream.headers) {
    if (!skipped.has(name.toLowerCase())) {
      response.setHeader(name, value)
    }
  }

  const cookies = upstream.headers.getSetCookie?.() ?? []
  const fallbackCookie = upstream.headers.get('set-cookie')

  if (cookies.length > 0) {
    response.setHeader('set-cookie', cookies)
  } else if (fallbackCookie !== null) {
    response.setHeader('set-cookie', fallbackCookie)
  }
}

export { forwardRequest, isRetrySafeRequest }
