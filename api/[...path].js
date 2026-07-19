const backendOrigin =
  process.env.BACKEND_API_ORIGIN ??
  'https://deriv-auto-trader-api-h44p4.ondigitalocean.app'
const retryableStatuses = new Set([502, 503, 504, 522])
const requestTimeoutMilliseconds = 4_000

export default async function handler(request, response) {
  const method = request.method ?? 'GET'
  const body = requestBody(request, method)
  const headers = requestHeaders(request.headers)
  const target = new URL(request.url ?? '/api', backendOrigin)
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

async function forwardRequest(target, init) {
  const attempts = ['GET', 'HEAD'].includes(init.method) ? 3 : 1

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(
        () => controller.abort(),
        requestTimeoutMilliseconds
      )

      try {
        const upstream = await fetch(target, {
          ...init,
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
    } catch {
      if (attempt === attempts - 1) {
        return null
      }
    }
  }

  return null
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
